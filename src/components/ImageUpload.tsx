"use client";

import { useState } from "react";
import { Input } from "@/components/ui";
import { Upload, X } from "lucide-react";

/**
 * Reusable image uploader. Uploads to /api/upload, then writes the resulting
 * URL into a hidden input (so it submits with the surrounding form). Users can
 * also paste a URL manually.
 */
export function ImageUpload({
  name,
  defaultValue = "",
  label = "Görsel",
}: {
  name: string;
  defaultValue?: string;
  label?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Yükleme hatası");
      else setUrl(data.url);
    } catch {
      setError("Yükleme başarısız");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={url} />
      <div className="flex items-center gap-3">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-14 w-14 rounded object-cover border" />
        ) : (
          <div className="h-14 w-14 rounded border border-dashed flex items-center justify-center text-slate-300">
            <Upload className="h-5 w-5" />
          </div>
        )}
        <div className="flex-1 space-y-1">
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer rounded-md border px-3 py-1.5 hover:bg-slate-50">
            <Upload className="h-4 w-4" />
            {busy ? "Yükleniyor..." : `${label} yükle`}
            <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={onFile} disabled={busy} />
          </label>
          {url && (
            <button type="button" onClick={() => setUrl("")} className="ml-2 text-xs text-red-500 inline-flex items-center gap-1">
              <X className="h-3 w-3" /> Kaldır
            </button>
          )}
        </div>
      </div>
      <Input placeholder="veya görsel URL yapıştırın" value={url} onChange={(e) => setUrl(e.target.value)} />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
