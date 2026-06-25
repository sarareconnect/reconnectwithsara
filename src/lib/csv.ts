import Papa from "papaparse";
import { csvRowSchema, type CsvRow } from "@/lib/validation";

/**
 * Maps many human-friendly header spellings to the canonical column names
 * used by {@link csvRowSchema}. Case/space/underscore insensitive.
 */
const HEADER_ALIASES: Record<string, keyof CsvRow> = {
  storename: "store_name",
  store: "store_name",
  name: "store_name",
  offertitle: "offer_title",
  offer: "offer_title",
  benefits: "benefits",
  benefit: "benefits",
  phone: "phone",
  phonenumber: "phone",
  contact: "phone",
  whatsapp: "whatsapp",
  whatsappnumber: "whatsapp",
  mapslink: "maps_link",
  googlemaps: "maps_link",
  googlemapslink: "maps_link",
  directions: "maps_link",
  location: "maps_link",
  instagram: "instagram",
  insta: "instagram",
  youtube: "youtube",
  facebook: "facebook",
  fb: "facebook",
  storelink: "store_link",
  website: "store_link",
  custombuttons: "custom_buttons",
  buttons: "custom_buttons",
  city: "city",
  region: "city",
  slug: "slug",
};

function normalizeHeader(header: string): string {
  const key = header.trim().toLowerCase().replace(/[\s_-]+/g, "");
  return HEADER_ALIASES[key] ?? header.trim().toLowerCase().replace(/\s+/g, "_");
}

export interface ParsedCsv {
  rows: CsvRow[];
  errors: Array<{ row: number; message: string }>;
  totalRows: number;
}

/** Parse and validate a CSV string into canonical store rows. */
export function parseStoreCsv(content: string): ParsedCsv {
  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: normalizeHeader,
  });

  const rows: CsvRow[] = [];
  const errors: ParsedCsv["errors"] = [];

  result.data.forEach((raw, index) => {
    // Skip fully empty rows.
    const hasValue = Object.values(raw).some((v) => v && v.trim().length > 0);
    if (!hasValue) return;

    const parsed = csvRowSchema.safeParse(raw);
    if (!parsed.success) {
      errors.push({
        row: index + 2, // +1 for header, +1 for 1-based
        message: parsed.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; "),
      });
      return;
    }
    rows.push(parsed.data);
  });

  result.errors.forEach((e) => {
    errors.push({ row: (e.row ?? 0) + 2, message: e.message });
  });

  return { rows, errors, totalRows: rows.length + errors.length };
}

/** Split a delimited cell (";" or "|" or newline) into trimmed parts. */
export function splitList(value: string | undefined | null): string[] {
  if (!value) return [];
  return value
    .split(/[;|\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Parse a custom-buttons cell formatted as "Label=URL; Label2=URL2". */
export function parseCustomButtons(
  value: string | undefined | null
): Array<{ label: string; url: string }> {
  return splitList(value)
    .map((part) => {
      const [label, ...rest] = part.split("=");
      const url = rest.join("=").trim();
      if (!label?.trim() || !url) return null;
      try {
        // Validate URL shape.
        new URL(url);
      } catch {
        return null;
      }
      return { label: label.trim(), url };
    })
    .filter((b): b is { label: string; url: string } => b !== null);
}

/** Serialize stores back to a CSV string (for export). */
export function storesToCsv(
  stores: Array<{
    storeName: string;
    slug: string;
    offerTitle: string | null;
    benefits: string[];
    phone: string | null;
    whatsapp: string | null;
    mapsLink: string | null;
    instagram: string | null;
    youtube: string | null;
    facebook: string | null;
    storeLink: string | null;
  }>
): string {
  const records = stores.map((s) => ({
    store_name: s.storeName,
    slug: s.slug,
    offer_title: s.offerTitle ?? "",
    benefits: s.benefits.join("; "),
    phone: s.phone ?? "",
    whatsapp: s.whatsapp ?? "",
    maps_link: s.mapsLink ?? "",
    instagram: s.instagram ?? "",
    youtube: s.youtube ?? "",
    facebook: s.facebook ?? "",
    store_link: s.storeLink ?? "",
  }));
  return Papa.unparse(records);
}
