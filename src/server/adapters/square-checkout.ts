import "server-only";

import { z } from "zod";

import type { CartLine } from "@/features/cart/domain/cart";
import type { CheckoutFulfillment } from "@/features/cart/domain/checkout";
import { initialCatalogProducts } from "@/features/shop/domain/initial-catalog";
import type { SquarePrintFinishModifierIds } from "@/features/shop/server/square-print-finish-config";
import type { SquareVariationIds } from "@/features/shop/server/square-variation-config";
import type { Money } from "@/lib/currency/money";
import type { SquareServerConfig } from "@/server/config/square";

const SQUARE_API_VERSION = "2026-07-15";

const catalogVariationSchema = z.object({
  object: z.object({
    id: z.string().min(1),
    type: z.literal("ITEM_VARIATION"),
    item_variation_data: z.object({
      price_money: z.object({
        amount: z.coerce.number().int().nonnegative(),
        currency: z.literal("CAD"),
      }),
    }),
  }),
});

const catalogModifierSchema = z.object({
  object: z.object({
    id: z.string().min(1),
    type: z.literal("MODIFIER"),
    modifier_data: z.object({
      name: z.enum(["Matte", "Glossy"]),
      price_money: z.object({
        amount: z.coerce.number().int().nonnegative(),
        currency: z.literal("CAD"),
      }),
    }),
  }),
});

const createPaymentLinkResponseSchema = z.object({
  payment_link: z.object({
    id: z.string().min(1),
    order_id: z.string().min(1),
    url: z.url(),
  }),
});

type FetchLike = typeof fetch;

export type SquareCheckoutLine = Pick<CartLine, "productId" | "finish" | "colour" | "quantity" | "unitPrice">;

export type CreateSquarePaymentLinkInput = {
  checkoutId: string;
  idempotencyKey: string;
  buyerEmail: string | null;
  lines: readonly SquareCheckoutLine[];
  fulfillment: CheckoutFulfillment;
  shippingFee: Money;
  redirectUrl: string;
};

export type SquarePaymentLink = {
  paymentLinkId: string;
  squareOrderId: string;
  url: string;
};

export class SquareCheckoutError extends Error {
  public constructor(public readonly code: "catalog_mismatch" | "provider_unavailable" | "unsafe_redirect") {
    super(code);
  }
}

function apiBaseUrl(environment: SquareServerConfig["SQUARE_ENVIRONMENT"]): string {
  return environment === "production" ? "https://connect.squareup.com" : "https://connect.squareupsandbox.com";
}

function checkoutUrlIsAllowed(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && [
      "square.link",
      "sandbox.square.link",
      "checkout.square.site",
      "sandbox.square.site",
    ].includes(parsed.hostname);
  } catch {
    return false;
  }
}

export class SquareCheckoutAdapter {
  public constructor(
    private readonly config: SquareServerConfig,
    private readonly variationIds: SquareVariationIds,
    private readonly modifierIds: SquarePrintFinishModifierIds,
    private readonly fetchImplementation: FetchLike = fetch,
  ) {}

  private async catalogObject(id: string): Promise<unknown> {
    const response = await this.fetchImplementation(
      new URL(`/v2/catalog/object/${encodeURIComponent(id)}`, apiBaseUrl(this.config.SQUARE_ENVIRONMENT)),
      { headers: this.headers() },
    );
    if (!response.ok) throw new SquareCheckoutError("provider_unavailable");
    return response.json();
  }

  private headers(): HeadersInit {
    return {
      Authorization: `Bearer ${this.config.SQUARE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      "Square-Version": SQUARE_API_VERSION,
    };
  }

  private async validateCatalog(lines: readonly SquareCheckoutLine[]): Promise<void> {
    await Promise.all(lines.map(async (line) => {
      const product = initialCatalogProducts.find((candidate) => candidate.id === line.productId);
      const finish = product?.finishOptions.find((candidate) => candidate.name === line.finish);
      const variationId = this.variationIds[line.productId as keyof SquareVariationIds];
      const modifierId = this.modifierIds[line.finish as keyof SquarePrintFinishModifierIds];
      if (!product || !finish || !variationId || !modifierId) throw new SquareCheckoutError("catalog_mismatch");

      const [variation, modifier] = await Promise.all([
        this.catalogObject(variationId).then((value) => catalogVariationSchema.parse(value)),
        this.catalogObject(modifierId).then((value) => catalogModifierSchema.parse(value)),
      ]).catch((error: unknown) => {
        if (error instanceof SquareCheckoutError) throw error;
        throw new SquareCheckoutError("catalog_mismatch");
      });

      const baseAmount = variation.object.item_variation_data.price_money.amount;
      const modifierAmount = modifier.object.modifier_data.price_money.amount;
      if (
        variation.object.id !== variationId
        || modifier.object.id !== modifierId
        || modifier.object.modifier_data.name !== line.finish
        || baseAmount !== product.basePrice.amountMinor
        || modifierAmount !== finish.surcharge.amountMinor
        || line.unitPrice.amountMinor !== baseAmount + modifierAmount
      ) {
        throw new SquareCheckoutError("catalog_mismatch");
      }
    }));
  }

  public async createPaymentLink(input: CreateSquarePaymentLinkInput): Promise<SquarePaymentLink> {
    await this.validateCatalog(input.lines);

    const redirectUrl = new URL(input.redirectUrl);
    redirectUrl.searchParams.set("checkout", input.checkoutId);
    const lineItems = input.lines.map((line) => ({
      quantity: String(line.quantity),
      catalog_object_id: this.variationIds[line.productId as keyof SquareVariationIds],
      note: `Colour: ${line.colour}`,
      modifiers: [{ catalog_object_id: this.modifierIds[line.finish as keyof SquarePrintFinishModifierIds] }],
    }));
    const checkoutOptions = {
      allow_tipping: false,
      enable_coupon: false,
      enable_loyalty: false,
      ask_for_shipping_address: input.fulfillment.kind === "shipping",
      merchant_support_email: "printaway@gmail.com",
      redirect_url: redirectUrl.toString(),
      ...(input.shippingFee.amountMinor > 0
        ? { shipping_fee: { name: "Shipping", charge: { amount: input.shippingFee.amountMinor, currency: input.shippingFee.currency } } }
        : {}),
    };

    const response = await this.fetchImplementation(
      new URL("/v2/online-checkout/payment-links", apiBaseUrl(this.config.SQUARE_ENVIRONMENT)),
      {
        method: "POST",
        headers: this.headers(),
        body: JSON.stringify({
          idempotency_key: input.idempotencyKey,
          order: {
            location_id: this.config.SQUARE_LOCATION_ID,
            reference_id: input.checkoutId,
            line_items: lineItems,
          },
          checkout_options: checkoutOptions,
          ...(input.buyerEmail ? { pre_populated_data: { buyer_email: input.buyerEmail } } : {}),
        }),
      },
    );
    if (!response.ok) throw new SquareCheckoutError("provider_unavailable");

    const parsed = createPaymentLinkResponseSchema.parse(await response.json());
    if (!checkoutUrlIsAllowed(parsed.payment_link.url)) throw new SquareCheckoutError("unsafe_redirect");
    return {
      paymentLinkId: parsed.payment_link.id,
      squareOrderId: parsed.payment_link.order_id,
      url: parsed.payment_link.url,
    };
  }
}
