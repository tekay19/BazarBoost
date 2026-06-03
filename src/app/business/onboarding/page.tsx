"use client";

import { useFormState, useFormStatus } from "react-dom";
import { acceptInvite } from "@/server/auth-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label } from "@/components/ui";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" disabled={pending}>
      {pending ? "Kaydediliyor..." : "Hesabımı Oluştur"}
    </Button>
  );
}

export default function OnboardingPage({ searchParams }: { searchParams: { token?: string; email?: string } }) {
  const [state, action] = useFormState(acceptInvite, { error: "" } as { error?: string });
  const token = searchParams.token ?? "";
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Hoş geldiniz 👋</CardTitle>
          <CardDescription>İşletme panelinize erişmek için şifrenizi oluşturun.</CardDescription>
        </CardHeader>
        <CardContent>
          {!token ? (
            <p className="text-sm text-red-600">Geçersiz davet linki. Token bulunamadı.</p>
          ) : (
            <form action={action} className="space-y-4">
              <input type="hidden" name="token" value={token} />
              {!searchParams.email && (
                <div className="space-y-1.5">
                  <Label htmlFor="email">E-posta</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
              )}
              {searchParams.email && <input type="hidden" name="email" value={searchParams.email} />}
              <div className="space-y-1.5">
                <Label htmlFor="name">Ad Soyad</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Şifre (min 8 karakter)</Label>
                <Input id="password" name="password" type="password" minLength={8} required />
              </div>
              {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
              <SubmitButton />
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
