import type { Request, Response } from 'express';
import { ReviewService } from '../services/reviewService.ts';

function parseId(value: unknown): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateReviewBody(body: unknown): string[] {
  if (typeof body !== 'object' || body === null) return ['Body harus berupa JSON object'];
  const b = body as Record<string, unknown>;
  const errors: string[] = [];

  if (!Number.isInteger(b.stallId) || (b.stallId as number) <= 0)
    errors.push('stallId wajib berupa bilangan bulat lebih dari 0');
  if (!Number.isInteger(b.userId) || (b.userId as number) <= 0)
    errors.push('userId wajib berupa bilangan bulat lebih dari 0');
  if (!Number.isInteger(b.rating) || (b.rating as number) < 1 || (b.rating as number) > 5)
    errors.push('rating wajib berupa bilangan bulat 1 sampai 5');
  if (b.comment !== undefined && b.comment !== null && typeof b.comment !== 'string')
    errors.push('comment harus berupa teks');
  if (typeof b.comment === 'string' && b.comment.length > 1000)
    errors.push('comment maksimal 1000 karakter');

  return errors;
}

const ERROR_MAP: Record<string, { code: number; message: string }> = {
  REVIEW_NOT_FOUND: { code: 404, message: 'Data review tidak ditemukan' },
  STALL_NOT_FOUND: { code: 404, message: 'Data warung tidak ditemukan' },
  USER_NOT_FOUND: { code: 404, message: 'Data user tidak ditemukan' },
  NOT_CUSTOMER: { code: 403, message: 'Hanya user dengan role customer yang dapat memberi review' },
  REVIEW_EXISTS: { code: 409, message: 'User ini sudah pernah mengulas warung tersebut' },
};

export class ReviewController {
  private reviewService: ReviewService;

  constructor(reviewService: ReviewService = new ReviewService()) {
    this.reviewService = reviewService;
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

  private badRequest(res: Response, errors: string[]): Response {
    return res.status(400).json({ status: 'fail', message: 'Validasi gagal', errors });
  }

  getReviews = async (req: Request, res: Response): Promise<Response> => {
    try {
      let stallId: number | undefined;
      if (req.query.stallId !== undefined) {
        const parsed = parseId(req.query.stallId);
        if (parsed === null) return this.badRequest(res, ['stallId harus bilangan bulat lebih dari 0']);
        stallId = parsed;
      }
      const data = await this.reviewService.getAllReviews(stallId);
      return res.status(200).json({ status: 'success', data });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  createReview = async (req: Request, res: Response): Promise<Response> => {
    try {
      const errors = validateReviewBody(req.body);
      if (errors.length > 0) return this.badRequest(res, errors);
      const data = await this.reviewService.createReview(req.body);
      return res.status(201).json({ status: 'success', data });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  deleteReview = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseId(req.params.id);
      if (id === null) return this.badRequest(res, ['id harus bilangan bulat lebih dari 0']);
      const data = await this.reviewService.deleteReview(id);
      return res.status(200).json({ status: 'success', data });
    } catch (error) {
      return this.handleError(res, error);
    }
  };
}