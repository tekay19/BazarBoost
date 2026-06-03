"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createQrCode, generateTableQrs } from "@/server/business-actions";
import { Card, CardContent, Input, Label } from "@/components/ui";
import { Button } from "@/components/ui/button";

export function QrTools({ menuId }: { menuId: string }) {
  const router = useRouter();
  const [count, setCount] = useState(5);
  const [busy, setBusy] = useState(false);

  async function addSingle(formData: FormData) {
    setBusy(true);
    await createQrCode(menuId, formData);
    setBusy(false);
    router.refresh();
  }
  async function bulk() {
    setBusy(true);
    await generateTableQrs(menuId, count);
    setBusy(false);
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="pt-6 grid md:grid-cols-2 gap-6">
        <form action={addSingle} className="space-y-3">
          <h3 className="font-semibold">Masa / Özel QR Ekle</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Etiket</Label><Input name="label" placeholder="Masa 1" /></div>
            <div className="space-y-1.5"><Label>Masa No</Label><Input name="tableNo" placeholder="1" /></div>
          </div>
          <Button disabled={busy}>QR Ekle</Button>
        </form>

        <div className="space-y-3">
          <h3 className="font-semibold">Toplu Masa QR Üret</h3>
          <div className="flex items-end gap-3">
            <div className="space-y-1.5"><Label>Masa Sayısı</Label><Input type="number" min={1} max={100} value={count} onChange={(e) => setCount(parseInt(e.target.value) || 1)} className="w-28" /></div>
            <Button variant="outline" onClick={bulk} disabled={busy}>{busy ? "Üretiliyor..." : "Üret"}</Button>
          </div>
          <p className="text-xs text-slate-400">Masa 1..N için ayrı QR kodları oluşturur.</p>
        </div>
      </CardContent>
    </Card>
  );
}
