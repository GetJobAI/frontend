import { createMutator } from "./mutator";
import type { AxiosRequestConfig } from "axios";

const parserRequestMutator = createMutator({
  basePath: "/api/v1/parser",
  logPrefix: "parser-api",
  fallbackErrorMessage: "Parser API request failed",
});

export async function parserMutator<T>(
  config: AxiosRequestConfig,
  extraOptions?: AxiosRequestConfig,
): Promise<T> {
  return parserRequestMutator<T>(config, extraOptions);
}
