import { PrismaClient, BusinessType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { buildTemplateCatalog, defaultTemplateForType } from "../src/lib/templates";
import { slugify } from "../src/lib/utils";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding...");

  // ---- Super admin ----
  const adminEmail = (process.env.SUPER_ADMIN_EMAIL || "admin@qrmenu.com").toLowerCase();
  const adminPass = process.env.SUPER_ADMIN_PASSWORD || "Admin123!";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: await bcrypt.hash(adminPass, 12), role: "SUPER_ADMIN", isActive: true },
    create: { email: adminEmail, name: "Süper Admin", role: "SUPER_ADMIN", passwordHash: await bcrypt.hash(adminPass, 12) },
  });
  console.log(`✓ Super admin: ${adminEmail} / ${adminPass}`);

  // ---- Template catalog ----
  const catalog = buildTemplateCatalog();
  for (const t of catalog) {
    await prisma.menuTemplate.upsert({
      where: { key: t.key },
      update: { name: t.name, category: t.category, layout: t.layout, config: t.theme as object },
      create: { key: t.key, name: t.name, category: t.category, layout: t.layout, config: t.theme as object, isPremium: true },
    });
  }
  console.log(`✓ ${catalog.length} premium şablon`);

  // ---- Sample businesses ----
  const samples: {
    name: string; type: BusinessType; sub: string; ownerEmail: string;
    categories: { name: string; products: { name: string; price: number; desc?: string; tags?: string[] }[] }[];
  }[] = [
    {
      name: "Pizza Napoli", type: "PIZZA", sub: "pizzanapoli", ownerEmail: "owner@pizzanapoli.com",
      categories: [
        { name: "Pizzalar", products: [
          { name: "Margherita", price: 180, desc: "Domates, mozzarella, fesleğen", tags: ["popüler"] },
          { name: "Pepperoni", price: 220, desc: "Bol pepperoni", tags: ["acılı", "popüler"] },
          { name: "Quattro Formaggi", price: 240, desc: "Dört peynirli", tags: ["vegan"] },
        ]},
        { name: "İçecekler", products: [
          { name: "Kola", price: 45 }, { name: "Ayran", price: 25 },
        ]},
      ],
    },
    {
      name: "Burger House", type: "BURGER", sub: "burgerhouse", ownerEmail: "owner@burgerhouse.com",
      categories: [
        { name: "Burgerler", products: [
          { name: "Classic Smash", price: 195, desc: "150gr köfte, cheddar", tags: ["popüler"] },
          { name: "Double Bacon", price: 265, desc: "Çift köfte, bacon", tags: ["yeni"] },
          { name: "Spicy Jalapeño", price: 215, desc: "Acı soslu", tags: ["acılı"] },
        ]},
        { name: "Yan Ürünler", products: [
          { name: "Patates Kızartması", price: 65 }, { name: "Soğan Halkası", price: 75 },
        ]},
      ],
    },
    {
      name: "Cafe Aroma", type: "CAFE", sub: "cafearoma", ownerEmail: "owner@cafearoma.com",
      categories: [
        { name: "Kahveler", products: [
          { name: "Espresso", price: 55 }, { name: "Latte", price: 75, tags: ["popüler"] }, { name: "Filtre Kahve", price: 65 },
        ]},
        { name: "Tatlılar", products: [
          { name: "Cheesecake", price: 120, tags: ["yeni"] }, { name: "Brownie", price: 95 },
        ]},
      ],
    },
  ];

  for (const s of samples) {
    const slug = slugify(s.sub);
    const business = await prisma.business.upsert({
      where: { subdomain: s.sub },
      update: {},
      create: {
        name: s.name, type: s.type, slug, subdomain: s.sub,
        email: s.ownerEmail, status: "ACTIVE", package: "PRO",
        description: `${s.name} dijital menüsü`,
        phone: "+90 555 000 0000", contactName: "İşletme Sahibi",
      },
    });

    // owner user
    const owner = await prisma.user.upsert({
      where: { email: s.ownerEmail },
      update: { passwordHash: await bcrypt.hash("Owner123!", 12), isActive: true },
      create: { email: s.ownerEmail, name: `${s.name} Sahibi`, role: "BUSINESS_OWNER", passwordHash: await bcrypt.hash("Owner123!", 12) },
    });
    await prisma.businessUser.upsert({
      where: { businessId_userId: { businessId: business.id, userId: owner.id } },
      update: {},
      create: { businessId: business.id, userId: owner.id, role: "BUSINESS_OWNER" },
    });

    // categories + products (skip if already seeded)
    const existingProducts = await prisma.product.count({ where: { businessId: business.id } });
    const productIds: string[] = [];
    if (existingProducts === 0) {
      let catOrder = 0;
      for (const cat of s.categories) {
        const category = await prisma.category.create({
          data: { businessId: business.id, name: cat.name, sortOrder: catOrder++ },
        });
        let pOrder = 0;
        for (const p of cat.products) {
          const product = await prisma.product.create({
            data: {
              businessId: business.id, categoryId: category.id, name: p.name,
              description: p.desc ?? null, price: p.price, currency: "TRY",
              tags: p.tags ?? [], sortOrder: pOrder++,
            },
          });
          productIds.push(product.id);
        }
      }
    } else {
      const ps = await prisma.product.findMany({ where: { businessId: business.id } });
      productIds.push(...ps.map((p) => p.id));
    }

    // a published menu
    const existingMenu = await prisma.menu.findFirst({ where: { businessId: business.id } });
    if (!existingMenu) {
      const products = await prisma.product.findMany({ where: { businessId: business.id } });
      const menu = await prisma.menu.create({
        data: {
          businessId: business.id, name: "Ana Menü", slug: "ana-menu",
          templateKey: defaultTemplateForType(s.type), status: "PUBLISHED",
          items: { create: products.map((p, i) => ({ productId: p.id, categoryId: p.categoryId, sortOrder: i })) },
        },
      });
      const base = process.env.APP_BASE_URL || "http://localhost:3000";
      await prisma.qrCode.create({
        data: { businessId: business.id, menuId: menu.id, label: "Genel", targetUrl: `${base}/m/${s.sub}/${menu.slug}` },
      });
    }

    console.log(`✓ İşletme: ${s.name} (${s.sub}) — owner: ${s.ownerEmail} / Owner123!`);
  }

  console.log("✅ Seed tamamlandı.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
