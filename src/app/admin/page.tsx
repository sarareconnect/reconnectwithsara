import { Building2, Plus, Store, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/dashboard/stat-card";
import { EnterpriseFormDialog } from "@/components/admin/enterprise-form-dialog";
import { EnterpriseRowActions } from "@/components/admin/enterprise-row-actions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminEnterprisesPage() {
  const [enterprises, totalStores, activeStores] = await Promise.all([
    prisma.enterprise.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { stores: true } } },
    }),
    prisma.store.count(),
    prisma.store.count({ where: { active: true } }),
  ]);

  const activeEnterprises = enterprises.filter(
    (e) => e.status === "ACTIVE"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Enterprises</h1>
          <p className="text-sm text-slate-500">
            Onboard clients and manage their store networks.
          </p>
        </div>
        <EnterpriseFormDialog
          mode="create"
          trigger={
            <Button>
              <Plus className="h-4 w-4" /> New enterprise
            </Button>
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Enterprises"
          value={enterprises.length}
          icon={Building2}
        />
        <StatCard
          label="Active enterprises"
          value={activeEnterprises}
          icon={CheckCircle2}
        />
        <StatCard label="Total stores" value={totalStores} icon={Store} />
        <StatCard
          label="Active stores"
          value={activeStores}
          icon={CheckCircle2}
        />
      </div>

      <div className="rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Enterprise</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Stores</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {enterprises.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-slate-500"
                >
                  No enterprises yet. Create your first one to get started.
                </TableCell>
              </TableRow>
            )}
            {enterprises.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium text-slate-900">
                  {e.name}
                </TableCell>
                <TableCell>
                  <div className="text-slate-700">{e.managerName}</div>
                  <div className="text-xs text-slate-400">{e.managerEmail}</div>
                </TableCell>
                <TableCell className="text-slate-600">{e.username}</TableCell>
                <TableCell className="text-slate-600">
                  {e._count.stores}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={e.status === "ACTIVE" ? "success" : "warning"}
                  >
                    {e.status === "ACTIVE" ? "Active" : "Suspended"}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-500">
                  {formatDate(e.createdAt)}
                </TableCell>
                <TableCell>
                  <EnterpriseRowActions
                    enterprise={{
                      id: e.id,
                      name: e.name,
                      managerName: e.managerName,
                      managerEmail: e.managerEmail,
                      managerPhone: e.managerPhone,
                      username: e.username,
                      status: e.status,
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
