import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { listStores } from "@/lib/queries/stores";
import { StoreTable, type StoreRow } from "@/components/stores/store-table";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function AdminEnterpriseStoresPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const sp = await searchParams;

  const enterprise = await prisma.enterprise.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
  if (!enterprise) notFound();

  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const result = await listStores({
    enterpriseId: id,
    search: sp.q,
    page,
    pageSize: 25,
  });

  const rows: StoreRow[] = result.rows.map((s) => ({
    id: s.id,
    storeName: s.storeName,
    slug: s.slug,
    offerTitle: s.offerTitle,
    phone: s.phone,
    whatsapp: s.whatsapp,
    mapsLink: s.mapsLink,
    active: s.active,
  }));

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/enterprises/${id}`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> {enterprise.name}
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">Stores</h1>
        <p className="text-sm text-slate-500">
          {result.total} store{result.total === 1 ? "" : "s"} in this network.
        </p>
      </div>

      <StoreTable
        enterpriseId={id}
        rows={rows}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        pageCount={result.pageCount}
        search={sp.q ?? ""}
        editBasePath={`/admin/enterprises/${id}/stores`}
      />
    </div>
  );
}
