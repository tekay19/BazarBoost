"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin, createSession, setSessionCookie } from "@/lib/auth";
import { generateToken } from "@/lib/tokens";
import { slugify } from "@/lib/utils";
import { defaultTemplateForType } from "@/lib/templates";
import { logAudit } from "@/lib/audit";
import { clientIp } from "@/lib/ratelimit";
import type { BusinessType, PackageTier } from "@prisma/client";

async function ensureAdmin() {
  const admin = await requireSuperAdmin();
  if (!admin) throw new Error("Yetkisiz");
  return admin;
}

async function uniqueSubdomain(base: string): Promise<string> {
  let sub = slugify(base) || "isletme";
  let i = 1;
  while (await prisma.business.findUnique({ where: { subdomain: sub } })) {
    sub = `${slugify(base)}-${i++}`;
  }
  return sub;
}

export async function createBusiness(_prev: unknown, formData: FormData) {
  const admin = await ensureAdmin();
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "İşletme adı zorunlu." };

  const type = (String(formData.get("type") || "RESTAURANT")) as BusinessType;
  const requestedSub = String(formData.get("subdomain") || name);
  const subdomain = await uniqueSubdomain(requestedSub);
  let slug = subdomain;
  if (await prisma.business.findUnique({ where: { slug } })) slug = `${slug}-${Date.now()}`;

  const business = await prisma.business.create({
    data: {
      name,
      type,
      slug,
      subdomain,
      address: String(formData.get("address") || "") || null,
      phone: String(formData.get("phone") || "") || null,
      contactName: String(formData.get("contactName") || "") || null,
      contactPhone: String(formData.get("contactPhone") || "") || null,
      email: String(formData.get("email") || "").toLowerCase() || null,
      taxInfo: String(formData.get("taxInfo") || "") || null,
      logoUrl: String(formData.get("logoUrl") || "") || null,
      description: String(formData.get("description") || "") || null,
      status: (String(formData.get("status") || "ACTIVE")) as "ACTIVE" | "INACTIVE",
      package: (String(formData.get("package") || "FREE")) as PackageTier,
    },
  });

  await logAudit({ businessId: business.id, userId: admin.id, action: "business.create", entity: "business", entityId: business.id, ip: clientIp(headers()) });
  redirect(`/admin/businesses/${business.id}`);
}

export async function updateBusiness(businessId: string, formData: FormData) {
  const admin = await ensureAdmin();
  const data: Record<string, unknown> = {
    name: String(formData.get("name") || "").trim(),
    type: String(formData.get("type") || "RESTAURANT"),
    address: String(formData.get("address") || "") || null,
    phone: String(formData.get("phone") || "") || null,
    contactName: String(formData.get("contactName") || "") || null,
    contactPhone: String(formData.get("contactPhone") || "") || null,
    email: String(formData.get("email") || "").toLowerCase() || null,
    taxInfo: String(formData.get("taxInfo") || "") || null,
    logoUrl: String(formData.get("logoUrl") || "") || null,
    description: String(formData.get("description") || "") || null,
    status: String(formData.get("status") || "ACTIVE"),
    package: String(formData.get("package") || "FREE"),
    seoIndexable: formData.get("seoIndexable") === "on",
  };

  // subdomain change (validate uniqueness)
  const newSub = slugify(String(formData.get("subdomain") || ""));
  if (newSub) {
    const existing = await prisma.business.findUnique({ where: { subdomain: newSub } });
    if (!existing || existing.id === businessId) data.subdomain = newSub;
  }

  await prisma.business.update({ where: { id: businessId }, data });
  await logAudit({ businessId, userId: admin.id, action: "business.update", entity: "business", entityId: businessId });
  revalidatePath(`/admin/businesses/${businessId}`);
  return { ok: true };
}

/** Admin generates a secure invite link for a business. Returns the raw URL. */
export async function generateInvite(businessId: string, formData: FormData) {
  const admin = await ensureAdmin();
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) return { error: "İşletme bulunamadı." };

  const email = String(formData.get("email") || "").toLowerCase() || business.email || null;
  const days = parseInt(String(formData.get("days") || "7"), 10) || 7;
  const singleUse = formData.get("singleUse") !== "off";

  // revoke previous pending invites for cleanliness
  await prisma.inviteToken.updateMany({
    where: { businessId, status: "PENDING" },
    data: { status: "REVOKED" },
  });

  const { raw, hash } = generateToken();
  await prisma.inviteToken.create({
    data: {
      businessId,
      tokenHash: hash,
      email,
      role: "BUSINESS_OWNER",
      singleUse,
      expiresAt: new Date(Date.now() + days * 86400_000),
    },
  });

  await logAudit({ businessId, userId: admin.id, action: "invite.generate", entity: "business", entityId: businessId });

  const base = process.env.APP_BASE_URL || "http://localhost:3000";
  const url = `${base}/business/onboarding?token=${raw}${email ? `&email=${encodeURIComponent(email)}` : ""}`;
  revalidatePath(`/admin/businesses/${businessId}`);
  return { ok: true, url };
}

/** Admin opens the business panel on behalf of the owner (support). */
export async function impersonateBusiness(businessId: string) {
  const admin = await ensureAdmin();
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business) throw new Error("İşletme bulunamadı");

  const token = await createSession({
    userId: admin.id,
    email: admin.email,
    role: "SUPER_ADMIN",
    businessId,
  });
  await setSessionCookie(token);
  await logAudit({ businessId, userId: admin.id, action: "business.impersonate", entity: "business", entityId: businessId });
  redirect("/business/dashboard");
}
