"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { saveMenuBuilder, setMenuStatus, duplicateMenu } from "@/server/business-actions";
import { Card, CardContent, Input, Label, Select, Badge } from "@/components/ui";
import { Button } from "@/components/ui/button";
import MenuRenderer from "@/components/menu/MenuRenderer";
import { formatPrice } from "@/lib/utils";
import type { TemplateTheme } from "@/lib/templates";
import type { RenderMenu } from "@/components/menu/types";
import { TEMPLATE_CATEGORIES } from "@/lib/templates";
import { Eye, Save, Send } from "lucide-react";

interface CatalogItem { key: string; name: string; category: string; layout: string; theme: TemplateTheme; }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = any;

export function MenuBuilder({ menu, products, categories, catalog }: {
  menu: AnyObj; products: AnyObj[]; categories: AnyObj[]; catalog: CatalogItem[]; baseUrl: string;
}) {
  const router = useRouter();
  const [name, setName] = useState<string>(menu.name);
  const [templateKey, setTemplateKey] = useState<string>(menu.templateKey);
  const [selected, setSelected] = useState<Set<string>>(new Set(menu.items.map((i: AnyObj) => i.productId)));
  const [overrides, setOverrides] = useState<Partial<TemplateTheme>>(menu.theme || {});
  const [tplFilter, setTplFilter] = useState<string>("all");
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const tpl = catalog.find((t) => t.key === templateKey) ?? catalog[0];
  const theme: TemplateTheme = { ...tpl.theme, ...overrides };

  const filteredTpl = useMemo(
    () => (tplFilter === "all" ? catalog : catalog.filter((t) => t.category === tplFilter)),
    [catalog, tplFilter]
  );

  function toggle(id: string) {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  }

  const previewMenu: RenderMenu = useMemo(() => {
    const byCat = new Map<string, AnyObj>();
    const uncat = { id: "uncat", name: "Diğer", description: null, imageUrl: null, products: [] as AnyObj[] };
    for (const p of products) {
      if (!selected.has(p.id)) continue;
      const rp = {
        id: p.id, name: p.name, description: p.description,
        price: formatPrice(Number(p.price), p.currency), rawPrice: Number(p.price),
        currency: p.currency, imageUrl: p.imageUrl, inStock: p.inStock, tags: p.tags,
      };
      if (p.category) {
        if (!byCat.has(p.category.id)) byCat.set(p.category.id, { id: p.category.id, name: p.category.name, description: null, imageUrl: null, products: [] });
        byCat.get(p.category.id).products.push(rp);
      } else uncat.products.push(rp);
    }
    const cats = [...byCat.values()];
    if (uncat.products.length) cats.push(uncat);
    return {
      businessName: menu.businessName, logoUrl: menu.logoUrl, menuName: name,
      description: menu.description, categories: cats, theme, layout: tpl.layout,
    };
  }, [products, selected, name, theme, tpl.layout, menu]);

  async function save(publish?: boolean) {
    setSaving(true); setMsg("");
    await saveMenuBuilder(menu.id, { name, templateKey, theme: overrides, productIds: [...selected] });
    if (publish) await setMenuStatus(menu.id, "PUBLISHED");
    setSaving(false);
    setMsg(publish ? "Yayınlandı ✓" : "Kaydedildi ✓");
    router.refresh();
    setTimeout(() => setMsg(""), 2500);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Menü Builder</h1>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Badge className="bg-slate-100 text-slate-600">{menu.status}</Badge>
            <span>v{menu.version} · {selected.size} ürün seçili</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setShowPreview(true)} className="lg:hidden"><Eye className="h-4 w-4" /> Önizleme</Button>
          <Button variant="outline" onClick={() => save(false)} disabled={saving}><Save className="h-4 w-4" /> Taslak</Button>
          <Button onClick={() => save(true)} disabled={saving}><Send className="h-4 w-4" /> Yayınla</Button>
          <Button variant="outline" onClick={() => duplicateMenu(menu.id)}>Yeni Versiyon</Button>
          {menu.status === "PUBLISHED" && <Button variant="outline" onClick={() => setMenuStatus(menu.id, "ARCHIVED").then(() => router.refresh())}>Arşivle</Button>}
        </div>
      </div>
      {msg && <p className="text-sm text-green-600">{msg}</p>}

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* controls */}
        <div className="space-y-6">
          <Card><CardContent className="pt-6 space-y-3">
            <div className="space-y-1.5"><Label>Menü Adı</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          </CardContent></Card>

          {/* Template picker */}
          <Card><CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Şablon Seç</h3>
              <Select value={tplFilter} onChange={(e) => setTplFilter(e.target.value)} className="w-auto h-9">
                <option value="all">Tüm kategoriler</option>
                {TEMPLATE_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </Select>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-72 overflow-auto">
              {filteredTpl.map((t) => (
                <button key={t.key} onClick={() => { setTemplateKey(t.key); setOverrides({}); }}
                  className={`rounded-md overflow-hidden border-2 text-left ${templateKey === t.key ? "border-slate-900" : "border-transparent"}`}>
                  <div className="h-12" style={{ background: `linear-gradient(135deg, ${t.theme.primary}, ${t.theme.secondary})` }} />
                  <div className="p-1 text-[10px] truncate">{t.layout}</div>
                </button>
              ))}
            </div>
          </CardContent></Card>

          {/* Brand overrides */}
          <Card><CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Marka Ayarları</h3>
            <div className="grid grid-cols-2 gap-3">
              <ColorField label="Ana Renk" value={theme.primary} onChange={(v) => setOverrides({ ...overrides, primary: v })} />
              <ColorField label="İkincil Renk" value={theme.secondary} onChange={(v) => setOverrides({ ...overrides, secondary: v })} />
              <ColorField label="Arka Plan" value={theme.background} onChange={(v) => setOverrides({ ...overrides, background: v })} />
              <ColorField label="Yüzey" value={theme.surface} onChange={(v) => setOverrides({ ...overrides, surface: v })} />
              <div className="space-y-1.5"><Label>Yazı Tipi</Label>
                <Select value={theme.font} onChange={(e) => setOverrides({ ...overrides, font: e.target.value as TemplateTheme["font"] })}>
                  <option value="sans">Sans</option><option value="serif">Serif</option><option value="display">Display</option><option value="mono">Mono</option>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Köşe Yuvarlaklığı</Label>
                <Select value={theme.radius} onChange={(e) => setOverrides({ ...overrides, radius: e.target.value as TemplateTheme["radius"] })}>
                  <option value="none">Yok</option><option value="sm">Az</option><option value="md">Orta</option><option value="lg">Çok</option><option value="full">Tam</option>
                </Select>
              </div>
            </div>
            <button className="text-xs underline text-slate-500 mt-3" onClick={() => setOverrides({})}>Şablon varsayılanına dön</button>
          </CardContent></Card>

          {/* Product selection */}
          <Card><CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Ürünler ({selected.size}/{products.length})</h3>
              <div className="flex gap-2">
                <button className="text-xs underline" onClick={() => setSelected(new Set(products.map((p) => p.id)))}>Tümünü seç</button>
                <button className="text-xs underline" onClick={() => setSelected(new Set())}>Temizle</button>
              </div>
            </div>
            {categories.map((cat) => {
              const items = products.filter((p) => p.categoryId === cat.id);
              if (!items.length) return null;
              return (
                <div key={cat.id} className="mb-3">
                  <div className="text-xs font-semibold text-slate-400 uppercase mb-1">{cat.name}</div>
                  {items.map((p) => <ProductRow key={p.id} p={p} checked={selected.has(p.id)} onToggle={() => toggle(p.id)} />)}
                </div>
              );
            })}
            {products.filter((p) => !p.categoryId).length > 0 && (
              <div className="mb-3">
                <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Kategorisiz</div>
                {products.filter((p) => !p.categoryId).map((p) => <ProductRow key={p.id} p={p} checked={selected.has(p.id)} onToggle={() => toggle(p.id)} />)}
              </div>
            )}
            {products.length === 0 && <p className="text-sm text-slate-500">Önce ürün ekleyin.</p>}
          </CardContent></Card>
        </div>

        {/* live preview desktop */}
        <div className="hidden lg:block">
          <div className="sticky top-4">
            <div className="text-xs text-slate-400 mb-2 text-center">Canlı Önizleme (mobil)</div>
            <div className="mx-auto w-[360px] h-[680px] rounded-[2rem] border-8 border-slate-900 overflow-hidden shadow-xl">
              <div className="h-full overflow-auto"><MenuRenderer menu={previewMenu} /></div>
            </div>
          </div>
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 bg-white lg:hidden">
          <button onClick={() => setShowPreview(false)} className="absolute top-3 right-3 z-50 bg-slate-900 text-white rounded-full px-3 py-1 text-sm">Kapat</button>
          <div className="h-full overflow-auto"><MenuRenderer menu={previewMenu} /></div>
        </div>
      )}
    </div>
  );
}

function ProductRow({ p, checked, onToggle }: { p: AnyObj; checked: boolean; onToggle: () => void }) {
  return (
    <label className="flex items-center gap-2 py-1 text-sm cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onToggle} />
      <span className="flex-1">{p.name}</span>
      <span className="text-slate-400">{Number(p.price).toFixed(2)} {p.currency}</span>
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-10 rounded border" />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-9" />
      </div>
    </div>
  );
}
