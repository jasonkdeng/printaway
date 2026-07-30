import { z } from "zod";

import { moneySchema, type Money } from "@/lib/currency/money";

export const printFinishOptionSchema = z.object({
  name: z.enum(["Standard", "Matte", "Glossy"]),
  surcharge: moneySchema,
});

export type PrintFinishOption = z.infer<typeof printFinishOptionSchema>;

export const printFinishOptions: PrintFinishOption[] = [
  { name: "Standard", surcharge: { amountMinor: 0, currency: "CAD" } },
  { name: "Matte", surcharge: { amountMinor: 100, currency: "CAD" } },
  { name: "Glossy", surcharge: { amountMinor: 200, currency: "CAD" } },
];

export const initialCatalogProductSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1),
  summary: z.string().min(1),
  material: z.enum(["PLA", "ABS"]),
  weightGrams: z.number().int().positive(),
  dimensionsMm: z.object({ length: z.number().positive(), width: z.number().positive(), height: z.number().positive() }),
  colours: z.array(z.enum(["white", "black", "gray", "dark green", "tan", "latte brown", "red"])).min(1),
  finishOptions: z.array(printFinishOptionSchema).min(1),
  limitations: z.array(z.string().min(1)).min(1),
  basePrice: moneySchema,
  availability: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("in_stock"), quantity: z.number().int().positive(), label: z.union([z.literal("In stock"), z.string().regex(/^Only [1-5] Left$/)]) }),
    z.object({ kind: z.literal("made_to_order"), label: z.literal("Made to order") }),
    z.object({ kind: z.literal("unavailable"), label: z.literal("Sold out") }),
  ]),
  mediaStatus: z.literal("placeholder_pending_approved_media"),
});

export type InitialCatalogProduct = z.infer<typeof initialCatalogProductSchema>;

export function priceForPrintFinishOption(basePrice: Money, option: PrintFinishOption): Money {
  return {
    amountMinor: basePrice.amountMinor + option.surcharge.amountMinor,
    currency: basePrice.currency,
  };
}

export function priceForPrintFinish(product: InitialCatalogProduct, finish: string) {
  const option = product.finishOptions.find((candidate) => candidate.name === finish);
  if (!option) return null;
  return priceForPrintFinishOption(product.basePrice, option);
}

export const initialCatalogProducts = [
  {
    id: "monitor-riser",
    slug: "monitor-riser",
    name: "Monitor Riser",
    summary: "A snap-together riser designed to raise a monitor and leave 90 mm of usable clearance beneath it. It can also serve as a light-duty desktop platform.",
    material: "PLA",
    weightGrams: 100,
    dimensionsMm: { length: 350, width: 250, height: 120 },
    colours: ["white", "black", "gray", "dark green", "tan", "latte brown", "red"],
    finishOptions: printFinishOptions,
    limitations: [
      "Use loads of 20 lb or less. This working load was physically observed during informal testing and is not a certified rating.",
      "Snap-together assembly requires no hardware or additional parts.",
      "Indoor use. Avoid high heat; see PLA material limits.",
    ],
    basePrice: { amountMinor: 1200, currency: "CAD" },
    availability: { kind: "unavailable", label: "Sold out" },
    mediaStatus: "placeholder_pending_approved_media",
  },
  {
    id: "desk-tray",
    slug: "desk-tray",
    name: "Desk Tray",
    summary: "An open, compartment-free stackable bin for simple desk or small-parts storage.",
    material: "PLA",
    weightGrams: 50,
    dimensionsMm: { length: 120, width: 180, height: 100 },
    colours: ["white", "black", "gray", "dark green", "tan", "latte brown", "red"],
    finishOptions: printFinishOptions,
    limitations: [
      "Not approved for food contact.",
      "Indoor use. Avoid high heat; see PLA material limits.",
    ],
    basePrice: { amountMinor: 300, currency: "CAD" },
    availability: { kind: "unavailable", label: "Sold out" },
    mediaStatus: "placeholder_pending_approved_media",
  },
  {
    id: "coat-hanger",
    slug: "coat-hanger",
    name: "Coat Hanger",
    summary: "A folding closet-rail coat hanger with an integrated printed hinge. It folds without separate hardware and requires no assembly.",
    material: "ABS",
    weightGrams: 15,
    dimensionsMm: { length: 400, width: 10, height: 150 },
    colours: ["white", "black", "gray", "dark green", "tan", "latte brown", "red"],
    finishOptions: printFinishOptions,
    limitations: [
      "Use loads of 10 lb or less. This capacity is based on calculation and informal observation and is not a certified rating.",
      "Indoor use. Avoid high heat; see ABS material limits.",
    ],
    basePrice: { amountMinor: 200, currency: "CAD" },
    availability: { kind: "unavailable", label: "Sold out" },
    mediaStatus: "placeholder_pending_approved_media",
  },
  {
    id: "keycap-fidget",
    slug: "keycap-fidget",
    name: "Keycap Fidget",
    summary: "A complete mechanical-switch fidget with removable keycaps, ready to use without additional components.",
    material: "PLA",
    weightGrams: 10,
    dimensionsMm: { length: 100, width: 30, height: 30 },
    colours: ["white", "black", "gray", "dark green", "tan", "latte brown", "red"],
    finishOptions: printFinishOptions,
    limitations: [
      "Contains small parts. Choking hazard. Not for children under 3 years.",
      "Indoor use. Avoid high heat; see PLA material limits.",
    ],
    basePrice: { amountMinor: 300, currency: "CAD" },
    availability: { kind: "unavailable", label: "Sold out" },
    mediaStatus: "placeholder_pending_approved_media",
  },
] as const satisfies readonly InitialCatalogProduct[];
