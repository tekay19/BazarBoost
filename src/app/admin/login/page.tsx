"use client";

import { useFormState, useFormStatus } from "react-dom";
import { adminLogin } from "@/server/auth-actions";
import { Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" disabled={pending}>
      {pending ? "Giriş yapılıyor..." : "Giriş Yap"}
    </Button>
  );
}

export default function AdminLoginPage() {
  const [state, action] = useFormState(adminLogin, { error: "" } as { error?: string });
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <ShieldCheck className="h-10 w-10 mx-auto text-slate-700" />
          <CardTitle>Süper Admin Girişi</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-posta</Label>
              <Input id="email" name="email" type="email" required placeholder="admin@qrmenu.com" />
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
