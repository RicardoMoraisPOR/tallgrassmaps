import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

import { getCover } from '@/data/covers';
import type { Game } from '@/data/games';
import { generationHref } from '@/lib/paths';
import { cn } from '@/lib/utils';

export type Crumb = {
  name: string;
  href: string;
};

type PageHeaderProps = {
  game: Game;
  ancestors?: Array<Crumb>;
  title: string;
};

export const PageHeader = ({
  game,
  ancestors = [],
  title,
}: PageHeaderProps) => {
  const steps: Array<Crumb> = [
    { name: game.name, href: generationHref(game.generation) },
    ...ancestors,
  ];
  const folded = (index: number) => index > 0 && index < steps.length - 1;
  const hasFolded = steps.some((_, index) => folded(index));
  const cover = getCover(game.id);

  return (
    <header className="flex items-center gap-4 sm:gap-5">
      {cover && (
        <img
          src={cover}
          alt={`${game.name} box art`}
          className="h-18 w-auto flex-none rounded-md border shadow-[0_8px_20px_-10px_oklch(0_0_0/0.45)] sm:h-24"
        />
      )}
      <div className="flex min-w-0 flex-col gap-2">
        <nav aria-label="Breadcrumb">
          <ol className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-muted-foreground">
            {steps.map((step, index) => (
              <li
                key={step.href}
                className={cn(
                  'items-center gap-1.5',
                  folded(index) ? 'hidden sm:flex' : 'flex',
                )}
              >
                <Link
                  to={step.href}
                  className="flex items-center gap-2 rounded-sm underline-offset-3 hover:text-foreground hover:underline"
                >
                  {index === 0 && (
                    <span
                      aria-hidden
                      className="size-2 rounded-full"
                      style={{ background: game.colors[0] }}
                    />
                  )}
                  {step.name}
                </Link>
                <Separator
                  className={cn(
                    index === steps.length - 1 && 'hidden sm:block',
                  )}
                />
                {index === 0 && hasFolded && (
                  <span
                    aria-hidden
                    className="flex items-center gap-1.5 sm:hidden"
                  >
                    …
                    <Separator />
                  </span>
                )}
              </li>
            ))}
            <li className="hidden sm:block">
              <span aria-current="page" className="font-medium text-foreground">
                {title}
              </span>
            </li>
          </ol>
        </nav>
        <h1 className="font-heading text-4xl leading-[1.05] font-bold tracking-[-0.035em] sm:text-5xl">
          {title}
        </h1>
      </div>
    </header>
  );
};

const Separator = ({ className }: { className?: string }) => {
  return (
    <ChevronRight
      aria-hidden
      className={cn('size-3.5 opacity-60', className)}
    />
  );
};
