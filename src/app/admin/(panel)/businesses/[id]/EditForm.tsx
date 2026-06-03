"use client";

import { useState } from "react";
import { updateBusiness, impersonateBusiness } from "@/server/admin-actions";
import { Input, Label, Select, Textarea } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ImageUpload";

const TYPES = [
  ["RESTAURANT", "Restoran"], ["CAFE", "Kafe"], ["BAR", "Bar"], ["PIZZA", "Pizzacı"],
  ["BURGER", "Hamburgerci"], ["KEBAB", "Kebapçı"], ["DESSERT", "Tatlıcı/Pastane"],
  ["FINE_DINING", "Fine Dining"], ["OTHER", "Diğer"],
];
const PACKAGES = [["FREE", "Free"], ["BASIC", "Basic"], ["PRO", "Pro"], ["ENTERPRISE", "Enterprise"]];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function EditForm({ b }: { b: any }) {
  const [saved, setSaved] = useState(false);

  async function save(formData: FormData) {
    setSaved(false);
    await updateBusiness(b.id, formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form action={save} className="grid sm:grid-cols-2 gap-4">
      <F label="İşletme Adı"><Input name="name" defaultValue={b.name} required /></F>
      <F label="Subdomain"><Input name="subdomain" defaultValue={b.subdomain} /></F>
      <F label="Tür"><Select name="type" defaultValue={b.type}>{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select></F>
      <F label="Paket"><Select name="package" defaultValue={b.package}>{PACKAGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select></F>
      <F label="Telefon"><Input name="phone" defaultValue={b.phone ?? ""} /></F>
      <F label="E-posta"><Input name="email" type="email" defaultValue={b.email ?? ""} /></F>
      <F label="Sorumlu Kişi"><Input name="contactName" defaultValue={b.contactName ?? ""} /></F>
      <F label="Sorumlu Telefonu"><Input name="contactPhone" defaultValue={b.contactPhone ?? ""} /></F>
      <F label="Vergi Bilgisi"><Input name="taxInfo" defaultValue={b.taxInfo ?? ""} /></F>
      <F label="Logo" full><ImageUpload name="logoUrl" defaultValue={b.logoUrl ?? ""} label="Logo" /></F>
      <F label="Adres" full><Textarea name="address" defaultValue={b.address ?? ""} /></F>
      <F label="Açıklama" full><Textarea name="description" defaultValue={b.description ?? ""} /></F>
      <F label="Durum"><Select name="status" defaultValue={b.status}><option value="ACTIVE">Aktif</option><option value="INACTIVE">Pasif</option></Select></F>
      <div className="flex items-center gap-2 pt-6">
        <input id="seo" type="checkbox" name="seoIndexable" defaultChecked={b.seoIndexable} className="h-4 w-4" />
        <Label htmlFor="seo">SEO indexlenebilir</Label>
      </div>
      <div className="sm:col-span-2 flex items-center gap-3">
        <Button type="submit">Kaydet</Button>
        <Button type="button" variant="outline" onClick={() => impersonateBusiness(b.id)}>
          İşletme adına panele gir
        </Button>
        {saved && <span className="text-sm text-green-600">Kaydedildi ✓</span>}
      </div>
    </form>
  );
}

function F({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`space-y-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
