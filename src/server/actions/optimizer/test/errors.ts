import axios from "axios";

export type OptimizerFailureKind =
  | "resume_not_found"
  | "no_optimisation_in_db"
  | "pipeline_timeout"
  | "auth"
  | "parser_api"
  | "optimizer_api"
  | "core_api"
  | "unknown";

export function classifyRequestError(error: unknown): {
  kind: OptimizerFailureKind;
  message: string;
  status?: number;
} {
  if ((error as Error).message === "Unauthorized") {
    return { kind: "auth", message: "Unauthorized (Clerk session)." };
  }

  if (!axios.isAxiosError(error)) {
    return {
      kind: "unknown",
      message: error instanceof Error ? error.message : String(error),
    };
  }

  const status = error.response?.status;
  const responseData: unknown = error.response?.data;
  let detail: string | null = null;
  if (
    responseData &&
    typeof responseData === "object" &&
    "message" in responseData
  ) {
    const message = (responseData as Record<string, unknown>).message;
    if (typeof message === "string") {
      detail = message;
    }
  }

  if (status === 401 || status === 403) {
    const isRls =
      typeof detail === "string" &&
      detail.toLowerCase().includes("row-level security");
    return {
      kind: "auth",
      status,
      message: isRls
        ? `Forbidden (${status}): ${detail}`
        : `Auth or access denied (${status})${detail ? `: ${detail}` : ""}.`,
    };
  }

  if (status === 404) {
    return {
      kind: "optimizer_api",
      status,
      message: `Optimizer returned 404${detail ? `: ${detail}` : " (optimisation not found in service)."}`,
    };
  }

  const url = error.config?.url ?? "";
  const isOptimizer = url.includes("/optimisations");
  const isParser =
    url.includes("/parser/") || url.includes("/job-postings/parse");
  const isCore = !isOptimizer && !isParser && url.length > 0;

  if (status !== undefined && status >= 400) {
    return {
      kind: isOptimizer
        ? "optimizer_api"
        : isParser
          ? "parser_api"
          : isCore
            ? "core_api"
            : "unknown",
      status,
      message: detail ?? error.message,
    };
  }

  return {
    kind: "unknown",
    status,
    message: error.message,
  };
}
