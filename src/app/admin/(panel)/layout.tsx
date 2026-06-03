import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth";
import { Shell, type NavItem } from "@/components/Shell";

const items: NavItem[] = [
  { href: "/admin/dashboard", label: "Genel Bakış", icon: "dashboard" },
  { href: "/admin/businesses", label: "İşletmeler", icon: "building" },
  { href: "/admin/templates", label: "Şablonlar", icon: "template" },
  { href: "/admin/analytics", label: "Analitik", icon: "chart" },
];

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireSuperAdmin();
  if (!admin) redirect("/admin/login");
  return (
    <Shell title="QR Menu · Admin" items={items} user={admin.email}>
      {children}
    </Shell>
  );
}
