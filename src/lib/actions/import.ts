"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireSession, assertOwnsEnterprise } from "@/lib/auth/guards";
import { parseStoreCsv, splitList, parseCustomButtons } from "@/lib/csv";
import { buildSlug, ensureUniqueSlug, slugify } from "@/lib/slug";
import { qrStoragePath, friendCardStoragePath } from "@/lib/assets/paths";

export interface ImportResult {
  ok: boolean;
  error?: string;
  created: number;
  updated: number;
  failed: number;
  rowErrors: Array<{ row: number; message: string }>;
}

const EMPTY: ImportResult = {
  ok: false,
  created: 0,
  updated: 0,
  failed: 0,
  rowErrors: [],
};

/**
 * Import stores from CSV content for an enterprise.
 *
 * @param mode "append" keeps existing stores; "replace" deletes all existing
 *             stores for the enterprise before import.
 */
export async function importStoresFromCsv(args: {
  enterpriseId: string;
  fileName: string;
  content: string;
  mode?: "append" | "replace";
}): Promise<ImportResult> {
  const session = await requireSession();
  assertOwnsEnterprise(session, args.enterpriseId);

  const { rows, errors } = parseStoreCsv(args.content);
  if (rows.length === 0) {
    return {
      ...EMPTY,
      error:
        errors.length > 0
          ? "No valid rows found. Check the highlighted errors."
          : "The CSV file is empty.",
      rowErrors: errors,
    };
  }

  if (args.mode === "replace") {
    await prisma.store.deleteMany({
      where: { enterpriseId: args.enterpriseId },
    });
  }

  // Pre-load existing slugs to guarantee global uniqueness efficiently.
  const existing = await prisma.store.findMany({
    select: { slug: true },
  });
  const used = new Set(existing.map((s) => s.slug));

  let created = 0;
  let updated = 0;
  let failed = 0;
  const rowErrors = [...errors];

  // Process in batches to keep memory bounded for large files.
  const BATCH = 500;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);

    const toCreate: Prisma.StoreCreateManyInput[] = [];

    for (const row of batch) {
      try {
        const baseSlug =
          (row.slug && slugify(row.slug)) ||
          buildSlug([row.city, row.store_name]);
        const slug = ensureUniqueSlug(baseSlug, used);

        toCreate.push({
          enterpriseId: args.enterpriseId,
          storeName: row.store_name,
          slug,
          offerTitle: row.offer_title || null,
          benefits: splitList(row.benefits),
          phone: row.phone || null,
          whatsapp: row.whatsapp || null,
          mapsLink: row.maps_link || null,
          instagram: row.instagram || null,
          youtube: row.youtube || null,
          facebook: row.facebook || null,
          storeLink: row.store_link || null,
          customButtons: parseCustomButtons(row.custom_buttons),
          qrCodePath: qrStoragePath(args.enterpriseId, slug),
          friendCardPath: friendCardStoragePath(args.enterpriseId, slug),
        });
      } catch (e) {
        failed += 1;
        rowErrors.push({
          row: i + 2,
          message: e instanceof Error ? e.message : "Unknown error",
        });
      }
    }

    if (toCreate.length > 0) {
      const res = await prisma.store.createMany({
        data: toCreate,
        skipDuplicates: true,
      });
      created += res.count;
    }
  }

  await prisma.bulkUpload.create({
    data: {
      enterpriseId: args.enterpriseId,
      fileName: args.fileName,
      recordsCreated: created,
      recordsUpdated: updated,
      recordsFailed: failed,
    },
  });

  revalidatePath("/dashboard/stores");
  revalidatePath(`/admin/enterprises/${args.enterpriseId}`);

  return { ok: true, created, updated, failed, rowErrors };
}
