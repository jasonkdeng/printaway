import Link from "next/link";

import type { AccountSession } from "@/server/auth/account-session";

import { AccountControl } from "./account-control";
import { headerNavigationControlClassName } from "./header-control-styles";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/studio", label: "Studio" },
  { href: "/materials", label: "Materials" },
  { href: "/about", label: "About" },
];

export function SiteHeader({ account, authenticationAvailable }: { account: AccountSession | null; authenticationAvailable: boolean }) {
  return (
    <header className="border-b border-graphite">
      <nav aria-label="Primary" className="mx-auto grid max-w-7xl gap-2 px-3 py-2 sm:px-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center lg:px-12">
        <Link aria-label="Printaway home" className="inline-flex h-6 w-fit shrink-0 self-center items-center px-2 font-display text-[1.75rem] lowercase leading-none tracking-[-0.06em] text-bone focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-cure-violet" href="/">
          printaway
        </Link>
        <div className="flex flex-wrap items-center justify-start gap-1 lg:justify-end">
          {links.map((link) => (
            <Link className={headerNavigationControlClassName} href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
          <Link className={headerNavigationControlClassName} href="/cart">
            Cart
          </Link>
          <AccountControl account={account} authenticationAvailable={authenticationAvailable} />
        </div>
      </nav>
    </header>
  );
}
