import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-7xl px-3 py-24 sm:px-6 lg:px-12">
      <p className="font-mono text-sm tracking-[0.16em] text-aluminum">404 / NOT FOUND</p>
      <h1 className="mt-3 font-display text-5xl tracking-[-0.05em] text-bone">This object is not here.</h1>
      <Link className="mt-8 inline-block bg-cure-violet px-3 py-2 font-mono text-sm font-semibold text-void focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cure-violet" href="/">
        Return home
      </Link>
    </section>
  );
}
