"use client";

import { useState } from "react";

import { useCart } from "@/features/cart/ui/browser-cart-store";
import { formatMoney, type Money } from "@/lib/currency/money";

import styles from "./purchase-panel.module.css";

type PurchasePanelProps = {
  productId: string;
  name: string;
  colours: readonly string[];
  finishes: readonly string[];
  unitPrice: Money;
  maximumQuantity: number;
};

export function PurchasePanel({ productId, name, colours, finishes, unitPrice, maximumQuantity }: PurchasePanelProps) {
  const cart = useCart();
  const [finish, setFinish] = useState(finishes[0] ?? "Default");
  const [colour, setColour] = useState(colours[0] ?? "white");
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("");

  const addToCart = () => {
    cart.add({ productId, name, finish, colour, quantity, maximumQuantity, unitPrice });
    setStatus(`Added ${name} to cart.`);
  };

  return (
    <fieldset className={styles.panel}>
      <legend className={styles.legend}>Select a configuration</legend>
      <div className={styles.fields}>
        <label className={styles.field} htmlFor="finish">
          <span>Finish</span>
          <span className={styles.selectWrap}>
            <select id="finish" onChange={(event) => setFinish(event.target.value)} value={finish}>
              {finishes.map((item) => <option key={item}>{item}</option>)}
            </select>
          </span>
        </label>
        <label className={styles.field} htmlFor="colour">
          <span>Colour</span>
          <span className={styles.selectWrap}>
            <select id="colour" onChange={(event) => setColour(event.target.value)} value={colour}>
              {colours.map((item) => <option key={item}>{item}</option>)}
            </select>
          </span>
        </label>
        <label className={styles.field} htmlFor="quantity">
          <span>Quantity</span>
          <span className={styles.selectWrap}>
            <select id="quantity" onChange={(event) => setQuantity(Number(event.target.value))} value={quantity}>
              {Array.from({ length: Math.min(10, maximumQuantity) }, (_, index) => index + 1).map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </span>
        </label>
      </div>
      <p className={styles.helper}>{formatMoney(unitPrice)} per object · {maximumQuantity} available</p>
      <button className={styles.action} onClick={addToCart} type="button">Add to cart</button>
      <p aria-atomic="true" aria-live="polite" className={styles.status} role="status">{status}</p>
    </fieldset>
  );
}
