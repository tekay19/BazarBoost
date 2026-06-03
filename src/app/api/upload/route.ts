import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireBusinessUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile, ALLOWED_IMAGE_TYPES } from "@/lib/storage";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  if (!rateLimit(`upload:${clientIp(req.headers)}`, 30, 60_000).ok) {
    return NextResponse.json({ error: "Çok fazla yükleme. Bekleyin." }, { status: 429 });
  }

  // resolve tenant context: business users -> their business; super admin -> none
  let businessId: string | null = null;
  if (user.role !== "SUPER_ADMIN") {
    const ctx = await requireBusinessUser();
    if (!ctx) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    businessId = ctx.business.id;
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Dosya gerekli" }, { status: 400 });
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Sadece PNG, JPG, WEBP, SVG" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Dosya 5MB sınırını aşıyor" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { key, url } = await uploadFile(buffer, file.type, businessId ? `b/${businessId}` : "admin");

  if (businessId) {
    await prisma.mediaFile.create({
      data: { businessId, key, url, mimeType: file.type, size: file.size },
    });
  }

  return NextResponse.json({ url, key });
}
