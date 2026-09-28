import {
  AuditLogRepository,
  type AuditLogFilter,
} from '../repositories/auditLogRepository.ts';
import { UserRepository } from '../repositories/userRepository.ts';

export interface CreateAuditLogBody {
  userId: number;
  action: string;
  targetTable: string;
  targetId: number;
  metadata?: unknown;
}

export class AuditLogService {
  private auditLogRepository: AuditLogRepository;
  private userRepository: UserRepository;

  constructor(
    auditLogRepository: AuditLogRepository = new AuditLogRepository(),
    userRepository: UserRepository = new UserRepository(),
  ) {
    this.auditLogRepository = auditLogRepository;
    this.userRepository = userRepository;
  }

  async getAllAuditLogs(filter: AuditLogFilter) {
    return this.auditLogRepository.findAll(filter);
  }

  async createAuditLog(body: CreateAuditLogBody) {
    const user = await this.userRepository.findById(body.userId);
    if (!user) throw new Error('USER_NOT_FOUND');

    // metadata boleh object atau string; disimpan sebagai teks JSON.
    let metadata: string | null = null;
    if (body.metadata !== undefined && body.metadata !== null) {
      metadata = typeof body.metadata === 'string' ? body.metadata : JSON.stringify(body.metadata);
    }

    const row = await this.auditLogRepository.create({
      userId: body.userId,
      action: body.action.trim().toUpperCase(),
      targetTable: body.targetTable,
      targetId: body.targetId,
      metadata,
    });
    if (!row) throw new Error('AUDIT_NOT_FOUND');

    return this.auditLogRepository.findById(row.id);
  }
}