"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { formatMoney } from "@/lib/currency/money";

import { cartSubtotal, type CartSnapshot } from "../domain/cart";
import { pickupPoints, shippingFeeFor, type CheckoutFulfillment } from "../domain/checkout";
import { useCart, useCartSnapshot } from "./browser-cart-store";

type CheckoutState = "idle" | "submitting" | "review" | "error";

function checkoutUrlIsAllowed(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && [
      "square.link",
      "sandbox.square.link",
      "checkout.square.site",
      "sandbox.square.site",
    ].includes(url.hostname);
  } catch {
    return false;
  }
}

export function CartPanel({ signedIn }: { signedIn: boolean }) {
  const cart = useCart();
  const snapshot = useCartSnapshot();
  const { lines } = snapshot;
  const [fulfillmentKind, setFulfillmentKind] = useState<CheckoutFulfillment["kind"]>("pickup");
  const [pickupPointId, setPickupPointId] = useState<(typeof pickupPoints)[number]["id"]>(pickupPoints[0].id);
  const [postalCode, setPostalCode] = useState("");
  const [checkoutState, setCheckoutState] = useState<CheckoutState>("idle");
  const [message, setMessage] = useState("");
  const idempotencyKey = useRef(crypto.randomUUID());
  const serializedCart = JSON.stringify(lines);

  useEffect(() => {
    idempotencyKey.current = crypto.randomUUID();
  }, [serializedCart]);

  const subtotal = useMemo(() => cartSubtotal(lines), [lines]);
  const selectedFulfillment: CheckoutFulfillment = fulfillmentKind === "pickup"
    ? { kind: "pickup", pickupPointId }
    : { kind: "shipping", postalCode };
  const shippingFee = shippingFeeFor(subtotal, selectedFulfillment);

  const beginCheckout = async () => {
    setCheckoutState("submitting");
    setMessage("Checking current price and availability.");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idempotencyKey: idempotencyKey.current, fulfillment: selectedFulfillment }),
      });
      const body = await response.json() as {
        kind?: string;
        url?: string;
        checkoutId?: string;
        cart?: CartSnapshot;
        issues?: Array<{ message: string }>;
      };
      if (response.status === 401) {
        setCheckoutState("error");
        setMessage("Sign in with Google before continuing to checkout.");
        return;
      }
      if (body.kind === "cart_changed" && body.cart) {
        cart.replace(body.cart);
        setCheckoutState("review");
        setMessage("Price or availability changed. Review the updated cart before continuing.");
        return;
      }
      if (body.kind === "already_paid" && body.checkoutId) {
        window.location.assign(`/checkout/return?checkout=${encodeURIComponent(body.checkoutId)}`);
        return;
      }
      if (!response.ok || body.kind !== "ready" || !body.url || !checkoutUrlIsAllowed(body.url)) {
        setCheckoutState("error");
        setMessage(body.issues?.[0]?.message ?? (
          body.kind === "catalog_mismatch"
            ? "Checkout is paused because the Square catalog does not match the approved price. Your cart is unchanged."
            : body.kind === "empty_cart"
              ? "Your account cart is empty. Add an available object before checking out."
              : "Checkout could not be started. Your cart is unchanged; try again."
        ));
        return;
      }
      window.location.assign(body.url);
    } catch {
      setCheckoutState("error");
      setMessage("Checkout could not be started. Your cart is unchanged; try again.");
    }
  };

  if (!lines.length) {
    return <section><h1 className="pa-page-title">Your cart is empty.</h1><p className="mt-4 text-aluminum">Add an available Shop object to begin.</p></section>;
  }

  return (
    <section aria-labelledby="cart-heading">
      <h1 className="pa-page-title" id="cart-heading">Your cart</h1>
      <ul className="mt-8 divide-y divide-graphite border-y border-graphite">
        {lines.map((line) => (
          <li className="grid gap-4 py-6 sm:grid-cols-[1fr_auto_auto] sm:items-end" key={line.id}>
            <div>
              <h2 className="font-display text-2xl text-bone">{line.name}</h2>
              <p className="mt-1 font-mono text-sm text-aluminum">{line.finish} · {line.colour} · {formatMoney(line.unitPrice)} each</p>
            </div>
            <label className="flex flex-col gap-2 font-mono text-xs uppercase tracking-[0.12em] text-aluminum" htmlFor={`quantity-${line.id}`}>
              Quantity
              <select className="min-h-11 border border-aluminum bg-void px-3 text-base text-bone" id={`quantity-${line.id}`} onChange={(event) => cart.updateQuantity(line.id, Number(event.target.value))} value={line.quantity}>
                {Array.from({ length: Math.min(10, line.maximumQuantity) }, (_, index) => index + 1).map((quantity) => <option key={quantity} value={quantity}>{quantity}</option>)}
              </select>
            </label>
            <button className="min-h-11 border border-aluminum px-4 font-mono text-sm text-bone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cure-violet" onClick={() => cart.remove(line.id)} type="button">Remove {line.name}</button>
          </li>
        ))}
      </ul>

      <fieldset className="mt-8 min-w-0 border border-graphite p-5">
        <legend className="px-2 font-display text-2xl text-bone">Fulfillment</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex min-h-11 items-center gap-3 border border-aluminum p-3 text-bone">
            <input checked={fulfillmentKind === "pickup"} name="fulfillment" onChange={() => setFulfillmentKind("pickup")} type="radio" />
            Pickup
          </label>
          <label className="flex min-h-11 items-center gap-3 border border-aluminum p-3 text-bone">
            <input checked={fulfillmentKind === "shipping"} name="fulfillment" onChange={() => setFulfillmentKind("shipping")} type="radio" />
            Shipping
          </label>
        </div>
        {fulfillmentKind === "pickup" ? (
          <label className="mt-5 flex min-w-0 flex-col gap-2 text-bone" htmlFor="pickup-point">
            Pickup point
            <select className="min-h-11 w-full min-w-0 border border-aluminum bg-void px-3" id="pickup-point" onChange={(event) => setPickupPointId(event.target.value as typeof pickupPointId)} value={pickupPointId}>
              {pickupPoints.map((point) => <option key={point.id} value={point.id}>{point.label} — {point.address}</option>)}
            </select>
          </label>
        ) : (
          <label className="mt-5 flex max-w-md flex-col gap-2 text-bone" htmlFor="shipping-postal-code">
            Shipping postal code
            <input autoComplete="postal-code" className="min-h-11 border border-aluminum bg-void px-3 uppercase" id="shipping-postal-code" onChange={(event) => setPostalCode(event.target.value)} placeholder="N2L 3G1" value={postalCode} />
            <span className="text-sm text-aluminum">Shipping is available in N2L, L3R, and M4Y. Square will collect the full address.</span>
          </label>
        )}
      </fieldset>

      <dl className="mt-6 ml-auto grid max-w-md grid-cols-[1fr_auto] gap-2 border-t border-graphite pt-5">
        <dt className="text-aluminum">Merchandise subtotal</dt><dd className="text-bone">{formatMoney(subtotal)}</dd>
        <dt className="text-aluminum">Shipping</dt><dd className="text-bone">{shippingFee.amountMinor ? formatMoney(shippingFee) : "Free"}</dd>
        <dt className="font-display text-xl text-bone">Total before tax</dt>
        <dd className="font-display text-xl text-bone">{formatMoney({ amountMinor: subtotal.amountMinor + shippingFee.amountMinor, currency: "CAD" })}</dd>
      </dl>

      <p className="mt-5 text-sm leading-6 text-aluminum">
        Sandbox checkout has no taxes. By continuing, you acknowledge the <Link className="text-bone underline decoration-cure-violet underline-offset-4" href="/policies/shipping">shipping and pickup terms</Link>, <Link className="text-bone underline decoration-cure-violet underline-offset-4" href="/policies/returns">refund terms</Link>, and <Link className="text-bone underline decoration-cure-violet underline-offset-4" href="/policies/cancellation">cancellation terms</Link>.
      </p>

      {!signedIn ? (
        <Link className="mt-5 inline-flex min-h-11 items-center border border-aluminum px-5 font-mono text-sm text-bone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cure-violet" href="/api/auth/signin/google?callbackUrl=%2Fcart">Sign in with Google to checkout</Link>
      ) : (
        <button className="mt-5 min-h-11 bg-cure-violet px-6 font-mono text-sm font-medium text-void disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bone" disabled={checkoutState === "submitting"} onClick={beginCheckout} type="button">
          {checkoutState === "submitting" ? "Preparing Square checkout" : "Continue to Square"}
        </button>
      )}
      <p aria-live="polite" className="mt-3 min-h-6 text-sm text-aluminum" role="status">{message}</p>
      <button className="mt-4 min-h-11 font-mono text-sm text-aluminum underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cure-violet" onClick={() => cart.clear()} type="button">Clear cart</button>
    </section>
  );
}
