import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { hashToken } from "@/lib/tokens";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

function loginUrl(req: NextRequest, error?: string) {
  const u = new URL("/business/login", req.url);
  if (error) u.searchParams.set("error", error);
  return u;
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("token");
  if (!raw) return NextResponse.redirect(loginUrl(req, "invalid"));

  const token = await prisma.magicLinkToken.findUnique({
    where: { tokenHash: hashToken(raw) },
    include: { business: true },
  });

  if (!token || token.usedAt || token.expiresAt < new Date() || !token.userId) {
    return NextResponse.redirect(loginUrl(req, "expired"));
  }
  if (token.business.status === "INACTIVE") {
    return NextResponse.redirect(loginUrl(req, "inactive"));
  }

  const link = await prisma.businessUser.findFirst({
    where: { businessId: token.businessId, userId: token.userId },
  });
  if (!link) return NextResponse.redirect(loginUrl(req, "invalid"));

  await prisma.magicLinkToken.update({ where: { id: token.id }, data: { usedAt: new Date() } });
  await prisma.user.update({ where: { id: token.userId }, data: { lastLoginAt: new Date() } });
  await logAudit({ businessId: token.businessId, userId: token.userId, action: "magic.login" });

  const user = await prisma.user.findUnique({ where: { id: token.userId } });
  const session = await createSession({
    userId: token.userId,
    email: user!.email,
    role: link.role,
    businessId: token.businessId,
  });

  const res = NextResponse.redirect(new URL("/business/dashboard", req.url));
  res.cookies.set("qrm_session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
