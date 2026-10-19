import { type ReactNode, useState } from 'react';

import { ThemeOverrideContext } from '@/components/settings/themeOverride';
import { Button } from '@/components/ui/button';
import { getGame } from '@/data/games';
import type { Encounter, EncounterMethod } from '@/data/pokedex/types';
import { shopsFor } from '@/data/shops';
import { rbyStaticPokemon } from '@/data/static-pokemon/rby';
import type { ThemeStyle } from '@/stores/settings';

import type { EncounterGroup } from '../Game/Location/encounters';
import { ItemPopup } from '../Game/Location/ItemPopup';
import { MapTextTooltip } from '../Game/Location/MapTextTooltip';
import { ShopDialog } from '../Game/Location/ShopDialog';
import { findBattle } from '../Game/Location/stories/trainerStoryData';
import { TrainerDialog } from '../Game/Location/TrainerDialog';
import { TrainerTooltip } from '../Game/Location/TrainerTooltip';
import { StaticPopup, WildPopup } from '../Game/Location/WildPopup';
import {
  storyEntries,
  storyEntry,
} from '../Game/Pokedex/stories/pokedexStoryData';

const GAME_ID = 'red';
const game = getGame(GAME_ID)!;
const pokedex = storyEntries(GAME_ID, 151);
const shop = shopsFor('RBY')?.[0];
const trainer = findBattle('Youngster', 'route-3');
const listed = {
  battle: trainer,
  key: trainer.name,
  label: trainer.name,
  number: 1,
};

const wildGroups = (
  method: EncounterMethod,
  path: string,
  rows: Array<[number: number, levels: [number, number], chance: number]>,
): Array<EncounterGroup> => [
  {
    method,
    rows: rows.map(([number, levels, chance]) => {
      const encounter: Encounter = {
        method,
        path,
        levels,
        chance: [chance, chance],
        games: [GAME_ID],
      };

      return {
        entry: storyEntry(GAME_ID, number, { encounters: [encounter] })!,
        encounter,
      };
    }),
  },
];

const walking = wildGroups('walk', 'route-2', [
  [16, [3, 5], 44.9],
  [19, [2, 5], 39.8],
  [13, [3, 5], 15.2],
]);
const surfing = wildGroups('surf', 'route-2', [[129, [5, 15], 100]]);
const fishing = [
  ...wildGroups('old-rod', 'route-2', [[129, [5, 5], 100]]),
  ...wildGroups('good-rod', 'route-2', [[118, [10, 10], 100]]),
];
const staticMarker = rbyStaticPokemon.find(({ kind }) => kind === 'static')!;
const giftMarker = rbyStaticPokemon.find(({ kind }) => kind === 'gift')!;

const Sample = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col items-start gap-1.5">
    <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
    {children}
  </div>
);

export const MapPopupSamples = ({ style }: { style: ThemeStyle }) => {
  const [trainerOpen, setTrainerOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);

  return (
    <ThemeOverrideContext value={style}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start gap-6">
          <Sample label="Sign text">
            <MapTextTooltip
              sign
              text={'PALLET TOWN\nShades of your journey await!'}
            />
          </Sample>
          <Sample label="Item">
            <ItemPopup name="Potion" />
          </Sample>
          <Sample label="Hidden item">
            <ItemPopup
              name="Full Restore"
              hidden
              note="Behind the tree on the left"
            />
          </Sample>
          <Sample label="TM">
            <ItemPopup name="TM42 Dream Eater" />
          </Sample>
          <Sample label="Needs HM">
            <ItemPopup name="Max Ether" hidden requires={['Surf']} />
          </Sample>
          <Sample label="Person with dialog">
            <MapTextTooltip
              name="Girl"
              sprite="/sprites/rby/overworld/girl.png"
              game={game}
              dialog={[
                {
                  text: "I'M RAISING POKéMON TOO!\nWhen they get strong, they can protect me!",
                  trigger: 'Talk to her',
                },
                { text: 'Wild Pokémon live in tall grass!' },
              ]}
            />
          </Sample>
          <Sample label="Person giving a TM">
            <MapTextTooltip
              name="Girl"
              sprite="/sprites/rby/overworld/girl.png"
              game={game}
              dialog={[
                {
                  text: 'Here, take this! It uses a powerful move.',
                  gift: {
                    name: 'TM42',
                    sprite: '/sprites/rby/overworld/poke_ball.png',
                  },
                },
              ]}
            />
          </Sample>
          <Sample label="Trainer tooltip">
            <TrainerTooltip listed={listed} game={game} pokedex={pokedex} />
          </Sample>
          <Sample label="Wild: grass">
            <WildPopup game={game} path="route-2" groups={walking} />
          </Sample>
          <Sample label="Wild: cavern">
            <WildPopup
              game={game}
              path="mt-moon"
              groups={walking}
              terrain="cavern"
            />
          </Sample>
          <Sample label="Wild: indoors">
            <WildPopup
              game={game}
              path="power-plant"
              groups={walking}
              terrain="indoors"
            />
          </Sample>
          <Sample label="Wild: water">
            <WildPopup game={game} path="route-2" groups={surfing} />
          </Sample>
          <Sample label="Wild: fishing">
            <WildPopup game={game} path="route-2" groups={fishing} />
          </Sample>
          <Sample label="Static Pokémon">
            <StaticPopup game={game} marker={staticMarker} pokedex={pokedex} />
          </Sample>
          <Sample label="Gift Pokémon">
            <StaticPopup game={game} marker={giftMarker} pokedex={pokedex} />
          </Sample>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setTrainerOpen(true)}>
            Open trainer dialog
          </Button>
          {shop && (
            <Button variant="outline" onClick={() => setShopOpen(true)}>
              Open shop dialog
            </Button>
          )}
        </div>
        <TrainerDialog
          listed={trainerOpen ? listed : undefined}
          place="Route 3"
          game={game}
          pokedex={pokedex}
          onClose={() => setTrainerOpen(false)}
        />
        <ShopDialog
          shop={
            shop && shopOpen ? { shops: [shop], selected: shop.id } : undefined
          }
          onClose={() => setShopOpen(false)}
        />
      </div>
    </ThemeOverrideContext>
  );
};
