import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AccountCartSync } from "@/features/cart/ui/account-cart-sync";
import { getAccountSession } from "@/server/auth/account-session";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Printaway",
    template: "%s | Printaway",
  },
  description: "Small-batch printed objects and custom-print enquiry.",
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const account = await getAccountSession();
  return (
    <html lang="en">
      <body>
        <SiteHeader account={account} />
        <AccountCartSync accountId={account?.accountId ?? null} />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
