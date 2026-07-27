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
      <nav aria-label="Primary" className="grid w-full gap-1 px-3 py-2 sm:px-6 lg:px-12 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:items-center">
        <Link aria-label="Printaway home" className="inline-flex h-6 w-fit shrink-0 justify-self-start self-center items-center px-2 font-display text-[1.75rem] lowercase leading-none tracking-[-0.06em] text-bone focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-cure-violet" href="/">
          printaway
        </Link>
        <div className="order-3 flex w-full flex-wrap items-center justify-center gap-1 justify-self-center xl:order-none xl:w-fit" data-testid="header-navigation">
          {links.map((link) => (
            <Link className={headerNavigationControlClassName} href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="order-2 flex w-fit flex-wrap items-center justify-end gap-1 justify-self-end xl:order-none" data-testid="header-actions">
          <Link className={headerNavigationControlClassName} href="/cart">
            Cart
          </Link>
          <AccountControl account={account} authenticationAvailable={authenticationAvailable} />
        </div>
      </nav>
    </header>
  );
}
