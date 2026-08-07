import { CartPanel } from "@/features/cart/ui/cart-panel";
import { getAccountSession } from "@/server/auth/account-session";

export const metadata = { title: "Cart" };

export default async function CartPage() {
  const account = await getAccountSession();
  return <section className="pa-page-shell"><CartPanel signedIn={Boolean(account)} /></section>;
}
