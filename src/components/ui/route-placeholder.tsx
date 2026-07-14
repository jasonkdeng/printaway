type RoutePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function RoutePlaceholder({ eyebrow, title, description }: RoutePlaceholderProps) {
  return (
    <section className="mx-auto min-h-[50vh] max-w-7xl px-3 py-12 sm:px-6 lg:px-12">
      <p className="font-mono text-sm tracking-[0.16em] text-aluminum">{eyebrow}</p>
      <h1 className="mt-3 font-display text-5xl leading-[0.95] tracking-[-0.05em] text-bone sm:text-6xl">{title}</h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-aluminum">{description}</p>
    </section>
  );
}
