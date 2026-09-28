import { and, desc, eq, type SQL } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { auditLogs, users } from '../db/schema.ts';

export interface AuditLogFilter {
  userId?: number;
  action?: string;
  targetTable?: string;
}

export interface CreateAuditLogInput {
  userId: number;
  action: string;
  targetTable: string;
  targetId: number;
  metadata: string | null;
}

// Kolom hasil JOIN AUDIT_LOGS + USERS.
const auditColumns = {
  id: auditLogs.id,
  userId: auditLogs.userId,
  userName: users.name,
  action: auditLogs.action,
  targetTable: auditLogs.targetTable,
  targetId: auditLogs.targetId,
  metadata: auditLogs.metadata,
  createdAt: auditLogs.createdAt,
};

export class AuditLogRepository {
  async findAll(filter: AuditLogFilter) {
    const db = await getDb();

    const conditions: SQL[] = [];
    if (filter.userId !== undefined) conditions.push(eq(auditLogs.userId, filter.userId));
    if (filter.action) conditions.push(eq(auditLogs.action, filter.action));
    if (filter.targetTable) conditions.push(eq(auditLogs.targetTable, filter.targetTable));
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    return db
      .select(auditColumns)
      .from(auditLogs)
      .innerJoin(users, eq(auditLogs.userId, users.id))
      .where(where)
      .orderBy(desc(auditLogs.id)); // terbaru di atas
  }

  async findById(id: number) {
    const db = await getDb();
    const rows = await db
      .select(auditColumns)
      .from(auditLogs)
      .innerJoin(users, eq(auditLogs.userId, users.id))
      .where(eq(auditLogs.id, id));
    return rows[0];
  }

  async create(input: CreateAuditLogInput) {
    const db = await getDb();
    const rows = await db.insert(auditLogs).output().values(input);
    return rows[0];
  }
}