"use client";

import { formatMoney } from "@/lib/currency/money";

import { cartSubtotal } from "../domain/cart";
import { useCart } from "./browser-cart-store";

export function CartPanel() {
  const cart = useCart();
  const { lines } = cart.getSnapshot();

  if (!lines.length) {
    return <section><h1>Your cart is empty.</h1><p>Add an available Shop object to begin.</p></section>;
  }

  return (
    <section aria-labelledby="cart-heading">
      <h1 id="cart-heading">Your cart</h1>
      <ul>
        {lines.map((line) => (
          <li key={line.id}>
            <h2>{line.name}</h2>
            <p>{line.finish} · {line.colour} · {formatMoney(line.unitPrice)}</p>
            <label htmlFor={`quantity-${line.id}`}>Quantity</label>
            <select id={`quantity-${line.id}`} onChange={(event) => cart.updateQuantity(line.id, Number(event.target.value))} value={line.quantity}>
              {Array.from({ length: Math.min(10, line.maximumQuantity) }, (_, index) => index + 1).map((quantity) => <option key={quantity} value={quantity}>{quantity}</option>)}
            </select>
            <button onClick={() => cart.remove(line.id)} type="button">Remove {line.name}</button>
          </li>
        ))}
      </ul>
      <p>Subtotal: {formatMoney(cartSubtotal(lines))}</p>
      <p>Checkout is not available yet.</p>
      <button onClick={() => cart.clear()} type="button">Clear cart</button>
    </section>
  );
}
