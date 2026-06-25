"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
} from "@tanstack/react-table";
import {
  Search,
  Loader2,
  QrCode,
  IdCard,
  Pencil,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BulkOfferDialog } from "@/components/stores/bulk-offer-dialog";
import { DownloadsToolbar } from "@/components/dashboard/downloads-toolbar";
import { LinkPending } from "@/components/ui/link-pending";
import { cn } from "@/lib/utils";

export interface StoreRow {
  id: string;
  storeName: string;
  slug: string;
  offerTitle: string | null;
  phone: string | null;
  whatsapp: string | null;
  mapsLink: string | null;
  active: boolean;
}

interface StoreTableProps {
  enterpriseId: string;
  rows: StoreRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  search: string;
  /** Base path used for the "edit store" link. */
  editBasePath: string;
}

export function StoreTable({
  enterpriseId,
  rows,
  total,
  page,
  pageSize,
  pageCount,
  search,
  editBasePath,
}: StoreTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [searchValue, setSearchValue] = React.useState(search);
  const [isPending, startTransition] = React.useTransition();

  const pushParams = React.useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      startTransition(() => {
        router.push(`${pathname}?${next.toString()}`);
      });
    },
    [params, pathname, router]
  );

  // Debounced search submission.
  React.useEffect(() => {
    const t = setTimeout(() => {
      if (searchValue !== search) {
        pushParams({ q: searchValue || null, page: "1" });
      }
    }, 350);
    return () => clearTimeout(t);
  }, [searchValue, search, pushParams]);

  const columns = React.useMemo<ColumnDef<StoreRow>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: "storeName",
        header: "Store name",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-slate-900">
              {row.original.storeName}
            </div>
            <div className="text-xs text-slate-400">/{row.original.slug}</div>
          </div>
        ),
      },
      {
        accessorKey: "offerTitle",
        header: "Offer",
        cell: ({ row }) => (
          <span className="text-slate-600">
            {row.original.offerTitle ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => row.original.phone ?? "—",
      },
      {
        accessorKey: "whatsapp",
        header: "WhatsApp",
        cell: ({ row }) => row.original.whatsapp ?? "—",
      },
      {
        accessorKey: "mapsLink",
        header: "Address",
        cell: ({ row }) =>
          row.original.mapsLink ? (
            <a
              href={row.original.mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
            >
              Map <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            "—"
          ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.active ? "success" : "warning"}>
            {row.original.active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild title="Edit">
              <Link href={`${editBasePath}/${row.original.id}`}>
                <LinkPending>
                  <Pencil className="h-4 w-4" />
                </LinkPending>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild title="Download QR">
              <a href={`/api/stores/${row.original.id}/qr`} download>
                <QrCode className="h-4 w-4" />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              title="Download friend card"
            >
              <a
                href={`/api/stores/${row.original.id}/friend-card?download=1`}
                download
              >
                <IdCard className="h-4 w-4" />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              title="Open landing page"
            >
              <a
                href={`/store/${row.original.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        ),
      },
    ],
    [editBasePath]
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    manualPagination: true,
    pageCount,
  });

  const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k]);

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search stores…"
            className="pl-8"
          />
          {isPending && (
            <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-slate-400" />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <span className="text-sm text-slate-500">
              {selectedIds.length} selected
            </span>
          )}
          <BulkOfferDialog
            enterpriseId={enterpriseId}
            selectedIds={selectedIds}
            onApplied={() => setRowSelection({})}
          />
          <DownloadsToolbar
            enterpriseId={enterpriseId}
            selectedIds={selectedIds}
          />
        </div>
      </div>

      <div className="hidden rounded-xl border bg-white md:block">
        <Table
          className={cn(
            "transition-opacity",
            isPending && "pointer-events-none opacity-60"
          )}
        >
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-10 text-center text-sm text-slate-500"
                >
                  No stores found.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card list */}
      <div
        className={cn(
          "space-y-3 transition-opacity md:hidden",
          isPending && "pointer-events-none opacity-60"
        )}
      >
        {table.getRowModel().rows.length === 0 ? (
          <div className="rounded-xl border bg-white py-10 text-center text-sm text-slate-500">
            No stores found.
          </div>
        ) : (
          table.getRowModel().rows.map((row) => {
            const store = row.original;
            return (
              <div
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
                className="rounded-xl border bg-white p-4 data-[state=selected]:border-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <Checkbox
                      className="mt-1"
                      checked={row.getIsSelected()}
                      onCheckedChange={(value) => row.toggleSelected(!!value)}
                      aria-label="Select row"
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900">
                        {store.storeName}
                      </div>
                      <div className="truncate text-xs text-slate-400">
                        /{store.slug}
                      </div>
                    </div>
                  </div>
                  <Badge variant={store.active ? "success" : "warning"}>
                    {store.active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-400">Offer</dt>
                    <dd className="text-right text-slate-700">
                      {store.offerTitle ?? "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-400">Phone</dt>
                    <dd className="text-right text-slate-700">
                      {store.phone ?? "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-400">WhatsApp</dt>
                    <dd className="text-right text-slate-700">
                      {store.whatsapp ?? "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-400">Address</dt>
                    <dd className="text-right text-slate-700">
                      {store.mapsLink ? (
                        <a
                          href={store.mapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 hover:text-slate-900"
                        >
                          Map <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        "—"
                      )}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 flex items-center gap-1 border-t pt-3">
                  <Button variant="ghost" size="icon" asChild title="Edit">
                    <Link href={`${editBasePath}/${store.id}`}>
                      <LinkPending>
                        <Pencil className="h-4 w-4" />
                      </LinkPending>
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    title="Download QR"
                  >
                    <a href={`/api/stores/${store.id}/qr`} download>
                      <QrCode className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    title="Download friend card"
                  >
                    <a
                      href={`/api/stores/${store.id}/friend-card?download=1`}
                      download
                    >
                      <IdCard className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    title="Open landing page"
                  >
                    <a
                      href={`/store/${store.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <span>
          Showing {from}–{to} of {total}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => pushParams({ page: String(page - 1) })}
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <span>
            Page {page} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount}
            onClick={() => pushParams({ page: String(page + 1) })}
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
