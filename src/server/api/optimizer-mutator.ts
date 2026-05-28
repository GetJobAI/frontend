import { createMutator } from "./mutator";
import type { AxiosRequestConfig } from "axios";

const optimizerRequestMutator = createMutator({
  basePath: "/api/v1",
  logPrefix: "optimizer-api",
  fallbackErrorMessage: "Optimizer API request failed",
});

export async function optimizerMutator<T>(
  config: AxiosRequestConfig,
  extraOptions?: AxiosRequestConfig,
): Promise<T> {
  const url =
    typeof config.url === "string"
      ? config.url.replace(/^\/api/, "")
      : config.url;

  return optimizerRequestMutator<T>({ ...config, url }, extraOptions);
}
