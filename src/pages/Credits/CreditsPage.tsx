import type { ReactNode } from 'react';

import { Container } from '@/components/Container';
import {
  type Credit,
  coverCredits,
  dataCredits,
  fontCredits,
  mapCredits,
  softwareCredits,
  spriteCredits,
} from '@/data/credits';
import { SITE_NAME } from '@/data/site';

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
          <h1 className="font-heading text-4xl leading-[1.05] font-bold tracking-[-0.035em] sm:text-5xl">
            Credits
          </h1>
          <p className="text-lg text-pretty text-muted-foreground">
            {SITE_NAME} is built on maps, sprites, research and code that other
            people made and shared. Here is everyone, and what they made.
          </p>
        </div>
      </header>

      <CreditSection id="maps" title="Maps and Town Map art">
        <ul className="grid gap-3 sm:grid-cols-2">
          {mapCredits().map((credit) => (
            <li
              key={`${credit.credit}-${credit.site}`}
              className="flex flex-col gap-2 rounded-[14px] border bg-card p-4"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold">{credit.credit}</span>
                <span className="text-[13px] text-muted-foreground">
                  via {credit.site} · {credit.works.length}{' '}
                  {credit.works.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <details className="text-[13px]">
                <summary className="cursor-pointer text-muted-foreground select-none hover:text-foreground">
                  Show what they made
                </summary>
                <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
                  {credit.works.map((work) => (
                    <li key={work.label}>
                      <ExternalLink href={work.url}>{work.label}</ExternalLink>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ul>
      </CreditSection>

      <CreditSection id="sprites" title="Pokémon sprites">
        <CreditList credits={spriteCredits} />
      </CreditSection>

      <CreditSection id="box-art" title="Box art">
        <CreditList credits={coverCredits} />
      </CreditSection>

      <CreditSection id="data" title="Game data and research">
        <CreditList credits={dataCredits} />
      </CreditSection>

      <CreditSection id="fonts" title="Fonts">
        <CreditList credits={fontCredits} />
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

      <CreditSection id="made-by" title="Made by">
        <p className="text-sm text-muted-foreground">
          {SITE_NAME} is designed and built by{' '}
          <ExternalLink href="https://www.ricardomorais.dev/">
            Ricardo Morais
          </ExternalLink>
          .
        </p>
      </CreditSection>

      <p className="max-w-[70ch] border-t pt-6 text-[13px] text-pretty text-muted-foreground">
        This is a fan project. It isn&apos;t affiliated with Nintendo, Game
        Freak, Creatures Inc. or The Pokémon Company, who own Pokémon and
        everything related to it.
      </p>
    </Container>
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

const CreditList = ({ credits }: { credits: Array<Credit> }) => {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {credits.map((credit) => (
        <li
          key={credit.name}
          className="flex flex-col gap-1 rounded-[14px] border bg-card p-4"
        >
          <ExternalLink href={credit.url} className="font-semibold">
            {credit.name}
          </ExternalLink>
          {credit.by && (
            <span className="text-[13px] text-muted-foreground">
              By {credit.by}
            </span>
          )}
          {credit.detail && (
            <span className="text-[13px] text-pretty text-muted-foreground">
              {credit.detail}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
};

const ExternalLink = ({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`underline underline-offset-3 hover:text-foreground ${className ?? ''}`}
    >
      {children}
    </a>
  );
};
