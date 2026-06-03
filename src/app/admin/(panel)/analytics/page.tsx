import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [topMenus, deviceBreakdown, recentViews] = await Promise.all([
    prisma.menuView.groupBy({ by: ["menuId"], _count: { menuId: true }, orderBy: { _count: { menuId: "desc" } }, take: 10 }),
    prisma.menuView.groupBy({ by: ["deviceType"], _count: { deviceType: true } }),
    prisma.menuView.count({ where: { createdAt: { gte: new Date(Date.now() - 86400_000) } } }),
  ]);

  const menus = await prisma.menu.findMany({
    where: { id: { in: topMenus.map((t) => t.menuId) } },
    include: { business: true },
  });
  const menuName = (id: string) => {
    const m = menus.find((x) => x.id === id);
    return m ? `${m.business.name} · ${m.name}` : id;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analitik</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-5"><div className="text-2xl font-bold">{recentViews}</div><div className="text-xs text-slate-500">Son 24 saat görüntülenme</div></CardContent></Card>
        {deviceBreakdown.map((d) => (
          <Card key={d.deviceType ?? "unknown"}><CardContent className="pt-5"><div className="text-2xl font-bold">{d._count.deviceType}</div><div className="text-xs text-slate-500 capitalize">{d.deviceType ?? "bilinmeyen"}</div></CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>En Çok Görüntülenen Menüler</CardTitle></CardHeader>
        <CardContent className="divide-y">
          {topMenus.length === 0 && <p className="text-sm text-slate-500">Henüz veri yok.</p>}
          {topMenus.map((t) => (
            <div key={t.menuId} className="flex justify-between py-2 text-sm">
              <span>{menuName(t.menuId)}</span>
              <span className="font-medium">{t._count.menuId}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
