import "server-only";
import { prisma } from "./prisma";
import { getTemplate, type TemplateTheme } from "./templates";
import { formatPrice } from "./utils";
import type { RenderMenu } from "@/components/menu/types";

/**
 * Load a published menu by subdomain + slug, fully tenant-scoped.
 * Returns null if business/menu not found or not viewable.
 */
export async function loadPublicMenu(
  subdomain: string,
  menuSlug?: string
): Promise<{ menu: RenderMenu; menuId: string; businessId: string; seoIndexable: boolean } | null> {
  const business = await prisma.business.findUnique({ where: { subdomain } });
  if (!business || business.status === "INACTIVE") return null;

  const where = menuSlug
    ? { businessId: business.id, slug: menuSlug }
    : { businessId: business.id, status: "PUBLISHED" as const };

  const menu = await prisma.menu.findFirst({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      items: {
        where: { isVisible: true },
        include: { product: true, category: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!menu) return null;
  if (menu.status !== "PUBLISHED") return null;

  const tpl = getTemplate(menu.templateKey);
  const baseTheme = tpl?.theme;
  if (!baseTheme) return null;
  // merge brand overrides stored on the menu
  const overrides = (menu.theme as Partial<TemplateTheme>) || {};
  const theme: TemplateTheme = { ...baseTheme, ...overrides };

  // group items by category preserving order
  const catMap = new Map<string, { id: string; name: string; description: string | null; imageUrl: string | null; products: RenderMenu["categories"][number]["products"] }>();
  const uncategorized = { id: "uncat", name: "Diğer", description: null, imageUrl: null as string | null, products: [] as RenderMenu["categories"][number]["products"] };

  for (const item of menu.items) {
    const p = item.product;
    if (!p.isActive) continue;
    const rp = {
      id: p.id,
      name: p.name,
      description: p.description,
      price: formatPrice(Number(p.price), p.currency),
      rawPrice: Number(p.price),
      currency: p.currency,
      imageUrl: p.imageUrl,
      inStock: p.inStock,
      tags: p.tags,
    };
    const cat = item.category;
    if (cat) {
      if (!catMap.has(cat.id)) {
        catMap.set(cat.id, { id: cat.id, name: cat.name, description: cat.description, imageUrl: cat.imageUrl, products: [] });
      }
      catMap.get(cat.id)!.products.push(rp);
    } else {
      uncategorized.products.push(rp);
    }
  }

  const categories = [...catMap.values()];
  if (uncategorized.products.length) categories.push(uncategorized);

  const render: RenderMenu = {
    businessName: business.name,
    logoUrl: business.logoUrl,
    menuName: menu.name,
    description: business.description,
    categories,
    theme,
    layout: tpl.layout,
  };

  return { menu: render, menuId: menu.id, businessId: business.id, seoIndexable: business.seoIndexable };
}
