import { StudioStepList } from "@/features/studio/ui/studio-step-list";

export const metadata = { title: "Studio" };

export default function StudioPage() {
  return (
    <section className="mx-auto max-w-7xl px-3 py-12 sm:px-6 lg:px-12">
      <p className="font-mono text-sm tracking-[0.16em] text-aluminum">STUDIO / CUSTOM PRINT</p>
      <h1 className="mt-3 font-display text-5xl leading-[0.95] tracking-[-0.05em] text-bone sm:text-6xl">Focused configuration, not a catalog.</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-aluminum">The submission flow will be activated after business confirms its contact, consent, and response requirements.</p>
      <StudioStepList />
    </section>
  );
}
