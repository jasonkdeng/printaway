import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-graphite">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-3 py-5 font-mono text-sm text-aluminum sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-12">
        <p>Printaway</p>
        <div className="flex gap-4">
          <Link className="hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cure-violet" href="/policies/shipping">Policies</Link>
          <Link className="hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cure-violet" href="/about">About</Link>
        </div>
      </div>
    </footer>
  );
}
