import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateFriendCardPng } from "@/lib/assets/friend-card";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Public endpoint that streams a store's friend card as a PNG. */
export async function GET(req: Request, { params }: RouteContext) {
  const { id } = await params;
  const store = await prisma.store.findUnique({
    where: { id },
    select: { slug: true, storeName: true, offerTitle: true, phone: true },
  });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const png = await generateFriendCardPng({
    slug: store.slug,
    storeName: store.storeName,
    offerTitle: store.offerTitle,
    phone: store.phone,
  });

  const download = new URL(req.url).searchParams.get("download") === "1";
  return new NextResponse(new Uint8Array(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${store.slug}-friend-card.png"`,
    },
  });
}
