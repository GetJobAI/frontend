import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { auth } from "@clerk/nextjs/server";

import { env } from "~/env";
import { logApiRequestOutcome } from "~/server/lib/request-log";

type MutatorOptions = {
  basePath: string;
  logPrefix: string;
  fallbackErrorMessage: string;
};

const clientCache = new Map<string, AxiosInstance>();

function getAxios(options: MutatorOptions): AxiosInstance {
  const cacheKey = `${options.basePath}:${options.logPrefix}`;
  const cached = clientCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const rootUrl = env.BACKEND_API_BASE_URL;
  if (typeof rootUrl !== "string" || rootUrl.trim().length === 0) {
    throw new Error("BACKEND_API_BASE_URL is not configured");
  }
  const root = rootUrl.replace(/\/$/, "");
  const baseURL = `${root}${options.basePath}`;
  const instance = axios.create({
    baseURL,
    headers: {
      Accept: "application/json",
    },
  });

  instance.interceptors.request.use(async (config) => {
    const { userId, getToken } = await auth();
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(`[${options.logPrefix}] Missing Clerk token`, {
        method: config.method?.toUpperCase(),
        url: config.url,
      });
    }
    if (userId) {
      config.headers["X-User-Id"] = userId;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const responseData: unknown = error.response?.data as unknown;
        console.warn(`[${options.logPrefix}] Request failed`, {
          method: error.config?.method?.toUpperCase(),
          url: error.config?.url,
          status: error.response?.status,
          data: responseData,
        });
      }
      return Promise.reject(
        error instanceof Error
          ? error
          : new Error(options.fallbackErrorMessage),
      );
    },
  );

  clientCache.set(cacheKey, instance);
  return instance;
}

export function createMutator(options: MutatorOptions) {
  return async function mutator<T>(
    config: AxiosRequestConfig,
    extraOptions?: AxiosRequestConfig,
  ): Promise<T> {
    const instance = getAxios(options);
    const headers: AxiosRequestConfig["headers"] = {
      ...config.headers,
      ...extraOptions?.headers,
    };

    if (config.data instanceof FormData && headers) {
      delete (headers as Record<string, unknown>)["Content-Type"];
      delete (headers as Record<string, unknown>)["content-type"];
    }

    const disableLogging = headers && (headers as Record<string, unknown>)["X-Disable-Logging"] === "true";
    if (disableLogging && headers) {
      delete (headers as Record<string, unknown>)["X-Disable-Logging"];
    }

    const requestConfig: AxiosRequestConfig = {
      ...config,
      ...extraOptions,
      headers,
    };

    const startedAtMs = Date.now();

    try {
      const response = await instance(requestConfig);
      if (!disableLogging) {
        await logApiRequestOutcome({
          scope: options.logPrefix,
          config: requestConfig,
          mergedHeaders: response.config.headers,
          startedAtMs,
          response,
        });
      }
      return response.data as T;
    } catch (error) {
      if (!disableLogging) {
        await logApiRequestOutcome({
          scope: options.logPrefix,
          config: requestConfig,
          startedAtMs,
          error,
        });
      }
      throw error;
    }
  };
}
