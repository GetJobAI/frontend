import { createMutator } from "./mutator";
import type { AxiosRequestConfig } from "axios";

const coreRequestMutator = createMutator({
  basePath: "/api/v1",
  logPrefix: "core-api",
  fallbackErrorMessage: "Core API request failed",
});

export async function coreMutator<T>(
  config: AxiosRequestConfig,
  extraOptions?: AxiosRequestConfig,
): Promise<T> {
  return coreRequestMutator<T>(config, extraOptions);
}
