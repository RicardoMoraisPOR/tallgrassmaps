import { games } from '../games';
import type { CatalogEntry, Generation } from './types';
import { catalogColors, soon } from './upcoming';

const catalogedGames = (generation: number): Array<CatalogEntry> =>
  games.filter((game) => game.generation === generation);

export const generations: Array<Generation> = [
  { number: 1, roman: 'I', entries: catalogedGames(1) },
  {
    number: 2,
    roman: 'II',
    entries: soon(
      'GSC',
      'Game Boy Color',
      ['Johto', 'Kanto'],
      [
        ['gold', 'Pokémon Gold', catalogColors.gold],
        ['silver', 'Pokémon Silver', catalogColors.silver],
        ['crystal', 'Pokémon Crystal', catalogColors.crystal],
      ],
    ),
  },
  {
    number: 3,
    roman: 'III',
    entries: [
      ...soon(
        'RSE',
        'Game Boy Advance',
        ['Hoenn'],
        [
          ['ruby', 'Pokémon Ruby', catalogColors.ruby],
          ['sapphire', 'Pokémon Sapphire', catalogColors.sapphire],
          ['emerald', 'Pokémon Emerald', catalogColors.emerald],
        ],
      ),
      ...soon(
        'FRLG',
        'Game Boy Advance',
        ['Kanto'],
        [
          ['firered', 'Pokémon FireRed', catalogColors.fire],
          ['leafgreen', 'Pokémon LeafGreen', catalogColors.leaf],
        ],
      ),
    ],
  },
  {
    number: 4,
    roman: 'IV',
    entries: [
      ...soon(
        'DPPt',
        'Nintendo DS',
        ['Sinnoh'],
        [
          ['diamond', 'Pokémon Diamond', catalogColors.diamond],
          ['pearl', 'Pokémon Pearl', catalogColors.pearl],
          ['platinum', 'Pokémon Platinum', catalogColors.platinum],
        ],
      ),
      ...soon(
        'HGSS',
        'Nintendo DS',
        ['Johto', 'Kanto'],
        [
          ['heartgold', 'Pokémon HeartGold', catalogColors.gold],
          ['soulsilver', 'Pokémon SoulSilver', catalogColors.silver],
        ],
      ),
    ],
  },
  {
    number: 5,
    roman: 'V',
    entries: [
      ...soon(
        'BW',
        'Nintendo DS',
        ['Unova'],
        [
          ['black', 'Pokémon Black', catalogColors.black],
          ['white', 'Pokémon White', catalogColors.white],
        ],
      ),
      ...soon(
        'B2W2',
        'Nintendo DS',
        ['Unova'],
        [
          ['black-2', 'Pokémon Black 2', catalogColors.black],
          ['white-2', 'Pokémon White 2', catalogColors.white],
        ],
      ),
    ],
  },
  {
    number: 6,
    roman: 'VI',
    entries: [
      ...soon(
        'XY',
        'Nintendo 3DS',
        ['Kalos'],
        [
          ['x', 'Pokémon X', catalogColors.x],
          ['y', 'Pokémon Y', catalogColors.y],
        ],
      ),
      ...soon(
        'ORAS',
        'Nintendo 3DS',
        ['Hoenn'],
        [
          ['omega-ruby', 'Pokémon Omega Ruby', catalogColors.ruby],
          ['alpha-sapphire', 'Pokémon Alpha Sapphire', catalogColors.sapphire],
        ],
      ),
    ],
  },
  {
    number: 7,
    roman: 'VII',
    entries: [
      ...soon(
        'SM',
        'Nintendo 3DS',
        ['Alola'],
        [
          ['sun', 'Pokémon Sun', catalogColors.sun],
          ['moon', 'Pokémon Moon', catalogColors.moon],
        ],
      ),
      ...soon(
        'USUM',
        'Nintendo 3DS',
        ['Alola'],
        [
          ['ultra-sun', 'Pokémon Ultra Sun', catalogColors.ultraSun],
          ['ultra-moon', 'Pokémon Ultra Moon', catalogColors.ultraMoon],
        ],
      ),
      ...soon(
        'LGPE',
        'Nintendo Switch',
        ['Kanto'],
        [
          [
            'lets-go-pikachu',
            "Pokémon Let's Go, Pikachu!",
            catalogColors.yellow,
          ],
          ['lets-go-eevee', "Pokémon Let's Go, Eevee!", catalogColors.eevee],
        ],
      ),
    ],
  },
  {
    number: 8,
    roman: 'VIII',
    entries: [
      ...soon(
        'SwSh',
        'Nintendo Switch',
        ['Galar'],
        [
          ['sword', 'Pokémon Sword', catalogColors.sword],
          ['shield', 'Pokémon Shield', catalogColors.shield],
        ],
      ),
      ...soon(
        'BDSP',
        'Nintendo Switch',
        ['Sinnoh'],
        [
          [
            'brilliant-diamond',
            'Pokémon Brilliant Diamond',
            catalogColors.diamond,
          ],
          ['shining-pearl', 'Pokémon Shining Pearl', catalogColors.pearl],
        ],
      ),
      ...soon(
        'PLA',
        'Nintendo Switch',
        ['Hisui'],
        [['legends-arceus', 'Pokémon Legends: Arceus', catalogColors.arceus]],
      ),
    ],
  },
  {
    number: 9,
    roman: 'IX',
    entries: [
      ...soon(
        'SV',
        'Nintendo Switch',
        ['Paldea'],
        [
          ['scarlet', 'Pokémon Scarlet', catalogColors.scarlet],
          ['violet', 'Pokémon Violet', catalogColors.violet],
        ],
      ),
      ...catalogedGames(9),
    ],
  },
];
