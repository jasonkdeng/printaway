"use client";

export default function ShopError({ reset }: { reset: () => void }) {
  return (
    <section className="px-3 py-12 sm:px-6 lg:px-12">
      <h1 className="font-display text-4xl text-bone">Products couldn&apos;t be loaded.</h1>
      <button className="mt-5 bg-cure-violet px-3 py-2 font-mono text-sm font-semibold text-void" onClick={reset} type="button">Try again</button>
    </section>
  );
}
