import { requireBusinessUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CategoriesManager } from "./CategoriesManager";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const c = await requireBusinessUser();
  if (!c) return null;
  const categories = await prisma.category.findMany({
    where: { businessId: c.business.id },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Kategoriler</h1>
      <CategoriesManager categories={JSON.parse(JSON.stringify(categories))} />
    </div>
  );
}
