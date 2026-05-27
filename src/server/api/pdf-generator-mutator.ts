import { createMutator } from "./mutator";
import type { AxiosRequestConfig } from "axios";

const pdfGeneratorRequestMutator = createMutator({
  basePath: "/api/v1/pdf",
  logPrefix: "pdf-generator-api",
  fallbackErrorMessage: "PDF generator API request failed",
});

export async function pdfGeneratorMutator<T>(
  config: AxiosRequestConfig,
  extraOptions?: AxiosRequestConfig,
): Promise<T> {
  return pdfGeneratorRequestMutator<T>(config, extraOptions);
}
