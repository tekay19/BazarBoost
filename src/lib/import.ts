import "server-only";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { z } from "zod";

// Accepted header names (TR + EN) mapped to canonical fields.
const HEADER_MAP: Record<string, keyof ParsedRow> = {
  "ürün adı": "name", "urun adi": "name", name: "name", "product name": "name", ad: "name",
  kategori: "category", category: "category",
  açıklama: "description", aciklama: "description", description: "description",
  fiyat: "price", price: "price",
  "para birimi": "currency", currency: "currency",
  görsel: "imageUrl", gorsel: "imageUrl", "görsel url": "imageUrl", image: "imageUrl", "image url": "imageUrl", imageurl: "imageUrl",
  stok: "inStock", "stok durumu": "inStock", stock: "inStock", instock: "inStock",
  etiketler: "tags", tags: "tags", etiket: "tags",
  sıralama: "sortOrder", siralama: "sortOrder", sort: "sortOrder", "sort order": "sortOrder", order: "sortOrder",
  aktif: "isActive", durum: "isActive", active: "isActive", status: "isActive",
};

export interface ParsedRow {
  name?: string;
  category?: string;
  description?: string;
  price?: string;
  currency?: string;
  imageUrl?: string;
  inStock?: string;
  tags?: string;
  sortOrder?: string;
  isActive?: string;
}

export interface ValidatedProduct {
  name: string;
  category: string | null;
  description: string | null;
  price: number;
  currency: string;
  imageUrl: string | null;
  inStock: boolean;
  tags: string[];
  sortOrder: number;
  isActive: boolean;
}

export interface RowError {
  row: number;
  errors: string[];
  raw: Record<string, unknown>;
}

export interface ImportResult {
  valid: ValidatedProduct[];
  errors: RowError[];
  total: number;
}

function normalizeHeader(h: string): keyof ParsedRow | null {
  const key = h.trim().toLowerCase();
  return HEADER_MAP[key] ?? null;
}

function toBool(v: string | undefined, def = true): boolean {
  if (v == null || v === "") return def;
  return ["1", "true", "evet", "aktif", "var", "yes", "stokta", "in stock"].includes(
    v.toString().trim().toLowerCase()
  );
}

// guard against CSV formula injection
function sanitizeCell(v: unknown): string {
  const s = (v ?? "").toString();
  if (/^[=+\-@\t\r]/.test(s)) return "'" + s;
  return s.replace(/[\u0000-\u001F\u007F]/g, "");
}

const rowSchema = z.object({
  name: z.string().min(1, "Ürün adı zorunlu").max(200),
  price: z.coerce.number().min(0, "Fiyat negatif olamaz"),
});

function rawToRecord(headers: string[], values: unknown[]): Record<string, unknown> {
  const rec: Record<string, unknown> = {};
  headers.forEach((h, i) => (rec[h] = values[i]));
  return rec;
}

function buildRows(grid: unknown[][]): { headers: string[]; rows: unknown[][] } {
  const headers = (grid[0] || []).map((h) => sanitizeCell(h));
  return { headers, rows: grid.slice(1).filter((r) => r.some((c) => c != null && c !== "")) };
}

export function parseCsv(content: string): unknown[][] {
  const result = Papa.parse<string[]>(content, { skipEmptyLines: true });
  return result.data as unknown[][];
}

export function parseExcel(buffer: Buffer): unknown[][] {
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false });
}

export function validateGrid(grid: unknown[][]): ImportResult {
  const { headers, rows } = buildRows(grid);
  const fieldByCol = headers.map((h) => normalizeHeader(h));

  const valid: ValidatedProduct[] = [];
  const errors: RowError[] = [];

  rows.forEach((row, idx) => {
    const parsed: ParsedRow = {};
    fieldByCol.forEach((field, col) => {
      if (field) parsed[field] = sanitizeCell(row[col]).trim();
    });

    const check = rowSchema.safeParse({ name: parsed.name, price: parsed.price ?? 0 });
    if (!check.success) {
      errors.push({
        row: idx + 2, // +1 header, +1 to 1-index
        errors: check.error.issues.map((i) => i.message),
        raw: rawToRecord(headers, row),
      });
      return;
    }

    valid.push({
      name: parsed.name!,
      category: parsed.category || null,
      description: parsed.description || null,
      price: check.data.price,
      currency: (parsed.currency || "TRY").toUpperCase().slice(0, 3),
      imageUrl: parsed.imageUrl || null,
      inStock: toBool(parsed.inStock, true),
      tags: (parsed.tags || "")
        .split(/[,;|]/)
        .map((t) => t.trim())
        .filter(Boolean),
      sortOrder: parseInt(parsed.sortOrder || "0", 10) || 0,
      isActive: toBool(parsed.isActive, true),
    });
  });

  return { valid, errors, total: rows.length };
}

export const IMPORT_TEMPLATE_HEADERS = [
  "Ürün adı",
  "Kategori",
  "Açıklama",
  "Fiyat",
  "Para birimi",
  "Görsel URL",
  "Stok durumu",
  "Etiketler",
  "Sıralama",
  "Aktif",
];
