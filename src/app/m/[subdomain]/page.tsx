import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { loadPublicMenu } from "@/lib/menu-data";
import { prisma } from "@/lib/prisma";
import { deviceTypeFromUA } from "@/lib/utils";
import MenuRenderer from "@/components/menu/MenuRenderer";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { subdomain: string } }): Promise<Metadata> {
  const data = await loadPublicMenu(params.subdomain);
  if (!data) return { title: "Menü bulunamadı" };
  return {
    title: `${data.menu.menuName} · ${data.menu.businessName}`,
    description: data.menu.description ?? undefined,
    robots: data.seoIndexable ? "index,follow" : "noindex,nofollow",
  };
}

export default async function SubdomainRootMenu({ params }: { params: { subdomain: string } }) {
  const data = await loadPublicMenu(params.subdomain);
  if (!data) notFound();

  const ua = headers().get("user-agent");
  prisma.menuView
    .create({ data: { businessId: data.businessId, menuId: data.menuId, deviceType: deviceTypeFromUA(ua) } })
    .catch(() => {});

  return <MenuRenderer menu={data.menu} />;
}
