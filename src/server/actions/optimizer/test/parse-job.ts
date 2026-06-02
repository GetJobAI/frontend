import { parseJobPostingJobPostingsParsePost } from "~/server/api/generated/parser/parser";
import type { JobPostingContent } from "~/server/api/generated/parser/schemas";
import { serializeAxiosError } from "~/server/lib/request-log";

import { testHttpOptions } from "./constants";
import { ARTIFICIAL_JOB_POSTING_RAW_TEXT } from "./fixtures";

function isFailedParseStatus(status: string): boolean {
  const normalized = status.trim().toLowerCase();
  return normalized === "failed" || normalized === "error";
}

function hasMinimalJobContent(content: JobPostingContent): boolean {
  const title = content.title?.trim();
  const company = content.company?.trim();
  return Boolean(title ?? company);
}

/** Calls the parser service with fixture plain text; returns structured job content for core API. */
export async function parseJobPostingForTest(
  addStep: (name: string, data?: unknown) => void,
): Promise<JobPostingContent> {
  addStep("parser.job.request", {
    textLength: ARTIFICIAL_JOB_POSTING_RAW_TEXT.length,
  });

  try {
    const response = await parseJobPostingJobPostingsParsePost(
      { text: ARTIFICIAL_JOB_POSTING_RAW_TEXT },
      testHttpOptions,
    );

    addStep("parser.job.response", {
      parse_status: response.parse_status,
      partial_parse: response.partial_parse,
      warnings: response.warnings,
      extraction_method: response.extraction_method,
      title: response.content?.title ?? null,
      company: response.content?.company ?? null,
    });

    if (isFailedParseStatus(response.parse_status ?? "")) {
      throw new Error(
        `Job posting parser returned status "${response.parse_status}".`,
      );
    }

    if (!hasMinimalJobContent(response.content)) {
      throw new Error("Job posting parser returned empty structured content.");
    }

    return response.content;
  } catch (error) {
    addStep("parser.job.error", serializeAxiosError(error));
    throw error;
  }
}
