import { z } from 'zod';

export const PostTelemetryBody = z.object({
  spacecraftId: z.string().min(1),
  timestamp: z.coerce.date(),
  parameters: z.record(z.union([z.number(), z.string(), z.boolean()]))
});
export type PostTelemetryBodyType = z.infer<typeof PostTelemetryBody>;

export const GetTelemetryQuery = z.object({
  spacecraftId: z.string().min(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});
export type GetTelemetryQueryType = z.infer<typeof GetTelemetryQuery>;

export const AnalyzeTelemetryQuery = GetTelemetryQuery.extend({});
export type AnalyzeTelemetryQueryType = z.infer<typeof AnalyzeTelemetryQuery>;

export const GetEventsQuery = z.object({
  spacecraftId: z.string().min(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});
export type GetEventsQueryType = z.infer<typeof GetEventsQuery>;

export const PostDocBody = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  content: z.string().min(1),
  tags: z.array(z.string()).default([])
});
export type PostDocBodyType = z.infer<typeof PostDocBody>;

export const SearchDocsQuery = z.object({
  q: z.string().min(1),
  limit: z.coerce.number().int().positive().max(50).default(10)
});
export type SearchDocsQueryType = z.infer<typeof SearchDocsQuery>;


