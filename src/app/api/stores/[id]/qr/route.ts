import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateStoreQrPng } from "@/lib/assets/qr";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Public endpoint that streams a store's QR code as a PNG. */
export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  const store = await prisma.store.findUnique({
    where: { id },
    select: { slug: true },
  });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const png = await generateStoreQrPng(store.slug);
  return new NextResponse(new Uint8Array(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "Content-Disposition": `inline; filename="${store.slug}-qr.png"`,
    },
  });
}
