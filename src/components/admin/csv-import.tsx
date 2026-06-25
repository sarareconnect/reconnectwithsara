"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Upload, FileWarning } from "lucide-react";
import { importStoresFromCsv, type ImportResult } from "@/lib/actions/import";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export function CsvImport({ enterpriseId }: { enterpriseId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"append" | "replace">("append");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ImportResult | null>(null);

  const onFile = (file: File) => {
    if (file.size > MAX_BYTES) {
      toast.error("File exceeds the 10MB limit.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result ?? "");
      startTransition(async () => {
        const res = await importStoresFromCsv({
          enterpriseId,
          fileName: file.name,
          content,
          mode,
        });
        setResult(res);
        if (res.ok) {
          toast.success(
            `Imported ${res.created} store${res.created === 1 ? "" : "s"}` +
            (res.failed ? `, ${res.failed} failed` : "")
          );
        } else {
          toast.error(res.error ?? "Import failed");
        }
        if (inputRef.current) inputRef.current.value = "";
      });
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Import mode
          </label>
          <Select
            value={mode}
            onValueChange={(v) => setMode(v as "append" | "replace")}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="append">Append to existing</SelectItem>
              <SelectItem value="replace">Replace all stores</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFile(file);
          }}
        />
        <Button
          onClick={() => inputRef.current?.click()}
          disabled={pending}
        >
          <Upload className="h-4 w-4" />
          {pending ? "Importing…" : "Upload CSV"}
        </Button>
      </div>

      <p className="text-xs text-slate-500">
        Expected columns: <code>store_name</code> (required), <code>city</code>,
        <code> offer_title</code>, <code>benefits</code> (separate with{" "}
        <code>;</code>), <code>phone</code>, <code>whatsapp</code>,{" "}
        <code>maps_link</code>, <code>instagram</code>, <code>youtube</code>,{" "}
        <code>facebook</code>, <code>store_link</code>,{" "}
        <code>custom_buttons</code> (<code>Label=URL; …</code>).
      </p>

      {result && (
        <div className="rounded-lg border bg-slate-50 p-4 text-sm">
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <span className="text-emerald-700">
              Created: <strong>{result.created}</strong>
            </span>
            <span className="text-slate-600">
              Updated: <strong>{result.updated}</strong>
            </span>
            <span className="text-red-600">
              Failed: <strong>{result.failed}</strong>
            </span>
          </div>
          {result.rowErrors.length > 0 && (
            <div className="mt-3 max-h-40 overflow-auto rounded border bg-white p-2">
              {result.rowErrors.slice(0, 50).map((err, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 py-0.5 text-xs text-red-600"
                >
                  <FileWarning className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    Row {err.row}: {err.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
