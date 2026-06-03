import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { EditForm } from "./EditForm";
import { InviteBox } from "./InviteBox";

export const dynamic = "force-dynamic";

export default async function BusinessDetail({ params }: { params: { id: string } }) {
  const b = await prisma.business.findUnique({
    where: { id: params.id },
    include: {
      _count: { select: { products: true, categories: true, menus: true } },
      menus: { include: { _count: { select: { views: true, items: true } } }, orderBy: { updatedAt: "desc" } },
      users: { include: { user: true } },
    },
  });
  if (!b) notFound();

  const totalViews = await prisma.menuView.count({ where: { businessId: b.id } });
  const lastUser = b.users.map((u) => u.user.lastLoginAt).filter(Boolean).sort().reverse()[0];

  const stats = [
    ["Ürün", b._count.products],
    ["Kategori", b._count.categories],
    ["Menü", b._count.menus],
    ["Görüntülenme", totalViews],
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">{b.name}</h1>
          <p className="text-sm text-slate-500">{b.subdomain} · {b.type} · {b.package}</p>
        </div>
        <Badge className={b.status === "ACTIVE" ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-100 text-slate-500"}>
          {b.status === "ACTIVE" ? "Aktif" : "Pasif"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(([l, v]) => (
          <Card key={l}><CardContent className="pt-5"><div className="text-2xl font-bold">{v}</div><div className="text-xs text-slate-500">{l}</div></CardContent></Card>
        ))}
      </div>
      <p className="text-xs text-slate-400">
        Son işletme girişi: {lastUser ? new Date(lastUser).toLocaleString("tr-TR") : "Henüz giriş yok"}
      </p>

      <Card>
        <CardHeader><CardTitle>Davet / Authentication Linki</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-3">
            Güvenli, süreli ve tek kullanımlık davet linki üretin. İşletme bu linkle ilk girişini yapıp şifresini oluşturur.
          </p>
          <InviteBox businessId={b.id} defaultEmail={b.email} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Menüler</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {b.menus.length === 0 && <p className="text-sm text-slate-500">Henüz menü yok.</p>}
          {b.menus.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <span className="font-medium">{m.name}</span>
                <span className="text-slate-400"> · {m.slug} · v{m.version}</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-slate-100 text-slate-600">{m.status}</Badge>
                <span className="text-slate-500">{m._count.views} görüntülenme</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>İşletme Ayarları</CardTitle></CardHeader>
        <CardContent><EditForm b={b} /></CardContent>
      </Card>
    </div>
  );
}
