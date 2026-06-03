import { NextRequest, NextResponse } from "next/server";
import { requireBusinessUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildQrPdf } from "@/lib/pdf";

export const runtime = "nodejs";

async function fetchLogoPng(url: string | null): Promise<Buffer | undefined> {
  if (!url) return undefined;
  try {
    if (url.startsWith("data:image/png")) {
      return Buffer.from(url.split(",")[1], "base64");
    }
    if (/^https?:\/\//.test(url) && url.toLowerCase().includes(".png")) {
      const res = await fetch(url);
      if (res.ok) return Buffer.from(await res.arrayBuffer());
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const ctx = await requireBusinessUser();
  if (!ctx) return new NextResponse("Yetkisiz", { status: 401 });

  const qr = await prisma.qrCode.findFirst({
    where: { id: params.id, businessId: ctx.business.id },
    include: { menu: true },
  });
  if (!qr) return new NextResponse("Bulunamadı", { status: 404 });

  const logoPng = await fetchLogoPng(ctx.business.logoUrl);
  const pdf = await buildQrPdf({
    businessName: ctx.business.name,
    menuName: qr.menu.name,
    description: ctx.business.description ?? undefined,
    url: qr.targetUrl,
    tableLabel: qr.label ?? undefined,
    logoPng,
    primaryColor: "#111111",
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="qr-${qr.label || qr.id}.pdf"`,
    },
  });
}
