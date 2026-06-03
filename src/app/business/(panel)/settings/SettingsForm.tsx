"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateBusinessSettings } from "@/server/business-actions";
import { Input, Label, Textarea } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ImageUpload";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return <Button disabled={pending}>{pending ? "Kaydediliyor..." : "Kaydet"}</Button>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SettingsForm({ b }: { b: any }) {
  const [state, action] = useFormState(updateBusinessSettings, {} as { error?: string; ok?: boolean });
  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5"><Label>Logo</Label><ImageUpload name="logoUrl" defaultValue={b.logoUrl ?? ""} label="Logo" /></div>
      <div className="space-y-1.5"><Label>Telefon</Label><Input name="phone" defaultValue={b.phone ?? ""} /></div>
      <div className="space-y-1.5"><Label>Adres</Label><Textarea name="address" defaultValue={b.address ?? ""} /></div>
      <div className="space-y-1.5"><Label>Açıklama</Label><Textarea name="description" defaultValue={b.description ?? ""} /></div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="seoIndexable" defaultChecked={b.seoIndexable} /> Menü sayfaları arama motorlarında indexlensin
      </label>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-sm text-green-600">Kaydedildi ✓</p>}
      <SubmitBtn />
    </form>
  );
}
