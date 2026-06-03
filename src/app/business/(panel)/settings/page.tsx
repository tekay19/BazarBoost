import { requireBusinessUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const c = await requireBusinessUser();
  if (!c) return null;
  const b = c.business;
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Ayarlar</h1>
      <Card>
        <CardHeader><CardTitle>İşletme Bilgileri</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">
            Subdomain: <strong>{b.subdomain}</strong> · Tür: {b.type} · Paket: {b.package}
            <br />Subdomain ve paket değişiklikleri için admin ile iletişime geçin.
          </p>
          <SettingsForm b={JSON.parse(JSON.stringify(b))} />
        </CardContent>
      </Card>
    </div>
  );
}
