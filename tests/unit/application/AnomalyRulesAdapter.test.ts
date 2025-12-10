import { describe, it, expect } from 'vitest';
import { extractAnomalyRules } from '../../../src/application/telemetry/anomalyRulesAdapter.js';

describe('extractAnomalyRules', () => {
  it('returns parameters when config is valid', () => {
    const rules = extractAnomalyRules({ parameters: { temp: { warnHigh: 10 } } });
    expect(rules.parameters.temp.warnHigh).toBe(10);
  });

  it('fails soft for invalid or missing config', () => {
    expect(extractAnomalyRules(undefined).parameters).toEqual({});
    expect(extractAnomalyRules({}).parameters).toEqual({});
    expect(extractAnomalyRules({ parameters: 'nope' as unknown as object }).parameters).toEqual({});
  });
});
