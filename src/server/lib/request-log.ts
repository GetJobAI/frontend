import fs from "node:fs/promises";
import path from "node:path";

import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

const LOG_DIR = path.join(process.cwd(), ".logs");

export type LogStep = {
  at: string;
  name: string;
  data?: unknown;
};

export type RequestLog = {
  logId: string;
  scope: string;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  result?: unknown;
  error?: unknown;
  steps: LogStep[];
};

export type ApiRequestLog = {
  logId: string;
  scope: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  request: {
    method?: string;
    baseURL?: string;
    url?: string;
    headers?: Record<string, unknown> | null;
    params?: unknown;
    data?: unknown;
  };
  response?: {
    status?: number;
    statusText?: string;
    headers?: Record<string, unknown> | null;
    data?: unknown;
  };
  error?: Record<string, unknown>;
};

function isProductionRuntime(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  );
}

export function isRequestLoggingEnabled(): boolean {
  if (isProductionRuntime()) {
    return false;
  }
  if (process.env.API_REQUEST_LOGS === "true") {
    return true;
  }
  return process.env.NODE_ENV === "development";
}

export function createRequestLog(scope: string): {
  log: RequestLog;
  addStep: (name: string, data?: unknown) => void;
  finish: (result?: unknown, error?: unknown) => Promise<string | null>;
} {
  const enabled = isRequestLoggingEnabled();
  const startedAt = new Date().toISOString();
  const logId = `${scope}-${Date.now()}`;

  const log: RequestLog = {
    logId,
    scope,
    startedAt,
    steps: [],
  };

  const addStep = (name: string, data?: unknown) => {
    if (!enabled) return;
    log.steps.push({
      at: new Date().toISOString(),
      name,
      data: data === undefined ? undefined : sanitizeForLog(data),
    });
  };

  const finish = async (result?: unknown, error?: unknown) => {
    if (!enabled) return null;

    const finishedAt = new Date().toISOString();
    log.finishedAt = finishedAt;
    log.durationMs =
      new Date(finishedAt).getTime() - new Date(startedAt).getTime();
    if (result !== undefined) {
      log.result = sanitizeForLog(result);
    }
    if (error !== undefined) {
      log.error = sanitizeForLog(error);
    }

    return writeLogFile(logId, log);
  };

  return { log, addStep, finish };
}

export async function writeApiRequestLog(
  entry: Omit<ApiRequestLog, "finishedAt" | "durationMs"> & {
    startedAtMs: number;
  },
): Promise<string | null> {
  const finishedAt = new Date().toISOString();
  const payload: ApiRequestLog = {
    ...entry,
    finishedAt,
    durationMs: Date.now() - entry.startedAtMs,
  };

  return writeLogFile(entry.logId, payload);
}

export function buildApiRequestLogId(scope: string): string {
  return `${scope}-${Date.now()}`;
}

export function snapshotAxiosRequest(
  config: AxiosRequestConfig,
  mergedHeaders?: AxiosRequestConfig["headers"],
): ApiRequestLog["request"] {
  const headers = mergedHeaders ?? config.headers;

  return {
    method: config.method?.toUpperCase(),
    baseURL: config.baseURL,
    url: config.url,
    headers: sanitizeHeaders(headers),
    params: sanitizeForLog(config.params),
    data: sanitizeForLog(config.data),
  };
}

export function snapshotAxiosResponse<T>(
  response: AxiosResponse<T>,
): ApiRequestLog["response"] {
  return {
    status: response.status,
    statusText: response.statusText,
    headers: sanitizeHeaders(response.headers),
    data: sanitizeForLog(response.data),
  };
}

export async function logApiRequestOutcome(params: {
  scope: string;
  config: AxiosRequestConfig;
  mergedHeaders?: AxiosRequestConfig["headers"];
  startedAtMs: number;
  response?: AxiosResponse<unknown>;
  error?: unknown;
}): Promise<string | null> {
  if (!isRequestLoggingEnabled()) {
    return null;
  }

  const logId = buildApiRequestLogId(params.scope);
  const startedAt = new Date(params.startedAtMs).toISOString();

  try {
    const filePath = await writeApiRequestLog({
      logId,
      scope: params.scope,
      startedAt,
      startedAtMs: params.startedAtMs,
      request: snapshotAxiosRequest(params.config, params.mergedHeaders),
      response: params.response
        ? snapshotAxiosResponse(params.response)
        : undefined,
      error: params.error ? serializeAxiosError(params.error) : undefined,
    });
    if (filePath) {
      console.info(`[${params.scope}] request log written: ${filePath}`);
    }
    return filePath;
  } catch (logError) {
    console.warn(`[${params.scope}] failed to write request log`, logError);
    return null;
  }
}

export function redactSecret(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.length <= 12) return "[redacted]";
  return `${value.slice(0, 6)}…${value.slice(-4)} [redacted]`;
}

export function sanitizeHeaders(
  headers: unknown,
): Record<string, unknown> | null {
  if (!headers || typeof headers !== "object") {
    return null;
  }

  const record = headers as Record<string, unknown>;
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(record)) {
    const lower = key.toLowerCase();
    if (lower === "authorization" && typeof value === "string") {
      out[key] = redactSecret(value);
      continue;
    }
    out[key] = value;
  }

  return out;
}

export function serializeAxiosError(error: unknown): Record<string, unknown> {
  if (!axios.isAxiosError(error)) {
    return {
      type: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
    };
  }

  return {
    type: "AxiosError",
    message: error.message,
    code: error.code,
    method: error.config?.method?.toUpperCase(),
    baseURL: error.config?.baseURL,
    url: error.config?.url,
    status: error.response?.status,
    statusText: error.response?.statusText,
    requestHeaders: sanitizeHeaders(error.config?.headers),
    responseHeaders: sanitizeHeaders(error.response?.headers),
    responseData: error.response?.data,
  };
}

async function writeLogFile(
  logId: string,
  payload: RequestLog | ApiRequestLog,
): Promise<string | null> {
  if (!isRequestLoggingEnabled()) {
    return null;
  }

  await fs.mkdir(LOG_DIR, { recursive: true });
  const filePath = path.join(LOG_DIR, `${logId}.json`);
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return filePath;
}

function sanitizeForLog(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof File) {
    return {
      name: value.name,
      size: value.size,
      type: value.type,
      lastModified: value.lastModified,
    };
  }

  if (value instanceof FormData) {
    const entries: Record<string, unknown> = {};
    for (const [key, entry] of value.entries()) {
      entries[key] =
        entry instanceof File
          ? sanitizeForLog(entry)
          : typeof entry === "string"
            ? entry
            : String(entry);
    }
    return { formData: entries };
  }

  if (axios.isAxiosError(value)) {
    return serializeAxiosError(value);
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForLog(item));
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(record)) {
      if (key.toLowerCase() === "authorization" && typeof entry === "string") {
        out[key] = redactSecret(entry);
        continue;
      }
      out[key] = sanitizeForLog(entry);
    }
    return out;
  }

  return value;
}
