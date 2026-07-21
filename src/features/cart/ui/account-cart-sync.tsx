"use client";

import { useEffect } from "react";

import { CartStore, type CartSnapshot } from "../domain/cart";
import { useCart } from "./browser-cart-store";

const synchronizedAccountKey = "printaway-account-cart-subject-v1";

function mergeSnapshots(first: CartSnapshot, second: CartSnapshot): CartSnapshot {
  const merged = new CartStore();
  first.lines.forEach((line) => merged.add(line));
  second.lines.forEach((line) => merged.add(line));
  return merged.getSnapshot();
}

export function AccountCartSync({ accountId }: { accountId: string | null }) {
  const cart = useCart();

  useEffect(() => {
    if (!accountId) {
      if (window.sessionStorage.getItem(synchronizedAccountKey)) {
        cart.clear();
        window.sessionStorage.removeItem(synchronizedAccountKey);
      }
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const current = await fetch("/api/cart");
        if (!current.ok) return;
        const server = await current.json() as CartSnapshot;
        const alreadySynchronized = window.sessionStorage.getItem(synchronizedAccountKey) === accountId;
        const next = alreadySynchronized ? server : mergeSnapshots(server, cart.getSnapshot());
        const response = alreadySynchronized
          ? { ok: true, json: async () => next }
          : await fetch("/api/cart", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(next) });
        if (!response.ok || cancelled) return;
        const persisted = await response.json() as CartSnapshot;
        if (cancelled) return;
        cart.replace(persisted);
        window.sessionStorage.setItem(synchronizedAccountKey, accountId);
      } catch {
        // Keep the local cart intact; the next mount can retry without losing it.
      }
    })();
    return () => { cancelled = true; };
  }, [accountId, cart]);

  return null;
}
