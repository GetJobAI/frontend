const DEFAULT_AUTH_REDIRECT = "/dashboard";

export function resolveAuthRedirectUrl(redirectUrl?: string): string {
  if (!redirectUrl) {
    return DEFAULT_AUTH_REDIRECT;
  }

  if (redirectUrl.startsWith("/")) {
    return redirectUrl;
  }

  try {
    const url = new URL(redirectUrl);
    return url.pathname + url.search || DEFAULT_AUTH_REDIRECT;
  } catch {
    return DEFAULT_AUTH_REDIRECT;
  }
}
