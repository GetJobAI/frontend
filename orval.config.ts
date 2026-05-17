import { defineConfig } from "orval";

export default defineConfig({
  backend: {
    input: { target: ".docs/openapi/core.json" },
    output: {
      mode: "tags-split",
      target: "src/server/api/generated",
      schemas: "src/server/api/generated/schemas",
      client: "axios-functions",
      clean: true,
      override: {
        mutator: {
          path: "src/server/api/backend-core-mutator.ts",
          name: "backendMutator",
        },
      },
    },
  },
  pdf: {
    input: { target: ".docs/openapi/pdf-generator.json" },
    output: {
      target: "src/server/api/generated/pdf/pdf-generator.ts",
      schemas: "src/server/api/generated/pdf/schemas",
      client: "axios-functions",
      clean: true,
      override: {
        mutator: {
          path: "src/server/api/backend-pdf-mutator.ts",
          name: "backendPdfMutator",
        },
      },
    },
  },
});
