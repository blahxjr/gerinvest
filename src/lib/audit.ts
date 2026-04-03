import { pool } from "./db";

type AuditEvent = {
  userId?: string | null;
  userRole?: string | null;
  entity: string;
  entityId?: string | null;
  action: "CREATE" | "UPDATE" | "DELETE" | "IMPORT" | "LOGIN" | "LOGOUT" | string;
  beforeData?: unknown;
  afterData?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function createAuditLog(event: AuditEvent) {
  const {
    userId,
    userRole,
    entity,
    entityId,
    action,
    beforeData,
    afterData,
    ipAddress,
    userAgent,
  } = event;

  await pool.query(
    `INSERT INTO audit_logs
     (user_id, user_role, entity, entity_id, action, before_data, after_data, ip_address, user_agent)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      userId || null,
      userRole || null,
      entity,
      entityId || null,
      action,
      beforeData ? JSON.stringify(beforeData) : null,
      afterData ? JSON.stringify(afterData) : null,
      ipAddress || null,
      userAgent || null,
    ]
  );
}
