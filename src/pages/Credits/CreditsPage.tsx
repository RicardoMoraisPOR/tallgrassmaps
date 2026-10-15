import '@fontsource/barlow/400.css';
import '@fontsource/michroma';
import '@fontsource/press-start-2p';
import {
  type CSSProperties,
  lazy,
  type ReactNode,
  Suspense,
  useState,
} from 'react';

import { ChevronRight, ExternalLink as ExternalLinkIcon } from 'lucide-react';

import { Container } from '@/components/Container';
import { PageTitle } from '@/components/PageTitle';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  type Credit,
  type DataCredit,
  type MapCreditGroup,
  coverCredits,
  dataCredits,
  fontCredits,
  mapCredits,
  softwareCredits,
  spriteCredits,
} from '@/data/credits';
import { getGame } from '@/data/games';
import { SITE_NAME } from '@/data/site';
import { cn } from '@/lib/utils';
import { ColorDot } from '@/pages/Game/ColorDot';

import { hasImageGroups } from './imageGroups';

const ImageListDialog = lazy(() => import('./ImageListDialog'));

export const CreditsPage = () => {
  return (
    <Container
      as="section"
      className="flex flex-col gap-12 pt-10 pb-16 sm:pt-14 sm:pb-20"
    >
      <header className="flex items-center gap-5 sm:gap-7">
        <img
          src="/favicon.svg"
          alt=""
          className="size-20 shrink-0 self-start sm:size-28 sm:self-center"
        />
        <div className="flex max-w-[60ch] flex-col gap-3">
          <PageTitle>Credits</PageTitle>
          <p className="text-lg text-pretty text-muted-foreground">
            {SITE_NAME} is built on maps, sprites, research and code that other
            people made and shared. Here is everyone, and what they made.
          </p>
        </div>
      </header>

      <CreditSection id="made-by" title="Made by">
        <p className="text-sm text-muted-foreground">
          {SITE_NAME} is designed and built by{' '}
          <ExternalLink href="https://www.ricardomorais.dev/">
            Ricardo Morais
          </ExternalLink>
          .
        </p>
      </CreditSection>

      <CreditSection id="maps" title="Maps and Town Map art">
        <div className="flex flex-col gap-6">
          {mapCredits().map((group) => (
            <MapCreditGroupSection key={group.id} group={group} />
          ))}
        </div>
      </CreditSection>

      <CreditSection id="sprites" title="Sprites">
        <CreditList credits={spriteCredits} listLabel="View sprites" />
      </CreditSection>

      <CreditSection id="box-art" title="Box art">
        <CreditList credits={coverCredits} listLabel="View box art" />
      </CreditSection>

      <CreditSection id="data" title="Game data and research">
        <CreditRows credits={dataCredits} />
      </CreditSection>

      <CreditSection id="fonts" title="Fonts">
        <CreditList credits={fontCredits} />
        <p className="text-xs text-muted-foreground">
          Fonts are self-hosted through{' '}
          <ExternalLink href="https://fontsource.org/">Fontsource</ExternalLink>
          .
        </p>
      </CreditSection>

      <CreditSection id="software" title="Open-source software">
        <ul className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {softwareCredits.map((credit) => (
            <li
              key={credit.name}
              className="flex items-baseline justify-between gap-3 border-b py-2"
            >
              <ExternalLink href={credit.url}>{credit.name}</ExternalLink>
              <span className="text-xs text-muted-foreground">
                {credit.detail}
              </span>
            </li>
          ))}
        </ul>
      </CreditSection>

      <div className="grid gap-x-12 gap-y-10 border-y py-8 md:grid-cols-2">
        <aside
          aria-labelledby="disclaimer-heading"
          className="flex flex-col gap-3"
        >
          <h2
            id="disclaimer-heading"
            className="text-xs font-semibold tracking-[0.14em] text-brand uppercase"
          >
            Disclaimer
          </h2>
          <p className="max-w-[40ch] font-heading text-xl leading-snug font-bold tracking-[-0.02em] text-balance sm:text-2xl">
            This is a fan project. It isn&apos;t affiliated with Nintendo, Game
            Freak, Creatures Inc. or The Pokémon Company.
          </p>
          <p className="max-w-[60ch] text-sm text-pretty text-muted-foreground">
            They own Pokémon and everything related to it.
          </p>
        </aside>
        <aside
          aria-labelledby="thanks-heading"
          className="flex flex-col gap-3 md:border-l md:pl-12"
        >
          <h2
            id="thanks-heading"
            className="text-xs font-semibold tracking-[0.14em] text-brand uppercase"
          >
            Thank you
          </h2>
          <blockquote className="max-w-[48ch] text-pretty text-muted-foreground">
            &ldquo;This site only exists because so many people mapped,
            documented and shared their work for free. To everyone listed on
            this page: thank you. I hope {SITE_NAME} does your work
            justice.&rdquo;
          </blockquote>
          <p className="font-heading text-lg font-bold tracking-[-0.02em]">
            Ricardo
          </p>
        </aside>
      </div>
    </Container>
  );
};

