import { useSearchParams } from 'react-router';

import { Container } from '@/components/Container';
import { PageTitle } from '@/components/PageTitle';
import { ToggleChip } from '@/components/ToggleChip';

import { DatasetExplorer } from './DatasetExplorer';
import { datasets } from './datasets';
import { StatsForNerds } from './StatsForNerds';
import { readExplorerState, writeExplorerState } from './urlState';

export const DataLakePage = () => {
  const [params, setParams] = useSearchParams();
  const dataset =
    datasets.find(({ id }) => id === params.get('dataset')) ?? datasets[0];

  const selectDataset = (target: (typeof datasets)[number]) => {
    const { filters } = readExplorerState(params, dataset.columns);
    const carried = filters.filter(({ column }) =>
      target.columns.some(({ id }) => id === column),
    );
    const next = writeExplorerState(new URLSearchParams(), {
      query: '',
      filters: carried,
    });

    next.set('dataset', target.id);
    setParams(next);
  };

  return (
    <Container
      as="section"
      size="wide"
      className="flex flex-col gap-10 pt-10 pb-16 sm:pt-14 sm:pb-20"
    >
      <header className="flex flex-col gap-3">
        <PageTitle>Data Lake</PageTitle>
        <p className="max-w-[60ch] text-lg text-pretty text-muted-foreground">
          Every trainer, item, sign and Pokémon we&apos;ve mapped, in one big
          spreadsheet. Built for Pokémaniac nerds.
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
          {datasets.map((entry) => (
            <ToggleChip
              key={entry.id}
              pressed={entry.id === dataset.id}
              onClick={() => selectDataset(entry)}
            >
              {entry.label}
            </ToggleChip>
          ))}
        </div>
        <DatasetExplorer key={dataset.id} dataset={dataset} />
      </section>
    </Container>
  );
};
