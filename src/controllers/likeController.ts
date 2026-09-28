import type { Request, Response } from 'express';
import { LikeService } from '../services/likeService.ts';

function parseId(value: unknown): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateLikeBody(body: unknown): string[] {
  if (typeof body !== 'object' || body === null) return ['Body harus berupa JSON object'];
  const b = body as Record<string, unknown>;
  const errors: string[] = [];

  if (!Number.isInteger(b.reviewId) || (b.reviewId as number) <= 0)
    errors.push('reviewId wajib berupa bilangan bulat lebih dari 0');
  if (!Number.isInteger(b.userId) || (b.userId as number) <= 0)
    errors.push('userId wajib berupa bilangan bulat lebih dari 0');

  return errors;
}

const ERROR_MAP: Record<string, { code: number; message: string }> = {
  LIKE_NOT_FOUND: { code: 404, message: 'Data like tidak ditemukan' },
  REVIEW_NOT_FOUND: { code: 404, message: 'Data review tidak ditemukan' },
  USER_NOT_FOUND: { code: 404, message: 'Data user tidak ditemukan' },
  SELF_LIKE: { code: 400, message: 'User tidak boleh me-like review miliknya sendiri' },
  LIKE_EXISTS: { code: 409, message: 'User ini sudah me-like review tersebut' },
};

export class LikeController {
  private likeService: LikeService;

  constructor(likeService: LikeService = new LikeService()) {
    this.likeService = likeService;
  }

  private handleError(res: Response, error: unknown): Response {
    if (error instanceof Error && ERROR_MAP[error.message]) {
      const { code, message } = ERROR_MAP[error.message];
      return res.status(code).json({ status: 'fail', message });
    }
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
      error: error instanceof Error ? error.message : String(error),
    });
  }

  createLike = async (req: Request, res: Response): Promise<Response> => {
    try {
      const errors = validateLikeBody(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ status: 'fail', message: 'Validasi gagal', errors });
      }
      const data = await this.likeService.createLike(req.body);
      return res.status(201).json({ status: 'success', data });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  deleteLike = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseId(req.params.id);
      if (id === null) {
        return res.status(400).json({
          status: 'fail',
          message: 'Validasi gagal',
          errors: ['id harus bilangan bulat lebih dari 0'],
        });
      }
      const data = await this.likeService.deleteLike(id);
      return res.status(200).json({ status: 'success', data });
    } catch (error) {
      return this.handleError(res, error);
    }
  };
}