import { useState } from 'react';

import { Container } from '@/components/Container';
import { ToggleChip } from '@/components/ToggleChip';

import { DatasetExplorer } from './DatasetExplorer';
import { datasets } from './datasets';
import { StatsForNerds } from './StatsForNerds';

export const DataLakePage = () => {
  const [datasetId, setDatasetId] = useState(datasets[0].id);
  const dataset = datasets.find(({ id }) => id === datasetId) ?? datasets[0];

  return (
    <Container
      as="section"
      className="flex max-w-7xl flex-col gap-10 pt-10 pb-16 sm:pt-14 sm:pb-20"
    >
      <header className="flex flex-col gap-3">
        <h1 className="font-heading text-4xl leading-[1.05] font-bold tracking-[-0.035em] sm:text-5xl">
          Data Lake
        </h1>
        <p className="max-w-[60ch] text-lg text-pretty text-muted-foreground">
          Every trainer, item, sign and Pokémon we&apos;ve mapped, in one big
          spreadsheet. Built for Pokémaniac nerds. (Yes, there&apos;s a CSV
          export. No, we won&apos;t judge.)
        </p>
      </header>
      <StatsForNerds />
      <section
        aria-labelledby="explorer-heading"
        className="flex flex-col gap-5"
      >
        <h2
          id="explorer-heading"
          className="text-xs font-semibold tracking-[0.14em] text-brand uppercase"
        >
          Explore the data
        </h2>
        <div
          role="group"
          aria-label="Dataset"
          className="flex flex-wrap gap-1.5"
        >
          {datasets.map(({ id, label }) => (
            <ToggleChip
              key={id}
              pressed={id === dataset.id}
              onClick={() => setDatasetId(id)}
            >
              {label}
            </ToggleChip>
          ))}
        </div>
        <DatasetExplorer key={dataset.id} dataset={dataset} />
      </section>
    </Container>
  );
};
