import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { writePng } from '../lib/png.mjs';
import { pokeredDir, pokeyellowDir } from './disassembly.mjs';
import { mapTiles, TILE } from './map-tiles.mjs';

const OUTPUT = fileURLToPath(
  new URL('../../public/maps/rby/', import.meta.url),
);

const maps = [
  ...[
    ['ViridianPokecenter', 'viridian-pokemon-center'],
    ['PewterPokecenter', 'pewter-pokemon-center'],
    ['CeruleanPokecenter', 'cerulean-pokemon-center'],
    ['LavenderPokecenter', 'lavender-pokemon-center'],
    ['VermilionPokecenter', 'vermilion-pokemon-center'],
    ['CeladonPokecenter', 'celadon-pokemon-center'],
    ['FuchsiaPokecenter', 'fuchsia-pokemon-center'],
    ['SaffronPokecenter', 'saffron-pokemon-center'],
    ['CinnabarPokecenter', 'cinnabar-pokemon-center'],
    ['MtMoonPokecenter', 'mt-moon-pokemon-center'],
    ['RockTunnelPokecenter', 'rock-tunnel-pokemon-center'],
    ['ViridianMart', 'viridian-poke-mart'],
    ['PewterMart', 'pewter-poke-mart'],
    ['CeruleanMart', 'cerulean-poke-mart'],
    ['LavenderMart', 'lavender-poke-mart'],
    ['VermilionMart', 'vermilion-poke-mart'],
    ['FuchsiaMart', 'fuchsia-poke-mart'],
    ['SaffronMart', 'saffron-poke-mart'],
    ['CinnabarMart', 'cinnabar-poke-mart'],
    ['IndigoPlateauLobby', 'indigo-plateau-lobby'],
    ['OaksLab', 'oaks-lab'],
    ['BluesHouse', 'blues-house'],
    ['ViridianSchoolHouse', 'viridian-school-house'],
    ['ViridianNicknameHouse', 'viridian-nickname-house'],
    ['Route2Gate', 'route-2-gate'],
    ['Route22Gate', 'route-22-gate'],
    ['Route2TradeHouse', 'route-2-trade-house'],
    ['ViridianForestNorthGate', 'viridian-forest-north-gate'],
    ['ViridianForestSouthGate', 'viridian-forest-south-gate'],
    ['DiglettsCaveRoute2', 'digletts-cave-route-2'],
    ['DiglettsCaveRoute11', 'digletts-cave-route-11'],
    ['DiglettsCave', 'digletts-cave'],
    ['PewterGym', 'pewter-gym'],
    ['PewterNidoranHouse', 'pewter-nidoran-house'],
    ['PewterSpeechHouse', 'pewter-speech-house'],
    ['Museum1F', 'pewter-museum/1f'],
    ['Museum2F', 'pewter-museum/2f'],
    ['CeruleanGym', 'cerulean-gym'],
    ['CeruleanTradeHouse', 'cerulean-trade-house', 'CeruleanMelaniesHouse'],
    ['BikeShop', 'bike-shop'],
    ['CeruleanBadgeHouse', 'cerulean-badge-house'],
    ['CeruleanTrashedHouse', 'cerulean-trashed-house'],
    ['BillsHouse', 'bills-house'],
    ['Route5Gate', 'route-5-gate'],
    ['UndergroundPathRoute5', 'underground-path-route-5'],
    ['Daycare', 'daycare'],
    ['UndergroundPathRoute6', 'underground-path-route-6'],
    ['Route6Gate', 'route-6-gate'],
    ['Route7Gate', 'route-7-gate'],
    ['UndergroundPathRoute7', 'underground-path-route-7'],
    ['Route8Gate', 'route-8-gate'],
    ['UndergroundPathRoute8', 'underground-path-route-8'],
    ['VermilionGym', 'vermilion-gym'],
    ['VermilionTradeHouse', 'vermilion-trade-house'],
    ['PokemonFanClub', 'pokemon-fan-club'],
    ['VermilionPidgeyHouse', 'vermilion-pidgey-house'],
    ['VermilionOldRodHouse', 'vermilion-old-rod-house'],
    ['Route11Gate1F', 'route-11-gate/1f'],
    ['Route11Gate2F', 'route-11-gate/2f'],
    ['Route12Gate1F', 'route-12-gate/1f'],
    ['Route12Gate2F', 'route-12-gate/2f'],
    ['Route12SuperRodHouse', 'route-12-super-rod-house'],
    ['Route16Gate1F', 'route-16-gate/1f'],
    ['Route16Gate2F', 'route-16-gate/2f'],
    ['Route16FlyHouse', 'route-16-fly-house'],
    ['Route15Gate1F', 'route-15-gate/1f'],
    ['Route15Gate2F', 'route-15-gate/2f'],
    ['Route18Gate1F', 'route-18-gate/1f'],
    ['Route18Gate2F', 'route-18-gate/2f'],
    ['MrFujisHouse', 'mr-fujis-house'],
    ['LavenderCuboneHouse', 'lavender-cubone-house'],
    ['NameRatersHouse', 'name-raters-house'],
    ['VermilionDock', 'ss-anne/dock'],
    ['SSAnne1F', 'ss-anne/1f'],
    ['SSAnne1FRooms', 'ss-anne/1f-cabins'],
    ['SSAnne2F', 'ss-anne/2f'],
    ['SSAnne2FRooms', 'ss-anne/2f-cabins'],
    ['SSAnne3F', 'ss-anne/3f'],
    ['SSAnneBow', 'ss-anne/bow'],
    ['SSAnneB1F', 'ss-anne/b1f'],
    ['SSAnneB1FRooms', 'ss-anne/b1f-cabins'],
    ['SSAnneKitchen', 'ss-anne/kitchen'],
    ['SSAnneCaptainsRoom', 'ss-anne/captains-room'],
    ['UndergroundPathNorthSouth', 'underground-path-north-south'],
    ['LoreleisRoom', 'pokemon-league/loreleis-room'],
    ['BrunosRoom', 'pokemon-league/brunos-room'],
    ['AgathasRoom', 'pokemon-league/agathas-room'],
    ['LancesRoom', 'pokemon-league/lances-room'],
    ['ChampionsRoom', 'pokemon-league/champions-room'],
    ['HallOfFame', 'pokemon-league/hall-of-fame'],
    ['CinnabarGym', 'cinnabar-gym'],
    ['CinnabarLab', 'cinnabar-lab/lobby'],
    ['CinnabarLabTradeRoom', 'cinnabar-lab/meeting-room'],
    ['CinnabarLabMetronomeRoom', 'cinnabar-lab/rd-room'],
    ['CinnabarLabFossilRoom', 'cinnabar-lab/testing-room'],
    ['UndergroundPathWestEast', 'underground-path-west-east'],
    ['FuchsiaGym', 'fuchsia-gym'],
    ['FuchsiaMeetingRoom', 'fuchsia-meeting-room'],
    ['FuchsiaGoodRodHouse', 'fuchsia-good-rod-house'],
    ['FuchsiaBillsGrandpasHouse', 'fuchsia-bills-grandpas-house'],
    ['WardensHouse', 'wardens-house'],
    ['SafariZoneGate', 'safari-zone-gate'],
    ['SafariZoneCenterRestHouse', 'safari-zone/center-rest-house'],
    ['SafariZoneEastRestHouse', 'safari-zone/east-rest-house'],
    ['SafariZoneNorthRestHouse', 'safari-zone/north-rest-house'],
    ['SafariZoneWestRestHouse', 'safari-zone/west-rest-house'],
    ['SafariZoneSecretHouse', 'safari-zone/secret-house'],
    ['RedsHouse1F', 'reds-house/1f'],
    ['RedsHouse2F', 'reds-house/2f'],
  ].map(([name, out, yellowName]) => ({
    name,
    yellowName,
    out: `${out}.png`,
  })),
  ...['1F', '2F', '3F', '4F', '5F', 'Roof'].map((floor) => ({
    name: `CeladonMart${floor}`,
    out: `celadon-dept-store/${floor.toLowerCase()}.png`,
  })),
  { name: 'SummerBeachHouse', out: 'summer-beach-house.png', yellowOnly: true },
];

