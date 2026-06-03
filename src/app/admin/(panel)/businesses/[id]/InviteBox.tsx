"use client";

import { useState } from "react";
import { generateInvite } from "@/server/admin-actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui";
import { Copy, Check } from "lucide-react";

export function InviteBox({ businessId, defaultEmail }: { businessId: string; defaultEmail?: string | null }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    const res = await generateInvite(businessId, formData);
    setLoading(false);
    if (res?.url) setUrl(res.url);
  }

  return (
    <div className="space-y-3">
      <form action={submit} className="grid sm:grid-cols-3 gap-3 items-end">
        <div className="space-y-1.5">
          <Label>E-posta</Label>
          <Input name="email" type="email" defaultValue={defaultEmail ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label>Geçerlilik (gün)</Label>
          <Input name="days" type="number" defaultValue={7} min={1} />
        </div>
        <div className="space-y-1.5">
          <Label>Tek Kullanımlık</Label>
          <Select name="singleUse" defaultValue="on">
            <option value="on">Evet</option>
            <option value="off">Hayır</option>
          </Select>
        </div>
        <div className="sm:col-span-3">
          <Button disabled={loading}>{loading ? "Üretiliyor..." : "Davet Linki Üret"}</Button>
        </div>
      </form>

      {url && (
        <div className="flex items-center gap-2 rounded-md border bg-slate-50 p-2 text-sm">
          <code className="flex-1 truncate">{url}</code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="p-1.5 rounded hover:bg-slate-200"
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
