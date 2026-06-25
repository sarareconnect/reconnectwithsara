import { NextResponse } from "next/server";
import JSZip from "jszip";
import { prisma } from "@/lib/db";
import { authorizeEnterprise } from "@/lib/auth/api";
import { generateFriendCardPng } from "@/lib/assets/friend-card";
import { safeFileName } from "@/lib/assets/paths";

export const runtime = "nodejs";
export const maxDuration = 60;

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Bundle every store friend card for an enterprise into a single ZIP. */
export async function GET(req: Request, { params }: RouteContext) {
  const { id } = await params;
  const session = await authorizeEnterprise(id);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const idsParam = url.searchParams.get("ids");
  const selectedIds = idsParam
    ? idsParam.split(",").map((s) => s.trim()).filter(Boolean)
    : null;

  const stores = await prisma.store.findMany({
    where: {
      enterpriseId: id,
      ...(selectedIds ? { id: { in: selectedIds } } : {}),
    },
    select: { slug: true, storeName: true, offerTitle: true, phone: true },
    orderBy: { storeName: "asc" },
  });

  if (stores.length === 0) {
    return NextResponse.json({ error: "No stores found" }, { status: 404 });
  }

  const zip = new JSZip();
  const folder = zip.folder("friend-cards")!;

  for (const store of stores) {
    const png = await generateFriendCardPng({
      slug: store.slug,
      storeName: store.storeName,
      offerTitle: store.offerTitle,
      phone: store.phone,
    });
    folder.file(`${safeFileName(store.slug)}.png`, png);
  }

  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="friend-cards-${id}.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
