import { requireBusinessUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductsManager } from "./ProductsManager";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const c = await requireBusinessUser();
  if (!c) return null;
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { businessId: c.business.id },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: { category: true },
    }),
    prisma.category.findMany({ where: { businessId: c.business.id }, orderBy: { name: "asc" } }),
  ]);
  return (
    <ProductsManager
      products={JSON.parse(JSON.stringify(products))}
      categories={JSON.parse(JSON.stringify(categories))}
    />
  );
}
