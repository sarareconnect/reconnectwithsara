"use client";

import { useState } from "react";
import { toast } from "sonner";
import { QrCode, IdCard, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DownloadsToolbarProps {
  enterpriseId: string;
  /** Optional selected store ids to scope the ZIPs. */
  selectedIds?: string[];
}

export function DownloadsToolbar({
  enterpriseId,
  selectedIds,
}: DownloadsToolbarProps) {
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const idsQuery =
    selectedIds && selectedIds.length > 0
      ? `?ids=${encodeURIComponent(selectedIds.join(","))}`
      : "";
  const scope = selectedIds && selectedIds.length > 0 ? "selected" : "all";

  const download = async (key: string, url: string, fallbackName: string) => {
    if (pendingKey) return;
    setPendingKey(key);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Download failed (${res.status})`);
      }
      const disposition = res.headers.get("content-disposition") ?? "";
      const match = /filename="?([^"]+)"?/i.exec(disposition);
      const fileName = match?.[1] ?? fallbackName;

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Download failed. Please retry."
      );
    } finally {
      setPendingKey(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={pendingKey !== null}
        onClick={() =>
          download(
            "qr",
            `/api/enterprises/${enterpriseId}/qr-zip${idsQuery}`,
            "qr-codes.zip"
          )
        }
      >
        {pendingKey === "qr" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <QrCode className="h-4 w-4" />
        )}
        {pendingKey === "qr" ? "Preparing…" : `Download QR codes (${scope})`}
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={pendingKey !== null}
        onClick={() =>
          download(
            "cards",
            `/api/enterprises/${enterpriseId}/friendcards-zip${idsQuery}`,
            "friend-cards.zip"
          )
        }
      >
        {pendingKey === "cards" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <IdCard className="h-4 w-4" />
        )}
        {pendingKey === "cards"
          ? "Preparing…"
          : `Download friend cards (${scope})`}
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={pendingKey !== null}
        onClick={() =>
          download(
            "csv",
            `/api/enterprises/${enterpriseId}/export`,
            "stores.csv"
          )
        }
      >
        {pendingKey === "csv" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-4 w-4" />
        )}
        {pendingKey === "csv" ? "Preparing…" : "Export CSV"}
      </Button>
    </div>
  );
}
