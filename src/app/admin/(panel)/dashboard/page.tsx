import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Building2, Eye, LayoutGrid, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [businessCount, activeCount, menuCount, viewCount, recent] = await Promise.all([
    prisma.business.count(),
    prisma.business.count({ where: { status: "ACTIVE" } }),
    prisma.menu.count(),
    prisma.menuView.count(),
    prisma.business.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { _count: { select: { menus: true, products: true } } } }),
  ]);

  const stats = [
    { label: "Toplam İşletme", value: businessCount, icon: Building2 },
    { label: "Aktif İşletme", value: activeCount, icon: Users },
    { label: "Toplam Menü", value: menuCount, icon: LayoutGrid },
    { label: "Toplam Görüntülenme", value: viewCount, icon: Eye },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Genel Bakış</h1>
        <Link href="/admin/businesses/new" className="px-4 py-2 rounded-md bg-slate-900 text-white text-sm">
          + Yeni İşletme
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <s.icon className="h-5 w-5 text-slate-400 mb-2" />
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-sm text-slate-500">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Son Eklenen İşletmeler</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {recent.length === 0 && <p className="text-sm text-slate-500">Henüz işletme yok.</p>}
          {recent.map((b) => (
            <Link key={b.id} href={`/admin/businesses/${b.id}`} className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-2 px-2 rounded">
              <div>
                <div className="font-medium">{b.name}</div>
                <div className="text-xs text-slate-500">{b.subdomain} · {b.type}</div>
              </div>
              <div className="text-xs text-slate-500">{b._count.menus} menü · {b._count.products} ürün</div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
