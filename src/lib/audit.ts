import "server-only";
import { prisma } from "./prisma";

export async function logAudit(input: {
  businessId?: string | null;
  userId?: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        businessId: input.businessId ?? null,
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        metadata: (input.metadata ?? {}) as object,
        ip: input.ip ?? null,
      },
    });
  } catch {
    // audit logging must never break the main flow
  }
}
