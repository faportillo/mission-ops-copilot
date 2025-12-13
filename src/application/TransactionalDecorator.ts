// src/application/transactionalDecorator.ts
import type { TransactionManager, TransactionalContext } from './tx/TransactionManager';

// Works with both legacy (3-arg) and new (2-arg) decorators
export function transactional(): any {
  return function (...decoratorArgs: any[]) {
    // New standard decorator: (value, context)
    if (decoratorArgs.length === 2 && typeof decoratorArgs[0] === 'function') {
      const original = decoratorArgs[0] as (...args: any[]) => Promise<any>;
      return async function (this: { txManager: TransactionManager }, ...args: any[]) {
        const input = args[0];
        return this.txManager.withTransaction((ctx: TransactionalContext) =>
          original.call(this, ctx, input),
        );
      };
    }

    // Legacy decorator: (target, propertyKey, descriptor)
    const [, , descriptor] = decoratorArgs as [any, string, PropertyDescriptor];
    const original = descriptor.value as (...args: any[]) => Promise<any>;
    descriptor.value = async function (this: { txManager: TransactionManager }, ...args: any[]) {
      const input = args[0];
      return this.txManager.withTransaction((ctx: TransactionalContext) =>
        original.call(this, ctx, input),
      );
    };
    return descriptor;
  };
}
