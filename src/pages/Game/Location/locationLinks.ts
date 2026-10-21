import type { ReactNode } from 'react';

import type { Location, LocationFloor, Region } from '@/data/maps';

import { buildingIcons, markerLinks } from './links/buildings';
import { buildConnections, connectionIcons } from './links/connections';
import { createGifts } from './links/gifts';
import { itemMarkers } from './links/items';
import { npcMarkers } from './links/npcs';
import { layerSections } from './links/panel';
import { entranceRegisters, registerMarkers } from './links/shops';
import { prizeEntries, signMarkers } from './links/signs';
import { staticMarkers } from './links/statics';
import { trainerMarkers } from './links/trainers';
import type { MarkerSources } from './links/types';
import { wildMarkers } from './links/wild';

const withDoorTooltips = <T extends { label: string; tooltip?: ReactNode }>(
  links: Array<T>,
  doorTooltip: MarkerSources['doorTooltip'],
) =>
  doorTooltip
    ? links.map((link) =>
        link.tooltip ? link : { ...link, tooltip: doorTooltip(link.label) },
      )
    : links;

export const locationLinks = (
  region: Region,
  location: Location,
  path: string,
  href: (path: string) => string,
  tileSize = 1,
  floor?: LocationFloor,
  {
    from,
    items = [],
    itemTooltip,
    trainers = [],
    onSelectTrainer,
    trainerTooltip,
    npcs = [],
    npcTooltip,
    signs = [],
    signTooltip,
    doorTooltip,
    onOpen,
    shops = [],
    entranceShops = [],
    onOpenShop,
    wildAreas = [],
    wildPopup,
    wildCount,
    staticPokemon = [],
    staticPopup,
  }: MarkerSources = {},
) => {
  const { links, pairing, hotspotCount } = buildConnections({
    region,
    location,
    path,
    href,
    floor,
    from,
  });
  const image = floor ?? location;
  const markers = markerLinks(location, href, pairing, hotspotCount);
  const gifts = createGifts();

  const trainerLinks = trainerMarkers(trainers, tileSize, gifts, {
    onSelectTrainer,
    trainerTooltip,
  });
  const npcLinks = npcMarkers(npcs, tileSize, gifts, npcTooltip);

  const mapLinks = [
    ...wildMarkers(wildAreas, image, tileSize, wildPopup, wildCount),
    ...links.filter(
      (link) => link.layer !== 'connections' && link.layer !== 'buildings',
    ),
    ...withDoorTooltips(connectionIcons(links, image), doorTooltip),
    ...withDoorTooltips(buildingIcons(links, markers), doorTooltip),
    ...entranceRegisters(location.markers, entranceShops, tileSize, {
      onOpenShop,
    }),
    ...registerMarkers(shops, entranceShops, tileSize, { onOpenShop }),
    ...itemMarkers(items, tileSize, itemTooltip),
    ...staticMarkers(staticPokemon, npcs, tileSize, staticPopup),
    ...trainerLinks,
    ...npcLinks,
    ...signMarkers(signs, tileSize, { signTooltip, onOpen }),
  ];

  return {
    links: mapLinks,
    layerSections: layerSections({
      links: mapLinks,
      location,
      path,
      href,
      extraEntries: { items: [...gifts.entries, ...prizeEntries(signs)] },
    }),
  };
};
