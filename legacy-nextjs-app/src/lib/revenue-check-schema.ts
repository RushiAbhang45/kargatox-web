import { z } from "zod";

export const AREA_KEYS = ["leads", "sales", "retention"] as const;

const score = z.union([z.literal(0), z.literal(1), z.literal(2)]);

export const revenueCheckSchema = z.object({
  leads: score,
  sales: score,
  retention: score,
  weakest: z.enum(AREA_KEYS),
  sessionId: z.string().trim().min(1),
  email: z.string().trim().email().optional(),
  city: z.string().trim().optional(),
});
