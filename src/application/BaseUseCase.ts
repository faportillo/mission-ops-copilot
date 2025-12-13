// src/application/BaseUseCase.ts
import type { TransactionManager } from './tx/TransactionManager';

export abstract class BaseUseCase {
  protected constructor(protected readonly txManager: TransactionManager) {}
}
