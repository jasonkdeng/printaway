import type { CartLine, CartSnapshot } from "../domain/cart";
import { CartStore } from "../domain/cart";

export interface CartRepository {
  read(accountId: string): Promise<CartSnapshot>;
  replace(accountId: string, lines: readonly CartLine[]): Promise<CartSnapshot>;
}

export function normalizeCartLines(lines: readonly CartLine[]): CartSnapshot {
  const cart = new CartStore();
  for (const line of lines) {
    if (line.maximumQuantity < 1) continue;
    cart.add(line);
  }
  return cart.getSnapshot();
}
