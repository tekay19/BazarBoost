// Modular template system.
//
// A template = a LAYOUT (real structural/visual component, see
// components/menu/layouts) + a THEME preset (colors, fonts, card style).
// We ship 8 business categories x multiple layouts x palettes => ~200 premium
// templates. Adding a new one is just adding an entry here (or a new layout
// component), nothing else changes.

export type LayoutKey =
  | "classic-list"
  | "image-grid"
  | "magazine"
  | "card-stack"
  | "elegant-serif"
  | "bold-hero"
  | "compact-rows"
  | "tabbed-sticky";

export interface TemplateTheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  font: "sans" | "serif" | "display" | "mono";
  cardStyle: "flat" | "elevated" | "outlined" | "image-left" | "image-top";
  radius: "none" | "sm" | "md" | "lg" | "full";
  buttonStyle: "solid" | "outline" | "pill" | "ghost";
}

export interface TemplateDef {
  key: string;
  name: string;
  category: string; // pizza | burger | cafe | kebab | restaurant | bar | dessert | fine-dining
  layout: LayoutKey;
  theme: TemplateTheme;
  isPremium: boolean;
}

interface CategorySpec {
  category: string;
  label: string;
  layouts: LayoutKey[];
  palettes: { name: string; theme: TemplateTheme }[];
}

const F = (font: TemplateTheme["font"]) => font;

