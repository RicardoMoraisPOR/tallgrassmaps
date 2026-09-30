import type { Meta, StoryObj } from '@storybook/react-vite';

import type { Encounter, EncounterMethod } from '@/data/pokedex/types';

import { pokedexStoryContext, storyEntry } from '../Pokedex/pokedexStoryData';
import type { EncounterGroup } from './encounters';
import { MapPopupStoryFrame } from './MapPopupStoryFrame';
import { WildPopup } from './WildPopup';

type SampleEncounter = [
  number: number,
  levels: [number, number],
  chance: number,
];

const group = (
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
      games: ['red'],
    };

    return {
      entry: storyEntry('red', number, { encounters: [encounter] })!,
      encounter,
    };
  }),
});

const meta = {
  title: 'Location/Wild encounters popup',
  component: WildPopup,
  decorators: [
    (Story) => (
      <MapPopupStoryFrame>
        <Story />
      </MapPopupStoryFrame>
    ),
  ],
  argTypes: {
    game: { control: false },
    groups: { control: false },
  },
  args: {
    game: pokedexStoryContext('red').game,
    path: 'route-2',
    groups: [
      group('walk', 'route-2', [
        [16, [3, 5], 44.9],
        [19, [2, 5], 39.8],
        [13, [3, 5], 15.2],
      ]),
    ],
  },
} satisfies Meta<typeof WildPopup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithoutScroll: Story = {};

export const WithScroll: Story = {
  args: {
    path: 'route-12',
    groups: [
      group('walk', 'route-12', [
        [16, [23, 27], 40.2],
        [43, [22, 26], 34.8],
        [48, [24, 26], 19.5],
        [44, [28, 30], 5.5],
      ]),
      group('super-rod', 'route-12', [
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
    groups: [group('old-rod', null, [[129, [5, 5], 100]])],
  },
};
