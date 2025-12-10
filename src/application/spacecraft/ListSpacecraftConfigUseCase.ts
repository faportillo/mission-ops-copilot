import type { SpacecraftConfigRepository } from '../../infrastructure/persistence/SpacecraftConfigRepository.js';

export class ListSpacecraftConfigUseCase {
  constructor(private readonly repo: SpacecraftConfigRepository) {}
  async execute(options: { limit: number; offset: number }) {
    return this.repo.listConfigsPaged(options);
  }
}
