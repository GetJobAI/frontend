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
          path: "src/server/api/core-mutator.ts",
          name: "coreMutator",
        },
      },
    },
  },
  pdf: {
    input: { target: ".docs/openapi/pdf-generator.json" },
    output: {
      target: "src/server/api/generated/pdf-generator/pdf-generator.ts",
      schemas: "src/server/api/generated/pdf-generator/schemas",
      client: "axios-functions",
      clean: true,
      override: {
        mutator: {
          path: "src/server/api/pdf-generator-mutator.ts",
          name: "pdfGeneratorMutator",
        },
      },
    },
  },
  optimizer: {
    input: { target: ".docs/openapi/optimizer.json" },
    output: {
      target: "src/server/api/generated/optimizer/optimizer.ts",
      schemas: "src/server/api/generated/optimizer/schemas",
      client: "axios-functions",
      clean: true,
      override: {
        mutator: {
          path: "src/server/api/optimizer-mutator.ts",
          name: "optimizerMutator",
        },
      },
    },
  },
  parser: {
    input: { target: ".docs/openapi/parser.json" },
    output: {
      target: "src/server/api/generated/parser/parser.ts",
      schemas: "src/server/api/generated/parser/schemas",
      client: "axios-functions",
      clean: true,
      override: {
        mutator: {
          path: "src/server/api/parser-mutator.ts",
          name: "parserMutator",
        },
      },
    },
  },
});
