import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const session = await getSession();
  if (session?.role === "SUPER_ADMIN") redirect("/admin");
  if (session?.role === "ENTERPRISE_MANAGER") redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
            S
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Sara
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to manage your stores
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
