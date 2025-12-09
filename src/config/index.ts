import 'dotenv/config';
import { ConfigSchema, type AppConfig } from './schema.js';

let cachedConfig: AppConfig | null = null;

export function loadConfig(): AppConfig {
  if (cachedConfig) return cachedConfig;
  const parsed = ConfigSchema.safeParse(process.env);
  if (!parsed.success) {
    const flattened = parsed.error.flatten();
    const message = JSON.stringify(flattened.fieldErrors);
    throw new Error(`Invalid configuration: ${message}`);
  }
  cachedConfig = parsed.data;
  return cachedConfig;
}


