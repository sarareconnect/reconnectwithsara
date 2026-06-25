import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export interface StoreListParams {
  enterpriseId: string;
  search?: string;
  active?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: "storeName" | "updatedAt" | "createdAt";
  sortDir?: "asc" | "desc";
}

export interface StoreListResult {
  rows: Awaited<ReturnType<typeof prisma.store.findMany>>;
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

const MAX_PAGE_SIZE = 100;

/** Server-side paginated, searchable, filterable store listing. */
export async function listStores(
  params: StoreListParams
): Promise<StoreListResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, params.pageSize ?? 25));
  const sortBy = params.sortBy ?? "updatedAt";
  const sortDir = params.sortDir ?? "desc";

  const where: Prisma.StoreWhereInput = {
    enterpriseId: params.enterpriseId,
    ...(params.active !== undefined ? { active: params.active } : {}),
    ...(params.search
      ? {
        OR: [
          { storeName: { contains: params.search, mode: "insensitive" } },
          { offerTitle: { contains: params.search, mode: "insensitive" } },
          { phone: { contains: params.search, mode: "insensitive" } },
          { whatsapp: { contains: params.search, mode: "insensitive" } },
          { slug: { contains: params.search, mode: "insensitive" } },
        ],
      }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.store.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.store.count({ where }),
  ]);

  return {
    rows,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Aggregate metrics for the enterprise dashboard. */
export async function enterpriseMetrics(enterpriseId: string) {
  const [total, active, lastUpdatedStore] = await Promise.all([
    prisma.store.count({ where: { enterpriseId } }),
    prisma.store.count({ where: { enterpriseId, active: true } }),
    prisma.store.findFirst({
      where: { enterpriseId },
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    }),
  ]);

  return {
    totalStores: total,
    activeStores: active,
    // Every store has exactly one QR code and one friend card.
    totalQrCodes: total,
    totalFriendCards: total,
    lastUpdated: lastUpdatedStore?.updatedAt ?? null,
  };
}

/** Fetch a single store scoped to an enterprise (tenant isolation). */
export async function getStoreForEnterprise(
  enterpriseId: string,
  storeId: string
) {
  return prisma.store.findFirst({
    where: { id: storeId, enterpriseId },
  });
}

/** Public landing-page lookup by slug. */
export async function getStoreBySlug(slug: string) {
  return prisma.store.findUnique({ where: { slug } });
}
