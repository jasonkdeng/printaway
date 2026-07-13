import { z } from "zod";

const availabilitySchema = z.literal("available");

export const shopFiltersSchema = z.object({
  material: z.string().trim().min(1).optional(),
  availability: availabilitySchema.optional(),
}).strict();

export type ShopFilters = z.infer<typeof shopFiltersSchema>;

export function parseShopFilters(input: unknown): ShopFilters {
  return shopFiltersSchema.parse(input);
}
