export type TelemetryAnomaly = {
  id: string;
  spacecraftId: string;
  timestamp: Date;
  parameter: string;
  value: number | string | boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  detectedAt?: Date;
  windowStart?: Date | null;
  windowEnd?: Date | null;
};
