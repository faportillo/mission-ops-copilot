FROM node:20-bookworm-slim AS base
WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable

# Install dependencies separately for better caching
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN pnpm prisma generate

# Copy source and build
COPY tsconfig*.json ./
COPY src ./src
RUN pnpm build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy built app and node_modules
RUN corepack enable
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/prisma ./prisma
COPY package.json ./

EXPOSE 3000
CMD ["node", "dist/server.js"]


