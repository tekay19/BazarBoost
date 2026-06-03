"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveCategory, deleteCategory } from "@/server/business-actions";
import { Card, CardContent, Input, Label, Textarea } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ImageUpload";
import { Pencil, Trash2 } from "lucide-react";

interface Cat {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  _count: { products: number };
}

export function CategoriesManager({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Cat | null>(null);
  const [error, setError] = useState("");

  async function onSave(formData: FormData) {
    const res = await saveCategory(null, formData);
    if (res?.error) return setError(res.error);
    setError("");
    setEditing(null);
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) return;
    await deleteCategory(id);
    router.refresh();
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="md:col-span-2 h-fit">
        <CardContent className="pt-6 divide-y">
          {categories.length === 0 && <p className="text-sm text-slate-500">Henüz kategori yok.</p>}
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-3">
              <div>
                <div className="font-medium">{c.name} {!c.isActive && <span className="text-xs text-slate-400">(pasif)</span>}</div>
                <div className="text-xs text-slate-500">{c._count.products} ürün · sıra {c.sortOrder}</div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(c); setError(""); }} className="p-2 hover:bg-slate-100 rounded"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => onDelete(c.id)} className="p-2 hover:bg-red-50 text-red-500 rounded"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-3">{editing ? "Kategori Düzenle" : "Yeni Kategori"}</h3>
          <form action={onSave} className="space-y-3" key={editing?.id ?? "new"}>
            <input type="hidden" name="id" value={editing?.id ?? ""} />
            <div className="space-y-1.5"><Label>Ad</Label><Input name="name" defaultValue={editing?.name ?? ""} required /></div>
            <div className="space-y-1.5"><Label>Açıklama</Label><Textarea name="description" defaultValue={editing?.description ?? ""} /></div>
            <div className="space-y-1.5"><Label>Görsel</Label><ImageUpload name="imageUrl" defaultValue={editing?.imageUrl ?? ""} label="Kategori görseli" /></div>
            <div className="space-y-1.5"><Label>Sıralama</Label><Input name="sortOrder" type="number" defaultValue={editing?.sortOrder ?? 0} /></div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isActive" defaultChecked={editing?.isActive ?? true} /> Aktif
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit">{editing ? "Güncelle" : "Ekle"}</Button>
              {editing && <Button type="button" variant="outline" onClick={() => setEditing(null)}>İptal</Button>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