const games = [
  { dir: pokeredDir, outDir: OUTPUT },
  { dir: pokeyellowDir, outDir: join(OUTPUT, 'variants/yellow') },
];

const BLACKED_OUT = {
  LancesRoom: [{ x: 288, y: 0, width: 128, height: 128 }],
};

const blackOut = ({ width, rgba }, areas = []) => {
  for (const area of areas) {
    for (let y = area.y; y < area.y + area.height; y++) {
      for (let x = area.x; x < area.x + area.width; x++) {
        const i = (y * width + x) * 4;

        rgba[i] = 0;
        rgba[i + 1] = 0;
        rgba[i + 2] = 0;
        rgba[i + 3] = 255;
      }
    }
  }
};

const render = (dir, name) => {
  const { tilesWide, tilesHigh, pixelWidth, pixelHeight, tileAt, shadeAt } =
    mapTiles(dir, name);
  const rgba = Buffer.alloc(pixelWidth * pixelHeight * 4);

  for (let tileY = 0; tileY < tilesHigh; tileY++) {
    for (let tileX = 0; tileX < tilesWide; tileX++) {
      const tile = tileAt(tileX, tileY);

      for (let y = 0; y < TILE; y++) {
        for (let x = 0; x < TILE; x++) {
          const i = ((tileY * TILE + y) * pixelWidth + tileX * TILE + x) * 4;
          const shade = shadeAt(tile, x, y);

          rgba[i] = shade;
          rgba[i + 1] = shade;
          rgba[i + 2] = shade;
          rgba[i + 3] = 255;
        }
      }
    }
  }

  return { width: pixelWidth, height: pixelHeight, rgba };
};

const written = [];

for (const { name, yellowName = name, out, yellowOnly } of maps) {
  const [red, yellow] = games.map(({ dir }, index) =>
    render(yellowOnly ? pokeyellowDir : dir, index === 0 ? name : yellowName),
  );

  blackOut(red, BLACKED_OUT[name]);
  blackOut(yellow, BLACKED_OUT[name]);

  mkdirSync(dirname(join(OUTPUT, out)), { recursive: true });
  writePng(join(OUTPUT, out), red.width, red.height, red.rgba);

  const variant = !red.rgba.equals(yellow.rgba);

  if (variant) {
    const target = join(games[1].outDir, out);

    mkdirSync(dirname(target), { recursive: true });
    writePng(target, yellow.width, yellow.height, yellow.rgba);
  }

  written.push(
    `${out} ${red.width}x${red.height}${variant ? ' (+ Yellow)' : ''}`,
  );
}

console.log(written.join('\n'));
