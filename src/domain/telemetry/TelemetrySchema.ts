import { z } from 'zod';

export const TelemetrySnapshotDtoSchema = z.object({
  id: z.string().optional(),
  spacecraftId: z.string().min(1),
  timestamp: z.coerce.date(),
  parameters: z.record(z.union([z.number(), z.string(), z.boolean()]))
});

export type TelemetrySnapshotDto = z.infer<typeof TelemetrySnapshotDtoSchema>;


