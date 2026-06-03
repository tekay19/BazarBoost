import type { TemplateTheme } from "@/lib/templates";

export interface RenderProduct {
  id: string;
  name: string;
  description: string | null;
  price: string; // formatted
  rawPrice: number;
  currency: string;
  imageUrl: string | null;
  inStock: boolean;
  tags: string[];
}

export interface RenderCategory {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  products: RenderProduct[];
}

export interface RenderMenu {
  businessName: string;
  logoUrl: string | null;
  menuName: string;
  description: string | null;
  categories: RenderCategory[];
  theme: TemplateTheme;
  layout: string;
}

const radiusMap: Record<string, string> = {
  none: "0px",
  sm: "6px",
  md: "12px",
  lg: "20px",
  full: "9999px",
};

export function themeVars(theme: TemplateTheme): React.CSSProperties {
  const fontMap: Record<string, string> = {
    sans: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    display: "'Trebuchet MS', 'Segoe UI', sans-serif",
    mono: "'Courier New', monospace",
  };
  return {
    // @ts-expect-error css vars
    "--m-primary": theme.primary,
    "--m-secondary": theme.secondary,
    "--m-bg": theme.background,
    "--m-surface": theme.surface,
    "--m-text": theme.text,
    "--m-muted": theme.muted,
    "--m-radius": radiusMap[theme.radius] ?? "12px",
    backgroundColor: theme.background,
    color: theme.text,
    fontFamily: fontMap[theme.font] ?? fontMap.sans,
  };
}

export const TAG_COLORS: Record<string, string> = {
  acılı: "#e74c3c",
  vegan: "#27ae60",
  yeni: "#2980b9",
  popüler: "#f39c12",
  glutensiz: "#8e44ad",
};
