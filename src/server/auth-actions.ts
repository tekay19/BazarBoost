"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  createSession,
  setSessionCookie,
  clearSession,
} from "@/lib/auth";
import { hashToken } from "@/lib/tokens";
import { logAudit } from "@/lib/audit";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export async function adminLogin(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");
  const ip = clientIp(headers());

  if (!rateLimit(`admin-login:${ip}`, 5, 60_000).ok) {
    return { error: "Çok fazla deneme. Lütfen biraz bekleyin." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== "SUPER_ADMIN" || !user.passwordHash || !user.isActive) {
    return { error: "Geçersiz e-posta veya şifre." };
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return { error: "Geçersiz e-posta veya şifre." };

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const token = await createSession({ userId: user.id, email: user.email, role: user.role });
  await setSessionCookie(token);
  await logAudit({ userId: user.id, action: "admin.login", ip });
  redirect("/admin/dashboard");
}

export async function businessLogin(_prev: unknown, formData: FormData) {
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");
  const ip = clientIp(headers());

  if (!rateLimit(`biz-login:${ip}`, 8, 60_000).ok) {
    return { error: "Çok fazla deneme. Lütfen biraz bekleyin." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { businessLinks: true },
  });
  if (!user || !user.passwordHash || !user.isActive || user.businessLinks.length === 0) {
    return { error: "Geçersiz e-posta veya şifre." };
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return { error: "Geçersiz e-posta veya şifre." };

  const link = user.businessLinks[0];
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await prisma.business.update({ where: { id: link.businessId }, data: { lastActivityAt: new Date() } });
  const token = await createSession({
    userId: user.id,
    email: user.email,
    role: link.role,
    businessId: link.businessId,
  });
  await setSessionCookie(token);
  await logAudit({ businessId: link.businessId, userId: user.id, action: "business.login", ip });
  redirect("/business/dashboard");
}

/** First-login onboarding: validate invite token, set password, create session. */
export async function acceptInvite(_prev: unknown, formData: FormData) {
  const rawToken = String(formData.get("token") || "");
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const name = String(formData.get("name") || "").trim();
  const password = String(formData.get("password") || "");
  const ip = clientIp(headers());

  if (!rateLimit(`accept-invite:${ip}`, 10, 60_000).ok) {
    return { error: "Çok fazla deneme. Lütfen biraz bekleyin." };
  }
  if (password.length < 8) return { error: "Şifre en az 8 karakter olmalı." };

  const invite = await prisma.inviteToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: { business: true },
  });

  if (!invite || invite.status !== "PENDING") return { error: "Davet geçersiz veya kullanılmış." };
  if (invite.expiresAt < new Date()) {
    await prisma.inviteToken.update({ where: { id: invite.id }, data: { status: "EXPIRED" } });
    return { error: "Davetin süresi dolmuş. Admin'den yeni davet isteyin." };
  }

  const finalEmail = invite.email?.toLowerCase() || email;
  if (!finalEmail) return { error: "E-posta gerekli." };

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email: finalEmail },
    update: { passwordHash, name: name || undefined, isActive: true },
    create: { email: finalEmail, passwordHash, name: name || finalEmail, role: invite.role },
  });

  await prisma.businessUser.upsert({
    where: { businessId_userId: { businessId: invite.businessId, userId: user.id } },
    update: { role: invite.role },
    create: { businessId: invite.businessId, userId: user.id, role: invite.role },
  });

  if (invite.singleUse) {
    await prisma.inviteToken.update({
      where: { id: invite.id },
      data: { status: "USED", usedAt: new Date() },
    });
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const token = await createSession({
    userId: user.id,
    email: user.email,
    role: invite.role,
    businessId: invite.businessId,
  });
  await setSessionCookie(token);
  await logAudit({ businessId: invite.businessId, userId: user.id, action: "business.onboard", ip });
  redirect("/business/dashboard");
}

export async function logout() {
  await clearSession();
  redirect("/");
}
