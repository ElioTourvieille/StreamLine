/**
 * Reads JWT_SECRET from the environment. Throws instead of silently falling
 * back to an insecure default — a missing secret must never let the API boot
 * and sign real tokens with a publicly known value.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error(
      'JWT_SECRET is not set. Define it in apps/api/.env (or the deployment env) before starting the API.',
    )
  }
  return secret
}
