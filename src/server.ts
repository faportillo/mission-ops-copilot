import Fastify from 'fastify';
import { registerHttpRoutes } from './interfaces/http/index.js';
import { createAppContext } from './index.js';
import { loadConfig } from './config/index.js';
import { getLogger } from './logging/logger.js';

async function main() {
  const config = loadConfig();
  const logger = getLogger();
  const ctx = createAppContext();

  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL
    }
  }).withTypeProvider();

  await registerHttpRoutes(app, ctx);

  try {
    await app.listen({ port: config.PORT, host: '0.0.0.0' });
    logger.info(`HTTP server listening on port ${config.PORT}`);
  } catch (err) {
    logger.error('Failed to start server', { err });
    process.exit(1);
  }
}

main();


