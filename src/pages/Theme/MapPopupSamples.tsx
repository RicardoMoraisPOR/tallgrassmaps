import { type ReactNode, useState } from 'react';

import {
  ThemeOverrideContext,
  ThemeVersionGroupContext,
} from '@/components/settings/themeOverride';
import { Button } from '@/components/ui/button';
import { getGame } from '@/data/games';
import type { Encounter, EncounterMethod } from '@/data/pokedex/types';
import { shopsFor } from '@/data/shops';
import { rbyStaticPokemon } from '@/data/static-pokemon/rby';
import { zaTrainers } from '@/data/trainers/za';

import type { EncounterGroup } from '../Game/Location/encounters';
import { ItemPopup } from '../Game/Location/ItemPopup';
import { MapTextTooltip } from '../Game/Location/MapTextTooltip';
import { ShopDialog } from '../Game/Location/ShopDialog';
import { TrainerDialog } from '../Game/Location/TrainerDialog';
import { TrainerTooltip } from '../Game/Location/TrainerTooltip';
import { StaticPopup, WildPopup } from '../Game/Location/WildPopup';
import { findBattle, sampleEntries, sampleEntry } from './popupSampleData';

type Skin = 'rby' | 'za';

const skins = {
  rby: {
    gameId: 'red',
    versionGroup: 'RBY',
    count: 151,
    trainer: findBattle('Youngster', 'route-3'),
    place: 'Route 3',
    npcSprite: '/sprites/rby/overworld/girl.png',
  },
  za: {
    gameId: 'legends-za',
    versionGroup: 'ZA',
    count: 400,
    trainer: zaTrainers[0],
    place: 'Wild Zone 6',
    npcSprite: undefined,
  },
};

const shop = shopsFor('RBY')?.[0];

const wildGroups = (
  gameId: string,
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
        games: [gameId],
      };

      return {
        entry: sampleEntry(gameId, number, { encounters: [encounter] })!,
        encounter,
      };
    }),
  },
];

const wildSamples = (gameId: string) => ({
  walking: wildGroups(gameId, 'walk', 'route-2', [
    [16, [3, 5], 44.9],
    [25, [2, 5], 39.8],
    [13, [3, 5], 15.2],
  ]),
  surfing: wildGroups(gameId, 'surf', 'route-2', [[129, [5, 15], 100]]),
  fishing: [
    ...wildGroups(gameId, 'old-rod', 'route-2', [[129, [5, 5], 100]]),
    ...wildGroups(gameId, 'good-rod', 'route-2', [[118, [10, 10], 100]]),
  ],
});
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

export const MapPopupSamples = ({ skin }: { skin: Skin | 'tall-grass' }) => {
  const [trainerOpen, setTrainerOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);

  const { gameId, versionGroup, count, trainer, place, npcSprite } =
    skins[skin === 'za' ? 'za' : 'rby'];
  const game = getGame(gameId)!;
  const pokedex = sampleEntries(gameId, count);
  const { walking, surfing, fishing } = wildSamples(gameId);
  const listed = {
    battle: trainer,
    key: trainer.name,
    label: trainer.name,
    number: 1,
  };

  return (
    <ThemeVersionGroupContext value={versionGroup}>
      <ThemeOverrideContext
        value={skin === 'tall-grass' ? 'tall-grass' : 'game'}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start gap-6">
            <Sample label="Sign text">
              <MapTextTooltip
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
                sprite={npcSprite}
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
                sprite={npcSprite}
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
              <StaticPopup
                game={game}
                marker={staticMarker}
                pokedex={pokedex}
              />
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
            place={place}
            game={game}
            pokedex={pokedex}
            onClose={() => setTrainerOpen(false)}
          />
          <ShopDialog
            shop={
              shop && shopOpen
                ? { shops: [shop], selected: shop.id }
                : undefined
            }
            onClose={() => setShopOpen(false)}
          />
        </div>
      </ThemeOverrideContext>
    </ThemeVersionGroupContext>
  );
};
