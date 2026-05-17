import { createBackendMutator } from "./backend-mutator-shared";
import type { AxiosRequestConfig } from "axios";

const backendPdfRequestMutator = createBackendMutator({
  basePath: "/api/v1/pdf",
  logPrefix: "backend-pdf-api",
  fallbackErrorMessage: "Backend PDF API request failed",
});

export async function backendPdfMutator<T>(
  config: AxiosRequestConfig,
  extraOptions?: AxiosRequestConfig,
): Promise<T> {
  return backendPdfRequestMutator<T>(config, extraOptions);
}
