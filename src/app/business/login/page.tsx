"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { businessLogin, requestMagicLink } from "@/server/auth-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <Button className="w-full" disabled={pending}>{pending ? "..." : label}</Button>;
}

export default function BusinessLoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [state, action] = useFormState(businessLogin, { error: "" } as { error?: string });
  const [magicState, magicAction] = useFormState(requestMagicLink, {} as { error?: string; ok?: boolean; url?: string; message?: string });

  const urlError = searchParams.error
    ? searchParams.error === "expired"
      ? "Giriş linkinin süresi dolmuş veya kullanılmış."
      : "Giriş linki geçersiz."
    : "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Store className="h-10 w-10 mx-auto text-slate-700" />
          <CardTitle>İşletme Girişi</CardTitle>
          <CardDescription>
            {mode === "password" ? "E-posta ve şifrenizle giriş yapın." : "E-postanıza giriş linki gönderelim."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {urlError && <p className="text-sm text-red-600">{urlError}</p>}

          {mode === "password" ? (
            <form action={action} className="space-y-4">
              <div className="space-y-1.5"><Label htmlFor="email">E-posta</Label><Input id="email" name="email" type="email" required /></div>
              <div className="space-y-1.5"><Label htmlFor="password">Şifre</Label><Input id="password" name="password" type="password" required /></div>
              {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
              <SubmitButton label="Giriş Yap" />
            </form>
          ) : (
            <form action={magicAction} className="space-y-4">
              <div className="space-y-1.5"><Label htmlFor="memail">E-posta</Label><Input id="memail" name="email" type="email" required /></div>
              {magicState?.error && <p className="text-sm text-red-600">{magicState.error}</p>}
              {magicState?.message && <p className="text-sm text-green-600">{magicState.message}</p>}
              {magicState?.url && (
                <a href={magicState.url} className="block text-sm underline text-blue-600 break-all">
                  Giriş için tıklayın →
                </a>
              )}
              <SubmitButton label="Giriş Linki Gönder" />
            </form>
          )}

          <button
            type="button"
            onClick={() => setMode(mode === "password" ? "magic" : "password")}
            className="w-full text-sm text-slate-500 underline"
          >
            {mode === "password" ? "Magic link ile giriş yap" : "Şifre ile giriş yap"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
