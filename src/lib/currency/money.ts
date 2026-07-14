import { z } from "zod";

export const launchCurrencySchema = z.literal("CAD");

export type LaunchCurrency = z.infer<typeof launchCurrencySchema>;

export const moneySchema = z.object({
  amountMinor: z.number().int().nonnegative(),
  currency: launchCurrencySchema,
});

export type Money = z.infer<typeof moneySchema>;

export function formatMoney(money: Money): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: money.currency,
  }).format(money.amountMinor / 100);
}
