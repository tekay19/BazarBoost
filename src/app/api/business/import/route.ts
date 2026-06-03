import { NextRequest, NextResponse } from "next/server";
import { requireBusinessUser } from "@/lib/auth";
import { parseCsv, parseExcel, validateGrid } from "@/lib/import";
import { ALLOWED_IMPORT_TYPES } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const ctx = await requireBusinessUser();
  if (!ctx) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Dosya 5MB sınırını aşıyor" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const isCsv = file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv");

  if (!isCsv && !ALLOWED_IMPORT_TYPES.includes(file.type) && !/\.(xlsx|xls)$/i.test(file.name)) {
    return NextResponse.json({ error: "Sadece CSV veya Excel dosyaları" }, { status: 400 });
  }

  try {
    const grid = isCsv ? parseCsv(buffer.toString("utf-8")) : parseExcel(buffer);
    const result = validateGrid(grid);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: "Dosya okunamadı" }, { status: 400 });
  }
}
