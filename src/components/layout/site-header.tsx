import Link from "next/link";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/studio", label: "Studio" },
  { href: "/materials", label: "Materials" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-graphite">
      <nav aria-label="Primary" className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-6 lg:px-12">
        <Link aria-label="Printaway home" className="font-display text-2xl lowercase tracking-[-0.06em] text-bone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cure-violet" href="/">
          printaway
        </Link>
        <div className="flex flex-wrap justify-end gap-x-3 gap-y-1 font-mono text-sm text-aluminum sm:gap-x-5">
          {links.map((link) => (
            <Link className="hover:text-bone focus-visible:text-bone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cure-violet" href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
          <Link className="text-bone hover:text-aluminum focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cure-violet" href="/cart">
            Cart
          </Link>
        </div>
      </nav>
    </header>
  );
}
