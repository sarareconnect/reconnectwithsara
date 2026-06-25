"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validation";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import { rateLimit } from "@/lib/auth/rate-limit";

export interface AuthState {
  error?: string;
}

async function clientKey(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  const ip = fwd?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  return `login:${ip}`;
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const limit = rateLimit(await clientKey(), 5, 60_000);
  if (!limit.success) {
    return {
      error: `Too many attempts. Try again in ${limit.retryAfterSeconds}s.`,
    };
  }

  const parsed = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Enter your username/email and password." };
  }

  const { identifier, password } = parsed.data;
  let destination: string | null = null;

  // Try super admin (by email) first.
  const admin = await prisma.admin.findUnique({
    where: { email: identifier.toLowerCase() },
  });
  if (admin && (await verifyPassword(password, admin.passwordHash))) {
    await setSessionCookie({
      sub: admin.id,
      role: "SUPER_ADMIN",
      name: admin.name,
    });
    destination = "/admin";
  } else {
    // Then enterprise manager (by username or manager email).
    const enterprise = await prisma.enterprise.findFirst({
      where: {
        OR: [
          { username: identifier },
          { managerEmail: identifier.toLowerCase() },
        ],
      },
    });
    if (
      enterprise &&
      enterprise.status === "ACTIVE" &&
      (await verifyPassword(password, enterprise.passwordHash))
    ) {
      await setSessionCookie({
        sub: enterprise.id,
        role: "ENTERPRISE_MANAGER",
        name: enterprise.managerName,
        enterpriseId: enterprise.id,
      });
      destination = "/dashboard";
    } else if (enterprise && enterprise.status === "SUSPENDED") {
      return { error: "This account is suspended. Contact the administrator." };
    }
  }

  if (!destination) {
    // Uniform error to avoid user enumeration.
    return { error: "Invalid credentials." };
  }

  redirect(destination);
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}
