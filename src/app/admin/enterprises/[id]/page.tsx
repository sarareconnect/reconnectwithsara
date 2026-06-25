import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Store,
  CheckCircle2,
  QrCode,
  IdCard,
  Clock,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { enterpriseMetrics } from "@/lib/queries/stores";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { CsvImport } from "@/components/admin/csv-import";
import { DownloadsToolbar } from "@/components/dashboard/downloads-toolbar";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EnterpriseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const enterprise = await prisma.enterprise.findUnique({
    where: { id },
    include: {
      bulkUploads: { orderBy: { uploadedAt: "desc" }, take: 10 },
    },
  });
  if (!enterprise) notFound();

  const metrics = await enterpriseMetrics(id);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Enterprises
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-xl font-semibold text-slate-900">
            {enterprise.name}
          </h1>
          <Badge variant={enterprise.status === "ACTIVE" ? "success" : "warning"}>
            {enterprise.status === "ACTIVE" ? "Active" : "Suspended"}
          </Badge>
        </div>
        <p className="text-sm text-slate-500">
          {enterprise.managerName} · {enterprise.managerEmail} · @
          {enterprise.username}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total stores" value={metrics.totalStores} icon={Store} />
        <StatCard
          label="Active stores"
          value={metrics.activeStores}
          icon={CheckCircle2}
        />
        <StatCard label="QR codes" value={metrics.totalQrCodes} icon={QrCode} />
        <StatCard
          label="Friend cards"
          value={metrics.totalFriendCards}
          icon={IdCard}
        />
        <StatCard
          label="Last updated"
          value={metrics.lastUpdated ? formatDate(metrics.lastUpdated) : "—"}
          icon={Clock}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import stores</CardTitle>
        </CardHeader>
        <CardContent>
          <CsvImport enterpriseId={enterprise.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Assets &amp; export</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/enterprises/${enterprise.id}/stores`}>
              View stores →
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <DownloadsToolbar enterpriseId={enterprise.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent imports</CardTitle>
        </CardHeader>
        <CardContent>
          {enterprise.bulkUploads.length === 0 ? (
            <p className="text-sm text-slate-500">No imports yet.</p>
          ) : (
            <ul className="divide-y">
              {enterprise.bulkUploads.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <span className="font-medium text-slate-700">
                    {u.fileName}
                  </span>
                  <span className="text-slate-500">
                    {u.recordsCreated} created · {u.recordsFailed} failed ·{" "}
                    {formatDate(u.uploadedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
