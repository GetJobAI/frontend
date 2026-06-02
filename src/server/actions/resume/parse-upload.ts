"use server";

import { revalidatePath } from "next/cache";
import { getUserId } from "~/lib/auth";
import { isResumeContentReady } from "~/app/dashboard/resumes/upload/lib/parse-status";
import { env } from "~/env";
import type { ParseResumeResponse } from "~/server/api/generated/parser/schemas";
import { parseResumeResumesParsePost } from "~/server/api/generated/parser/parser";
import {
  createRequestLog,
  serializeAxiosError,
} from "~/server/lib/request-log";
import { getResumeAction } from "./actions";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const POLL_TIMEOUT_MS = 90_000;
const POLL_INITIAL_DELAY_MS = 500;
const POLL_MAX_DELAY_MS = 1_500;

export type ParseUploadResult =
  | {
      ok: true;
      resumeId: string;
      warnings?: string[];
      partialParse?: boolean;
    }
  | { ok: false; error: string };

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getFileExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot).toLowerCase() : "";
}

function validateUploadFile(file: unknown): File | { error: string } {
  if (!(file instanceof File)) {
    return { error: "Please select a PDF or DOCX file." };
  }

  if (file.size === 0) {
    return { error: "The selected file is empty." };
  }

  if (file.size > MAX_FILE_BYTES) {
    return { error: "File must be 10 MB or smaller." };
  }

  const ext = getFileExtension(file.name);
  const allowedExtensions = new Set([".pdf", ".docx"]);
  const allowedMime = new Set([
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]);

  if (!allowedExtensions.has(ext) && !allowedMime.has(file.type)) {
    return { error: "Only PDF and DOCX files are supported." };
  }

  return file;
}

function getParserErrorMessage(error: unknown): string {
  const responseData =
    error && typeof error === "object" && "response" in error
      ? (error as { response?: { data?: unknown } }).response?.data
      : undefined;

  if (
    responseData &&
    typeof responseData === "object" &&
    !Array.isArray(responseData)
  ) {
    const detail = (responseData as Record<string, unknown>).detail;
    if (typeof detail === "string") {
      return detail;
    }
    if (Array.isArray(detail) && detail.length > 0) {
      const first: unknown = detail[0];
      if (
        first &&
        typeof first === "object" &&
        "msg" in first &&
        typeof (first as Record<string, unknown>).msg === "string"
      ) {
        return (first as Record<string, unknown>).msg as string;
      }
    }
  }

  return error instanceof Error
    ? error.message
    : "Failed to parse resume. Try again.";
}

async function callParseResumeApi(
  file: File,
  addStep: (name: string, data?: unknown) => void,
): Promise<ParseResumeResponse> {
  try {
    const response = await parseResumeResumesParsePost({ file });
    addStep("parser.response.success", response);
    return response;
  } catch (error) {
    addStep("parser.response.error", serializeAxiosError(error));
    throw error;
  }
}

async function waitForParsedResume(
  resumeId: string,
  initialParseStatus: string,
  addStep: (name: string, data?: unknown) => void,
): Promise<{ ready: boolean; error?: string }> {
  const failed = initialParseStatus.toLowerCase();
  if (failed === "failed" || failed === "error") {
    return { ready: false, error: "Resume parsing failed. Try another file." };
  }

  const deadline = Date.now() + POLL_TIMEOUT_MS;
  let delayMs = POLL_INITIAL_DELAY_MS;
  let attempt = 0;

  while (Date.now() < deadline) {
    attempt += 1;
    const resume = await getResumeAction(resumeId);
    const ready = Boolean(resume && isResumeContentReady(resume.content));

    addStep("poll.resume", {
      attempt,
      resumeId,
      ready,
      parseStatus: resume?.parseStatus ?? null,
      contentReady: ready,
      contentPreview:
        resume?.content && typeof resume.content === "object"
          ? {
              hasContact: Boolean(
                (resume.content as Record<string, unknown>).contact,
              ),
              experienceCount: Array.isArray(
                (resume.content as Record<string, unknown>).experience,
              )
                ? (
                    (resume.content as Record<string, unknown>)
                      .experience as unknown[]
                  ).length
                : 0,
            }
          : null,
    });

    if (ready) {
      return { ready: true };
    }

    await sleep(delayMs);
    delayMs = Math.min(Math.round(delayMs * 1.25), POLL_MAX_DELAY_MS);
  }

  return {
    ready: false,
    error: "Parsing is taking longer than expected. Please try again.",
  };
}

export async function parseUploadedResumeAction(
  formData: FormData,
): Promise<ParseUploadResult> {
  const { addStep, finish } = createRequestLog("parse-upload");
  let result: ParseUploadResult | undefined;

  try {
    const userId = await getUserId();
    addStep("action.start", {
      userId,
      formDataKeys: [...formData.keys()],
      backendApiBaseUrl: env.BACKEND_API_BASE_URL,
    });

    const validated = validateUploadFile(formData.get("file"));
    if (!(validated instanceof File)) {
      result = { ok: false, error: validated.error };
      addStep("validation.failed", { error: validated.error });
      return result;
    }

    addStep("validation.passed", {
      name: validated.name,
      size: validated.size,
      type: validated.type,
    });

    const parseResponse = await callParseResumeApi(validated, addStep);
    const resumeId = parseResponse.resume_id?.trim();
    if (!resumeId) {
      result = { ok: false, error: "Parser did not return a resume id." };
      addStep("parser.missing_resume_id", { parseResponse });
      return result;
    }

    addStep("parser.resume_id", { resumeId });

    const poll = await waitForParsedResume(
      resumeId,
      parseResponse.parse_status ?? "",
      addStep,
    );
    if (!poll.ready) {
      result = {
        ok: false,
        error: poll.error ?? "Failed to load parsed resume.",
      };
      addStep("poll.failed", result);
      return result;
    }

    revalidatePath("/dashboard/resumes");
    revalidatePath(`/dashboard/resumes/${resumeId}`);

    result = {
      ok: true,
      resumeId,
      warnings: parseResponse.warnings,
      partialParse: parseResponse.partial_parse,
    };
    addStep("action.success", result);
    return result;
  } catch (e) {
    if ((e as Error).message === "Unauthorized") {
      result = { ok: false, error: "Unauthorized" };
      addStep("action.unauthorized", result);
      return result;
    }

    console.error("[parseUploadedResumeAction]", e);
    result = {
      ok: false,
      error: getParserErrorMessage(e),
    };
    addStep("action.error", {
      message: getParserErrorMessage(e),
      axios: serializeAxiosError(e),
    });
    return result;
  } finally {
    const logPath = await finish(result);
    if (logPath) {
      console.info(`[parse-upload] log written: ${logPath}`);
    }
  }
}
