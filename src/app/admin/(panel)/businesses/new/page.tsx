"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createBusiness } from "@/server/admin-actions";
import { Card, CardContent, CardHeader, CardTitle, Input, Label, Select, Textarea } from "@/components/ui";
import { Button } from "@/components/ui/button";

const TYPES = [
  ["RESTAURANT", "Restoran"], ["CAFE", "Kafe"], ["BAR", "Bar"], ["PIZZA", "Pizzacı"],
  ["BURGER", "Hamburgerci"], ["KEBAB", "Kebapçı"], ["DESSERT", "Tatlıcı/Pastane"],
  ["FINE_DINING", "Fine Dining"], ["OTHER", "Diğer"],
];
const PACKAGES = [["FREE", "Free"], ["BASIC", "Basic"], ["PRO", "Pro"], ["ENTERPRISE", "Enterprise"]];

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button disabled={pending}>{pending ? "Kaydediliyor..." : "İşletme Oluştur"}</Button>;
}

export default function NewBusinessPage() {
  const [state, action] = useFormState(createBusiness, { error: "" } as { error?: string });
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Yeni İşletme</h1>
      <Card>
        <CardHeader><CardTitle>İşletme Bilgileri</CardTitle></CardHeader>
        <CardContent>
          <form action={action} className="grid sm:grid-cols-2 gap-4">
            <Field label="İşletme Adı *"><Input name="name" required /></Field>
            <Field label="Subdomain"><Input name="subdomain" placeholder="otomatik üretilir" /></Field>
            <Field label="İşletme Türü">
              <Select name="type">{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select>
            </Field>
            <Field label="Paket">
              <Select name="package">{PACKAGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</Select>
            </Field>
            <Field label="Telefon"><Input name="phone" /></Field>
            <Field label="E-posta"><Input name="email" type="email" /></Field>
            <Field label="Sorumlu Kişi"><Input name="contactName" /></Field>
            <Field label="Sorumlu Telefonu"><Input name="contactPhone" /></Field>
            <Field label="Vergi Bilgisi"><Input name="taxInfo" /></Field>
            <Field label="Logo URL"><Input name="logoUrl" /></Field>
            <Field label="Adres" full><Textarea name="address" /></Field>
            <Field label="Açıklama" full><Textarea name="description" /></Field>
            <Field label="Durum">
              <Select name="status"><option value="ACTIVE">Aktif</option><option value="INACTIVE">Pasif</option></Select>
            </Field>
            {state?.error && <p className="text-sm text-red-600 sm:col-span-2">{state.error}</p>}
            <div className="sm:col-span-2"><SubmitButton /></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`space-y-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
