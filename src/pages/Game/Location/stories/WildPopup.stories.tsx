import type { ComponentProps } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import type { Encounter, EncounterMethod } from '@/data/pokedex/types';

import { useStoryGameId } from '../../../../../.storybook/StoryGame';
import {
  pokedexStoryContext,
  storyEntry,
} from '../../Pokedex/stories/pokedexStoryData';
import type { EncounterGroup } from '../encounters';
import { WildPopup } from '../WildPopup';

type WildPopupProps = ComponentProps<typeof WildPopup>;

type SampleEncounter = [
  number: number,
  levels: [number, number],
  chance: number,
];

const group = (
  gameId: string,
  method: EncounterMethod,
  path: string | null,
  encounters: Array<SampleEncounter>,
): EncounterGroup => ({
  method,
  rows: encounters.map(([number, levels, chance]) => {
    const encounter: Encounter = {
      method,
      path,
      levels,
      chance: [chance, chance],
      games: [gameId],
    };

    return {
      entry: storyEntry(gameId, number, { encounters: [encounter] })!,
      encounter,
    };
  }),
});

type WildPopupStoryProps = Omit<WildPopupProps, 'game' | 'groups'> & {
  groups?: Array<EncounterGroup>;
};

const WildPopupStory = ({
  groups: suppliedGroups,
  ...props
}: WildPopupStoryProps) => {
  const gameId = useStoryGameId();
  const game = pokedexStoryContext(gameId).game;
  const groups = (
    suppliedGroups ?? [
      group(gameId, 'walk', 'route-2', [
        [16, [3, 5], 44.9],
        [19, [2, 5], 39.8],
        [13, [3, 5], 15.2],
      ]),
    ]
  ).map(({ method, rows }) => ({
    method,
    rows: rows.map(({ entry, encounter }) => {
      const selectedEncounter = { ...encounter, games: [gameId] };

      return {
        entry:
          storyEntry(gameId, entry.number, {
            encounters: [selectedEncounter],
          }) ?? entry,
        encounter: selectedEncounter,
      };
    }),
  }));

  return <WildPopup {...props} game={game} groups={groups} />;
};

const meta = {
  title: 'Map/Wild Encounters Tooltip',
  component: WildPopupStory,
  decorators: [
    (Story) => (
      <div className="p-10">
        <Story />
      </div>
    ),
  ],
  argTypes: { groups: { control: false } },
  args: { path: 'route-2' },
} satisfies Meta<typeof WildPopupStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithoutScroll: Story = {};

export const WithScroll: Story = {
  args: {
    path: 'route-12',
    groups: [
      group('red', 'walk', 'route-12', [
        [16, [23, 27], 40.2],
        [43, [22, 26], 34.8],
        [48, [24, 26], 19.5],
        [44, [28, 30], 5.5],
      ]),
      group('red', 'super-rod', 'route-12', [
        [72, [5, 5], 25],
        [98, [15, 15], 25],
        [118, [15, 15], 25],
        [129, [15, 15], 25],
      ]),
    ],
  },
};

export const SinglePokemon: Story = {
  args: {
    path: 'route-12',
    groups: [group('red', 'old-rod', null, [[129, [5, 5], 100]])],
  },
};
