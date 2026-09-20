export const MIN_PASSWORD_LENGTH = 12;

const INTERNAL_ORIGIN = 'https://internal.invalid';

/**
 * Accept only same-site paths before passing user-controlled values to
 * Next.js navigation or server redirects.
 */
export function getSafeRedirectPath(
  value: string | null | undefined,
  fallback: string
): string {
  if (
    !value ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\')
  ) {
    return fallback;
  }

  try {
    const url = new URL(value, INTERNAL_ORIGIN);
    if (url.origin !== INTERNAL_ORIGIN) return fallback;

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
  }

  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
    return 'Password must include both uppercase and lowercase letters.';
  }

  if (!/\d/.test(password)) {
    return 'Password must include at least one number.';
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must include at least one symbol.';
  }

  return null;
}

export function buildAuthCallbackUrl(origin: string, nextPath: string): string {
  const safeNextPath = getSafeRedirectPath(nextPath, '/account');
  const callback = new URL('/auth/callback', origin);
  callback.searchParams.set('next', safeNextPath);
  return callback.toString();
}
