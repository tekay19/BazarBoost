import { notFound } from "next/navigation";
import Link from "next/link";
import { requireBusinessUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { qrDataUrl } from "@/lib/qr";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { QrTools } from "./QrTools";
import { Download, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function QrPage({ params }: { params: { id: string } }) {
  const c = await requireBusinessUser();
  if (!c) return null;

  const menu = await prisma.menu.findFirst({ where: { id: params.id, businessId: c.business.id } });
  if (!menu) notFound();

  const base = process.env.APP_BASE_URL || "http://localhost:3000";
  const publicUrl = `${base}/m/${c.business.subdomain}/${menu.slug}`;

  // ensure a default "general" QR exists
  let qrCodes = await prisma.qrCode.findMany({ where: { menuId: menu.id, businessId: c.business.id }, orderBy: { createdAt: "asc" } });
  if (qrCodes.length === 0) {
    await prisma.qrCode.create({ data: { businessId: c.business.id, menuId: menu.id, label: "Genel", targetUrl: publicUrl } });
    qrCodes = await prisma.qrCode.findMany({ where: { menuId: menu.id, businessId: c.business.id }, orderBy: { createdAt: "asc" } });
  }

  const withPreview = await Promise.all(
    qrCodes.map(async (q) => ({ ...q, dataUrl: await qrDataUrl(q.targetUrl, { size: 240 }) }))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">QR Kodları — {menu.name}</h1>
          <p className="text-sm text-slate-500">Menü durumu: <Badge className="bg-slate-100 text-slate-600">{menu.status}</Badge></p>
        </div>
        <Link href={`/business/menus/${menu.id}/builder`} className="text-sm underline">← Builder'a dön</Link>
      </div>

      {menu.status !== "PUBLISHED" && (
        <div className="rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3">
          Bu menü henüz yayında değil. QR kodları çalışır ancak ziyaretçiler menüyü göremez. Builder'dan <strong>Yayınla</strong> deyin.
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Genel Menü Linki</CardTitle></CardHeader>
        <CardContent>
          <code className="text-sm break-all">{publicUrl}</code>
        </CardContent>
      </Card>

      <QrTools menuId={menu.id} />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {withPreview.map((q) => (
          <Card key={q.id}>
            <CardContent className="pt-6 text-center space-y-3">
              <div className="font-medium">{q.label || "QR"}{q.tableNo ? ` · Masa ${q.tableNo}` : ""}</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={q.dataUrl} alt="QR" className="mx-auto w-40 h-40" />
              <div className="text-xs text-slate-400">{q.scanCount} tarama</div>
              <div className="flex gap-2 justify-center">
                <a href={`/api/qr/${q.id}/png`} className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded border hover:bg-slate-50"><Download className="h-3.5 w-3.5" /> PNG</a>
                <a href={`/api/qr/${q.id}/pdf`} className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded border hover:bg-slate-50"><FileText className="h-3.5 w-3.5" /> PDF</a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
