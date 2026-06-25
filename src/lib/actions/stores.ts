"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  requireSession,
} from "@/lib/auth/guards";
import type { SessionPayload } from "@/lib/auth/session";
import { storeUpdateSchema, bulkOfferSchema } from "@/lib/validation";
import { qrStoragePath, friendCardStoragePath } from "@/lib/assets/paths";
import type { ActionResult } from "@/lib/actions/enterprises";

/** Scope a store query so enterprise managers only ever touch their own. */
function storeScope(session: SessionPayload, storeId: string) {
  return session.role === "SUPER_ADMIN"
    ? { id: storeId }
    : { id: storeId, enterpriseId: session.enterpriseId! };
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

/** Parse "benefits" textarea (one per line) into a string array. */
function parseBenefits(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function updateStore(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireSession();

  const parsed = storeUpdateSchema.safeParse({
    id: formData.get("id"),
    storeName: formData.get("storeName") ?? undefined,
    offerTitle: formData.get("offerTitle") ?? undefined,
    benefits: parseBenefits(formData.get("benefits")),
    phone: formData.get("phone") ?? undefined,
    whatsapp: formData.get("whatsapp") ?? undefined,
    mapsLink: formData.get("mapsLink") ?? undefined,
    instagram: formData.get("instagram") ?? undefined,
    youtube: formData.get("youtube") ?? undefined,
    facebook: formData.get("facebook") ?? undefined,
    storeLink: formData.get("storeLink") ?? undefined,
    active: formData.get("active") === "on" || formData.get("active") === "true",
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: zodToFieldErrors(parsed.error.issues) };
  }

  const { id, ...data } = parsed.data;

  // Tenant isolation: ensure the store is visible to this session.
  const store = await prisma.store.findFirst({
    where: storeScope(session, id),
    select: { id: true, enterpriseId: true },
  });
  if (!store) return { ok: false, error: "Store not found" };

  await prisma.store.update({
    where: { id },
    data: {
      ...(data.storeName !== undefined ? { storeName: data.storeName } : {}),
      ...(data.offerTitle !== undefined
        ? { offerTitle: data.offerTitle ?? null }
        : {}),
      ...(data.benefits !== undefined ? { benefits: data.benefits } : {}),
      ...(data.phone !== undefined ? { phone: data.phone ?? null } : {}),
      ...(data.whatsapp !== undefined ? { whatsapp: data.whatsapp ?? null } : {}),
      ...(data.mapsLink !== undefined ? { mapsLink: data.mapsLink ?? null } : {}),
      ...(data.instagram !== undefined
        ? { instagram: data.instagram ?? null }
        : {}),
      ...(data.youtube !== undefined ? { youtube: data.youtube ?? null } : {}),
      ...(data.facebook !== undefined ? { facebook: data.facebook ?? null } : {}),
      ...(data.storeLink !== undefined
        ? { storeLink: data.storeLink ?? null }
        : {}),
      ...(data.active !== undefined ? { active: data.active } : {}),
    },
  });

  revalidatePath("/dashboard/stores");
  revalidatePath(`/dashboard/stores/${id}`);
  revalidatePath(`/admin/enterprises/${store.enterpriseId}/stores`);
  return { ok: true, id };
}

/** Apply an offer to all stores or a selected subset (bulk). */
export async function bulkApplyOffer(
  input: unknown
): Promise<ActionResult & { updated?: number }> {
  const session = await requireSession();
  const parsed = bulkOfferSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: zodToFieldErrors(parsed.error.issues) };
  }
  const { enterpriseId, offerTitle, benefits, storeIds } = parsed.data;

  if (
    session.role === "ENTERPRISE_MANAGER" &&
    session.enterpriseId !== enterpriseId
  ) {
    return { ok: false, error: "Forbidden" };
  }

  const result = await prisma.store.updateMany({
    where: {
      enterpriseId,
      ...(storeIds.length > 0 ? { id: { in: storeIds } } : {}),
    },
    data: { offerTitle, benefits },
  });

  revalidatePath("/dashboard/stores");
  return { ok: true, updated: result.count };
}

/** Toggle a store active/inactive. */
export async function setStoreActive(
  id: string,
  active: boolean
): Promise<ActionResult> {
  const session = await requireSession();
  const store = await prisma.store.findFirst({
    where: storeScope(session, id),
    select: { id: true, enterpriseId: true },
  });
  if (!store) return { ok: false, error: "Store not found" };

  await prisma.store.update({ where: { id }, data: { active } });
  revalidatePath("/dashboard/stores");
  revalidatePath(`/admin/enterprises/${store.enterpriseId}/stores`);
  return { ok: true };
}

/**
 * Backfill missing asset path columns for an enterprise's stores.
 * Assets themselves are rendered on demand; this records their storage paths.
 */
export async function ensureAssetPaths(
  enterpriseId: string
): Promise<{ updated: number }> {
  const session = await requireSession();
  if (
    session.role === "ENTERPRISE_MANAGER" &&
    session.enterpriseId !== enterpriseId
  ) {
    throw new Error("Forbidden");
  }

  const stores = await prisma.store.findMany({
    where: {
      enterpriseId,
      OR: [{ qrCodePath: null }, { friendCardPath: null }],
    },
    select: { id: true, slug: true },
  });

  await Promise.all(
    stores.map((s) =>
      prisma.store.update({
        where: { id: s.id },
        data: {
          qrCodePath: qrStoragePath(enterpriseId, s.slug),
          friendCardPath: friendCardStoragePath(enterpriseId, s.slug),
        },
      })
    )
  );

  return { updated: stores.length };
}
