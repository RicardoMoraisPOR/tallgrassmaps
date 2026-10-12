import { useState } from 'react';

import { Container } from '@/components/Container';
import { Button } from '@/components/ui/button';
import { changelog } from '@/data/changelog';

const PAGE_SIZE = 3;
const STAGGER_SECONDS = 0.07;

const dateFormat = new Intl.DateTimeFormat('en', { dateStyle: 'long' });

const formatDate = (date: string) =>
  dateFormat.format(new Date(`${date}T00:00:00`));

export const ChangelogPage = () => {
  const [shown, setShown] = useState(PAGE_SIZE);
  return (
    <Container
      as="section"
      className="flex max-w-3xl flex-col gap-12 pt-10 pb-16 sm:pt-14 sm:pb-20"
    >
      <header className="flex flex-col gap-3">
        <h1 className="font-heading text-4xl leading-[1.05] font-bold tracking-[-0.035em] sm:text-5xl">
          Changelog
        </h1>
        <p className="text-lg text-pretty text-muted-foreground">
          Everything that has changed on the site.
        </p>
      </header>

      {changelog.slice(0, shown).map((entry, index) => (
        <article
          key={entry.version}
          className="flex animate-in flex-col gap-4 border-t pt-8 duration-450 ease-out fill-mode-backwards fade-in slide-in-from-bottom-12"
          style={{
            animationDelay: `${(index % PAGE_SIZE) * STAGGER_SECONDS}s`,
          }}
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-6 shrink-0 items-center rounded-full bg-[oklch(0.39_0.08_150)] px-2.5 text-xs font-semibold text-[oklch(0.9_0.1_145)] tabular-nums">
                v{entry.version}
              </span>
              <h2 className="text-2xl font-semibold tracking-tight">
                {entry.title}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              <time dateTime={entry.date}>{formatDate(entry.date)}</time>
            </p>
          </div>
          {entry.intro && (
            <p className="text-pretty text-muted-foreground">{entry.intro}</p>
          )}
          <ul className="flex list-disc flex-col gap-2 pl-5 text-pretty marker:text-brand">
            {entry.changes.map((change) => (
              <li key={change}>{change}</li>
            ))}
          </ul>
        </article>
      ))}

      {shown < changelog.length && (
        <Button
          variant="outline"
          className="self-center"
          onClick={() => setShown((current) => current + PAGE_SIZE)}
        >
          Load more
        </Button>
      )}
    </Container>
  );
};
