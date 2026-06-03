import { NextRequest, NextResponse } from "next/server";
import { requireBusinessUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { qrPngBuffer } from "@/lib/qr";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await requireBusinessUser();
  if (!ctx) return new NextResponse("Yetkisiz", { status: 401 });

  const qr = await prisma.qrCode.findFirst({ where: { id: params.id, businessId: ctx.business.id } });
  if (!qr) return new NextResponse("Bulunamadı", { status: 404 });

  const png = await qrPngBuffer(qr.targetUrl);
  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="qr-${qr.label || qr.id}.png"`,
    },
  });
}
