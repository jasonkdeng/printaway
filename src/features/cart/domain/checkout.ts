import { z } from "zod";

import type { Money } from "@/lib/currency/money";

export const pickupPoints = [
  {
    id: "waterloo-engineering-7",
    label: "Engineering 7 First Floor C&D",
    address: "200 University Avenue West, Waterloo, ON N2L 3G1",
  },
  {
    id: "markham-pacific-mall",
    label: "Pacific Mall outside TD Bank",
    address: "4300 Steeles Avenue East, Markham, ON L3R 0Y5",
  },
  {
    id: "toronto-wellesley",
    label: "Wellesley Station Neo Coffee Bar",
    address: "12 Gloucester Street, Toronto, ON M4Y 0H8",
  },
] as const;

const pickupPointIdSchema = z.enum(pickupPoints.map((point) => point.id) as [
  (typeof pickupPoints)[number]["id"],
  ...(typeof pickupPoints)[number]["id"][],
]);

const shippingPostalCodeSchema = z.string().trim().transform((value) => value.replace(/\s+/g, "").toUpperCase()).pipe(
  z.string().regex(/^(N2L|L3R|M4Y)[0-9][A-Z][0-9]$/, "Enter a postal code in the N2L, L3R, or M4Y service area."),
);

export const checkoutFulfillmentSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("pickup"), pickupPointId: pickupPointIdSchema }),
  z.object({ kind: z.literal("shipping"), postalCode: shippingPostalCodeSchema }),
]);

export const checkoutRequestSchema = z.object({
  idempotencyKey: z.uuid(),
  fulfillment: checkoutFulfillmentSchema,
});

export type CheckoutFulfillment = z.infer<typeof checkoutFulfillmentSchema>;
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
export type CheckoutOrderStatus = "pending" | "paid" | "cancelled" | "failed" | "refunded";

export const SHIPPING_FEE: Money = { amountMinor: 500, currency: "CAD" };
export const FREE_SHIPPING_THRESHOLD: Money = { amountMinor: 3000, currency: "CAD" };

export function shippingFeeFor(subtotal: Money, fulfillment: CheckoutFulfillment): Money {
  if (fulfillment.kind === "pickup" || subtotal.amountMinor >= FREE_SHIPPING_THRESHOLD.amountMinor) {
    return { amountMinor: 0, currency: "CAD" };
  }
  return SHIPPING_FEE;
}

export function pickupPointFor(id: (typeof pickupPoints)[number]["id"]) {
  return pickupPoints.find((point) => point.id === id);
}
