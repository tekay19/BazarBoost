"use client";

import { useEffect, useMemo, useState } from "react";
import type { RenderMenu, RenderProduct } from "./types";
import { themeVars, TAG_COLORS } from "./types";

function Tags({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {tags.map((t) => (
        <span
          key={t}
          className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
          style={{ backgroundColor: (TAG_COLORS[t.toLowerCase()] ?? "var(--m-secondary)") + "22", color: TAG_COLORS[t.toLowerCase()] ?? "var(--m-secondary)" }}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

function Price({ p }: { p: RenderProduct }) {
  return (
    <span className="font-bold whitespace-nowrap" style={{ color: "var(--m-primary)" }}>
      {p.price}
    </span>
  );
}

/* ---------------- Sticky category navigation ---------------- */
function CategoryNav({
  cats,
  active,
  onPick,
}: {
  cats: { id: string; name: string }[];
  active: string;
  onPick: (id: string) => void;
}) {
  if (cats.length <= 1) return null;
  return (
    <nav
      className="sticky top-0 z-20 no-scrollbar overflow-x-auto flex gap-2 px-4 py-3 backdrop-blur border-b"
      style={{ backgroundColor: "color-mix(in srgb, var(--m-bg) 88%, transparent)", borderColor: "color-mix(in srgb, var(--m-muted) 40%, transparent)" }}
    >
      {cats.map((c) => (
        <button
          key={c.id}
          onClick={() => onPick(c.id)}
          className="whitespace-nowrap text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
          style={
            active === c.id
              ? { backgroundColor: "var(--m-primary)", color: "var(--m-bg)" }
              : { backgroundColor: "var(--m-surface)", color: "var(--m-text)" }
          }
        >
          {c.name}
        </button>
      ))}
    </nav>
  );
}

/* ---------------- Header ---------------- */
function Header({ menu, variant = "default" }: { menu: RenderMenu; variant?: "default" | "hero" | "serif" }) {
  return (
    <header
      className={
        variant === "hero"
          ? "relative px-6 pt-12 pb-10 text-center"
          : "px-6 pt-10 pb-6 text-center"
      }
      style={variant === "hero" ? { background: `linear-gradient(135deg, var(--m-primary), var(--m-secondary))`, color: "var(--m-bg)" } : {}}
    >
      {menu.logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={menu.logoUrl} alt={menu.businessName} className="mx-auto h-16 w-16 rounded-full object-cover mb-3 shadow" />
      )}
      <h1
        className={variant === "serif" ? "text-3xl font-serif tracking-wide" : "text-2xl font-extrabold"}
        style={variant === "hero" ? {} : { color: "var(--m-primary)" }}
      >
        {menu.businessName}
      </h1>
      <p className="text-sm opacity-80 mt-1">{menu.menuName}</p>
      {menu.description && <p className="text-xs opacity-70 mt-2 max-w-md mx-auto">{menu.description}</p>}
    </header>
  );
}

/* ---------------- Card variants ---------------- */
function CardImageTop({ p }: { p: RenderProduct }) {
  return (
    <div className="rounded-[var(--m-radius)] overflow-hidden shadow-sm" style={{ backgroundColor: "var(--m-surface)" }}>
      {p.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.imageUrl} alt={p.name} className="w-full h-36 object-cover" />
      )}
      <div className="p-3">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-sm">{p.name}</h3>
          <Price p={p} />
        </div>
        {p.description && <p className="text-xs mt-1 opacity-70 line-clamp-2">{p.description}</p>}
        <Tags tags={p.tags} />
        {!p.inStock && <span className="text-[10px] text-red-500 font-medium">Tükendi</span>}
      </div>
    </div>
  );
}

function CardRow({ p, image = true }: { p: RenderProduct; image?: boolean }) {
  return (
    <div className="flex gap-3 py-3 border-b" style={{ borderColor: "color-mix(in srgb, var(--m-muted) 30%, transparent)" }}>
      {image && p.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.imageUrl} alt={p.name} className="h-16 w-16 rounded-[var(--m-radius)] object-cover flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-2">
          <h3 className="font-semibold text-sm">{p.name}</h3>
          <Price p={p} />
        </div>
        {p.description && <p className="text-xs mt-0.5 opacity-70">{p.description}</p>}
        <Tags tags={p.tags} />
        {!p.inStock && <span className="text-[10px] text-red-500 font-medium">Tükendi</span>}
      </div>
    </div>
  );
}

/* ---------------- Layouts ---------------- */
function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={`cat-${id}`} className="px-4 py-5 scroll-mt-16">
      <h2 className="text-lg font-bold mb-3" style={{ color: "var(--m-primary)" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function ImageGrid({ menu }: { menu: RenderMenu }) {
  return (
    <>
      {menu.categories.map((c) => (
        <Section key={c.id} id={c.id} title={c.name}>
          <div className="grid grid-cols-2 gap-3">
            {c.products.map((p) => (
              <CardImageTop key={p.id} p={p} />
            ))}
          </div>
        </Section>
      ))}
    </>
  );
}

function ClassicList({ menu }: { menu: RenderMenu }) {
  return (
    <>
      {menu.categories.map((c) => (
        <Section key={c.id} id={c.id} title={c.name}>
          <div>
            {c.products.map((p) => (
              <CardRow key={p.id} p={p} />
            ))}
          </div>
        </Section>
      ))}
    </>
  );
}

function CompactRows({ menu }: { menu: RenderMenu }) {
  return (
    <>
      {menu.categories.map((c) => (
        <Section key={c.id} id={c.id} title={c.name}>
          <div>
            {c.products.map((p) => (
              <CardRow key={p.id} p={p} image={false} />
            ))}
          </div>
        </Section>
      ))}
    </>
  );
}

function CardStack({ menu }: { menu: RenderMenu }) {
  return (
    <>
      {menu.categories.map((c) => (
        <Section key={c.id} id={c.id} title={c.name}>
          <div className="space-y-3">
            {c.products.map((p) => (
              <div key={p.id} className="rounded-[var(--m-radius)] p-3 shadow-sm" style={{ backgroundColor: "var(--m-surface)" }}>
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-semibold">{p.name}</h3>
                  <Price p={p} />
                </div>
                {p.description && <p className="text-xs mt-1 opacity-70">{p.description}</p>}
                <Tags tags={p.tags} />
              </div>
            ))}
          </div>
        </Section>
      ))}
    </>
  );
}

function Magazine({ menu }: { menu: RenderMenu }) {
  return (
    <>
      {menu.categories.map((c, ci) => (
        <Section key={c.id} id={c.id} title={c.name}>
          {c.description && <p className="text-xs opacity-60 -mt-2 mb-3 italic">{c.description}</p>}
          <div className="space-y-4">
            {c.products.map((p, i) =>
              i === 0 && p.imageUrl ? (
                <CardImageTop key={p.id} p={p} />
              ) : (
                <CardRow key={p.id} p={p} />
              )
            )}
          </div>
        </Section>
      ))}
    </>
  );
}

function ElegantSerif({ menu }: { menu: RenderMenu }) {
  return (
    <>
      {menu.categories.map((c) => (
        <section key={c.id} id={`cat-${c.id}`} className="px-6 py-6 scroll-mt-16">
          <div className="text-center mb-4">
            <h2 className="text-xl font-serif tracking-[0.2em] uppercase" style={{ color: "var(--m-primary)" }}>
              {c.name}
            </h2>
            <div className="mx-auto mt-2 h-px w-16" style={{ backgroundColor: "var(--m-secondary)" }} />
          </div>
          <div className="space-y-4 max-w-xl mx-auto">
            {c.products.map((p) => (
              <div key={p.id} className="flex items-baseline gap-3">
                <span className="font-serif font-medium">{p.name}</span>
                <span className="flex-1 border-b border-dotted self-end mb-1 opacity-40" />
                <Price p={p} />
                {p.description && <></>}
                <div className="basis-full text-xs opacity-60">{p.description}</div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

function BoldHero({ menu }: { menu: RenderMenu }) {
  return (
    <>
      {menu.categories.map((c) => (
        <Section key={c.id} id={c.id} title={c.name}>
          <div className="grid gap-3">
            {c.products.map((p) => (
              <div key={p.id} className="relative overflow-hidden rounded-[var(--m-radius)] shadow" style={{ backgroundColor: "var(--m-surface)" }}>
                <div className="flex">
                  {p.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt={p.name} className="h-24 w-24 object-cover flex-shrink-0" />
                  )}
                  <div className="p-3 flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-extrabold uppercase text-sm">{p.name}</h3>
                      <Price p={p} />
                    </div>
                    {p.description && <p className="text-xs opacity-70 mt-1">{p.description}</p>}
                    <Tags tags={p.tags} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      ))}
    </>
  );
}

const LAYOUTS: Record<string, (p: { menu: RenderMenu }) => JSX.Element> = {
  "image-grid": ImageGrid,
  "classic-list": ClassicList,
  "compact-rows": CompactRows,
  "card-stack": CardStack,
  magazine: Magazine,
  "elegant-serif": ElegantSerif,
  "bold-hero": BoldHero,
  "tabbed-sticky": ClassicList,
};

export default function MenuRenderer({ menu }: { menu: RenderMenu }) {
  const cats = useMemo(() => menu.categories.map((c) => ({ id: c.id, name: c.name })), [menu]);
  const [active, setActive] = useState(cats[0]?.id ?? "");
  const Layout = LAYOUTS[menu.layout] ?? ClassicList;
  const headerVariant = menu.layout === "bold-hero" ? "hero" : menu.layout === "elegant-serif" ? "serif" : "default";

  const pick = (id: string) => {
    setActive(id);
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const handler = () => {
      for (const c of cats) {
        const el = document.getElementById(`cat-${c.id}`);
        if (el && el.getBoundingClientRect().top < 120) setActive(c.id);
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [cats]);

  return (
    <div className="min-h-screen pb-16" style={themeVars(menu.theme)}>
      <Header menu={menu} variant={headerVariant} />
      <CategoryNav cats={cats} active={active} onPick={pick} />
      <main className="max-w-2xl mx-auto">
        <Layout menu={menu} />
      </main>
      <footer className="text-center text-[11px] opacity-50 py-6">QR Menu ile oluşturuldu</footer>
    </div>
  );
}
