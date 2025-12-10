import { SpacecraftConfigRepository } from '../../infrastructure/persistence/SpacecraftConfigRepository.js';

export class CountSpacecraftConfigsUseCase {
  constructor(private readonly repo: SpacecraftConfigRepository) {}
  async execute(): Promise<number> {
    return this.repo.countConfigs();
  }
}
