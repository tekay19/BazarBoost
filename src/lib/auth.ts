import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { Role } from "@prisma/client";

const COOKIE_NAME = "qrm_session";
const ALG = "HS256";

function secret(): Uint8Array {
  const s = process.env.SECRET_KEY || "dev-insecure-secret-change-me-please-32chars";
  return new TextEncoder().encode(s);
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: Role;
  // active business context (for business users)
  businessId?: string;
  [key: string]: unknown;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  cookies().delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: [ALG] });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/** Resolve the full user + role, ensuring the account is still active. */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { businessLinks: { include: { business: true } } },
  });
  if (!user || !user.isActive) return null;
  return { ...user, session };
}

export async function requireSuperAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") return null;
  return user;
}

/**
 * Resolve the active business for a business-scoped request and assert the
 * user actually belongs to it (tenant isolation gate).
 */
export async function requireBusinessUser(businessId?: string) {
  const user = await getCurrentUser();
  if (!user) return null;

  // super admin can impersonate any business via session.businessId
  if (user.role === "SUPER_ADMIN") {
    const bid = businessId ?? user.session.businessId;
    if (!bid) return null;
    const business = await prisma.business.findUnique({ where: { id: bid } });
    if (!business) return null;
    return { user, business, role: "BUSINESS_OWNER" as Role, impersonating: true };
  }

  const bid = businessId ?? user.session.businessId ?? user.businessLinks[0]?.businessId;
  if (!bid) return null;
  const link = user.businessLinks.find((l) => l.businessId === bid);
  if (!link) return null; // not a member -> hard deny
  if (link.business.status === "INACTIVE") return null;
  return { user, business: link.business, role: link.role, impersonating: false };
}
