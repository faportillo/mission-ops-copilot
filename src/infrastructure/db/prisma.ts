import { createRequire } from 'node:module';
type PrismaClient = import('../../../prisma/generated/client').PrismaClient;
type PrismaNS = typeof import('../../../prisma/generated/client').Prisma;

let prisma: PrismaClient | null = null;
let PrismaClientCtor: { new (): PrismaClient } | null = null;
let Prisma: PrismaNS | null = null;

export type PrismaTx = PrismaClient | (PrismaNS extends { TransactionClient: infer T } ? T : never);

export function getPrisma(): PrismaClient {
  if (!prisma) {
    if (!PrismaClientCtor) {
      const require = createRequire(import.meta.url);
      const mod = require('../../../prisma/generated/client') as {
        PrismaClient: { new (): PrismaClient };
        Prisma: PrismaNS;
      };
      PrismaClientCtor = mod.PrismaClient;
      Prisma = mod.Prisma;
    }
    prisma = new PrismaClientCtor!();
  }
  return prisma;
}
