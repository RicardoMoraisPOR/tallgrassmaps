import type { Game } from '@/data/games';
import type { WildArea } from '@/data/maps';
import type {
  Encounter,
  EncounterMethod,
  PokedexEntry,
} from '@/data/pokedex/types';

const CATCHABLE: Array<EncounterMethod> = [
  'walk',
  'surf',
  'old-rod',
  'good-rod',
  'super-rod',
  'static',
  'gift',
];

export type EncounterRowData = { entry: PokedexEntry; encounter: Encounter };

export type EncounterGroup = {
  method: EncounterMethod;
  rows: Array<EncounterRowData>;
};

type EncounterFilter = {
  game: Game;
  path: string;
  floor?: string;
  hasWater?: boolean;
};

const onFloor = (encounter: Encounter, floor: string | undefined) => {
  if (!floor) return encounter;

  const match = encounter.floors?.find((entry) => entry.floor === floor);

  return match && { ...encounter, levels: match.levels, chance: match.chance };
};

const ANYWHERE_RODS: Array<EncounterMethod> = ['old-rod', 'good-rod'];

const RODS: Array<EncounterMethod> = [...ANYWHERE_RODS, 'super-rod'];

const areaMethods: Partial<Record<EncounterMethod, WildArea['method']>> = {
  walk: 'walk',
  surf: 'water',
  'old-rod': 'water',
  'good-rod': 'water',
  'super-rod': 'water',
};

export const wildHighlightKey = (area: WildArea['method']) => `wild:${area}`;

export const wildAreaFor = (method: EncounterMethod) => areaMethods[method];

export const staticHighlightKey = (number: number) => `static:${number}`;

export const encounterHighlightKey = ({
  entry,
  encounter,
}: EncounterRowData) => {
  if (encounter.method === 'static' || encounter.method === 'gift')
    return staticHighlightKey(entry.number);

  const area = areaMethods[encounter.method];

  return area && wildHighlightKey(area);
};

export const encounterGroups = (
  pokedex: Array<PokedexEntry>,
  { game, path, floor, hasWater = false }: EncounterFilter,
): Array<EncounterGroup> => {
  const groups = CATCHABLE.map((method) => ({
    method,
    rows: pokedex
      .flatMap((entry) =>
        entry.encounters
          .filter(
            (encounter) =>
              encounter.method === method &&
              (encounter.path === path ||
                (encounter.path === null && ANYWHERE_RODS.includes(method))) &&
              encounter.games.includes(game.id),
          )
          .flatMap((encounter) => {
            const shown = encounter.path
              ? onFloor(encounter, floor)
              : encounter;

            return shown ? [{ entry, encounter: shown }] : [];
          }),
      )
      .sort(
        (a, b) =>
          (b.encounter.chance?.[1] ?? 0) - (a.encounter.chance?.[1] ?? 0),
      ),
  })).filter(({ rows }) => rows.length > 0);
  return groups.filter(({ method }) => hasWater || !RODS.includes(method));
};
