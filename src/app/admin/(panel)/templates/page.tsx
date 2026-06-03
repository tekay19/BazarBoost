import { getCatalog, TEMPLATE_CATEGORIES } from "@/lib/templates";
import { Card, CardContent } from "@/components/ui";

export default function TemplatesPage() {
  const catalog = getCatalog();
  const byCat = TEMPLATE_CATEGORIES.map((c) => ({
    ...c,
    items: catalog.filter((t) => t.category === c.key),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Şablon Kataloğu</h1>
        <p className="text-sm text-slate-500">{catalog.length} premium şablon · {TEMPLATE_CATEGORIES.length} kategori</p>
      </div>

      {byCat.map((cat) => (
        <section key={cat.key}>
          <h2 className="font-semibold mb-3">{cat.label} <span className="text-slate-400 text-sm">({cat.items.length})</span></h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {cat.items.map((t) => (
              <Card key={t.key}>
                <div className="h-20 rounded-t-lg" style={{ background: `linear-gradient(135deg, ${t.theme.primary}, ${t.theme.secondary})` }} />
                <CardContent className="pt-3">
                  <div className="text-sm font-medium truncate">{t.name}</div>
                  <div className="text-[11px] text-slate-400">{t.layout}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
