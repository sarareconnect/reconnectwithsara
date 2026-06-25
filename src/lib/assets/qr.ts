import "server-only";
import QRCode from "qrcode";
import { env } from "@/lib/env";

/** Absolute public URL a QR code should resolve to for a given store slug. */
export function storeUrl(slug: string): string {
  const base = env.appUrl().replace(/\/$/, "");
  return `${base}/store/${slug}`;
}

const QR_OPTIONS: QRCode.QRCodeToBufferOptions = {
  errorCorrectionLevel: "M",
  type: "png",
  margin: 2,
  width: 800,
  color: {
    dark: "#0b1220ff",
    light: "#ffffffff",
  },
};

/** Generate a high-resolution PNG buffer for a store's landing page URL. */
export async function generateStoreQrPng(slug: string): Promise<Buffer> {
  return QRCode.toBuffer(storeUrl(slug), QR_OPTIONS);
}

/** Generate a QR PNG for an arbitrary payload (used inside friend cards). */
export async function generateQrPng(
  data: string,
  options?: Partial<QRCode.QRCodeToBufferOptions>
): Promise<Buffer> {
  return QRCode.toBuffer(data, { ...QR_OPTIONS, ...options });
}

/** Data URL variant — handy for embedding QR codes inline. */
export async function generateStoreQrDataUrl(slug: string): Promise<string> {
  return QRCode.toDataURL(storeUrl(slug), {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 800,
    color: { dark: "#0b1220ff", light: "#ffffffff" },
  });
}
