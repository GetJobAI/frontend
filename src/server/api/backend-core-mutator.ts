import { createBackendMutator } from "./backend-mutator-shared";
import type { AxiosRequestConfig } from "axios";

const backendCoreMutator = createBackendMutator({
  basePath: "/api/v1",
  logPrefix: "backend-api",
  fallbackErrorMessage: "Backend Core API request failed",
});

export async function backendMutator<T>(
  config: AxiosRequestConfig,
  extraOptions?: AxiosRequestConfig,
): Promise<T> {
  return backendCoreMutator<T>(config, extraOptions);
}
