"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { formatMoney } from "@/lib/currency/money";

import { cartSubtotal, type CartSnapshot } from "../domain/cart";
import { pickupPoints, shippingFeeFor, type CheckoutFulfillment } from "../domain/checkout";
import { useCart, useCartSnapshot } from "./browser-cart-store";
import styles from "./cart-panel.module.css";

type CheckoutState = "idle" | "submitting" | "review" | "error";

function checkoutUrlIsAllowed(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ["square.link", "sandbox.square.link", "checkout.square.site", "sandbox.square.site"].includes(url.hostname);
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
  const selectedFulfillment: CheckoutFulfillment = fulfillmentKind === "pickup" ? { kind: "pickup", pickupPointId } : { kind: "shipping", postalCode };
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
      const body = await response.json() as { kind?: string; url?: string; checkoutId?: string; cart?: CartSnapshot; issues?: Array<{ message: string }> };
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
        setMessage(body.issues?.[0]?.message ?? (body.kind === "catalog_mismatch"
          ? "Checkout is paused because the Square catalog does not match the approved price. Your cart is unchanged."
          : body.kind === "empty_cart"
            ? "Your account cart is empty. Add an available object before checking out."
            : "Checkout could not be started. Your cart is unchanged; try again."));
        return;
      }
      window.location.assign(body.url);
    } catch {
      setCheckoutState("error");
      setMessage("Checkout could not be started. Your cart is unchanged; try again.");
    }
  };

  if (!lines.length) {
    return (
      <section className={styles.empty} aria-labelledby="cart-heading">
        <div aria-hidden="true" className={styles.emptyStage} />
        <div>
          <p className={styles.eyebrow}>{"// Cart / Empty"}</p>
          <h1 className="pa-page-title" id="cart-heading">Your cart is empty.</h1>
        </div>
        <Link href="/shop">Browse Shop</Link>
      </section>
    );
  }

  return (
    <section className={styles.panel} aria-labelledby="cart-heading">
      <header className={styles.header}>
        <div><p className={styles.eyebrow}>{"// Cart / Order review"}</p><h1 className="pa-page-title" id="cart-heading">Your cart</h1></div>
        <p>Review the object, finish, and fulfillment details before moving to secure Square checkout.</p>
      </header>
      <div className={styles.layout}>
        <div>
          <ul className={styles.lines}>
            {lines.map((line) => (
              <li className={styles.line} key={line.id}>
                <div aria-hidden="true" className={styles.media}><span className={styles.mediaLabel}>Object / {line.productId}</span></div>
                <div className={styles.lineBody}>
                  <h2>{line.name}</h2>
                  <p className={styles.itemMeta}>{line.finish} · {line.colour} · {formatMoney(line.unitPrice)} each</p>
                </div>
                <div className={styles.lineActions}>
                  <label className={styles.quantity} htmlFor={`quantity-${line.id}`}>
                    <span className={styles.fieldLabel}>Quantity</span>
                    <select id={`quantity-${line.id}`} onChange={(event) => cart.updateQuantity(line.id, Number(event.target.value))} value={line.quantity}>
                      {Array.from({ length: Math.min(10, line.maximumQuantity) }, (_, index) => index + 1).map((quantity) => <option key={quantity} value={quantity}>{quantity}</option>)}
                    </select>
                  </label>
                  <button className={styles.remove} onClick={() => cart.remove(line.id)} type="button">Remove</button>
                </div>
              </li>
            ))}
          </ul>

          <fieldset className={styles.fulfillment}>
            <legend>Fulfillment</legend>
            <div className={styles.choices}>
              <label className={styles.choice}>
                <input checked={fulfillmentKind === "pickup"} name="fulfillment" onChange={() => setFulfillmentKind("pickup")} type="radio" />
                <span><strong>Pickup</strong><span>Choose a confirmed Printaway pickup point.</span></span>
              </label>
              <label className={styles.choice}>
                <input checked={fulfillmentKind === "shipping"} name="fulfillment" onChange={() => setFulfillmentKind("shipping")} type="radio" />
                <span><strong>Shipping</strong><span>Available within approved postal-code areas.</span></span>
              </label>
            </div>
            {fulfillmentKind === "pickup" ? (
              <label className={styles.fulfillmentField} htmlFor="pickup-point">
                Pickup point
                <select id="pickup-point" onChange={(event) => setPickupPointId(event.target.value as typeof pickupPointId)} value={pickupPointId}>
                  {pickupPoints.map((point) => <option key={point.id} value={point.id}>{point.label} — {point.address}</option>)}
                </select>
              </label>
            ) : (
              <label className={styles.fulfillmentField} htmlFor="shipping-postal-code">
                Shipping postal code
                <input autoComplete="postal-code" id="shipping-postal-code" onChange={(event) => setPostalCode(event.target.value)} placeholder="N2L 3G1" value={postalCode} />
                <small>Shipping is available in N2L, L3R, and M4Y. Square will collect the full address.</small>
              </label>
            )}
          </fieldset>
        </div>

        <aside className={styles.summaryPanel} aria-label="Order summary">
          <p className={styles.eyebrow}>{"// Checkout"}</p>
          <h2>Order summary</h2>
          <dl className={styles.summary}>
            <dt>Merchandise subtotal</dt><dd>{formatMoney(subtotal)}</dd>
            <dt>Shipping</dt><dd>{shippingFee.amountMinor ? formatMoney(shippingFee) : "Free"}</dd>
            <dt className={styles.total}>Total before tax</dt>
            <dd className={styles.total}>{formatMoney({ amountMinor: subtotal.amountMinor + shippingFee.amountMinor, currency: "CAD" })}</dd>
          </dl>
          <p className={styles.terms}>Sandbox checkout has no taxes. By continuing, you acknowledge the <Link href="/policies/shipping">shipping and pickup terms</Link>, <Link href="/policies/returns">refund terms</Link>, and <Link href="/policies/cancellation">cancellation terms</Link>.</p>
          {!signedIn ? (
            <Link className={styles.signIn} href="/api/auth/signin/google?callbackUrl=%2Fcart">Sign in with Google to checkout</Link>
          ) : (
            <button className={styles.checkout} disabled={checkoutState === "submitting"} onClick={beginCheckout} type="button">{checkoutState === "submitting" ? "Preparing Square checkout" : "Continue to checkout"}</button>
          )}
          <p aria-live="polite" className={styles.status} role="status">{message}</p>
          <button className={styles.clear} onClick={() => cart.clear()} type="button">Clear cart</button>
        </aside>
      </div>
    </section>
  );
}
