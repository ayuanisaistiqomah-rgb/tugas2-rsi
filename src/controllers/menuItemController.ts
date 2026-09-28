import type { Request, Response } from 'express';
import { MenuItemService } from '../services/menuItemService.ts';

// Validasi sederhana body menu. isUpdate = true -> semua field opsional.
function validateMenuBody(body: unknown, isUpdate: boolean): string[] {
  if (typeof body !== 'object' || body === null) return ['Body harus berupa JSON object'];
  const b = body as Record<string, unknown>;
  const errors: string[] = [];

  if (!isUpdate || b.stallId !== undefined) {
    if (!Number.isInteger(b.stallId) || (b.stallId as number) <= 0)
      errors.push('stallId wajib berupa bilangan bulat lebih dari 0');
  }
  if (!isUpdate || b.name !== undefined) {
    if (typeof b.name !== 'string' || b.name.trim().length < 3)
      errors.push('name wajib berupa teks minimal 3 karakter');
  }
  if (!isUpdate || b.price !== undefined) {
    if (!Number.isInteger(b.price) || (b.price as number) < 0)
      errors.push('price wajib berupa bilangan bulat, tidak boleh negatif');
  }
  if (b.isAvailable !== undefined && typeof b.isAvailable !== 'boolean')
    errors.push('isAvailable harus true atau false');
  if (isUpdate && ['stallId', 'name', 'price', 'isAvailable'].every((k) => b[k] === undefined))
    errors.push('Minimal satu field harus diisi');

  return errors;
}

function parseId(value: unknown): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export class MenuItemController {
  private menuItemService: MenuItemService;

  constructor(menuItemService: MenuItemService = new MenuItemService()) {
    this.menuItemService = menuItemService;
  }

  private handleError(res: Response, error: unknown): Response {
    if (error instanceof Error && error.message === 'MENU_NOT_FOUND') {
      return res.status(404).json({ status: 'fail', message: 'Data menu tidak ditemukan' });
    }
    if (error instanceof Error && error.message === 'STALL_NOT_FOUND') {
      return res.status(404).json({ status: 'fail', message: 'Data warung tidak ditemukan' });
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

  getMenuItems = async (req: Request, res: Response): Promise<Response> => {
    try {
      let stallId: number | undefined;
      if (req.query.stallId !== undefined) {
        const parsed = parseId(req.query.stallId);
        if (parsed === null) return this.badRequest(res, ['stallId harus bilangan bulat lebih dari 0']);
        stallId = parsed;
      }
      const data = await this.menuItemService.getAllMenuItems(stallId);
      return res.status(200).json({ status: 'success', data });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  getMenuItemById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseId(req.params.id);
      if (id === null) return this.badRequest(res, ['id harus bilangan bulat lebih dari 0']);
      const data = await this.menuItemService.getMenuItemById(id);
      return res.status(200).json({ status: 'success', data });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  createMenuItem = async (req: Request, res: Response): Promise<Response> => {
    try {
      const errors = validateMenuBody(req.body, false);
      if (errors.length > 0) return this.badRequest(res, errors);
      const data = await this.menuItemService.createMenuItem(req.body);
      return res.status(201).json({ status: 'success', data });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  updateMenuItem = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseId(req.params.id);
      if (id === null) return this.badRequest(res, ['id harus bilangan bulat lebih dari 0']);
      const errors = validateMenuBody(req.body, true);
      if (errors.length > 0) return this.badRequest(res, errors);
      const data = await this.menuItemService.updateMenuItem(id, req.body);
      return res.status(200).json({ status: 'success', data });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  deleteMenuItem = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseId(req.params.id);
      if (id === null) return this.badRequest(res, ['id harus bilangan bulat lebih dari 0']);
      const data = await this.menuItemService.deleteMenuItem(id);
      return res.status(200).json({ status: 'success', data });
    } catch (error) {
      return this.handleError(res, error);
    }
  };
}