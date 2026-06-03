import Link from "next/link";
import { requireBusinessUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, Badge } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { QrCode, Pencil } from "lucide-react";

export const dynamic = "force-dynamic";

const statusColor: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700 border-green-200",
  DRAFT: "bg-amber-100 text-amber-700 border-amber-200",
  ARCHIVED: "bg-slate-100 text-slate-500",
  INACTIVE: "bg-slate-100 text-slate-500",
};

export default async function MenusPage() {
  const c = await requireBusinessUser();
  if (!c) return null;
  const menus = await prisma.menu.findMany({
    where: { businessId: c.business.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { items: true, views: true, qrCodes: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">QR Menüler</h1>
        <Link href="/business/menus/new"><Button>+ Yeni QR Menü</Button></Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menus.map((m) => (
          <Card key={m.id}>
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-xs text-slate-500">v{m.version} · {m._count.items} ürün · {m._count.views} görüntülenme</div>
                </div>
                <Badge className={statusColor[m.status]}>{m.status}</Badge>
              </div>
              <div className="flex gap-2">
                <Link href={`/business/menus/${m.id}/builder`} className="flex-1"><Button variant="outline" size="sm" className="w-full"><Pencil className="h-3.5 w-3.5" /> Düzenle</Button></Link>
                <Link href={`/business/menus/${m.id}/qr`} className="flex-1"><Button variant="outline" size="sm" className="w-full"><QrCode className="h-3.5 w-3.5" /> QR ({m._count.qrCodes})</Button></Link>
              </div>
            </CardContent>
          </Card>
        ))}
        {menus.length === 0 && <p className="text-sm text-slate-500">Henüz menü yok. İlk QR menünüzü oluşturun.</p>}
      </div>
    </div>
  );
}
