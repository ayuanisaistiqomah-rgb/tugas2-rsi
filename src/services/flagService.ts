import { FlagRepository, type FlagStatus } from '../repositories/flagRepository.ts';

export class FlagService {
  private flagRepository: FlagRepository;

  constructor(flagRepository: FlagRepository = new FlagRepository()) {
    this.flagRepository = flagRepository;
  }

  async getAllFlags(status?: FlagStatus) {
    return this.flagRepository.findAll(status);
  }

  async updateFlagStatus(id: number, status: FlagStatus) {
    const row = await this.flagRepository.updateStatus(id, status);
    if (!row) throw new Error('FLAG_NOT_FOUND');
    return this.flagRepository.findById(id);
  }
}