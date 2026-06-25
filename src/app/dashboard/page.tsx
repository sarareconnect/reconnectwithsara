import Link from "next/link";
import {
  Store,
  CheckCircle2,
  QrCode,
  IdCard,
  Clock,
  ArrowRight,
} from "lucide-react";
import { requireEnterprise } from "@/lib/auth/guards";
import { enterpriseMetrics } from "@/lib/queries/stores";
import { StatCard } from "@/components/dashboard/stat-card";
import { DownloadsToolbar } from "@/components/dashboard/downloads-toolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardOverviewPage() {
  const session = await requireEnterprise();
  const enterpriseId = session.enterpriseId!;
  const metrics = await enterpriseMetrics(enterpriseId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Overview</h1>
          <p className="text-sm text-slate-500">
            Your store network at a glance.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/stores">
            Manage stores <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
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
          <CardTitle>Bulk downloads &amp; export</CardTitle>
        </CardHeader>
        <CardContent>
          <DownloadsToolbar enterpriseId={enterpriseId} />
        </CardContent>
      </Card>
    </div>
  );
}
