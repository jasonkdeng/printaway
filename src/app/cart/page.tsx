import { CartPanel } from "@/features/cart/ui/cart-panel";
import { getAccountSession } from "@/server/auth/account-session";

export const metadata = { title: "Cart" };

export default async function CartPage() {
  const account = await getAccountSession();
  return <section className="mx-auto max-w-5xl px-3 py-12 sm:px-6 lg:px-12"><CartPanel signedIn={Boolean(account)} /></section>;
}
