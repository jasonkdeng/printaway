"use client";

export default function ShopError({ reset }: { reset: () => void }) {
  return (
    <section className="pa-page-shell">
      <div className="pa-state-panel">
        <p className="font-mono text-sm tracking-[0.16em] text-aluminum">{"// Shop / Request error"}</p>
        <h1 className="mt-3 font-display text-4xl text-bone">Products couldn&apos;t be loaded.</h1>
        <button className="mt-5 min-h-11 bg-cure-violet px-4 py-2 font-mono text-sm font-semibold text-void focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cure-violet" onClick={reset} type="button">Try again</button>
      </div>
    </section>
  );
}
