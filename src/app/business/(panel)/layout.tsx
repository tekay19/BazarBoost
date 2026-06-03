import { redirect } from "next/navigation";
import { requireBusinessUser } from "@/lib/auth";
import { Shell, type NavItem } from "@/components/Shell";

const items: NavItem[] = [
  { href: "/business/dashboard", label: "Genel Bakış", icon: "dashboard" },
  { href: "/business/products", label: "Ürünler", icon: "package" },
  { href: "/business/categories", label: "Kategoriler", icon: "folder" },
  { href: "/business/menus", label: "QR Menüler", icon: "qr" },
  { href: "/business/settings", label: "Ayarlar", icon: "settings" },
];

export default async function BusinessPanelLayout({ children }: { children: React.ReactNode }) {
  const c = await requireBusinessUser();
  if (!c) redirect("/business/login");

  const banner = c.impersonating ? (
    <div className="bg-amber-500 text-white text-center text-sm py-2 px-4">
      Admin olarak <strong>{c.business.name}</strong> işletmesinin panelindesiniz (destek modu).
    </div>
  ) : null;

  return (
    <Shell title="QR Menu · İşletme" items={items} user={`${c.business.name} (${c.role})`} banner={banner}>
      {children}
    </Shell>
  );
}
