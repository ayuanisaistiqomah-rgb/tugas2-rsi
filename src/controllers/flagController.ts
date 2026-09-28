import type { Request, Response } from 'express';
import { FlagService } from '../services/flagService.ts';
import type { FlagStatus } from '../repositories/flagRepository.ts';

const STATUSES: FlagStatus[] = ['pending', 'resolved', 'dismissed'];

function parseId(value: unknown): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export class FlagController {
  private flagService: FlagService;

  constructor(flagService: FlagService = new FlagService()) {
    this.flagService = flagService;
  }

  private handleError(res: Response, error: unknown): Response {
    if (error instanceof Error && error.message === 'FLAG_NOT_FOUND') {
      return res.status(404).json({ status: 'fail', message: 'Data laporan tidak ditemukan' });
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

  getFlags = async (req: Request, res: Response): Promise<Response> => {
    try {
      const status = req.query.status;
      if (status !== undefined && !STATUSES.includes(status as FlagStatus)) {
        return this.badRequest(res, ['status harus pending, resolved, atau dismissed']);
      }
      const data = await this.flagService.getAllFlags(status as FlagStatus | undefined);
      return res.status(200).json({ status: 'success', data });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  updateFlagStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseId(req.params.id);
      if (id === null) return this.badRequest(res, ['id harus bilangan bulat lebih dari 0']);

      const status = req.body?.status;
      if (!STATUSES.includes(status as FlagStatus)) {
        return this.badRequest(res, ['status wajib diisi: pending, resolved, atau dismissed']);
      }

      const data = await this.flagService.updateFlagStatus(id, status as FlagStatus);
      return res.status(200).json({ status: 'success', data });
    } catch (error) {
      return this.handleError(res, error);
    }
  };
}