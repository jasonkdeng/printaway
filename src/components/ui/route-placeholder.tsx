type RoutePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function RoutePlaceholder({ eyebrow, title, description }: RoutePlaceholderProps) {
  return (
    <section className="pa-page-shell min-h-[50vh]">
      <div className="pa-state-panel">
        <p className="font-mono text-sm tracking-[0.16em] text-aluminum">{eyebrow}</p>
        <h1 className="pa-page-title mt-3 text-bone">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-aluminum">{description}</p>
      </div>
    </section>
  );
}
