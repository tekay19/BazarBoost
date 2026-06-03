import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function BusinessesPage() {
  const businesses = await prisma.business.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { menus: true, products: true, categories: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">İşletmeler</h1>
        <Link href="/admin/businesses/new" className="px-4 py-2 rounded-md bg-slate-900 text-white text-sm">
          + Yeni İşletme
        </Link>
      </div>

      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="p-3 font-medium">İşletme</th>
              <th className="p-3 font-medium hidden md:table-cell">Subdomain</th>
              <th className="p-3 font-medium hidden md:table-cell">Tür</th>
              <th className="p-3 font-medium">Durum</th>
              <th className="p-3 font-medium hidden sm:table-cell">Menü / Ürün</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {businesses.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50">
                <td className="p-3">
                  <Link href={`/admin/businesses/${b.id}`} className="font-medium hover:underline">{b.name}</Link>
                </td>
                <td className="p-3 hidden md:table-cell text-slate-500">{b.subdomain}</td>
                <td className="p-3 hidden md:table-cell text-slate-500">{b.type}</td>
                <td className="p-3">
                  <Badge className={b.status === "ACTIVE" ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-100 text-slate-500"}>
                    {b.status === "ACTIVE" ? "Aktif" : "Pasif"}
                  </Badge>
                </td>
                <td className="p-3 hidden sm:table-cell text-slate-500">{b._count.menus} / {b._count.products}</td>
              </tr>
            ))}
            {businesses.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-slate-500">Henüz işletme yok.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
