import "server-only";
import { getSession, type SessionPayload } from "@/lib/auth/session";

/**
 * Authorize an API request against an enterprise resource.
 * Returns the session when allowed, otherwise null.
 */
export async function authorizeEnterprise(
  enterpriseId: string
): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session) return null;
  if (session.role === "SUPER_ADMIN") return session;
  if (
    session.role === "ENTERPRISE_MANAGER" &&
    session.enterpriseId === enterpriseId
  ) {
    return session;
  }
  return null;
}
