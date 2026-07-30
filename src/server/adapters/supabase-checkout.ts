import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { checkoutFulfillmentSchema } from "@/features/cart/domain/checkout";
import type { CheckoutOrder, CheckoutOrderStatusResult, CheckoutRepository } from "@/features/cart/server/checkout-repository";
import { moneySchema } from "@/lib/currency/money";
import { getSupabaseAdminConfigFromEnvironment } from "@/server/config/supabase";

const cartSnapshotSchema = z.object({
  lines: z.array(z.object({
    id: z.string().min(1),
    productId: z.string().min(1),
    name: z.string().min(1),
    finish: z.string().min(1),
    colour: z.string().min(1),
    quantity: z.number().int().min(1).max(10),
    maximumQuantity: z.number().int().nonnegative(),
    unitPrice: moneySchema,
  })),
});

const checkoutOrderRowSchema = z.object({
  id: z.uuid(),
  account_id: z.string().min(1),
  idempotency_key: z.uuid(),
  square_order_id: z.string().min(1),
  square_payment_link_id: z.string().min(1),
  payment_link_url: z.url(),
  status: z.enum(["pending", "paid", "cancelled", "failed", "refunded"]),
  cart_snapshot: cartSnapshotSchema,
  fulfillment_kind: z.enum(["pickup", "shipping"]),
  fulfillment_details: z.record(z.string(), z.unknown()),
  merchandise_subtotal_minor: z.number().int().nonnegative(),
  shipping_minor: z.number().int().nonnegative(),
  currency: z.literal("CAD"),
});

const checkoutStatusRowSchema = checkoutOrderRowSchema.pick({ id: true, status: true });

type CheckoutGateway = {
  findByIdempotencyKey(accountId: string, idempotencyKey: string): Promise<unknown>;
  create(order: CheckoutOrder): Promise<unknown>;
  readStatus(accountId: string, checkoutId: string): Promise<unknown>;
  recordPaymentEvent(input: Parameters<CheckoutRepository["recordPaymentEvent"]>[0]): Promise<unknown>;
  removeExpired(now: Date): Promise<unknown>;
};

function client(): SupabaseClient {
  const config = getSupabaseAdminConfigFromEnvironment();
  return createClient(config.SUPABASE_URL, config.SUPABASE_SECRET_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function rowToOrder(value: unknown): CheckoutOrder {
  const row = checkoutOrderRowSchema.parse(value);
  const fulfillment = checkoutFulfillmentSchema.parse({ kind: row.fulfillment_kind, ...row.fulfillment_details });
  return {
    id: row.id,
    accountId: row.account_id,
    idempotencyKey: row.idempotency_key,
    squareOrderId: row.square_order_id,
    paymentLinkId: row.square_payment_link_id,
    paymentLinkUrl: row.payment_link_url,
    status: row.status,
    cart: row.cart_snapshot,
    fulfillment,
    merchandiseSubtotalMinor: row.merchandise_subtotal_minor,
    shippingMinor: row.shipping_minor,
    currency: row.currency,
  };
}

export class SupabaseCheckoutRepository implements CheckoutRepository {
  public constructor(private readonly gateway: CheckoutGateway) {}

  public async findByIdempotencyKey(accountId: string, idempotencyKey: string): Promise<CheckoutOrder | null> {
    const row = await this.gateway.findByIdempotencyKey(accountId, idempotencyKey);
    return row ? rowToOrder(row) : null;
  }

  public async create(order: CheckoutOrder): Promise<CheckoutOrder> {
    return rowToOrder(await this.gateway.create(order));
  }

  public async readStatus(accountId: string, checkoutId: string): Promise<CheckoutOrderStatusResult | null> {
    const row = await this.gateway.readStatus(accountId, checkoutId);
    return row ? checkoutStatusRowSchema.parse(row) : null;
  }

  public async recordPaymentEvent(input: Parameters<CheckoutRepository["recordPaymentEvent"]>[0]): Promise<void> {
    await this.gateway.recordPaymentEvent(input);
  }

  public async removeExpired(now: Date): Promise<number> {
    return z.number().int().nonnegative().parse(await this.gateway.removeExpired(now));
  }
}

export function createSupabaseCheckoutRepository(): SupabaseCheckoutRepository {
  const supabase = client();
  return new SupabaseCheckoutRepository({
    async findByIdempotencyKey(accountId, idempotencyKey) {
      const result = await supabase.from("shop_checkout_orders").select("*").eq("account_id", accountId).eq("idempotency_key", idempotencyKey).maybeSingle();
      if (result.error) throw new Error("provider_unavailable");
      return result.data;
    },
    async create(order) {
      const fulfillmentDetails = order.fulfillment.kind === "pickup"
        ? { pickupPointId: order.fulfillment.pickupPointId }
        : { postalCode: order.fulfillment.postalCode };
      const result = await supabase.from("shop_checkout_orders").insert({
        id: order.id,
        account_id: order.accountId,
        idempotency_key: order.idempotencyKey,
        square_order_id: order.squareOrderId,
        square_payment_link_id: order.paymentLinkId,
        payment_link_url: order.paymentLinkUrl,
        status: order.status,
        cart_snapshot: order.cart,
        fulfillment_kind: order.fulfillment.kind,
        fulfillment_details: fulfillmentDetails,
        merchandise_subtotal_minor: order.merchandiseSubtotalMinor,
        shipping_minor: order.shippingMinor,
        currency: order.currency,
      }).select("*").single();
      if (result.error) throw new Error("provider_unavailable");
      return result.data;
    },
    async readStatus(accountId, checkoutId) {
      const result = await supabase.from("shop_checkout_orders").select("id, status").eq("id", checkoutId).eq("account_id", accountId).maybeSingle();
      if (result.error) throw new Error("provider_unavailable");
      return result.data;
    },
    async recordPaymentEvent(input) {
      const result = await supabase.rpc("record_square_payment_event", {
        p_event_id: input.eventId,
        p_event_type: input.eventType,
        p_square_order_id: input.squareOrderId,
        p_square_payment_id: input.squarePaymentId,
        p_payment_status: input.paymentStatus,
        p_occurred_at: input.occurredAt,
      });
      if (result.error) throw new Error("provider_unavailable");
      return result.data;
    },
    async removeExpired(now) {
      const result = await supabase.rpc("remove_expired_shop_checkout_orders", { p_now: now.toISOString() });
      if (result.error) throw new Error("provider_unavailable");
      return result.data;
    },
  });
}
