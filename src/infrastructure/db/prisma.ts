import { PrismaClient, Prisma } from '../../../prisma/generated/client/index.js';

let prisma: PrismaClient | null = null;

export type PrismaTx = PrismaClient | Prisma.TransactionClient;

export function getPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}
