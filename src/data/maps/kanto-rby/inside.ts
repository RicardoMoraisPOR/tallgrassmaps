import { type InsideEntry, teleporter } from './entries';
import { entrance, rect, type Size, variant, warp } from './helpers';

export const inside: Array<InsideEntry> = [
  {
    id: 'oaks-lab',
    name: "Oak's Lab",
    kind: 'building',
    size: [160, 192],
    parent: 'pallet-town',
    entrances: [warp(12, 11)],
    exits: [rect(64, 176, 32, 16)],
    variants: [variant('yellow', 'oaks-lab.png')],
  },
  {
    id: 'viridian-gym',
    name: 'Viridian Gym',
    kind: 'building',
    size: [320, 288],
    parent: 'viridian-city',
    entrances: [warp(32, 7)],
    exits: [rect(256, 272, 32, 16)],
  },
  {
    id: 'pewter-gym',
    name: 'Pewter Gym',
    kind: 'building',
    size: [160, 224],
    parent: 'pewter-city',
    entrances: [warp(16, 17)],
    exits: [rect(64, 208, 32, 16)],
  },
  {
    id: 'pewter-museum',
    name: 'Pewter Museum',
    kind: 'building',
    size: [320, 128],
    parent: 'pewter-city',
    entrances: [warp(14, 7), warp(19, 5)],
    floors: [
      {
        name: '1F',
        exits: [
          { to: 'pewter-city', area: rect(160, 112, 32, 16) },
          { to: 'pewter-city', area: rect(256, 112, 32, 16) },
          { floor: '2F', area: warp(7, 7) },
        ],
      },
      {
        name: '2F',
        size: [224, 128],
        exits: [{ floor: '1F', area: warp(7, 7) }],
      },
    ],
  },
  {
    id: 'viridian-forest',
    name: 'Viridian Forest',
    kind: 'dungeon',
    size: [544, 768],
    parent: 'route-2',
    cell: [2, 4],
    entrances: [],
    exits: [
      { area: rect(16, 0, 32, 16), to: 'route-2/viridian-forest-north-gate' },
      {
        area: rect(240, 752, 64, 16),
        to: 'route-2/viridian-forest-south-gate',
      },
    ],
  },
  {
    id: 'mt-moon',
    name: 'Mt. Moon',
    kind: 'dungeon',
    size: [640, 576],
    parent: 'route-4',
    cell: [6, 2],
    entrances: [entrance(288, 80), { area: warp(24, 5), floor: 'B1F' }],
    floors: [
      {
        name: '1F',
        size: [640, 576],
        exits: [
          { to: 'route-4', area: rect(224, 560, 32, 16) },
          ...[warp(5, 5), warp(17, 11), warp(25, 15)].map((area) => ({
            floor: 'B1F',
            area,
            ladder: true,
          })),
        ],
      },
      {
        name: 'B1F',
        size: [448, 448],
        exits: [
          ...[warp(5, 5), warp(25, 9), warp(25, 15)].map((area) => ({
            floor: '1F',
            area,
            ladder: true,
          })),
          ...[warp(17, 11), warp(21, 17), warp(13, 27), warp(23, 3)].map(
            (area) => ({ floor: 'B2F', area, ladder: true }),
          ),
          { to: 'route-4', area: warp(27, 3), ladder: true },
        ],
      },
      {
        name: 'B2F',
        size: [640, 576],
        exits: [warp(25, 9), warp(21, 17), warp(15, 27), warp(5, 7)].map(
          (area) => ({ floor: 'B1F', area, ladder: true }),
        ),
      },
    ],
  },
  {
    id: 'cerulean-gym',
    name: 'Cerulean Gym',
    kind: 'building',
    size: [160, 224],
    parent: 'cerulean-city',
    entrances: [warp(30, 19)],
    exits: [rect(64, 208, 32, 16)],
  },
  {
    id: 'underground-path-north-south',
    name: 'Underground Path',
    kind: 'dungeon',
    size: [128, 768],
    parent: 'route-5',
    otherParents: ['route-6'],
    entrances: [],
    exits: [
      { area: warp(5, 4), to: 'route-5/underground-path-route-5' },
      { area: warp(2, 41), to: 'route-6/underground-path-route-6' },
    ],
  },
  {
    id: 'underground-path-west-east',
    name: 'Underground Path',
    kind: 'dungeon',
    size: [800, 128],
    parent: 'route-8',
    otherParents: ['route-7'],
    entrances: [],
    exits: [
      { area: warp(2, 5), to: 'route-7/underground-path-route-7' },
      { area: warp(47, 2), to: 'route-8/underground-path-route-8' },
    ],
  },
  {
    id: 'pokemon-league',
    name: 'Pokémon League',
    kind: 'building',
    size: [160, 192],
    parent: 'indigo-plateau',
    entrances: [],
    floors: [
      {
        name: "Lorelei's Room",
        exits: [
          {
            to: 'indigo-plateau/indigo-plateau-lobby',
            area: rect(64, 176, 32, 16),
          },
          { floor: "Bruno's Room", area: rect(64, 0, 32, 16), door: true },
        ],
      },
      {
        name: "Bruno's Room",
        exits: [
          { floor: "Lorelei's Room", area: rect(64, 176, 32, 16), door: true },
          { floor: "Agatha's Room", area: rect(64, 0, 32, 16), door: true },
        ],
      },
      {
        name: "Agatha's Room",
        exits: [
          { floor: "Bruno's Room", area: rect(64, 176, 32, 16), door: true },
          { floor: "Lance's Room", area: rect(64, 0, 32, 16), door: true },
        ],
      },
      {
        name: "Lance's Room",
        size: [416, 416],
        exits: [
          { floor: "Agatha's Room", area: warp(24, 16) },
          { floor: "Champion's Room", area: rect(80, 0, 32, 16), door: true },
        ],
      },
      {
        name: "Champion's Room",
        size: [128, 128],
        exits: [
          { floor: "Lance's Room", area: rect(48, 112, 32, 16), door: true },
          { floor: 'Hall of Fame', area: rect(48, 0, 32, 16), door: true },
        ],
      },
      {
        name: 'Hall of Fame',
        size: [160, 128],
        exits: [
          { floor: "Champion's Room", area: rect(64, 112, 32, 16), door: true },
        ],
      },
    ],
  },
  {
    id: 'cerulean-cave',
    name: 'Cerulean Cave',
    kind: 'dungeon',
    size: [480, 288],
    parent: 'cerulean-city',
    entrances: [entrance(64, 176)],
    floors: [
      {
        name: '1F',
        size: [480, 288],
        variants: [variant('yellow', 'cerulean-cave/1f.png')],
        exits: [
          { to: 'cerulean-city', area: rect(384, 272, 32, 16) },
          ...[
            warp(27, 1),
            warp(23, 7),
            warp(18, 9),
            warp(7, 1),
            warp(1, 3),
            warp(3, 11),
          ].map((area) => ({ floor: '2F', area, ladder: true })),
          { floor: 'B1F', area: warp(0, 6), ladder: true },
        ],
      },
      {
        name: '2F',
        size: [480, 288],
        variants: [variant('yellow', 'cerulean-cave/2f.png')],
        exits: [
          warp(29, 1),
          warp(22, 6),
          warp(19, 7),
          warp(9, 1),
          warp(1, 3),
          warp(3, 11),
        ].map((area) => ({ floor: '1F', area, ladder: true })),
      },
      {
        name: 'B1F',
        size: [480, 288],
        variants: [variant('yellow', 'cerulean-cave/b1f.png')],
        exits: [{ floor: '1F', area: warp(3, 6), ladder: true }],
      },
    ],
  },
  {
    id: 'vermilion-gym',
    name: 'Vermilion Gym',
    kind: 'building',
    size: [160, 288],
    parent: 'vermilion-city',
    entrances: [warp(12, 19)],
    exits: [rect(64, 272, 32, 16)],
  },
  {
    id: 'ss-anne',
    name: 'S.S. Anne',
    kind: 'dungeon',
    size: [448, 192],
    parent: 'vermilion-city',
    entrances: [rect(284, 492, 40, 24)],
    floors: [
      {
        name: 'Dock',
        size: [448, 192],
        exits: [
          { to: 'vermilion-city', area: warp(14, 0) },
          { floor: '1F', area: warp(14, 2), door: true },
        ],
      },
      {
        name: '1F',
        size: [640, 288],
        exits: [
          { floor: 'Dock', area: rect(416, 0, 32, 16), door: true },
          ...[
            warp(31, 8),
            warp(23, 8),
            warp(19, 8),
            warp(15, 8),
            warp(11, 8),
            warp(7, 8),
          ].map((area) => ({ floor: '1F Cabins', area, door: true })),
          { floor: '2F', area: warp(2, 6) },
          { floor: 'B1F', area: warp(37, 15) },
          { floor: 'Kitchen', area: warp(3, 16), door: true },
        ],
      },
      {
        name: '1F Cabins',
        size: [384, 256],
        exits: [
          warp(0, 0),
          warp(10, 0),
          warp(20, 0),
          warp(0, 10),
          warp(10, 10),
          warp(20, 10),
        ].map((area) => ({ floor: '1F', area, door: true })),
      },
      {
        name: '2F',
        size: [640, 288],
        exits: [
          ...[
            warp(9, 11),
            warp(13, 11),
            warp(17, 11),
            warp(21, 11),
            warp(25, 11),
            warp(29, 11),
          ].map((area) => ({ floor: '2F Cabins', area, door: true })),
          { floor: '1F', area: warp(2, 4) },
          { floor: '3F', area: warp(2, 12) },
          { floor: "Captain's Room", area: warp(36, 4), door: true },
        ],
      },
      {
        name: '2F Cabins',
        size: [384, 256],
        exits: [
          rect(32, 80, 32, 16),
          rect(192, 80, 32, 16),
          rect(352, 80, 32, 16),
          rect(32, 240, 32, 16),
          rect(192, 240, 32, 16),
          rect(352, 240, 32, 16),
        ].map((area) => ({ floor: '2F', area, door: true })),
      },
      {
        name: '3F',
        size: [320, 96],
        exits: [
          { floor: 'Bow', area: warp(0, 3), door: true },
          { floor: '2F', area: warp(19, 3) },
        ],
      },
      {
        name: 'Bow',
        size: [320, 224],
        exits: [{ floor: '3F', area: rect(208, 96, 16, 32), door: true }],
      },
      {
        name: 'B1F',
        size: [480, 128],
        exits: [
          ...[
            warp(7, 3),
            warp(11, 3),
            warp(15, 3),
            warp(19, 3),
            warp(23, 3),
          ].map((area) => ({ floor: 'B1F Cabins', area, door: true })),
          { floor: '1F', area: warp(27, 5) },
        ],
      },
      {
        name: 'B1F Cabins',
        size: [384, 256],
        exits: [
          rect(32, 80, 32, 16),
          rect(192, 80, 32, 16),
          rect(352, 80, 32, 16),
          rect(32, 240, 32, 16),
          rect(192, 240, 32, 16),
        ].map((area) => ({ floor: 'B1F', area, door: true })),
      },
      {
        name: 'Kitchen',
        size: [224, 256],
        exits: [{ floor: '1F', area: warp(6, 0), door: true }],
      },
      {
        name: "Captain's Room",
        size: [96, 128],
        exits: [{ floor: '2F', area: warp(0, 7), door: true }],
      },
    ],
  },
  {
    id: 'digletts-cave',
    name: "Diglett's Cave",
    kind: 'dungeon',
    size: [640, 576],
    parent: 'route-11',
    otherParents: ['route-2'],
    entrances: [],
    exits: [
      { area: warp(5, 5), to: 'route-2/digletts-cave-route-2' },
      { area: warp(37, 31), to: 'route-11/digletts-cave-route-11' },
    ],
  },
  {
    id: 'rock-tunnel',
    name: 'Rock Tunnel',
    kind: 'dungeon',
    size: [640, 576],
    parent: 'route-10',
    cell: [14, 3],
    entrances: [entrance(128, 272), entrance(128, 848)],
    floors: [
      {
        name: '1F',
        size: [640, 576],
        exits: [
          { to: 'route-10', area: warp(15, 3), ladder: true },
          { to: 'route-10', area: warp(15, 33), ladder: true },
          ...[warp(37, 3), warp(5, 3), warp(17, 11), warp(37, 17)].map(
            (area) => ({ floor: 'B1F', area, ladder: true }),
          ),
        ],
      },
      {
        name: 'B1F',
        size: [640, 576],
        exits: [warp(33, 25), warp(27, 3), warp(23, 11), warp(3, 3)].map(
          (area) => ({ floor: '1F', area, ladder: true }),
        ),
      },
    ],
  },
  {
    id: 'power-plant',
    name: 'Power Plant',
    kind: 'dungeon',
    size: [640, 576],
    parent: 'route-10',
    entrances: [entrance(96, 624)],
    exits: [rect(64, 560, 32, 16), rect(0, 176, 16, 16)],
  },
  {
    id: 'pokemon-tower',
    name: 'Pokémon Tower',
    kind: 'building',
    size: [320, 288],
    parent: 'lavender-town',
    entrances: [entrance(224, 80)],
    floors: [
      {
        name: '1F',
        exits: [
          { to: 'lavender-town', area: rect(160, 272, 32, 16) },
          { floor: '2F', area: warp(18, 9) },
        ],
      },
      {
        name: '2F',
        exits: [
          { floor: '3F', area: warp(3, 9) },
          { floor: '1F', area: warp(18, 9) },
        ],
      },
      {
        name: '3F',
        exits: [
          { floor: '2F', area: warp(3, 9) },
          { floor: '4F', area: warp(18, 9) },
        ],
      },
      {
        name: '4F',
        exits: [
          { floor: '5F', area: warp(3, 9) },
          { floor: '3F', area: warp(18, 9) },
        ],
      },
      {
        name: '5F',
        exits: [
          { floor: '4F', area: warp(3, 9) },
          { floor: '6F', area: warp(18, 9) },
        ],
      },
      {
        name: '6F',
        exits: [
          { floor: '5F', area: warp(18, 9) },
          { floor: '7F', area: warp(9, 16) },
        ],
      },
      {
        name: '7F',
        exits: [{ floor: '6F', area: warp(9, 16) }],
      },
    ],
  },
  {
    id: 'rocket-game-corner',
    name: 'Rocket Game Corner',
    kind: 'building',
    size: [320, 288],
    parent: 'celadon-city',
    entrances: [entrance(448, 304)],
    floors: [
      {
        name: 'Game Corner',
        size: [320, 288],
        variants: [variant('yellow', 'rocket-game-corner/game-corner.png')],
        exits: [
          { to: 'celadon-city', area: rect(240, 272, 32, 16) },
          { floor: 'B1F', area: warp(17, 4) },
        ],
      },
      {
        name: 'B1F',
        size: [480, 448],
        exits: [
          { floor: 'B2F', area: warp(23, 2) },
          { floor: 'Game Corner', area: warp(21, 2) },
          { floor: 'Elevator', area: rect(384, 304, 32, 16), door: true },
          { floor: 'B2F', area: warp(21, 24) },
        ],
      },
      {
        name: 'B2F',
        size: [480, 448],
        exits: [
          { floor: 'B1F', area: warp(27, 8) },
          { floor: 'B3F', area: warp(21, 8) },
          { floor: 'Elevator', area: rect(384, 304, 32, 16), door: true },
          { floor: 'B1F', area: warp(21, 22) },
        ],
      },
      {
        name: 'B3F',
        size: [480, 448],
        exits: [
          { floor: 'B2F', area: warp(25, 6) },
          { floor: 'B4F', area: warp(19, 18) },
        ],
      },
      {
        name: 'B4F',
        size: [480, 384],
        exits: [
          { floor: 'B3F', area: warp(19, 10) },
          { floor: 'Elevator', area: rect(384, 240, 32, 16), door: true },
        ],
      },
      {
        name: 'Elevator',
        size: [96, 128],
        exits: [
          { floor: 'B1F', area: rect(32, 16, 32, 16), door: true, back: true },
        ],
      },
    ],
  },
  {
    id: 'celadon-mansion',
    name: 'Celadon Mansion',
    kind: 'building',
    size: [128, 192],
    parent: 'celadon-city',
    entrances: [warp(24, 9), rect(380, 44, 40, 24)],
    floors: [
      {
        name: '1F',
        exits: [
          { to: 'celadon-city', area: rect(64, 176, 32, 16) },
          { to: 'celadon-city', area: warp(4, 0) },
          { floor: '2F', area: warp(7, 1) },
          { floor: '2F', area: warp(2, 1) },
        ],
      },
      {
        name: '2F',
        exits: [
          { floor: '3F', area: warp(6, 1) },
          { floor: '1F', area: warp(7, 1) },
          { floor: '1F', area: warp(2, 1) },
          { floor: '3F', area: warp(4, 1) },
        ],
      },
      {
        name: '3F',
        exits: [
          { floor: '2F', area: warp(6, 1) },
          { floor: 'Roof', area: warp(7, 1) },
          { floor: 'Roof', area: warp(2, 1) },
          { floor: '2F', area: warp(4, 1) },
        ],
      },
      {
        name: 'Roof',
        exits: [
          { floor: '3F', area: warp(6, 1) },
          { floor: '3F', area: warp(2, 1) },
          { floor: 'Roof House', area: warp(2, 7), door: true },
        ],
      },
      {
        name: 'Roof House',
        size: [128, 128],
        exits: [{ floor: 'Roof', area: rect(32, 112, 32, 16), door: true }],
      },
    ],
  },
  {
    id: 'celadon-gym',
    name: 'Celadon Gym',
    kind: 'building',
    size: [160, 288],
    parent: 'celadon-city',
    entrances: [warp(12, 27)],
    exits: [rect(64, 272, 32, 16)],
    variants: [variant('yellow', 'celadon-gym.png')],
  },
  {
    id: 'silph-co',
    name: 'Silph Co.',
    kind: 'building',
    size: [480, 288],
    parent: 'saffron-city',
    entrances: [entrance(288, 336)],
    floors: [
      {
        name: '1F',
        size: [480, 288],
        exits: [
          { to: 'saffron-city', area: rect(160, 272, 32, 16) },
          { floor: '2F', area: warp(26, 0) },
          { floor: 'Elevator', area: warp(20, 0), door: true },
        ],
      },
      {
        name: '2F',
        size: [480, 288],
        exits: [
          { floor: '1F', area: warp(24, 0) },
          { floor: '3F', area: warp(26, 0) },
          { floor: 'Elevator', area: warp(20, 0), door: true },
          { floor: '3F', ...teleporter(3, 3, [27, 3]) },
          { floor: '8F', ...teleporter(13, 3, [3, 15]) },
          { floor: '8F', ...teleporter(27, 15, [11, 5]) },
          { floor: '6F', ...teleporter(9, 15, [23, 3]) },
        ],
      },
      {
        name: '3F',
        size: [480, 288],
        exits: [
          { floor: '2F', area: warp(26, 0) },
          { floor: '4F', area: warp(24, 0) },
          { floor: 'Elevator', area: warp(20, 0), door: true },
          { floor: '3F', ...teleporter(23, 11, [27, 15]) },
          { floor: '5F', ...teleporter(3, 3, [11, 5]) },
          { floor: '5F', ...teleporter(3, 15, [3, 15]) },
          { floor: '2F', ...teleporter(27, 3, [3, 3]) },
          { floor: '9F', ...teleporter(3, 11, [9, 3]) },
          { floor: '7F', ...teleporter(11, 11, [5, 3]) },
          { floor: '3F', ...teleporter(27, 15, [23, 11]) },
        ],
      },
      {
        name: '4F',
        size: [480, 288],
        exits: [
          { floor: '3F', area: warp(24, 0) },
          { floor: '5F', area: warp(26, 0) },
          { floor: 'Elevator', area: warp(20, 0), door: true },
          { floor: '10F', ...teleporter(11, 7, [9, 11]) },
          { floor: '6F', ...teleporter(17, 3, [3, 3]) },
          { floor: '10F', ...teleporter(3, 15, [13, 15]) },
          { floor: '10F', ...teleporter(17, 11, [13, 7]) },
        ],
      },
      {
        name: '5F',
        size: [480, 288],
        exits: [
          { floor: '6F', area: warp(24, 0) },
          { floor: '4F', area: warp(26, 0) },
          { floor: 'Elevator', area: warp(20, 0), door: true },
          { floor: '7F', ...teleporter(27, 3, [21, 15]) },
          { floor: '9F', ...teleporter(9, 15, [17, 15]) },
          { floor: '3F', ...teleporter(11, 5, [3, 3]) },
          { floor: '3F', ...teleporter(3, 15, [3, 15]) },
        ],
      },
      {
        name: '6F',
        size: [416, 288],
        exits: [
          { floor: '7F', area: warp(16, 0) },
          { floor: '5F', area: warp(14, 0) },
          { floor: 'Elevator', area: warp(18, 0), door: true },
          { floor: '4F', ...teleporter(3, 3, [17, 3]) },
          { floor: '2F', ...teleporter(23, 3, [9, 15]) },
        ],
      },
      {
        name: '7F',
        size: [416, 288],
        exits: [
          { floor: '8F', area: warp(16, 0) },
          { floor: '6F', area: warp(22, 0) },
          { floor: 'Elevator', area: warp(18, 0), door: true },
          { floor: '11F', ...teleporter(5, 7, [3, 2]) },
          { floor: '3F', ...teleporter(5, 3, [11, 11]) },
          { floor: '5F', ...teleporter(21, 15, [27, 3]) },
        ],
      },
      {
        name: '8F',
        size: [416, 288],
        exits: [
          { floor: '9F', area: warp(16, 0) },
          { floor: '7F', area: warp(14, 0) },
          { floor: 'Elevator', area: warp(18, 0), door: true },
          { floor: '8F', ...teleporter(3, 11, [11, 9]) },
          { floor: '2F', ...teleporter(3, 15, [13, 3]) },
          { floor: '2F', ...teleporter(11, 5, [27, 15]) },
          { floor: '8F', ...teleporter(11, 9, [3, 11]) },
        ],
      },
      {
        name: '9F',
        size: [416, 288],
        exits: [
          { floor: '10F', area: warp(14, 0) },
          { floor: '8F', area: warp(16, 0) },
          { floor: 'Elevator', area: warp(18, 0), door: true },
          { floor: '3F', ...teleporter(9, 3, [3, 11]) },
          { floor: '5F', ...teleporter(17, 15, [9, 15]) },
        ],
      },
      {
        name: '10F',
        size: [256, 288],
        exits: [
          { floor: '9F', area: warp(8, 0) },
          { floor: '11F', area: warp(10, 0) },
          { floor: 'Elevator', area: warp(12, 0), door: true },
          { floor: '4F', ...teleporter(9, 11, [11, 7]) },
          { floor: '4F', ...teleporter(13, 15, [3, 15]) },
          { floor: '4F', ...teleporter(13, 7, [17, 11]) },
        ],
      },
      {
        name: '11F',
        size: [288, 288],
        exits: [
          { floor: '10F', area: warp(9, 0) },
          { floor: 'Elevator', area: warp(13, 0), door: true },
          { floor: '7F', ...teleporter(3, 2, [5, 7]) },
        ],
      },
      {
        name: 'Elevator',
        size: [64, 64],
        exits: [
          { floor: '1F', area: rect(16, 48, 32, 16), door: true, back: true },
        ],
      },
    ],
  },
  {
    id: 'saffron-gym',
    name: 'Saffron Gym',
    kind: 'building',
    size: [320, 288],
    parent: 'saffron-city',
    entrances: [warp(34, 3)],
    exits: [
      rect(128, 272, 32, 16),
      teleporter(1, 3, [15, 5]),
      teleporter(5, 3, [11, 3]),
      teleporter(1, 5, [11, 11]),
      teleporter(5, 5, [1, 11]),
      teleporter(1, 9, [19, 11]),
      teleporter(5, 9, [9, 5]),
      teleporter(1, 11, [5, 5]),
      teleporter(5, 11, [5, 17]),
      teleporter(1, 15, [19, 5]),
      teleporter(5, 15, [15, 17]),
      teleporter(1, 17, [11, 5]),
      teleporter(5, 17, [5, 11]),
      teleporter(9, 3, [15, 11]),
      teleporter(11, 3, [5, 3]),
      teleporter(9, 5, [5, 9]),
      teleporter(11, 5, [1, 17]),
      teleporter(11, 11, [1, 5]),
      teleporter(11, 15, [19, 17]),
      teleporter(15, 3, [15, 9]),
      teleporter(19, 3, [15, 15]),
      teleporter(15, 5, [1, 3]),
      teleporter(19, 5, [1, 15]),
      teleporter(15, 9, [15, 3]),
      teleporter(19, 9, [19, 15]),
      teleporter(15, 11, [9, 3]),
      teleporter(19, 11, [1, 9]),
      teleporter(15, 15, [19, 3]),
      teleporter(19, 15, [19, 9]),
      teleporter(15, 17, [5, 15]),
      teleporter(19, 17, [11, 15]),
    ],
  },
  {
    id: 'fighting-dojo',
    name: 'Fighting Dojo',
    kind: 'building',
    size: [160, 192],
    parent: 'saffron-city',
    entrances: [warp(26, 3)],
    exits: [rect(64, 176, 32, 16)],
  },
  {
    id: 'safari-zone',
    name: 'Safari Zone',
    kind: 'dungeon',
    size: [480, 416],
    parent: 'fuchsia-city',
    entrances: [],
    floors: [
      {
        name: 'Center',
        exits: [
          { to: 'fuchsia-city/safari-zone-gate', area: rect(224, 400, 32, 16) },
          { floor: 'West', area: rect(0, 160, 16, 32), travel: 'west' },
          { floor: 'North', area: rect(224, 0, 32, 16), travel: 'north' },
          { floor: 'East', area: rect(464, 160, 16, 32), travel: 'east' },
          { floor: 'Center Rest House', area: warp(17, 19), door: true },
        ],
      },
      {
        name: 'East',
        exits: [
          { floor: 'North', area: rect(0, 64, 16, 32), travel: 'west' },
          { floor: 'Center', area: rect(0, 352, 16, 32), travel: 'west' },
          { floor: 'East Rest House', area: warp(25, 9), door: true },
        ],
      },
      {
        name: 'North',
        size: [640, 576],
        exits: [
          { floor: 'West', area: rect(32, 560, 32, 16), travel: 'south' },
          { floor: 'West', area: rect(128, 560, 32, 16), travel: 'south' },
          { floor: 'Center', area: rect(320, 560, 32, 16), travel: 'south' },
          { floor: 'East', area: rect(624, 480, 16, 32), travel: 'east' },
          { floor: 'North Rest House', area: warp(35, 3), door: true },
        ],
      },
      {
        name: 'West',
        exits: [
          { floor: 'North', area: rect(320, 0, 32, 16), travel: 'north' },
          { floor: 'North', area: rect(416, 0, 32, 16), travel: 'north' },
          { floor: 'Center', area: rect(464, 352, 16, 32), travel: 'east' },
          { floor: 'Secret House', area: warp(3, 3), door: true },
          { floor: 'West Rest House', area: warp(11, 11), door: true },
        ],
      },
      ...[
        ['Center Rest House', 'Center'],
        ['East Rest House', 'East'],
        ['North Rest House', 'North'],
        ['West Rest House', 'West'],
        ['Secret House', 'West'],
      ].map(([name, area]) => ({
        name,
        size: [128, 128] as Size,
        exits: [{ floor: area, area: rect(32, 112, 32, 16), door: true }],
      })),
    ],
  },
  {
    id: 'fuchsia-gym',
    name: 'Fuchsia Gym',
    kind: 'building',
    size: [160, 288],
    parent: 'fuchsia-city',
    entrances: [warp(5, 27)],
    exits: [rect(64, 272, 32, 16)],
  },
  {
    id: 'pokemon-mansion',
    name: 'Pokémon Mansion',
    kind: 'building',
    size: [480, 448],
    parent: 'cinnabar-island',
    entrances: [entrance(96, 48)],
    floors: [
      {
        name: '1F',
        size: [480, 448],
        exits: [
          { to: 'cinnabar-island', area: rect(64, 432, 64, 16) },
          { to: 'cinnabar-island', area: rect(416, 432, 32, 16) },
          { floor: '2F', area: warp(5, 10) },
          { floor: 'B1F', area: warp(21, 23) },
        ],
      },
      {
        name: '2F',
        size: [480, 448],
        exits: [
          { floor: '1F', area: warp(5, 10) },
          ...[warp(7, 10), warp(25, 14), warp(6, 1)].map((area) => ({
            floor: '3F',
            area,
          })),
        ],
      },
      {
        name: '3F',
        size: [480, 288],
        exits: [
          ...[warp(7, 10), warp(25, 14), warp(6, 1)].map((area) => ({
            floor: '2F',
            area,
          })),
          ...[warp(16, 14), warp(17, 14)].map((area) => ({
            floor: '1F',
            area,
            hole: true,
          })),
          { floor: '2F', area: warp(19, 14), hole: true },
        ],
      },
      {
        name: 'B1F',
        size: [480, 448],
        exits: [{ floor: '1F', area: warp(23, 22) }],
      },
    ],
  },
  {
    id: 'cinnabar-gym',
    name: 'Cinnabar Gym',
    kind: 'building',
    size: [320, 288],
    parent: 'cinnabar-island',
    entrances: [warp(18, 3)],
    exits: [rect(256, 272, 32, 16)],
  },
  {
    id: 'cinnabar-lab',
    name: 'Pokémon Lab',
    kind: 'building',
    size: [288, 128],
    parent: 'cinnabar-island',
    entrances: [warp(6, 9)],
    floors: [
      {
        name: 'Lobby',
        exits: [
          { to: 'cinnabar-island', area: rect(32, 112, 32, 16) },
          { floor: 'Meeting Room', area: warp(8, 4), door: true },
          { floor: 'R&D Room', area: warp(12, 4), door: true },
          { floor: 'Testing Room', area: warp(16, 4), door: true },
        ],
      },
      ...['Meeting Room', 'R&D Room', 'Testing Room'].map((name) => ({
        name,
        size: [128, 128] as Size,
        exits: [{ floor: 'Lobby', area: rect(32, 112, 32, 16), door: true }],
      })),
    ],
  },
  {
    id: 'seafoam-islands',
    name: 'Seafoam Islands',
    kind: 'dungeon',
    size: [480, 288],
    parent: 'route-20',
    cell: [5, 15],
    entrances: [entrance(768, 80), entrance(928, 144)],
    floors: [
      {
        name: '1F',
        exits: [
          { to: 'route-20', area: rect(64, 272, 32, 16) },
          { to: 'route-20', area: rect(416, 272, 32, 16) },
          ...[warp(7, 5), warp(25, 3), warp(23, 15)].map((area) => ({
            floor: 'B1F',
            area,
            ladder: true,
          })),
          ...[warp(17, 6), warp(24, 6)].map((area) => ({
            floor: 'B1F',
            area,
            hole: true,
          })),
        ],
      },
      {
        name: 'B1F',
        exits: [
          ...[warp(7, 5), warp(25, 3), warp(23, 15)].map((area) => ({
            floor: '1F',
            area,
            ladder: true,
          })),
          ...[warp(4, 2), warp(13, 7), warp(19, 15), warp(25, 11)].map(
            (area) => ({ floor: 'B2F', area, ladder: true }),
          ),
          ...[warp(18, 6), warp(23, 6)].map((area) => ({
            floor: 'B2F',
            area,
            hole: true,
          })),
        ],
      },
      {
        name: 'B2F',
        exits: [
          ...[warp(5, 3), warp(13, 7), warp(19, 15), warp(25, 11)].map(
            (area) => ({ floor: 'B1F', area, ladder: true }),
          ),
          ...[warp(5, 13), warp(25, 3), warp(25, 14)].map((area) => ({
            floor: 'B3F',
            area,
            ladder: true,
          })),
          ...[warp(19, 6), warp(22, 6)].map((area) => ({
            floor: 'B3F',
            area,
            hole: true,
          })),
        ],
      },
      {
        name: 'B3F',
        exits: [
          ...[warp(5, 12), warp(25, 3), warp(25, 14)].map((area) => ({
            floor: 'B2F',
            area,
            ladder: true,
          })),
          ...[warp(8, 6), warp(25, 4)].map((area) => ({
            floor: 'B4F',
            area,
            ladder: true,
          })),
          { floor: 'B4F', area: rect(320, 272, 32, 16), current: true },
          ...[warp(3, 16), warp(6, 16)].map((area) => ({
            floor: 'B4F',
            area,
            hole: true,
          })),
        ],
      },
      {
        name: 'B4F',
        exits: [
          ...[warp(11, 7), warp(25, 4)].map((area) => ({
            floor: 'B3F',
            area,
            ladder: true,
          })),
          { floor: 'B3F', area: rect(320, 272, 32, 16), current: true },
        ],
      },
    ],
  },
  {
    id: 'victory-road',
    name: 'Victory Road',
    kind: 'dungeon',
    size: [320, 288],
    parent: 'route-23',
    cell: [0, 4],
    entrances: [entrance(64, 496), { area: warp(14, 31), floor: '2F' }],
    floors: [
      {
        name: '1F',
        size: [320, 288],
        exits: [
          { to: 'route-23', area: rect(128, 272, 32, 16) },
          { floor: '2F', area: warp(1, 1), ladder: true },
        ],
      },
      {
        name: '2F',
        size: [480, 288],
        exits: [
          { floor: '1F', area: warp(0, 8), ladder: true },
          { to: 'route-23', area: rect(464, 112, 16, 32) },
          ...[warp(23, 7), warp(27, 7), warp(25, 14), warp(1, 1)].map(
            (area) => ({ floor: '3F', area, ladder: true }),
          ),
        ],
      },
      {
        name: '3F',
        size: [480, 288],
        exits: [warp(23, 7), warp(26, 8), warp(27, 15), warp(2, 0)].map(
          (area) => ({ floor: '2F', area, ladder: true }),
        ),
      },
    ],
  },
];
