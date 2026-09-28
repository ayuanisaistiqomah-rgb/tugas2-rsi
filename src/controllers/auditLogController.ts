import type { Request, Response } from 'express';
import { AuditLogService } from '../services/auditLogService.ts';

const TABLES = ['USERS', 'STALLS', 'MENU_ITEMS', 'REVIEWS', 'LIKES', 'FLAGS', 'AUDIT_LOGS'];

function parseId(value: unknown): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateAuditBody(body: unknown): string[] {
  if (typeof body !== 'object' || body === null) return ['Body harus berupa JSON object'];
  const b = body as Record<string, unknown>;
  const errors: string[] = [];

  if (!Number.isInteger(b.userId) || (b.userId as number) <= 0)
    errors.push('userId wajib berupa bilangan bulat lebih dari 0');
  if (typeof b.action !== 'string' || b.action.trim().length < 2 || b.action.length > 50)
    errors.push('action wajib berupa teks 2-50 karakter (mis. CREATE, UPDATE, DELETE)');
  if (typeof b.targetTable !== 'string' || !TABLES.includes(b.targetTable))
    errors.push(`targetTable wajib salah satu dari: ${TABLES.join(', ')}`);
  if (!Number.isInteger(b.targetId) || (b.targetId as number) <= 0)
    errors.push('targetId wajib berupa bilangan bulat lebih dari 0');
  if (b.metadata !== undefined && b.metadata !== null && typeof b.metadata !== 'object' && typeof b.metadata !== 'string')
    errors.push('metadata harus berupa object JSON atau teks');

  return errors;
}

export class AuditLogController {
  private auditLogService: AuditLogService;

  constructor(auditLogService: AuditLogService = new AuditLogService()) {
    this.auditLogService = auditLogService;
  }

  private handleError(res: Response, error: unknown): Response {
    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({ status: 'fail', message: 'Data user tidak ditemukan' });
    }
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
      error: error instanceof Error ? error.message : String(error),
    });
  }

  private badRequest(res: Response, errors: string[]): Response {
    return res.status(400).json({ status: 'fail', message: 'Validasi gagal', errors });
  }

  getAuditLogs = async (req: Request, res: Response): Promise<Response> => {
    try {
      let userId: number | undefined;
      if (req.query.userId !== undefined) {
        const parsed = parseId(req.query.userId);
        if (parsed === null) return this.badRequest(res, ['userId harus bilangan bulat lebih dari 0']);
        userId = parsed;
      }
      const action = typeof req.query.action === 'string' ? req.query.action.toUpperCase() : undefined;
      const targetTable = typeof req.query.targetTable === 'string' ? req.query.targetTable : undefined;

      const data = await this.auditLogService.getAllAuditLogs({ userId, action, targetTable });
      return res.status(200).json({ status: 'success', data });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  createAuditLog = async (req: Request, res: Response): Promise<Response> => {
    try {
      const errors = validateAuditBody(req.body);
      if (errors.length > 0) return this.badRequest(res, errors);
      const data = await this.auditLogService.createAuditLog(req.body);
      return res.status(201).json({ status: 'success', data });
    } catch (error) {
      return this.handleError(res, error);
    }
  };
}