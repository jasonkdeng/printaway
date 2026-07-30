import type { CartSnapshot } from "../domain/cart";
import type { CheckoutFulfillment, CheckoutOrderStatus } from "../domain/checkout";

export type CheckoutOrder = {
  id: string;
  accountId: string;
  idempotencyKey: string;
  squareOrderId: string;
  paymentLinkId: string;
  paymentLinkUrl: string;
  status: CheckoutOrderStatus;
  cart: CartSnapshot;
  fulfillment: CheckoutFulfillment;
  merchandiseSubtotalMinor: number;
  shippingMinor: number;
  currency: "CAD";
};

export type CheckoutOrderStatusResult = Pick<CheckoutOrder, "id" | "status">;

export interface CheckoutRepository {
  findByIdempotencyKey(accountId: string, idempotencyKey: string): Promise<CheckoutOrder | null>;
  create(order: CheckoutOrder): Promise<CheckoutOrder>;
  readStatus(accountId: string, checkoutId: string): Promise<CheckoutOrderStatusResult | null>;
  recordPaymentEvent(input: {
    eventId: string;
    eventType: string;
    squareOrderId: string;
    squarePaymentId: string;
    paymentStatus: string;
    occurredAt: string;
  }): Promise<void>;
  removeExpired(now: Date): Promise<number>;
}
