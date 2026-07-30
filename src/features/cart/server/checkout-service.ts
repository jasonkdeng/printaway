import type { AccountSession } from "@/server/auth/account-session";

import { cartSubtotal, type CartSnapshot } from "../domain/cart";
import { shippingFeeFor, type CheckoutRequest } from "../domain/checkout";
import type { CheckoutOrder, CheckoutRepository } from "./checkout-repository";
import type { CartRepository } from "./cart-repository";

type PaymentLinkGateway = {
  createPaymentLink(input: {
    checkoutId: string;
    idempotencyKey: string;
    buyerEmail: string | null;
    lines: CartSnapshot["lines"];
    fulfillment: CheckoutRequest["fulfillment"];
    shippingFee: ReturnType<typeof shippingFeeFor>;
    redirectUrl: string;
  }): Promise<{ paymentLinkId: string; squareOrderId: string; url: string }>;
};

type CheckoutDependencies = {
  getAccount(): Promise<AccountSession | null>;
  cartRepository: CartRepository;
  checkoutRepository: CheckoutRepository;
  revalidate(lines: CartSnapshot["lines"]): Promise<CartSnapshot>;
  paymentLinkGateway: PaymentLinkGateway;
  checkoutReturnUrl: string;
  createCheckoutId(): string;
};

export type CheckoutServiceResult =
  | { status: 200; body: { kind: "ready"; checkoutId: string; url: string } }
  | { status: 200; body: { kind: "already_paid"; checkoutId: string } }
  | { status: 401; body: { kind: "unauthorized" } }
  | { status: 409; body: { kind: "cart_changed"; cart: CartSnapshot } }
  | { status: 409; body: { kind: "checkout_closed" } }
  | { status: 422; body: { kind: "empty_cart" } };

function snapshotsMatch(first: CartSnapshot, second: CartSnapshot): boolean {
  return JSON.stringify(first.lines) === JSON.stringify(second.lines);
}

export function createCheckoutService(dependencies: CheckoutDependencies) {
  return {
    async create(request: CheckoutRequest): Promise<CheckoutServiceResult> {
      const account = await dependencies.getAccount();
      if (!account) return { status: 401, body: { kind: "unauthorized" } };

      const existing = await dependencies.checkoutRepository.findByIdempotencyKey(account.accountId, request.idempotencyKey);
      if (existing) {
        if (existing.status === "paid") {
          return { status: 200, body: { kind: "already_paid", checkoutId: existing.id } };
        }
        if (existing.status !== "pending") {
          return { status: 409, body: { kind: "checkout_closed" } };
        }
        return { status: 200, body: { kind: "ready", checkoutId: existing.id, url: existing.paymentLinkUrl } };
      }

      const cart = await dependencies.cartRepository.read(account.accountId);
      if (!cart.lines.length) return { status: 422, body: { kind: "empty_cart" } };
      const revalidated = await dependencies.revalidate(cart.lines);
      if (!snapshotsMatch(cart, revalidated)) {
        const persisted = await dependencies.cartRepository.replace(account.accountId, revalidated.lines);
        return { status: 409, body: { kind: "cart_changed", cart: persisted } };
      }

      const merchandiseSubtotal = cartSubtotal(revalidated.lines);
      const shippingFee = shippingFeeFor(merchandiseSubtotal, request.fulfillment);
      const checkoutId = dependencies.createCheckoutId();
      const paymentLink = await dependencies.paymentLinkGateway.createPaymentLink({
        checkoutId,
        idempotencyKey: request.idempotencyKey,
        buyerEmail: account.email,
        lines: revalidated.lines,
        fulfillment: request.fulfillment,
        shippingFee,
        redirectUrl: dependencies.checkoutReturnUrl,
      });
      const order: CheckoutOrder = {
        id: checkoutId,
        accountId: account.accountId,
        idempotencyKey: request.idempotencyKey,
        squareOrderId: paymentLink.squareOrderId,
        paymentLinkId: paymentLink.paymentLinkId,
        paymentLinkUrl: paymentLink.url,
        status: "pending",
        cart: revalidated,
        fulfillment: request.fulfillment,
        merchandiseSubtotalMinor: merchandiseSubtotal.amountMinor,
        shippingMinor: shippingFee.amountMinor,
        currency: "CAD",
      };
      await dependencies.checkoutRepository.create(order);
      return { status: 200, body: { kind: "ready", checkoutId, url: paymentLink.url } };
    },
  };
}
