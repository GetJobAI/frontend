import { defineConfig } from "orval";

export default defineConfig({
  backend: {
    input: { target: ".agents/docs/api.json" },
    output: {
      mode: "tags-split",
      target: "src/server/api/generated",
      schemas: "src/server/api/generated/schemas",
      client: "axios-functions",
      clean: true,
      override: {
        mutator: {
          path: "src/server/api/backend-mutator.ts",
          name: "backendMutator",
        },
      },
    },
  },
});
