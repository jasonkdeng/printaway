"use client";

import { useSyncExternalStore } from "react";

import { CartStore, type CartLine, type CartSnapshot } from "../domain/cart";

const STORAGE_KEY = "printaway-cart-v1";
const EMPTY_CART: CartSnapshot = { lines: [] };

let store: CartStore | undefined;

function getStore(): CartStore {
  if (store) return store;

  store = new CartStore();
  if (typeof window !== "undefined") {
    try {
      const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? "null") as CartSnapshot | null;
      saved?.lines.forEach((line) => store?.add(line));
    } catch {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
    store.subscribe(() => window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store?.getSnapshot())));
  }
  return store;
}

export function useCart(): CartStore {
  const cart = getStore();
  useSyncExternalStore(cart.subscribe, cart.getSnapshot, () => EMPTY_CART);
  return cart;
}

export function cartLineCount(lines: readonly CartLine[]): number {
  return lines.reduce((count, line) => count + line.quantity, 0);
}
