import { createMutator } from "./mutator";
import type { AxiosRequestConfig } from "axios";

const optimizerRequestMutator = createMutator({
  basePath: "/api/v1/optimizer",
  logPrefix: "optimizer-api",
  fallbackErrorMessage: "Optimizer API request failed",
});

export async function optimizerMutator<T>(
  config: AxiosRequestConfig,
  extraOptions?: AxiosRequestConfig,
): Promise<T> {
  return optimizerRequestMutator<T>(config, extraOptions);
}
