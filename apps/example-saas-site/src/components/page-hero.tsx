type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="site-shell py-12">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-[#5e6b66]">{description}</p>
    </section>
  );
}

