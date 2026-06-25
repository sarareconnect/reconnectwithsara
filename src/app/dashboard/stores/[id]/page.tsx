import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireEnterprise } from "@/lib/auth/guards";
import { getStoreForEnterprise } from "@/lib/queries/stores";
import { StoreForm } from "@/components/stores/store-form";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardStoreEditPage({ params }: PageProps) {
  const session = await requireEnterprise();
  const { id } = await params;
  const store = await getStoreForEnterprise(session.enterpriseId!, id);
  if (!store) notFound();

  const backHref = "/dashboard/stores";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Stores
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">
          {store.storeName}
        </h1>
      </div>
      <StoreForm
        backHref={backHref}
        store={{
          id: store.id,
          storeName: store.storeName,
          slug: store.slug,
          offerTitle: store.offerTitle,
          benefits: store.benefits,
          phone: store.phone,
          whatsapp: store.whatsapp,
          mapsLink: store.mapsLink,
          instagram: store.instagram,
          youtube: store.youtube,
          facebook: store.facebook,
          storeLink: store.storeLink,
          active: store.active,
        }}
      />
    </div>
  );
}
