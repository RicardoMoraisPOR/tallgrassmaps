import type { Location } from '@/data/maps';
import { joinPath } from '@/lib/paths';

import { type MapLayerId, mapLayers } from '../mapLayers';
import type {
  LayeredMapLink,
  LayerEntry,
  LayerGroup,
  LayerSection,
} from './types';

const PANEL_SECTIONS: Array<{
  id: LayerSection['id'];
  layers: Array<MapLayerId>;
}> = [
  {
    id: 'interactions',
    layers: ['items', 'hidden-items', 'static-pokemon', 'special-npcs', 'npcs'],
  },
  { id: 'exits', layers: ['connections', 'buildings', 'services'] },
];

type PanelContext = {
  links: Array<LayeredMapLink>;
  location: Location;
  path: string;
  href: (path: string) => string;
  extraEntries: Partial<Record<MapLayerId, Array<LayerEntry>>>;
};

export const layerSections = ({
  links,
  location,
  path,
  href,
  extraEntries,
}: PanelContext): Array<LayerSection> => {
  const entriesFor = (layer: MapLayerId) => {
    const entries = new Map<string, LayerEntry>();

    for (const link of links) {
      const key = [link.highlightKey].flat()[0] ?? link.href;

      if (link.layer !== layer || link.unlisted || !key || entries.has(key))
        continue;

      entries.set(key, {
        key,
        name: link.label,
        href: link.href,
        travel: link.travel,
        replace: link.replace,
        opens: Boolean(link.tooltip),
      });
    }

    return entries;
  };

  const listedHrefs = new Set(
    links.flatMap((link) => link.href?.split('?')[0] ?? []),
  );
  const reachedThroughChildren = new Set(
    location.locations.flatMap((child) =>
      [
        ...child.hotspots,
        ...(child.floors ?? []).flatMap(({ hotspots }) => hotspots),
      ].map(({ target }) => target),
    ),
  );
  const unlistedChildren: Array<LayerEntry> = location.locations
    .filter(
      (child) =>
        !reachedThroughChildren.has(child.dataPath ?? joinPath(path, child.id)),
    )
    .map((child) => {
      const childHref = href(joinPath(path, child.id));

      return { key: childHref, name: child.name, href: childHref };
    })
    .filter((entry) => !listedHrefs.has(entry.href));

  const groupFor = (id: MapLayerId): LayerGroup => {
    const layer = mapLayers.find((entry) => entry.id === id)!;
    const entries = entriesFor(id);

    if (id === 'buildings')
      for (const entry of unlistedChildren) entries.set(entry.key, entry);

    for (const entry of extraEntries[id] ?? []) entries.set(entry.key, entry);

    return { layer, entries: [...entries.values()] };
  };

  return PANEL_SECTIONS.map(({ id, layers }) => ({
    id,
    groups: layers.map(groupFor).filter(({ entries }) => entries.length > 0),
  })).filter(({ groups }) => groups.length > 0);
};
