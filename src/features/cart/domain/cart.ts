import type { Money } from "@/lib/currency/money";

export type CartLine = {
  id: string;
  productId: string;
  name: string;
  finish: string;
  colour: string;
  quantity: number;
  maximumQuantity: number;
  unitPrice: Money;
};

export type CartLineInput = Omit<CartLine, "id">;
export type CartSnapshot = { lines: readonly CartLine[] };

const EMPTY_CART: CartSnapshot = { lines: [] };

function lineId(input: Pick<CartLineInput, "productId" | "finish" | "colour">): string {
  return `${input.productId}:${input.finish}:${input.colour}`;
}

function validQuantity(quantity: number, maximumQuantity: number): number {
  return Math.max(1, Math.min(10, maximumQuantity, quantity));
}

export function cartSubtotal(lines: readonly CartLine[]): Money {
  return {
    amountMinor: lines.reduce((subtotal, line) => subtotal + line.unitPrice.amountMinor * line.quantity, 0),
    currency: "CAD",
  };
}

export class CartStore {
  private snapshot: CartSnapshot = EMPTY_CART;
  private readonly listeners = new Set<() => void>();

  public getSnapshot = (): CartSnapshot => this.snapshot;

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  public add(input: CartLineInput): void {
    const id = lineId(input);
    const existing = this.snapshot.lines.find((line) => line.id === id);
    const quantity = validQuantity((existing?.quantity ?? 0) + input.quantity, input.maximumQuantity);
    const line: CartLine = { ...input, id, quantity };
    this.setSnapshot({ lines: existing ? this.snapshot.lines.map((item) => item.id === id ? line : item) : [...this.snapshot.lines, line] });
  }

  public updateQuantity(id: string, quantity: number): void {
    this.setSnapshot({ lines: this.snapshot.lines.map((line) => line.id === id ? { ...line, quantity: validQuantity(quantity, line.maximumQuantity) } : line) });
  }

  public remove(id: string): void {
    this.setSnapshot({ lines: this.snapshot.lines.filter((line) => line.id !== id) });
  }

  public clear(): void {
    this.setSnapshot(EMPTY_CART);
  }

  public replace(snapshot: CartSnapshot): void {
    this.setSnapshot({ lines: [...snapshot.lines] });
  }

  private setSnapshot(snapshot: CartSnapshot): void {
    this.snapshot = snapshot;
    this.listeners.forEach((listener) => listener());
  }
}
