import type { AnomalyRules, AnomalyRulesConfig } from '../../domain/telemetry/AnomalyRules.js';
import { AnomalyRulesConfigSchema } from '../../domain/telemetry/AnomalyRules.js';

export function extractAnomalyRules(rawConfig: unknown): AnomalyRules {
  const parsed = AnomalyRulesConfigSchema.safeParse(rawConfig);
  if (!parsed.success || !parsed.data || !parsed.data.parameters) {
    return { parameters: {} };
  }

  const cfg: AnomalyRulesConfig = parsed.data;
  return {
    parameters: cfg.parameters ?? {},
  };
}
