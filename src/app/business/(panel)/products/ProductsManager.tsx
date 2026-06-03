"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveProduct, deleteProduct, commitImport } from "@/server/business-actions";
import { Card, CardContent, Input, Label, Select, Textarea } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Upload, X } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import type { ValidatedProduct, RowError } from "@/lib/import";

interface Product {
  id: string; name: string; description: string | null; price: string; currency: string;
  imageUrl: string | null; inStock: boolean; isActive: boolean; sortOrder: number;
  tags: string[]; categoryId: string | null; category: { name: string } | null;
}
interface Category { id: string; name: string; }

export function ProductsManager({ products, categories }: { products: Product[]; categories: Category[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [error, setError] = useState("");

  async function onSave(formData: FormData) {
    const res = await saveProduct(null, formData);
    if (res?.error) return setError(res.error);
    setError(""); setEditing(null); setShowForm(false);
    router.refresh();
  }
  async function onDelete(id: string) {
    if (!confirm("Ürünü silmek istediğinize emin misiniz?")) return;
    await deleteProduct(id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Ürünler <span className="text-slate-400 text-base">({products.length})</span></h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImport(true)}><Upload className="h-4 w-4" /> CSV/Excel</Button>
          <Button onClick={() => { setEditing(null); setShowForm(true); setError(""); }}>+ Ürün Ekle</Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500 border-b">
              <tr><th className="py-3">Ürün</th><th className="hidden sm:table-cell">Kategori</th><th>Fiyat</th><th className="hidden md:table-cell">Etiketler</th><th></th></tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-2.5">
                    <div className="font-medium">{p.name} {!p.isActive && <span className="text-xs text-slate-400">(pasif)</span>}</div>
                  </td>
                  <td className="hidden sm:table-cell text-slate-500">{p.category?.name ?? "—"}</td>
                  <td>{Number(p.price).toFixed(2)} {p.currency}</td>
                  <td className="hidden md:table-cell text-xs text-slate-400">{p.tags.join(", ")}</td>
                  <td className="text-right">
                    <button onClick={() => { setEditing(p); setShowForm(true); setError(""); }} className="p-2 hover:bg-slate-100 rounded"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => onDelete(p.id)} className="p-2 hover:bg-red-50 text-red-500 rounded"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-slate-500">Henüz ürün yok.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {showForm && (
        <Modal title={editing ? "Ürün Düzenle" : "Yeni Ürün"} onClose={() => setShowForm(false)}>
          <form action={onSave} className="grid sm:grid-cols-2 gap-3">
            <input type="hidden" name="id" value={editing?.id ?? ""} />
            <Fld label="Ad *" full><Input name="name" defaultValue={editing?.name ?? ""} required /></Fld>
            <Fld label="Kategori">
              <Select name="categoryId" defaultValue={editing?.categoryId ?? ""}>
                <option value="">— Kategorisiz —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Fld>
            <Fld label="Fiyat"><Input name="price" type="number" step="0.01" defaultValue={editing?.price ?? "0"} /></Fld>
            <Fld label="Para Birimi"><Input name="currency" defaultValue={editing?.currency ?? "TRY"} /></Fld>
            <Fld label="Sıralama"><Input name="sortOrder" type="number" defaultValue={editing?.sortOrder ?? 0} /></Fld>
            <Fld label="Görsel" full><ImageUpload name="imageUrl" defaultValue={editing?.imageUrl ?? ""} label="Ürün görseli" /></Fld>
            <Fld label="Etiketler (virgülle)" full><Input name="tags" defaultValue={editing?.tags.join(", ") ?? ""} placeholder="acılı, vegan, yeni" /></Fld>
            <Fld label="Açıklama" full><Textarea name="description" defaultValue={editing?.description ?? ""} /></Fld>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="inStock" defaultChecked={editing?.inStock ?? true} /> Stokta</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={editing?.isActive ?? true} /> Aktif</label>
            {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
            <div className="sm:col-span-2 flex gap-2"><Button type="submit">Kaydet</Button><Button type="button" variant="outline" onClick={() => setShowForm(false)}>İptal</Button></div>
          </form>
        </Modal>
      )}

      {showImport && <ImportModal categories={categories} onClose={() => setShowImport(false)} onDone={() => { setShowImport(false); router.refresh(); }} />}
    </div>
  );
}

function ImportModal({ onClose, onDone }: { categories: Category[]; onClose: () => void; onDone: () => void }) {
  const [preview, setPreview] = useState<{ valid: ValidatedProduct[]; errors: RowError[]; total: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true); setMsg("");
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/business/import", { method: "POST", body: fd });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setMsg(data.error || "Hata");
    setPreview(data);
  }

  async function commit() {
    if (!preview?.valid.length) return;
    setLoading(true);
    const res = await commitImport(preview.valid);
    setLoading(false);
    if (res?.error) return setMsg(res.error);
    onDone();
  }

  return (
    <Modal title="CSV / Excel İçe Aktarma" onClose={onClose}>
      {!preview && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Sütunlar: Ürün adı, Kategori, Açıklama, Fiyat, Para birimi, Görsel URL, Stok durumu, Etiketler, Sıralama, Aktif.
          </p>
          <a href="/import-template.csv" download className="text-sm underline text-blue-600">Örnek şablonu indir</a>
          <input type="file" accept=".csv,.xlsx,.xls" onChange={upload} className="block text-sm" />
          {loading && <p className="text-sm">Yükleniyor...</p>}
          {msg && <p className="text-sm text-red-600">{msg}</p>}
        </div>
      )}
      {preview && (
        <div className="space-y-3">
          <div className="flex gap-4 text-sm">
            <span className="text-green-600">{preview.valid.length} geçerli</span>
            <span className="text-red-600">{preview.errors.length} hatalı</span>
            <span className="text-slate-500">{preview.total} toplam</span>
          </div>
          {preview.errors.length > 0 && (
            <div className="max-h-32 overflow-auto rounded border bg-red-50 p-2 text-xs">
              {preview.errors.map((e, i) => (
                <div key={i}>Satır {e.row}: {e.errors.join(", ")}</div>
              ))}
            </div>
          )}
          <div className="max-h-48 overflow-auto rounded border text-xs">
            <table className="w-full">
              <thead className="bg-slate-50 text-left"><tr><th className="p-1.5">Ad</th><th>Kategori</th><th>Fiyat</th></tr></thead>
              <tbody>
                {preview.valid.slice(0, 50).map((p, i) => (
                  <tr key={i} className="border-t"><td className="p-1.5">{p.name}</td><td>{p.category ?? "—"}</td><td>{p.price} {p.currency}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          {msg && <p className="text-sm text-red-600">{msg}</p>}
          <div className="flex gap-2">
            <Button onClick={commit} disabled={loading || !preview.valid.length}>{loading ? "Aktarılıyor..." : `${preview.valid.length} ürünü içe aktar`}</Button>
            <Button variant="outline" onClick={() => setPreview(null)}>Geri</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-auto" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-2xl mt-10 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function Fld({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <div className={`space-y-1.5 ${full ? "sm:col-span-2" : ""}`}><Label>{label}</Label>{children}</div>;
}
