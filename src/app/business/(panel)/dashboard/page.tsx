import Link from "next/link";
import { requireBusinessUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Package, FolderTree, QrCode, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BusinessDashboard() {
  const c = await requireBusinessUser();
  if (!c) return null;
  const businessId = c.business.id;

  const [products, categories, menus, published, views] = await Promise.all([
    prisma.product.count({ where: { businessId } }),
    prisma.category.count({ where: { businessId } }),
    prisma.menu.count({ where: { businessId } }),
    prisma.menu.count({ where: { businessId, status: "PUBLISHED" } }),
    prisma.menuView.count({ where: { businessId } }),
  ]);

  const stats = [
    { label: "Ürün", value: products, icon: Package, href: "/business/products" },
    { label: "Kategori", value: categories, icon: FolderTree, href: "/business/categories" },
    { label: "Yayında Menü", value: `${published}/${menus}`, icon: QrCode, href: "/business/menus" },
    { label: "Görüntülenme", value: views, icon: Eye, href: "/business/menus" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Merhaba, {c.business.name}</h1>
        <Link href="/business/menus/new" className="px-4 py-2 rounded-md bg-slate-900 text-white text-sm">+ Yeni QR Menü</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <s.icon className="h-5 w-5 text-slate-400 mb-2" />
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-sm text-slate-500">{s.label}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Hızlı Başlangıç</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>1. <Link href="/business/categories" className="underline">Kategorilerinizi</Link> oluşturun.</p>
          <p>2. <Link href="/business/products" className="underline">Ürünlerinizi</Link> ekleyin veya CSV/Excel ile içe aktarın.</p>
          <p>3. <Link href="/business/menus/new" className="underline">QR menü oluşturun</Link>, şablon seçin ve yayınlayın.</p>
          <p>4. QR kodunuzu PNG/PDF olarak indirip masalarınıza bastırın.</p>
        </CardContent>
      </Card>
    </div>
  );
}
