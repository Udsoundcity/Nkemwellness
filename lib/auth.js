import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function getSecretKey() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

/** Create a signed session token for the given admin username. */
export async function createSessionToken(username) {
  return await new SignJWT({ sub: username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

/** Verify a session token. Returns the payload, or null if invalid/expired. */
export async function verifySessionToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.role !== "admin") return null;
    return payload;
  } catch {
    return null;
  }
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_COOKIE_MAX_AGE = SESSION_TTL_SECONDS;

/**
 * Reads the admin_session cookie off an incoming Request (App Router route
 * handlers) and verifies it. Use in every /api/admin* and mutating
 * /api/products, /api/forms, /api/orders route.
 */
export async function requireAdmin(request) {
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const payload = await verifySessionToken(cookie);
  return payload; // null if unauthenticated
}
