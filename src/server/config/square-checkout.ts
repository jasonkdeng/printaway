import "server-only";

import { z } from "zod";

const squareCheckoutConfigSchema = z.object({
  SQUARE_CHECKOUT_ENABLED: z.enum(["true", "false"]).transform((value) => value === "true"),
  SQUARE_CHECKOUT_RETURN_URL: z.url(),
  SQUARE_WEBHOOK_NOTIFICATION_URL: z.url(),
  SQUARE_WEBHOOK_SIGNATURE_KEY: z.string().min(1),
});

type SquareCheckoutEnvironment = {
  SQUARE_CHECKOUT_ENABLED?: string;
  SQUARE_CHECKOUT_RETURN_URL?: string;
  SQUARE_WEBHOOK_NOTIFICATION_URL?: string;
  SQUARE_WEBHOOK_SIGNATURE_KEY?: string;
};

export type SquareCheckoutConfig = z.infer<typeof squareCheckoutConfigSchema>;

export function getSquareCheckoutConfig(environment: SquareCheckoutEnvironment): SquareCheckoutConfig {
  return squareCheckoutConfigSchema.parse(environment);
}

export function getOptionalSquareCheckoutConfigFromEnvironment(): SquareCheckoutConfig | null {
  const result = squareCheckoutConfigSchema.safeParse({
    SQUARE_CHECKOUT_ENABLED: process.env["SQUARE_CHECKOUT_ENABLED"],
    SQUARE_CHECKOUT_RETURN_URL: process.env["SQUARE_CHECKOUT_RETURN_URL"],
    SQUARE_WEBHOOK_NOTIFICATION_URL: process.env["SQUARE_WEBHOOK_NOTIFICATION_URL"],
    SQUARE_WEBHOOK_SIGNATURE_KEY: process.env["SQUARE_WEBHOOK_SIGNATURE_KEY"],
  });
  return result.success ? result.data : null;
}
