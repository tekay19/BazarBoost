"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createMenu } from "@/server/business-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label } from "@/components/ui";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button disabled={pending}>{pending ? "Oluşturuluyor..." : "Oluştur ve Builder'a Git"}</Button>;
}

export default function NewMenuPage() {
  const [state, action] = useFormState(createMenu, { error: "" } as { error?: string });
  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Yeni QR Menü</h1>
      <Card>
        <CardHeader>
          <CardTitle>Menü Bilgisi</CardTitle>
          <CardDescription>Menü adını girin. Sonraki adımda ürünleri ve şablonu seçeceksiniz.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Menü Adı</Label>
              <Input name="name" placeholder="Örn: Yaz Menüsü, Kahvaltı, Bar Menüsü" required />
            </div>
            {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
