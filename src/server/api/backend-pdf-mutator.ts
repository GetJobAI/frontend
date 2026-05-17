import { createBackendMutator } from "./backend-mutator-shared";

export const backendPdfMutator = createBackendMutator({
  basePath: "/api/v1/pdf",
  logPrefix: "backend-pdf-api",
  fallbackErrorMessage: "Backend PDF API request failed",
});
