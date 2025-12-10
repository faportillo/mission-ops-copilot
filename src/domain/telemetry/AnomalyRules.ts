import { z } from 'zod';

export const ParameterRuleSchema = z
  .object({
    warnHigh: z.number().optional(),
    critHigh: z.number().optional(),
    warnLow: z.number().optional(),
    critLow: z.number().optional(),
  })
  .partial();

export const AnomalyRulesConfigSchema = z.object({
  parameters: z.record(z.string(), ParameterRuleSchema).optional(),
});

export type ParameterRule = z.infer<typeof ParameterRuleSchema>;
export type AnomalyRulesConfig = z.infer<typeof AnomalyRulesConfigSchema>;

export type AnomalyRules = {
  parameters: Record<string, ParameterRule>;
};
