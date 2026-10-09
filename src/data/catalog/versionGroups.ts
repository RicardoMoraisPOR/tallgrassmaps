import { entryName, entryVersionGroup } from './entries';
import { generations } from './generations';

export const versionGroupNames = (versionGroup: string) =>
  generations
    .flatMap(({ entries }) => entries)
    .filter((entry) => entryVersionGroup(entry) === versionGroup)
    .map(entryName);

const versionGroupLetters: Record<
  string,
  Array<[text: string, gameId?: string]>
> = {
  RBY: [
    ['R', 'red'],
    ['B', 'blue'],
    ['Y', 'yellow'],
  ],
  GSC: [
    ['G', 'gold'],
    ['S', 'silver'],
    ['C', 'crystal'],
  ],
  RSE: [
    ['R', 'ruby'],
    ['S', 'sapphire'],
    ['E', 'emerald'],
  ],
  FRLG: [
    ['FR', 'firered'],
    ['LG', 'leafgreen'],
  ],
  DPPt: [
    ['D', 'diamond'],
    ['P', 'pearl'],
    ['Pt', 'platinum'],
  ],
  HGSS: [
    ['HG', 'heartgold'],
    ['SS', 'soulsilver'],
  ],
  BW: [
    ['B', 'black'],
    ['W', 'white'],
  ],
  B2W2: [
    ['B2', 'black-2'],
    ['W2', 'white-2'],
  ],
  XY: [
    ['X', 'x'],
    ['Y', 'y'],
  ],
  ORAS: [
    ['OR', 'omega-ruby'],
    ['AS', 'alpha-sapphire'],
  ],
  SM: [
    ['S', 'sun'],
    ['M', 'moon'],
  ],
  USUM: [
    ['US', 'ultra-sun'],
    ['UM', 'ultra-moon'],
  ],
  LGPE: [['LG'], ['P', 'lets-go-pikachu'], ['E', 'lets-go-eevee']],
  SwSh: [
    ['Sw', 'sword'],
    ['Sh', 'shield'],
  ],
  BDSP: [
    ['BD', 'brilliant-diamond'],
    ['SP', 'shining-pearl'],
  ],
  PLA: [['PLA', 'legends-arceus']],
  SV: [
    ['S', 'scarlet'],
    ['V', 'violet'],
  ],
  ZA: [['Z-A', 'legends-za']],
};

const gameColor = (gameId: string) =>
  generations
    .flatMap(({ entries }) => entries)
    .find((entry) => entry.id === gameId)?.colors[0];

export const versionGroupParts = (versionGroup: string) =>
  (versionGroupLetters[versionGroup] ?? [[versionGroup]]).map(
    ([text, gameId]) => ({ text, color: gameId && gameColor(gameId) }),
  );
