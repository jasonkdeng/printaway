import { z } from "zod";

import { CheckoutReturnStatus } from "@/features/cart/ui/checkout-return-status";

export const metadata = { title: "Order status" };

export default async function CheckoutReturnPage({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const parsed = z.uuid().safeParse((await searchParams).checkout);
  return <CheckoutReturnStatus checkoutId={parsed.success ? parsed.data : null} />;
}
