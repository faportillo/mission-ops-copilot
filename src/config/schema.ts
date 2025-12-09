import { z } from 'zod';

export const ConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATA_BACKEND: z.enum(['in-memory', 'file']).default('in-memory'),
  DATA_DIR: z.string().optional(),
  OPENAI_API_KEY: z.string().optional()
}).refine(
  (cfg) => {
    if (cfg.DATA_BACKEND === 'file') {
      return typeof cfg.DATA_DIR === 'string' && cfg.DATA_DIR.length > 0;
    }
    return true;
  },
  { message: 'DATA_DIR is required when DATA_BACKEND is "file"', path: ['DATA_DIR'] }
);

export type AppConfig = z.infer<typeof ConfigSchema>;


