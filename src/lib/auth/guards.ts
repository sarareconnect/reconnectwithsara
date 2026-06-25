import "server-only";
import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "@/lib/auth/session";

/** Require any authenticated session, else redirect to login. */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/** Require a super admin session, else redirect. */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "SUPER_ADMIN") redirect("/dashboard");
  return session;
}

/** Require an enterprise manager session, else redirect. */
export async function requireEnterprise(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ENTERPRISE_MANAGER" || !session.enterpriseId) {
    redirect("/admin");
  }
  return session;
}

/**
 * Assert that the current enterprise session owns the given enterprise id.
 * Throws on violation — used inside server actions for tenant isolation.
 */
export function assertOwnsEnterprise(
  session: SessionPayload,
  enterpriseId: string
): void {
  if (session.role === "SUPER_ADMIN") return;
  if (session.enterpriseId !== enterpriseId) {
    throw new Error("Forbidden: cross-tenant access denied");
  }
}