const CATEGORY_SPECS: CategorySpec[] = [
  {
    category: "pizza",
    label: "Pizza",
    layouts: ["image-grid", "bold-hero", "card-stack", "magazine", "classic-list"],
    palettes: [
      { name: "Napoli", theme: t("#c0392b", "#27ae60", "#fff8f0", "#ffffff", "#2b2b2b", "#8a8a8a", "display", "image-top", "md", "pill") },
      { name: "Forno", theme: t("#b23b1e", "#e0a500", "#1c1410", "#26201a", "#f5ede2", "#b9a890", "display", "elevated", "lg", "solid") },
      { name: "Margherita", theme: t("#2e7d32", "#c62828", "#ffffff", "#f7f7f5", "#222", "#777", "sans", "outlined", "md", "outline") },
      { name: "Rustico", theme: t("#8d4a2f", "#d98e04", "#fbf6ee", "#ffffff", "#3a2c20", "#9b8a78", "serif", "image-left", "sm", "ghost") },
      { name: "Verace", theme: t("#d32f2f", "#1b5e20", "#0f0f0f", "#1a1a1a", "#f0f0f0", "#9a9a9a", "display", "elevated", "md", "pill") },
    ],
  },
  {
    category: "burger",
    label: "Burger",
    layouts: ["bold-hero", "image-grid", "card-stack", "compact-rows", "magazine"],
    palettes: [
      { name: "Smash", theme: t("#e67e22", "#2c3e50", "#1a1a1a", "#262626", "#f5f5f5", "#999", "display", "image-top", "lg", "solid") },
      { name: "Diner", theme: t("#c0392b", "#f1c40f", "#fffdf5", "#ffffff", "#222", "#888", "display", "elevated", "md", "pill") },
      { name: "Charcoal", theme: t("#f39c12", "#e74c3c", "#121212", "#1e1e1e", "#fafafa", "#8a8a8a", "sans", "image-left", "sm", "solid") },
      { name: "Retro", theme: t("#e84118", "#00a8ff", "#fff5e6", "#ffffff", "#2f2f2f", "#7a7a7a", "display", "outlined", "lg", "outline") },
      { name: "Craft", theme: t("#d35400", "#27ae60", "#1c1814", "#2a241d", "#f3ede2", "#b3a48f", "serif", "elevated", "md", "ghost") },
    ],
  },
  {
    category: "cafe",
    label: "Kafe",
    layouts: ["magazine", "classic-list", "card-stack", "tabbed-sticky", "compact-rows"],
    palettes: [
      { name: "Latte", theme: t("#8d6e63", "#a1887f", "#faf6f1", "#ffffff", "#3e342e", "#9e8e83", "serif", "flat", "lg", "ghost") },
      { name: "Roastery", theme: t("#5d4037", "#bcaaa4", "#1c1714", "#241d18", "#efe6df", "#b09e92", "serif", "outlined", "md", "outline") },
      { name: "Matcha", theme: t("#6b8e23", "#cddc39", "#f7faf0", "#ffffff", "#33401a", "#8a9b6a", "sans", "elevated", "lg", "pill") },
      { name: "Nordic", theme: t("#37474f", "#90a4ae", "#fafafa", "#ffffff", "#263238", "#90a4ae", "sans", "flat", "sm", "outline") },
      { name: "Cocoa", theme: t("#795548", "#d7ccc8", "#fbf7f4", "#ffffff", "#4e342e", "#a1887f", "serif", "elevated", "md", "ghost") },
    ],
  },
  {
    category: "kebab",
    label: "Kebapçı",
    layouts: ["classic-list", "image-grid", "compact-rows", "card-stack", "bold-hero"],
    palettes: [
      { name: "Anadolu", theme: t("#a52a2a", "#daa520", "#fdf6ec", "#ffffff", "#3a2a1e", "#9c8770", "serif", "image-left", "md", "solid") },
      { name: "Ocakbaşı", theme: t("#b71c1c", "#f9a825", "#171210", "#221a16", "#f2e8df", "#b8a08c", "display", "elevated", "sm", "solid") },
      { name: "Saffron", theme: t("#e67e22", "#8e44ad", "#fffaf2", "#ffffff", "#2f2620", "#9a8a78", "serif", "outlined", "md", "outline") },
      { name: "Bazaar", theme: t("#c0392b", "#16a085", "#fbf5ee", "#ffffff", "#33271d", "#a08c78", "display", "elevated", "lg", "pill") },
      { name: "Mangal", theme: t("#8b0000", "#ffb300", "#120f0d", "#1d1714", "#f4ebe1", "#bba892", "serif", "image-top", "sm", "ghost") },
    ],
  },
  {
    category: "restaurant",
    label: "Restoran",
    layouts: ["magazine", "classic-list", "elegant-serif", "card-stack", "tabbed-sticky"],
    palettes: [
      { name: "Bistro", theme: t("#34495e", "#e67e22", "#fafafa", "#ffffff", "#2c3e50", "#7f8c8d", "serif", "elevated", "md", "solid") },
      { name: "Garden", theme: t("#2e7d32", "#8bc34a", "#f6faf4", "#ffffff", "#1b3a1b", "#7c9a6a", "sans", "flat", "lg", "outline") },
      { name: "Slate", theme: t("#455a64", "#ff7043", "#1b1f22", "#262c30", "#eceff1", "#90a4ae", "sans", "outlined", "sm", "ghost") },
      { name: "Harvest", theme: t("#bf360c", "#fbc02d", "#fdf7ef", "#ffffff", "#3e2a1e", "#a08a76", "serif", "image-left", "md", "pill") },
      { name: "Marble", theme: t("#37474f", "#b0bec5", "#ffffff", "#f4f5f6", "#263238", "#78909c", "serif", "elevated", "lg", "outline") },
    ],
  },
  {
    category: "bar",
    label: "Bar",
    layouts: ["bold-hero", "card-stack", "elegant-serif", "compact-rows", "magazine"],
    palettes: [
      { name: "Speakeasy", theme: t("#c9a227", "#7b1fa2", "#0d0d0f", "#16161a", "#f0e9d8", "#9c9486", "serif", "elevated", "sm", "outline") },
      { name: "Neon", theme: t("#00e5ff", "#ff4081", "#0a0a14", "#13131f", "#eef0ff", "#7a7f9a", "display", "outlined", "lg", "pill") },
      { name: "Whiskey", theme: t("#b8860b", "#5d4037", "#15110c", "#201a12", "#f3e9d8", "#b3a187", "serif", "flat", "sm", "ghost") },
      { name: "Tropic", theme: t("#1de9b6", "#ffca28", "#0e1a17", "#16241f", "#e9fff8", "#7fae9e", "sans", "elevated", "lg", "pill") },
      { name: "Velvet", theme: t("#ad1457", "#f8bbd0", "#140a10", "#1f0f18", "#fbe9f1", "#b78aa0", "serif", "outlined", "md", "outline") },
    ],
  },
  {
    category: "dessert",
    label: "Tatlı & Pastane",
    layouts: ["image-grid", "magazine", "card-stack", "classic-list", "elegant-serif"],
    palettes: [
      { name: "Patisserie", theme: t("#ec407a", "#ffd54f", "#fff7fa", "#ffffff", "#5a2a3f", "#bb8aa0", "serif", "image-top", "lg", "pill") },
      { name: "Macaron", theme: t("#ce93d8", "#80deea", "#fdf9ff", "#ffffff", "#4a3a52", "#a890b0", "sans", "elevated", "full", "pill") },
      { name: "Caramel", theme: t("#a1672a", "#f0c987", "#fdf6ec", "#ffffff", "#4a3320", "#b39873", "serif", "image-left", "md", "ghost") },
      { name: "Berry", theme: t("#c2185b", "#f48fb1", "#fff5f8", "#ffffff", "#4a1027", "#c08294", "serif", "outlined", "lg", "outline") },
      { name: "Vanilla", theme: t("#d4a017", "#fff3cd", "#fffdf5", "#ffffff", "#4a3c1a", "#b3a06a", "serif", "elevated", "md", "solid") },
    ],
  },
  {
    category: "fine-dining",
    label: "Fine Dining",
    layouts: ["elegant-serif", "magazine", "classic-list", "tabbed-sticky", "card-stack"],
    palettes: [
      { name: "Noir", theme: t("#caa472", "#8a6d3b", "#0c0c0c", "#161616", "#f3ecdf", "#9b9282", "serif", "flat", "none", "outline") },
      { name: "Champagne", theme: t("#bfa15a", "#e8d9b5", "#faf7f0", "#ffffff", "#2b2620", "#a99f88", "serif", "outlined", "sm", "outline") },
      { name: "Onyx", theme: t("#9e9e9e", "#cfd8dc", "#0a0a0a", "#141414", "#ededed", "#8a8a8a", "serif", "flat", "none", "ghost") },
      { name: "Bordeaux", theme: t("#722f37", "#c9a227", "#120a0b", "#1c1213", "#f2e6df", "#a88f86", "serif", "elevated", "sm", "outline") },
      { name: "Platinum", theme: t("#607d8b", "#b0bec5", "#fbfcfd", "#ffffff", "#263238", "#8a9aa3", "serif", "outlined", "sm", "outline") },
    ],
  },
];

