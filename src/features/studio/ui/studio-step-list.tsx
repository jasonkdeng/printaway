import { studioSteps } from "@/features/studio/domain/studio-steps";

export function StudioStepList() {
  return (
    <ol className="mt-10 grid gap-px border border-graphite bg-graphite sm:grid-cols-2 lg:grid-cols-3">
      {studioSteps.map((step, index) => (
        <li className="bg-void p-3" key={step}>
          <p className="font-mono text-sm text-aluminum">STEP {index + 1} OF {studioSteps.length}</p>
          <p className="mt-4 font-display text-2xl tracking-[-0.04em] text-bone">{step}</p>
        </li>
      ))}
    </ol>
  );
}
