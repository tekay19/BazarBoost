import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { loadPublicMenu } from "@/lib/menu-data";
import { prisma } from "@/lib/prisma";
import { deviceTypeFromUA } from "@/lib/utils";
import MenuRenderer from "@/components/menu/MenuRenderer";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { subdomain: string; menuSlug: string } }): Promise<Metadata> {
  const data = await loadPublicMenu(params.subdomain, params.menuSlug);
  if (!data) return { title: "Menü bulunamadı" };
  return {
    title: `${data.menu.menuName} · ${data.menu.businessName}`,
    description: data.menu.description ?? undefined,
    robots: data.seoIndexable ? "index,follow" : "noindex,nofollow",
  };
}

export default async function PublicMenuPage({
  params,
  searchParams,
}: {
  params: { subdomain: string; menuSlug: string };
  searchParams: { qr?: string };
}) {
  const data = await loadPublicMenu(params.subdomain, params.menuSlug);
  if (!data) notFound();

  // fire-and-forget view + scan tracking
  const ua = headers().get("user-agent");
  trackView(data.businessId, data.menuId, deviceTypeFromUA(ua), searchParams.qr);

  return <MenuRenderer menu={data.menu} />;
}

function trackView(businessId: string, menuId: string, deviceType: string, qrId?: string) {
  (async () => {
    try {
      let qrCodeId: string | null = null;
      if (qrId) {
        // attribute the scan only if the QR belongs to this menu (tenant-safe)
        const qr = await prisma.qrCode.findFirst({ where: { id: qrId, menuId, businessId } });
        if (qr) {
          qrCodeId = qr.id;
          await prisma.qrCode.update({
            where: { id: qr.id },
            data: { scanCount: { increment: 1 }, lastScanAt: new Date() },
          });
        }
      }
      await prisma.menuView.create({ data: { businessId, menuId, qrCodeId, deviceType } });
      await prisma.business.update({ where: { id: businessId }, data: { lastActivityAt: new Date() } });
    } catch {
      /* tracking must not break rendering */
    }
  })();
}
