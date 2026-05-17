import axios, { type AxiosRequestConfig } from "axios";
import { auth } from "@clerk/nextjs/server";

import { env } from "~/env";

const root = env.BACKEND_API_BASE_URL.replace(/\/$/, "");
const baseURL = `${root}/api/v1`;

const backendAxios = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

backendAxios.interceptors.request.use(async (config) => {
  const { getToken } = await auth();
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("[backend-api] Missing Clerk token", {
      method: config.method?.toUpperCase(),
      url: config.url,
    });
  }
  return config;
});

backendAxios.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const responseData: unknown = error.response?.data as unknown;
      console.error("[backend-api] Request failed", {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        status: error.response?.status,
        data: responseData,
      });
    }
    return Promise.reject(
      error instanceof Error ? error : new Error("Backend API request failed"),
    );
  },
);

export async function backendMutator<T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> {
  const response = await backendAxios({
    ...config,
    ...options,
    headers: {
      ...config.headers,
      ...options?.headers,
    },
  });
  return response.data as T;
}
