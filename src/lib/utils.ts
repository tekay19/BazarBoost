import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string): string {
  const map: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
    Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u",
  };
  return input
    .split("")
    .map((c) => map[c] ?? c)
    .join("")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatPrice(value: number | string, currency = "TRY"): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  const symbols: Record<string, string> = { TRY: "₺", USD: "$", EUR: "€", GBP: "£" };
  const symbol = symbols[currency] ?? currency + " ";
  if (Number.isNaN(num)) return `${symbol}0.00`;
  return `${symbol}${num.toFixed(2)}`;
}

export function deviceTypeFromUA(ua: string | null): string {
  if (!ua) return "unknown";
  if (/mobile/i.test(ua) && !/ipad|tablet/i.test(ua)) return "mobile";
  if (/ipad|tablet/i.test(ua)) return "tablet";
  return "desktop";
}
