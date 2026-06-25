import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function RootPage() {
  const session = await getSession();
  if (session?.role === "SUPER_ADMIN") redirect("/admin");
  if (session?.role === "ENTERPRISE_MANAGER") redirect("/dashboard");
  redirect("/login");
}