function t(
  primary: string,
  secondary: string,
  background: string,
  surface: string,
  text: string,
  muted: string,
  font: TemplateTheme["font"],
  cardStyle: TemplateTheme["cardStyle"],
  radius: TemplateTheme["radius"],
  buttonStyle: TemplateTheme["buttonStyle"]
): TemplateTheme {
  return { primary, secondary, background, surface, text, muted, font: F(font), cardStyle, radius, buttonStyle };
}

/**
 * Build the full catalog. Each category yields layouts x palettes; we cap to
 * ~25 per category to land near 200 premium templates total.
 */
export function buildTemplateCatalog(): TemplateDef[] {
  const out: TemplateDef[] = [];
  for (const spec of CATEGORY_SPECS) {
    let count = 0;
    // expand palettes across layouts to reach 25 per category
    const targetPerCat = 25;
    outer: for (let p = 0; p < spec.palettes.length; p++) {
      for (let l = 0; l < spec.layouts.length; l++) {
        if (count >= targetPerCat) break outer;
        const palette = spec.palettes[p];
        const layout = spec.layouts[l];
        out.push({
          key: `${spec.category}-${slug(palette.name)}-${layout}`,
          name: `${spec.label} · ${palette.name} (${layoutLabel(layout)})`,
          category: spec.category,
          layout,
          theme: palette.theme,
          isPremium: true,
        });
        count++;
      }
    }
  }
  return out;
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function layoutLabel(l: LayoutKey): string {
  const map: Record<LayoutKey, string> = {
    "classic-list": "Klasik Liste",
    "image-grid": "Görsel Izgara",
    magazine: "Magazin",
    "card-stack": "Kart Yığını",
    "elegant-serif": "Zarif",
    "bold-hero": "Vurgulu",
    "compact-rows": "Kompakt",
    "tabbed-sticky": "Sekmeli",
  };
  return map[l];
}

export const TEMPLATE_CATEGORIES = CATEGORY_SPECS.map((s) => ({ key: s.category, label: s.label }));

const CATALOG = buildTemplateCatalog();

export function getCatalog(): TemplateDef[] {
  return CATALOG;
}

export function getTemplate(key: string): TemplateDef | undefined {
  return CATALOG.find((t) => t.key === key);
}

export function defaultTemplateForType(type: string): string {
  const map: Record<string, string> = {
    PIZZA: "pizza",
    BURGER: "burger",
    CAFE: "cafe",
    KEBAB: "kebab",
    RESTAURANT: "restaurant",
    BAR: "bar",
    DESSERT: "dessert",
    FINE_DINING: "fine-dining",
  };
  const cat = map[type] || "restaurant";
  return CATALOG.find((t) => t.category === cat)?.key || CATALOG[0].key;
}
