"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireBusinessUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { defaultTemplateForType } from "@/lib/templates";
import { logAudit } from "@/lib/audit";
import type { ValidatedProduct } from "@/lib/import";

/** Resolve active tenant context or throw. Used by every business action. */
async function ctx() {
  const c = await requireBusinessUser();
  if (!c) throw new Error("Yetkisiz");
  return c;
}

/* ---------------- Categories ---------------- */
export async function saveCategory(_prev: unknown, formData: FormData) {
  const { business } = await ctx();
  const id = String(formData.get("id") || "");
  const data = {
    name: String(formData.get("name") || "").trim(),
    description: String(formData.get("description") || "") || null,
    imageUrl: String(formData.get("imageUrl") || "") || null,
    sortOrder: parseInt(String(formData.get("sortOrder") || "0"), 10) || 0,
    isActive: formData.get("isActive") !== "off",
  };
  if (!data.name) return { error: "Kategori adı zorunlu." };

  if (id) {
    // tenant guard: ensure the category belongs to this business
    const existing = await prisma.category.findFirst({ where: { id, businessId: business.id } });
    if (!existing) return { error: "Kategori bulunamadı." };
    await prisma.category.update({ where: { id }, data });
  } else {
    await prisma.category.create({ data: { ...data, businessId: business.id } });
  }
  revalidatePath("/business/categories");
  return { ok: true };
}

export async function deleteCategory(id: string) {
  const { business } = await ctx();
  await prisma.category.deleteMany({ where: { id, businessId: business.id } });
  revalidatePath("/business/categories");
}

/* ---------------- Products ---------------- */
export async function saveProduct(_prev: unknown, formData: FormData) {
  const { business } = await ctx();
  const id = String(formData.get("id") || "");
  const categoryId = String(formData.get("categoryId") || "") || null;

  if (categoryId) {
    const cat = await prisma.category.findFirst({ where: { id: categoryId, businessId: business.id } });
    if (!cat) return { error: "Geçersiz kategori." };
  }

  const data = {
    name: String(formData.get("name") || "").trim(),
    description: String(formData.get("description") || "") || null,
    price: parseFloat(String(formData.get("price") || "0")) || 0,
    currency: (String(formData.get("currency") || "TRY")).toUpperCase().slice(0, 3),
    imageUrl: String(formData.get("imageUrl") || "") || null,
    inStock: formData.get("inStock") !== "off",
    isActive: formData.get("isActive") !== "off",
    sortOrder: parseInt(String(formData.get("sortOrder") || "0"), 10) || 0,
    tags: String(formData.get("tags") || "").split(",").map((t) => t.trim()).filter(Boolean),
    categoryId,
  };
  if (!data.name) return { error: "Ürün adı zorunlu." };

  if (id) {
    const existing = await prisma.product.findFirst({ where: { id, businessId: business.id } });
    if (!existing) return { error: "Ürün bulunamadı." };
    await prisma.product.update({ where: { id }, data });
  } else {
    await prisma.product.create({ data: { ...data, businessId: business.id } });
  }
  revalidatePath("/business/products");
  return { ok: true };
}

export async function deleteProduct(id: string) {
  const { business } = await ctx();
  await prisma.product.deleteMany({ where: { id, businessId: business.id } });
  revalidatePath("/business/products");
}

/** Commit validated import rows (creates missing categories). */
export async function commitImport(rows: ValidatedProduct[]) {
  const { business, user } = await ctx();
  if (!Array.isArray(rows) || rows.length === 0) return { error: "İçe aktarılacak satır yok." };
  if (rows.length > 5000) return { error: "Tek seferde en fazla 5000 ürün." };

  // build category map
  const existing = await prisma.category.findMany({ where: { businessId: business.id } });
  const catByName = new Map(existing.map((c) => [c.name.toLowerCase(), c.id]));

  let created = 0;
  for (const r of rows) {
    let categoryId: string | null = null;
    if (r.category) {
      const key = r.category.toLowerCase();
      if (!catByName.has(key)) {
        const cat = await prisma.category.create({ data: { businessId: business.id, name: r.category } });
        catByName.set(key, cat.id);
      }
      categoryId = catByName.get(key)!;
    }
    await prisma.product.create({
      data: {
        businessId: business.id,
        categoryId,
        name: r.name,
        description: r.description,
        price: r.price,
        currency: r.currency,
        imageUrl: r.imageUrl,
        inStock: r.inStock,
        tags: r.tags,
        sortOrder: r.sortOrder,
        isActive: r.isActive,
      },
    });
    created++;
  }
  await logAudit({ businessId: business.id, userId: user.id, action: "products.import", metadata: { count: created } });
  revalidatePath("/business/products");
  return { ok: true, created };
}

/* ---------------- Menus ---------------- */
export async function createMenu(_prev: unknown, formData: FormData) {
  const { business } = await ctx();
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Menü adı zorunlu." };

  let slug = slugify(name) || "menu";
  let i = 1;
  while (await prisma.menu.findFirst({ where: { businessId: business.id, slug } })) {
    slug = `${slugify(name)}-${i++}`;
  }

  const menu = await prisma.menu.create({
    data: {
      businessId: business.id,
      name,
      slug,
      templateKey: defaultTemplateForType(business.type),
      status: "DRAFT",
    },
  });
  redirect(`/business/menus/${menu.id}/builder`);
}

