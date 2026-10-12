import { Container } from '@/components/Container';

export const DataLakePage = () => {
  return (
    <Container
      as="section"
      className="flex max-w-3xl flex-col gap-3 pt-10 pb-16 sm:pt-14 sm:pb-20"
    >
      <h1 className="font-heading text-4xl leading-[1.05] font-bold tracking-[-0.035em] sm:text-5xl">
        Data Lake
      </h1>
      <p className="text-lg text-pretty text-muted-foreground">
        Search anything that is mapped on the site: Pokémon, trainers, items,
        places and more. Coming soon.
      </p>
    </Container>
  );
};
