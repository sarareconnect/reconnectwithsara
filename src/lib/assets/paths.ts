/**
 * Logical asset paths. Images are generated on demand by API routes rather
 * than written as individual files, which lets the platform scale to
 * 100,000+ stores without producing per-store artifacts.
 *
 * The folder-style strings mirror the documented storage architecture
 * (/enterprise/{id}/qrs, /enterprise/{id}/friendcards) and are persisted in
 * the `qr_code_path` / `friend_card_path` columns for traceability.
 */

export function qrRoute(storeId: string): string {
  return `/api/stores/${storeId}/qr`;
}

export function friendCardRoute(storeId: string): string {
  return `/api/stores/${storeId}/friend-card`;
}

export function qrStoragePath(enterpriseId: string, slug: string): string {
  return `/enterprise/${enterpriseId}/qrs/${slug}.png`;
}

export function friendCardStoragePath(
  enterpriseId: string,
  slug: string
): string {
  return `/enterprise/${enterpriseId}/friendcards/${slug}.png`;
}

export function safeFileName(slug: string): string {
  return slug.replace(/[^a-z0-9-_]/gi, "-");
}
