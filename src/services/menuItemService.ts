import {
  MenuItemRepository,
  type CreateMenuItemInput,
} from '../repositories/menuItemRepository.ts';
import { StallRepository } from '../repositories/stallRepository.ts';
import type { MenuItemWithStallDto } from '../dtos/menuItemDto.ts';

export class MenuItemService {
  private menuItemRepository: MenuItemRepository;
  private stallRepository: StallRepository;

  constructor(
    menuItemRepository: MenuItemRepository = new MenuItemRepository(),
    stallRepository: StallRepository = new StallRepository(),
  ) {
    this.menuItemRepository = menuItemRepository;
    this.stallRepository = stallRepository;
  }

  private async ensureStallExists(stallId: number) {
    const stall = await this.stallRepository.findById(stallId);
    if (!stall) throw new Error('STALL_NOT_FOUND');
  }

  async getAllMenuItems(stallId?: number): Promise<MenuItemWithStallDto[]> {
    return this.menuItemRepository.findAllWithStall(stallId);
  }

  async getMenuItemById(id: number): Promise<MenuItemWithStallDto> {
    const row = await this.menuItemRepository.findByIdWithStall(id);
    if (!row) throw new Error('MENU_NOT_FOUND');
    return row;
  }

  async createMenuItem(input: CreateMenuItemInput): Promise<MenuItemWithStallDto> {
    await this.ensureStallExists(input.stallId);
    const row = await this.menuItemRepository.create(input);
    if (!row) throw new Error('MENU_NOT_FOUND');
    return this.getMenuItemById(row.id);
  }

  async updateMenuItem(
    id: number,
    input: Partial<CreateMenuItemInput>,
  ): Promise<MenuItemWithStallDto> {
    if (input.stallId !== undefined) await this.ensureStallExists(input.stallId);
    const row = await this.menuItemRepository.update(id, input);
    if (!row) throw new Error('MENU_NOT_FOUND');
    return this.getMenuItemById(id);
  }

  async deleteMenuItem(id: number): Promise<MenuItemWithStallDto> {
    const existing = await this.getMenuItemById(id); // 404 bila tidak ada
    await this.menuItemRepository.remove(id);
    return existing;
  }
}