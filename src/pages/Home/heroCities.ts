import { kantoRby } from '@/data/maps/kanto-rby';
import { lumioseZa } from '@/data/maps/lumiose-za';

export type CityMap = {
  image: string;
  width: number;
  height: number;
  pixelated: boolean;
};

export type HeroCity = {
  name: string;
  map?: CityMap;
};

const cityNames: Array<string> = [
  'Pallet Town',
  'Viridian City',
  'Pewter City',
  'Cerulean City',
  'Vermilion City',
  'Lavender Town',
  'Celadon City',
  'Fuchsia City',
  'Saffron City',
  'Cinnabar Island',
  'New Bark Town',
  'Cherrygrove City',
  'Violet City',
  'Azalea Town',
  'Goldenrod City',
  'Ecruteak City',
  'Olivine City',
  'Cianwood City',
  'Mahogany Town',
  'Blackthorn City',
  'Littleroot Town',
  'Oldale Town',
  'Petalburg City',
  'Rustboro City',
  'Dewford Town',
  'Slateport City',
  'Mauville City',
  'Lavaridge Town',
  'Fortree City',
  'Lilycove City',
  'Mossdeep City',
  'Sootopolis City',
  'Twinleaf Town',
  'Sandgem Town',
  'Jubilife City',
  'Oreburgh City',
  'Eterna City',
  'Hearthome City',
  'Veilstone City',
  'Pastoria City',
  'Canalave City',
  'Snowpoint City',
  'Sunyshore City',
  'Nuvema Town',
  'Accumula Town',
  'Striaton City',
  'Nacrene City',
  'Castelia City',
  'Nimbasa City',
  'Driftveil City',
  'Mistralton City',
  'Icirrus City',
  'Opelucid City',
  'Vaniville Town',
  'Aquacorde Town',
  'Santalune City',
  'Lumiose City',
  'Cyllage City',
  'Ambrette Town',
  'Shalour City',
  'Coumarine City',
  'Laverre City',
  'Anistar City',
  'Snowbelle City',
  'Iki Town',
  "Hau'oli City",
  'Heahea City',
  'Konikoni City',
  'Malie City',
  'Seafolk Village',
  'Po Town',
  'Postwick',
  'Wedgehurst',
  'Motostoke',
  'Turffield',
  'Hulbury',
  'Hammerlocke',
  'Stow-on-Side',
  'Ballonlea',
  'Circhester',
  'Spikemuth',
  'Wyndon',
  'Jubilife Village',
  'Mesagoza',
  'Cabo Poco',
  'Los Platos',
  'Cortondo',
  'Artazon',
  'Levincia',
  'Cascarrafa',
  'Medali',
  'Montenevera',
  'Alfornada',
  'Porto Marinada',
];

const mapOf = (name: string): CityMap | undefined => {
  if (name === 'Lumiose City') return lumioseZa;

  return kantoRby.locations.find((location) => location.name === name);
};

export const heroCities: Array<HeroCity> = cityNames.map((name) => ({
  name,
  map: mapOf(name),
}));
