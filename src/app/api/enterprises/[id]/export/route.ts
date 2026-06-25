import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authorizeEnterprise } from "@/lib/auth/api";
import { storesToCsv } from "@/lib/csv";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Export all stores for an enterprise as a CSV download. */
export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  const session = await authorizeEnterprise(id);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stores = await prisma.store.findMany({
    where: { enterpriseId: id },
    orderBy: { storeName: "asc" },
    select: {
      storeName: true,
      slug: true,
      offerTitle: true,
      benefits: true,
      phone: true,
      whatsapp: true,
      mapsLink: true,
      instagram: true,
      youtube: true,
      facebook: true,
      storeLink: true,
    },
  });

  const csv = storesToCsv(stores);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="stores-${id}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
