import type { PokedexEntry } from '@/data/pokedex/types';
import { megaStoneSprite } from '@/data/sprites';
import { useMegaSprite } from '@/hooks/usePokemonSprite';
import { cn } from '@/lib/utils';

type MegaEvolutionsProps = {
  entry: PokedexEntry;
  compact?: boolean;
};

export const MegaEvolutions = ({
  entry,
  compact = false,
}: MegaEvolutionsProps) => {
  const spriteFor = useMegaSprite();

  if (!entry.megas?.length) return null;

  return (
    <ul aria-label="Mega Evolutions" className="flex w-full flex-col gap-2">
      {entry.megas.map(({ stone, form, dlc }) => {
        const name = `Mega ${entry.name}${form ? ` ${form}` : ''}`;

        return (
          <li
            key={stone}
            className={cn(
              'flex items-center rounded-xl border bg-muted/40',
              compact ? 'gap-2 p-1 pr-2 text-xs' : 'gap-3 p-2 pr-3 text-sm',
            )}
          >
            <img
              src={spriteFor(entry.number, form).src}
              alt={name}
              width={64}
              height={64}
              loading="lazy"
              className={cn(
                'flex-none rounded-lg object-contain',
                compact ? 'size-10' : 'size-16',
              )}
            />
            <span className="min-w-0 flex-1">
              Evolves to <span className="font-bold">{name}</span> with{' '}
              <span className="font-bold">{stone}</span>
              {dlc && (
                <span className="block text-xs text-muted-foreground">
                  Only available in the Mega Dimension DLC
                </span>
              )}
            </span>
            <img
              src={megaStoneSprite(stone)}
              alt=""
              width={32}
              height={32}
              loading="lazy"
              className={cn(
                'flex-none object-contain',
                compact ? 'size-5' : 'size-8',
              )}
            />
          </li>
        );
      })}
    </ul>
  );
};