const MapCreditGroupSection = ({ group }: { group: MapCreditGroup }) => {
  const [open, setOpen] = useState(false);
  const total = group.credits.reduce(
    (sum, credit) => sum + credit.works.length,
    0,
  );

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/40 px-4 py-3">
        <div className="flex items-baseline gap-2">
          <h3 className="font-semibold tracking-tight">{group.title}</h3>
          <span className="text-xs text-muted-foreground tabular-nums">
            {total} {total === 1 ? 'map tile' : 'map tiles'}
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
        >
          See all map tiles
        </Button>
      </div>
      <ul className="divide-y">
        {group.credits.map((credit) => (
          <li
            key={`${credit.credit}-${credit.site}`}
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-4 py-3"
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="font-medium">{credit.credit}</span>
              {credit.note && (
                <span className="max-w-[60ch] text-xs text-pretty text-muted-foreground">
                  {credit.note}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-3 text-xs text-muted-foreground">
              {credit.url ? (
                <ExternalLink href={credit.url}>{credit.site}</ExternalLink>
              ) : (
                <span>{credit.site}</span>
              )}
              <span className="w-24 text-right tabular-nums">
                {credit.works.length}{' '}
                {credit.works.length === 1 ? 'map tile' : 'map tiles'}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[85svh] flex-col gap-5 overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{group.title}</DialogTitle>
            <DialogDescription>
              Everything each person provided.
            </DialogDescription>
          </DialogHeader>
          {group.credits.map((credit) => (
            <section
              key={`${credit.credit}-${credit.site}`}
              className="flex flex-col gap-2"
            >
              <h4 className="text-sm font-semibold">
                {credit.credit}{' '}
                <span className="font-normal text-muted-foreground">
                  · {credit.works.length}
                </span>
              </h4>
              <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
                {credit.works.map((work) => (
                  <li key={work.label}>
                    <ExternalLink href={work.url}>{work.label}</ExternalLink>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const CreditSection = ({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) => {
  return (
    <section aria-labelledby={`${id}-heading`} className="flex flex-col gap-4">
      <h2
        id={`${id}-heading`}
        className="font-heading text-2xl font-bold tracking-[-0.02em]"
      >
        {title}
      </h2>
      {children}
    </section>
  );
};

const CreditRows = ({ credits }: { credits: Array<DataCredit> }) => {
  const byGameCount = credits.toSorted(
    (a, b) => b.games.length - a.games.length,
  );

  return (
    <ul className="divide-y overflow-hidden rounded-xl border bg-card">
      {byGameCount.map((credit) => (
        <DataCreditRow key={credit.name} credit={credit} />
      ))}
    </ul>
  );
};

const GameTags = ({ games }: { games: Array<string> }) =>
  games.map((id) => {
    const game = getGame(id);

    return (
      game && (
        <span
          key={id}
          className="inline-flex h-6 items-center gap-1.5 rounded-full border bg-background px-2.5 text-xs font-medium"
        >
          <ColorDot color={game.colors[0]} />
          {game.shortName}
        </span>
      )
    );
  });

const DataCreditRow = ({ credit }: { credit: DataCredit }) => {
  const [open, setOpen] = useState(false);

  return (
    <li>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
      >
        <span className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <span className="flex min-w-0 flex-col">
            <span className="font-medium">{credit.name}</span>
            {credit.by && (
              <span className="text-xs text-muted-foreground">{credit.by}</span>
            )}
          </span>
          <span className="flex flex-wrap gap-1.5">
            <GameTags games={credit.games} />
          </span>
        </span>
        <ChevronRight
          aria-hidden
          className="size-4 flex-none text-muted-foreground"
        />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[85svh] flex-col gap-5 overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{credit.name}</DialogTitle>
            <DialogDescription>{credit.by}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              What we took from it
            </h4>
            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-pretty marker:text-brand">
              {credit.uses.map((use) => (
                <li key={use}>{use}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Used for
            </h4>
            <div className="flex flex-wrap gap-1.5">
              <GameTags games={credit.games} />
            </div>
          </div>
          <Button asChild>
            <a href={credit.url} target="_blank" rel="noreferrer">
              Visit {credit.name}
              <ExternalLinkIcon aria-hidden />
            </a>
          </Button>
        </DialogContent>
      </Dialog>
    </li>
  );
};

const ImageListButton = ({
  credit,
  label,
}: {
  credit: Credit;
  label: string;
}) => {
  const [requested, setRequested] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-haspopup="dialog"
        className="relative mt-2 w-fit"
        onClick={() => {
          setRequested(true);
          setOpen(true);
        }}
      >
        {label}
      </Button>
      {requested && (
        <Suspense fallback={null}>
          <ImageListDialog
            name={credit.name}
            by={credit.by}
            open={open}
            onOpenChange={setOpen}
          />
        </Suspense>
      )}
    </>
  );
};

const CoverFan = ({ covers }: { covers: Array<string> }) => {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-0 flex w-3/5 items-center justify-end [mask-image:linear-gradient(to_left,black_40%,transparent)] pr-4"
    >
      {covers.map((cover, index) => (
        <img
          key={cover}
          src={cover}
          alt=""
          loading="lazy"
          className="-ml-8 h-24 rounded-sm opacity-80 shadow-lg shadow-black/30 sm:h-28"
          style={{
            rotate: `${(index - (covers.length - 1) / 2) * 7}deg`,
            translate: `0 ${index % 2 === 0 ? -4 : 6}px`,
          }}
        />
      ))}
    </div>
  );
};

const CreditList = ({
  credits,
  listLabel,
}: {
  credits: Array<Credit>;
  listLabel?: string;
}) => {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {credits.map((credit) => (
        <li
          key={credit.name}
          className={`relative flex flex-col gap-1 overflow-hidden rounded-xl border bg-card p-4 ${credit.sprite ? 'pr-24 sm:pr-28' : ''}`}
        >
          {credit.covers && <CoverFan covers={credit.covers} />}
          {credit.sprite && (
            <img
              aria-hidden
              src={credit.sprite.src}
              alt=""
              width={96}
              height={96}
              loading="lazy"
              className={cn(
                'pointer-events-none absolute top-2 right-3 size-16 object-contain sm:size-20',
                credit.sprite.pixelated && 'pixelated',
              )}
            />
          )}
          <ExternalLink
            href={credit.url}
            className="relative w-fit font-semibold"
            style={{ fontFamily: credit.fontFamily }}
          >
            {credit.name}
          </ExternalLink>
          {credit.by && (
            <span className="relative text-xs text-muted-foreground">
              By {credit.by}
            </span>
          )}
          {credit.detail && (
            <span className="relative text-xs text-pretty text-muted-foreground">
              {credit.detail}
            </span>
          )}
          {listLabel && hasImageGroups(credit.name) && (
            <ImageListButton credit={credit} label={listLabel} />
          )}
        </li>
      ))}
    </ul>
  );
};

const ExternalLink = ({
  href,
  className,
  style,
  children,
}: {
  href: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={style}
      className={`underline underline-offset-3 hover:text-foreground ${className ?? ''}`}
    >
      {children}
    </a>
  );
};
