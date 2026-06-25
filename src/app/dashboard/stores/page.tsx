import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireEnterprise } from "@/lib/auth/guards";
import { listStores } from "@/lib/queries/stores";
import { StoreTable, type StoreRow } from "@/components/stores/store-table";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function DashboardStoresPage({ searchParams }: PageProps) {
  const session = await requireEnterprise();
  const enterpriseId = session.enterpriseId!;
  const sp = await searchParams;

  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const result = await listStores({
    enterpriseId,
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
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to overview
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">Stores</h1>
        <p className="text-sm text-slate-500">
          Manage offers, contact details, and downloads for every location.
        </p>
      </div>

      <StoreTable
        enterpriseId={enterpriseId}
        rows={rows}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        pageCount={result.pageCount}
        search={sp.q ?? ""}
        editBasePath="/dashboard/stores"
      />
    </div>
  );
}
