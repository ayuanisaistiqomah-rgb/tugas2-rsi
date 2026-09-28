import type { Request, Response } from 'express';
import { UserService } from '../services/userService.ts';
import type { UserRole } from '../repositories/userRepository.ts';

const ROLES: UserRole[] = ['admin', 'owner', 'customer'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateUserBody(body: unknown): string[] {
  if (typeof body !== 'object' || body === null) return ['Body harus berupa JSON object'];
  const b = body as Record<string, unknown>;
  const errors: string[] = [];

  if (typeof b.name !== 'string' || b.name.trim().length < 3)
    errors.push('name wajib berupa teks minimal 3 karakter');
  if (typeof b.email !== 'string' || !EMAIL_REGEX.test(b.email.trim()))
    errors.push('email wajib diisi dengan format yang valid');
  if (typeof b.password !== 'string' || b.password.length < 8)
    errors.push('password wajib diisi, minimal 8 karakter');
  if (b.role !== undefined && !ROLES.includes(b.role as UserRole))
    errors.push('role harus admin, owner, atau customer');

  return errors;
}

export class UserController {
  private userService: UserService;

  constructor(userService: UserService = new UserService()) {
    this.userService = userService;
  }

  private handleError(res: Response, error: unknown): Response {
    if (error instanceof Error && error.message === 'EMAIL_EXISTS') {
      return res.status(409).json({ status: 'fail', message: 'Email sudah terdaftar' });
    }
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
      error: error instanceof Error ? error.message : String(error),
    });
  }

  getUsers = async (req: Request, res: Response): Promise<Response> => {
    try {
      const role = req.query.role;
      if (role !== undefined && !ROLES.includes(role as UserRole)) {
        return res.status(400).json({
          status: 'fail',
          message: 'Validasi gagal',
          errors: ['role harus admin, owner, atau customer'],
        });
      }
      const data = await this.userService.getAllUsers(role as UserRole | undefined);
      return res.status(200).json({ status: 'success', data });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  createUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      const errors = validateUserBody(req.body);
      if (errors.length > 0) {
        return res.status(400).json({ status: 'fail', message: 'Validasi gagal', errors });
      }
      const data = await this.userService.createUser(req.body);
      return res.status(201).json({ status: 'success', data });
    } catch (error) {
      return this.handleError(res, error);
    }
  };
}