async function assertMenu(menuId: string, businessId: string) {
  const menu = await prisma.menu.findFirst({ where: { id: menuId, businessId } });
  if (!menu) throw new Error("Menü bulunamadı");
  return menu;
}

export async function saveMenuBuilder(
  menuId: string,
  payload: { name?: string; templateKey?: string; theme?: Record<string, unknown>; locale?: string; productIds?: string[] }
) {
  const { business } = await ctx();
  const menu = await assertMenu(menuId, business.id);

  await prisma.menu.update({
    where: { id: menu.id },
    data: {
      name: payload.name ?? menu.name,
      templateKey: payload.templateKey ?? menu.templateKey,
      theme: (payload.theme ?? (menu.theme as object)) as object,
      locale: payload.locale ?? menu.locale,
    },
  });

  if (payload.productIds) {
    // validate all products belong to this business
    const products = await prisma.product.findMany({
      where: { id: { in: payload.productIds }, businessId: business.id },
    });
    const valid = products.map((p) => ({ id: p.id, categoryId: p.categoryId }));

    await prisma.menuItem.deleteMany({ where: { menuId: menu.id } });
    if (valid.length) {
      await prisma.menuItem.createMany({
        data: valid.map((p, idx) => ({
          menuId: menu.id,
          productId: p.id,
          categoryId: p.categoryId,
          sortOrder: idx,
        })),
      });
    }
  }
  revalidatePath(`/business/menus/${menuId}/builder`);
  return { ok: true };
}

export async function setMenuStatus(menuId: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "INACTIVE") {
  const { business, user } = await ctx();
  await assertMenu(menuId, business.id);
  await prisma.menu.update({ where: { id: menuId }, data: { status } });
  await logAudit({ businessId: business.id, userId: user.id, action: "menu.status", entityId: menuId, metadata: { status } });
  revalidatePath("/business/menus");
  revalidatePath(`/business/menus/${menuId}/builder`);
  return { ok: true };
}

/** Create a new version of a menu (keeps old QR working). */
export async function duplicateMenu(menuId: string) {
  const { business } = await ctx();
  const menu = await assertMenu(menuId, business.id);
  const items = await prisma.menuItem.findMany({ where: { menuId } });

  let slug = `${menu.slug}-v${menu.version + 1}`;
  let i = 1;
  while (await prisma.menu.findFirst({ where: { businessId: business.id, slug } })) {
    slug = `${menu.slug}-v${menu.version + 1}-${i++}`;
  }

  const copy = await prisma.menu.create({
    data: {
      businessId: business.id,
      name: `${menu.name} (v${menu.version + 1})`,
      slug,
      templateKey: menu.templateKey,
      theme: menu.theme as object,
      locale: menu.locale,
      version: menu.version + 1,
      status: "DRAFT",
      items: {
        create: items.map((it) => ({
          productId: it.productId,
          categoryId: it.categoryId,
          sortOrder: it.sortOrder,
          isVisible: it.isVisible,
        })),
      },
    },
  });
  redirect(`/business/menus/${copy.id}/builder`);
}

/* ---------------- QR codes ---------------- */
export async function createQrCode(menuId: string, formData: FormData) {
  const { business } = await ctx();
  const menu = await assertMenu(menuId, business.id);
  const label = String(formData.get("label") || "") || null;
  const tableNo = String(formData.get("tableNo") || "") || null;

  const base = process.env.APP_BASE_URL || "http://localhost:3000";
  // create first to get the id, then bake ?qr=<id> into the target URL for scan attribution
  const created = await prisma.qrCode.create({ data: { businessId: business.id, menuId, label, tableNo, targetUrl: "" } });
  const targetUrl = `${base}/m/${business.subdomain}/${menu.slug}?qr=${created.id}${tableNo ? `&table=${encodeURIComponent(tableNo)}` : ""}`;
  await prisma.qrCode.update({ where: { id: created.id }, data: { targetUrl } });
  revalidatePath(`/business/menus/${menuId}/qr`);
  return { ok: true };
}

export async function generateTableQrs(menuId: string, count: number) {
  const { business } = await ctx();
  const menu = await assertMenu(menuId, business.id);
  const base = process.env.APP_BASE_URL || "http://localhost:3000";
  const n = Math.min(Math.max(count, 1), 100);

  // create per-row so each QR can carry its own ?qr=<id> for scan attribution
  for (let i = 0; i < n; i++) {
    const created = await prisma.qrCode.create({
      data: { businessId: business.id, menuId, label: `Masa ${i + 1}`, tableNo: String(i + 1), targetUrl: "" },
    });
    await prisma.qrCode.update({
      where: { id: created.id },
      data: { targetUrl: `${base}/m/${business.subdomain}/${menu.slug}?qr=${created.id}&table=${i + 1}` },
    });
  }
  revalidatePath(`/business/menus/${menuId}/qr`);
  return { ok: true };
}

/* ---------------- Settings ---------------- */
export async function updateBusinessSettings(_prev: unknown, formData: FormData) {
  const { business, role } = await ctx();
  if (role === "BUSINESS_STAFF") return { error: "Bu işlem için yetkiniz yok." };
  await prisma.business.update({
    where: { id: business.id },
    data: {
      description: String(formData.get("description") || "") || null,
      logoUrl: String(formData.get("logoUrl") || "") || null,
      phone: String(formData.get("phone") || "") || null,
      address: String(formData.get("address") || "") || null,
      seoIndexable: formData.get("seoIndexable") === "on",
    },
  });
  revalidatePath("/business/settings");
  return { ok: true };
}
