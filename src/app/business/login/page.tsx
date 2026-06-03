"use client";

import { useFormState, useFormStatus } from "react-dom";
import { businessLogin } from "@/server/auth-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" disabled={pending}>
      {pending ? "Giriş yapılıyor..." : "Giriş Yap"}
    </Button>
  );
}

export default function BusinessLoginPage() {
  const [state, action] = useFormState(businessLogin, { error: "" } as { error?: string });
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Store className="h-10 w-10 mx-auto text-slate-700" />
          <CardTitle>İşletme Girişi</CardTitle>
          <CardDescription>Davet linkiyle ilk girişinizi yaptıysanız buradan giriş yapın.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Şifre</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
