export const metadata = { title: "Materials" };

export default function MaterialsPage() {
  return (
    <main className="pa-page-shell">
      <header className="pa-page-intro">
        <p className="font-mono text-sm tracking-[0.16em] text-aluminum">{"// Materials"}</p>
        <h1 className="pa-page-title mt-3 text-bone">Material reference</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-aluminum">Current Shop objects are intended for indoor use. Avoid high heat and expect normal printed layer and colour variation.</p>
      </header>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <section className="border border-[var(--pa-edge-subtle)] bg-graphite p-5 shadow-[var(--pa-shadow-inset)]" id="pla" aria-labelledby="pla-heading">
          <p className="font-mono text-sm tracking-[0.16em] text-cure-violet">PLA</p>
          <h2 id="pla-heading" className="mt-3 font-display text-3xl tracking-[-0.04em] text-bone">Keep below 60°C</h2>
          <p className="mt-3 max-w-prose leading-7 text-aluminum">Keep finished PLA objects away from environments and surfaces above 60°C.</p>
        </section>
        <section className="border border-[var(--pa-edge-subtle)] bg-graphite p-5 shadow-[var(--pa-shadow-inset)]" id="abs" aria-labelledby="abs-heading">
          <p className="font-mono text-sm tracking-[0.16em] text-cure-violet">ABS</p>
          <h2 id="abs-heading" className="mt-3 font-display text-3xl tracking-[-0.04em] text-bone">Keep below 80°C</h2>
          <p className="mt-3 max-w-prose leading-7 text-aluminum">Keep finished ABS objects away from environments and surfaces above 80°C.</p>
        </section>
      </div>
    </main>
  );
}
