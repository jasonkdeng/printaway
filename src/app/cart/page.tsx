import { CartPanel } from "@/features/cart/ui/cart-panel";

export const metadata = { title: "Cart" };

export default function CartPage() {
  return <section className="mx-auto max-w-5xl px-3 py-12 sm:px-6 lg:px-12"><CartPanel /></section>;
}
