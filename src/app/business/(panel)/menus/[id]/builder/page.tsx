import { notFound } from "next/navigation";
import { requireBusinessUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCatalog } from "@/lib/templates";
import { MenuBuilder } from "./MenuBuilder";

export const dynamic = "force-dynamic";

export default async function BuilderPage({ params }: { params: { id: string } }) {
  const c = await requireBusinessUser();
  if (!c) return null;

  const menu = await prisma.menu.findFirst({
    where: { id: params.id, businessId: c.business.id },
    include: { items: true },
  });
  if (!menu) notFound();

  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where: { businessId: c.business.id, isActive: true }, include: { category: true }, orderBy: { sortOrder: "asc" } }),
    prisma.category.findMany({ where: { businessId: c.business.id }, orderBy: { sortOrder: "asc" } }),
  ]);

  const catalog = getCatalog().map((t) => ({ key: t.key, name: t.name, category: t.category, layout: t.layout, theme: t.theme }));

  return (
    <MenuBuilder
      menu={JSON.parse(JSON.stringify({ ...menu, businessName: c.business.name, subdomain: c.business.subdomain, logoUrl: c.business.logoUrl, description: c.business.description }))}
      products={JSON.parse(JSON.stringify(products))}
      categories={JSON.parse(JSON.stringify(categories))}
      catalog={catalog}
      baseUrl={process.env.APP_BASE_URL || ""}
    />
  );
}
