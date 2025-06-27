/**
 * Public routes that do not require authentication
 * These routes should not have Authorization headers added by the interceptor
 * 
 * Note: Other auth routes like /v1/auth/logout, /v1/auth/validate, and /v1/tokens/refresh
 * are NOT in this list, so they WILL receive Authorization headers as needed.
 */
export const PUBLIC_AUTH_ROUTES = [
  '/v1/auth/login',
  '/v1/auth/register',
  '/v1/auth/verify',
  '/v1/auth/forgot-password',
  '/v1/auth/reset-password'
] as const;

/**
 * Client-side public routes for navigation
 */
export const PUBLIC_CLIENT_ROUTES = [
  '/auth/login',
  '/auth/register', 
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/email-verification'
] as const;

/**
 * Checks if a URL matches any of the public API routes
 * @param url - The URL to check
 * @returns true if the URL is a public route
 */
export function isPublicApiRoute(url: string): boolean {
  return PUBLIC_AUTH_ROUTES.some(route => url.includes(route));
}

/**
 * Checks if a URL matches any of the public client routes
 * @param url - The URL to check
 * @returns true if the URL is a public client route
 */
export function isPublicClientRoute(url: string): boolean {
  return PUBLIC_CLIENT_ROUTES.some(route => url.includes(route));
} 