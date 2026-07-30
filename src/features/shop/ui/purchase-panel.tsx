"use client";

import { useState } from "react";

import { useCart } from "@/features/cart/ui/browser-cart-store";
import { formatMoney, type Money } from "@/lib/currency/money";

import { priceForPrintFinishOption, type PrintFinishOption } from "../domain/initial-catalog";
import styles from "./purchase-panel.module.css";

type PurchasePanelProps = {
  productId: string;
  name: string;
  colours: readonly string[];
  finishOptions: readonly PrintFinishOption[];
  basePrice: Money;
  maximumQuantity: number;
};

type SelectedFinish = { option: PrintFinishOption; unitPrice: Money } | null;

function selectFinish(basePrice: Money, finishOptions: readonly PrintFinishOption[], name: string): SelectedFinish {
  const option = finishOptions.find((candidate) => candidate.name === name);
  return option ? { option, unitPrice: priceForPrintFinishOption(basePrice, option) } : null;
}

export function PurchasePanel({ productId, name, colours, finishOptions, basePrice, maximumQuantity }: PurchasePanelProps) {
  const cart = useCart();
  const [selectedFinish, setSelectedFinish] = useState<SelectedFinish>(() => selectFinish(basePrice, finishOptions, "Standard") ?? selectFinish(basePrice, finishOptions, finishOptions[0]?.name ?? ""));
  const [colour, setColour] = useState(colours[0] ?? "white");
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("");

  const addToCart = () => {
    if (!selectedFinish) return;
    cart.add({ productId, name, finish: selectedFinish.option.name, colour, quantity, maximumQuantity, unitPrice: selectedFinish.unitPrice });
    setStatus(`Added ${name} to cart.`);
  };

  return (
    <fieldset className={styles.panel}>
      <legend className={styles.legend}>Select a configuration</legend>
      <div className={styles.fields}>
        <label className={styles.field} htmlFor="finish">
          <span>Print Finish</span>
          <span className={styles.selectWrap}>
            <select
              id="finish"
              onChange={(event) => {
                setSelectedFinish(selectFinish(basePrice, finishOptions, event.target.value));
              }}
              value={selectedFinish?.option.name ?? ""}
            >
              {finishOptions.map((option) => <option key={option.name} value={option.name}>{option.surcharge.amountMinor ? `${option.name} (+${formatMoney(option.surcharge)})` : `${option.name} (included)`}</option>)}
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
      <p className={styles.helper}>{formatMoney(selectedFinish?.unitPrice ?? basePrice)} per object · {maximumQuantity} available</p>
      <button className={styles.action} onClick={addToCart} type="button">Add to cart</button>
      <p aria-atomic="true" aria-live="polite" className={styles.status} role="status">{status}</p>
    </fieldset>
  );
}
