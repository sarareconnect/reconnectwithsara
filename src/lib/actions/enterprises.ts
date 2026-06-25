"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { hashPassword } from "@/lib/auth/password";
import {
  enterpriseCreateSchema,
  enterpriseUpdateSchema,
} from "@/lib/validation";

export interface ActionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  id?: string;
}

function zodToFieldErrors(
  issues: { path: (string | number)[]; message: string }[]
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const key = String(i.path[0] ?? "form");
    if (!out[key]) out[key] = i.message;
  }
  return out;
}

export async function createEnterprise(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = enterpriseCreateSchema.safeParse({
    name: formData.get("name"),
    managerName: formData.get("managerName"),
    managerEmail: formData.get("managerEmail"),
    managerPhone: formData.get("managerPhone"),
    username: formData.get("username"),
    password: formData.get("password"),
    status: formData.get("status") ?? "ACTIVE",
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: zodToFieldErrors(parsed.error.issues) };
  }

  const data = parsed.data;

  const existing = await prisma.enterprise.findUnique({
    where: { username: data.username },
  });
  if (existing) {
    return { ok: false, fieldErrors: { username: "Username already taken" } };
  }

  const enterprise = await prisma.enterprise.create({
    data: {
      name: data.name,
      managerName: data.managerName,
      managerEmail: data.managerEmail.toLowerCase(),
      managerPhone: data.managerPhone ?? null,
      username: data.username,
      passwordHash: await hashPassword(data.password),
      status: data.status,
    },
  });

  revalidatePath("/admin");
  return { ok: true, id: enterprise.id };
}

export async function updateEnterprise(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = enterpriseUpdateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    managerName: formData.get("managerName"),
    managerEmail: formData.get("managerEmail"),
    managerPhone: formData.get("managerPhone"),
    username: formData.get("username"),
    password: formData.get("password"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: zodToFieldErrors(parsed.error.issues) };
  }

  const { id, password, ...rest } = parsed.data;

  if (rest.username) {
    const clash = await prisma.enterprise.findFirst({
      where: { username: rest.username, NOT: { id } },
    });
    if (clash) {
      return { ok: false, fieldErrors: { username: "Username already taken" } };
    }
  }

  await prisma.enterprise.update({
    where: { id },
    data: {
      ...(rest.name !== undefined ? { name: rest.name } : {}),
      ...(rest.managerName !== undefined
        ? { managerName: rest.managerName }
        : {}),
      ...(rest.managerEmail !== undefined
        ? { managerEmail: rest.managerEmail.toLowerCase() }
        : {}),
      ...(rest.managerPhone !== undefined
        ? { managerPhone: rest.managerPhone ?? null }
        : {}),
      ...(rest.username !== undefined ? { username: rest.username } : {}),
      ...(rest.status !== undefined ? { status: rest.status } : {}),
      ...(password ? { passwordHash: await hashPassword(password) } : {}),
    },
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/enterprises/${id}`);
  return { ok: true, id };
}

export async function deleteEnterprise(id: string): Promise<ActionResult> {
  await requireAdmin();
  if (!id) return { ok: false, error: "Missing enterprise id" };

  // Cascades to stores and bulk uploads via schema relations.
  await prisma.enterprise.delete({ where: { id } });
  revalidatePath("/admin");
  return { ok: true };
}
