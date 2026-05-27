import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { auth } from "@clerk/nextjs/server";

import { env } from "~/env";

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
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  instance.interceptors.request.use(async (config) => {
    const { getToken } = await auth();
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(`[${options.logPrefix}] Missing Clerk token`, {
        method: config.method?.toUpperCase(),
        url: config.url,
      });
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const responseData: unknown = error.response?.data as unknown;
        console.error(`[${options.logPrefix}] Request failed`, {
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
    const response = await instance({
      ...config,
      ...extraOptions,
      headers: {
        ...config.headers,
        ...extraOptions?.headers,
      },
    });
    return response.data as T;
  };
}
