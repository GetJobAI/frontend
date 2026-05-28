/** Per-request timeout so smoke tests cannot hang on a dead service. */
export const TEST_HTTP_TIMEOUT_MS = 20_000;

/** Poll for async pipeline only when ATS seed succeeded. */
export const PIPELINE_POLL_TIMEOUT_MS = 30_000;

export const testHttpOptions = { timeout: TEST_HTTP_TIMEOUT_MS };
