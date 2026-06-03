import "server-only";
import crypto from "crypto";

/** Generate a URL-safe random token (raw) plus its sha256 hash for storage. */
export function generateToken(bytes = 32): { raw: string; hash: string } {
  const raw = crypto.randomBytes(bytes).toString("base64url");
  const hash = hashToken(raw);
  return { raw, hash };
}

export function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}
