import { useState } from 'react';

import { MapPinned } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import type { Game } from '@/data/games';
import type { Location, Region } from '@/data/maps';
import { pokedexFor } from '@/data/pokedex';
import { trainersFor } from '@/data/trainers';
import { cn } from '@/lib/utils';

import { encounterGroups } from '../Location/encounters';
import { EncountersTab, OpenPokedexButton } from '../Location/EncountersTab';
import {
  EmptyTab,
  LocationPanel,
  type PanelTab,
} from '../Location/LocationPanel';
import { TrainerDialog } from '../Location/TrainerDialog';
import { battleGroups } from '../Location/trainerList';
import { TrainersTab } from '../Location/TrainersTab';

type ZonePanelProps = {
  game: Game;
  region: Region;
  zone: Location;
  href: (path: string) => string;
  immersive: boolean;
};

export const ZonePanel = ({
  game,
  region,
  zone,
  href,
  immersive,
}: ZonePanelProps) => {
  const [selected, setSelected] = useState<{ zone: string; key?: string }>({
    zone: zone.id,
  });
  const pokedex = pokedexFor(region.versionGroup);
  const trainers = trainersFor(region.versionGroup);
  const encounters = pokedex
    ? encounterGroups(pokedex, { game, path: zone.id })
    : [];
  const trainerGroups = trainers
    ? battleGroups(trainers, { game, path: zone.id, onMapOnly: false })
    : [];
  const listedBattles = trainerGroups.flatMap((group) => group.battles);
  const pokemonCount = new Set(
    encounters.flatMap((group) => group.rows.map((row) => row.entry.number)),
  ).size;
  const selectTrainer = (key: string | undefined) =>
    setSelected({ zone: zone.id, key });
  const noHighlight = () => {};

  const tabs: Array<PanelTab> = [
    {
      id: 'pokemon',
      label: 'Pokémon',
      count: pokemonCount,
      action: <OpenPokedexButton />,
      content:
        pokedex && pokemonCount > 0 ? (
          <EncountersTab
            game={game}
            path={zone.id}
            groups={encounters}
            onHighlight={noHighlight}
          />
        ) : (
          <EmptyTab>No Pokémon to catch here.</EmptyTab>
        ),
    },
    {
      id: 'trainers',
      label: 'Trainers',
      count: listedBattles.length,
      content:
        pokedex && listedBattles.length > 0 ? (
          <TrainersTab
            game={game}
            groups={trainerGroups}
            pokedex={pokedex}
            onHighlight={noHighlight}
            onSelect={selectTrainer}
          />
        ) : (
          <EmptyTab>No trainer battles here.</EmptyTab>
        ),
    },
  ];

  return (
    <>
      <div className="rounded-[14px] border bg-card p-3">
        <Button variant="outline" className="h-10 w-full" asChild>
          <Link to={href('')}>
            <MapPinned aria-hidden />
            Show {region.name}
          </Link>
        </Button>
      </div>
      <LocationPanel
        tabs={tabs}
        className={cn(immersive ? 'min-h-48 flex-1' : 'lg:flex-1')}
      />
      {pokedex && (
        <TrainerDialog
          listed={
            selected.zone === zone.id
              ? listedBattles.find((listed) => listed.key === selected.key)
              : undefined
          }
          battles={listedBattles}
          place={zone.name}
          game={game}
          pokedex={pokedex}
          onSelect={selectTrainer}
          onClose={() => selectTrainer(undefined)}
        />
      )}
    </>
  );
};
