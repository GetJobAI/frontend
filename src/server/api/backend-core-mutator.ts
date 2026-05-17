import { createBackendMutator } from "./backend-mutator-shared";

export const backendMutator = createBackendMutator({
  basePath: "/api/v1",
  logPrefix: "backend-api",
  fallbackErrorMessage: "Backend Core API request failed",
});
