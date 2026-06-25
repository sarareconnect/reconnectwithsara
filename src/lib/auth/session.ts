import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

export const SESSION_COOKIE = "sara_session";
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

export type SessionRole = "SUPER_ADMIN" | "ENTERPRISE_MANAGER";

export interface SessionPayload {
  /** Subject id — admin id or enterprise id. */
  sub: string;
  role: SessionRole;
  /** Display name. */
  name: string;
  /** For enterprise managers, their enterprise id (== sub). */
  enterpriseId?: string;
}

function secret(): Uint8Array {
  return new TextEncoder().encode(env.authSecret());
}

export async function createSessionToken(
  payload: SessionPayload
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .setIssuer("sara")
    .setAudience("sara")
    .sign(secret());
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), {
      issuer: "sara",
      audience: "sara",
    });
    if (
      typeof payload.sub === "string" &&
      (payload.role === "SUPER_ADMIN" || payload.role === "ENTERPRISE_MANAGER")
    ) {
      return {
        sub: payload.sub,
        role: payload.role as SessionRole,
        name: typeof payload.name === "string" ? payload.name : "",
        enterpriseId:
          typeof payload.enterpriseId === "string"
            ? payload.enterpriseId
            : undefined,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await createSessionToken(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
