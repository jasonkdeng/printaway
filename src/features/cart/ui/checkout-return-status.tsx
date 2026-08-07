"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useCart } from "./browser-cart-store";

type DisplayStatus = "checking" | "pending" | "paid" | "cancelled" | "failed" | "unavailable";

export function CheckoutReturnStatus({ checkoutId }: { checkoutId: string | null }) {
  const cart = useCart();
  const [status, setStatus] = useState<DisplayStatus>(checkoutId ? "checking" : "unavailable");

  useEffect(() => {
    if (!checkoutId) return;
    let cancelled = false;
    let attempts = 0;
    const check = async () => {
      try {
        const response = await fetch(`/api/checkout/status?checkout=${encodeURIComponent(checkoutId)}`, { cache: "no-store" });
        if (!response.ok) {
          if (!cancelled) setStatus("unavailable");
          return;
        }
        const body = await response.json() as { status: "pending" | "paid" | "cancelled" | "failed" | "refunded" };
        if (cancelled) return;
        if (body.status === "paid") {
          const cartResponse = await fetch("/api/cart", { cache: "no-store" });
          if (cartResponse.ok && !cancelled) cart.replace(await cartResponse.json());
          setStatus("paid");
          return;
        }
        if (body.status === "cancelled" || body.status === "failed") {
          setStatus(body.status);
          return;
        }
        attempts += 1;
        if (attempts < 10) {
          setStatus("pending");
          window.setTimeout(check, 2000);
        } else {
          setStatus("pending");
        }
      } catch {
        if (!cancelled) setStatus("unavailable");
      }
    };
    void check();
    return () => { cancelled = true; };
  }, [cart, checkoutId]);

  const copy = {
    checking: "Checking the verified payment status.",
    pending: "Payment confirmation is still pending. Do not submit the order again. Refresh this page shortly.",
    paid: "Payment confirmed. The purchased items have been removed from your account cart.",
    cancelled: "The payment was cancelled. Your cart remains available.",
    failed: "The payment did not complete. Your cart remains available.",
    unavailable: "The payment status could not be verified. Check that you are signed in with the same account, then try again.",
  }[status];

  return (
    <section className="pa-page-shell">
      <div className="pa-state-panel">
        <p className="font-mono text-sm tracking-[0.16em] text-aluminum">{"// Square checkout"}</p>
        <h1 className="pa-page-title mt-3">{status === "paid" ? "Payment confirmed." : "Order status."}</h1>
        <p aria-live="polite" className="mt-5 max-w-prose text-lg leading-8 text-aluminum" role="status">{copy}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="min-h-11 border border-bone px-5 py-3 font-mono text-sm text-bone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cure-violet" href="/cart">Return to cart</Link>
          <Link className="min-h-11 border border-graphite px-5 py-3 font-mono text-sm text-bone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cure-violet" href="/shop">Return to Shop</Link>
        </div>
      </div>
    </section>
  );
}
