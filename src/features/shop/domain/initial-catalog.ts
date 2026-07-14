import { z } from "zod";

import { moneySchema } from "@/lib/currency/money";

export const initialCatalogProductSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1),
  material: z.enum(["PLA", "ABS"]),
  weightGrams: z.number().int().positive(),
  pricingFormula: z.string().min(1),
  provisionalPrice: moneySchema,
  mediaStatus: z.literal("placeholder_pending_approved_media"),
});

export type InitialCatalogProduct = z.infer<typeof initialCatalogProductSchema>;

export const initialCatalogProducts = [
  {
    id: "monitor-riser",
    slug: "monitor-riser",
    name: "Monitor Riser",
    material: "PLA",
    weightGrams: 100,
    pricingFormula: "100 g × $0.05",
    provisionalPrice: { amountMinor: 500, currency: "CAD" },
    mediaStatus: "placeholder_pending_approved_media",
  },
  {
    id: "desk-tray",
    slug: "desk-tray",
    name: "Desk Tray",
    material: "PLA",
    weightGrams: 50,
    pricingFormula: "50 g × $0.05",
    provisionalPrice: { amountMinor: 250, currency: "CAD" },
    mediaStatus: "placeholder_pending_approved_media",
  },
  {
    id: "coat-hanger",
    slug: "coat-hanger",
    name: "Coat Hanger",
    material: "ABS",
    weightGrams: 15,
    pricingFormula: "15 g × $0.07",
    provisionalPrice: { amountMinor: 105, currency: "CAD" },
    mediaStatus: "placeholder_pending_approved_media",
  },
  {
    id: "keycap-fidget",
    slug: "keycap-fidget",
    name: "Keycap Fidget",
    material: "PLA",
    weightGrams: 10,
    pricingFormula: "10 g × $0.05 + $0.50",
    provisionalPrice: { amountMinor: 100, currency: "CAD" },
    mediaStatus: "placeholder_pending_approved_media",
  },
] as const satisfies readonly InitialCatalogProduct[];
