import { useEffect, useRef } from 'react';

import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';

import { linkKey } from '../viewer/links';
import type { MapLink, MapPalette } from '../viewer/types';
import { linkColor } from './glColors';
import { BASE_ZOOM, fromGlZoom, toLngLat } from './glCoordinates';
import { FEATURE_ZOOM_SCALE } from './glLayers';
import {
  ensureSpriteGlows,
  ensureSpriteImages,
  SPRITE_GLOW_PAD,
  SPRITE_HI_SCALE,
  SPRITE_LO_SCALE,
  type SpriteWant,
  spriteGlowName,
  spriteImageName,
} from './glSpriteImages';

const IDLE = 'sprites';
const HI = 'sprites-hi';
const ACTIVE = 'sprites-active';
const MIN_ZOOM = 0;
const MAX_ZOOM = 22;
const FADED_OPACITY = 0.5;
const HI_FROM_ZOOM = 2;
const HI_PREPARE_ZOOM = HI_FROM_ZOOM - 0.5;
const HI_VIEW_PADDING = 0.5;
const HI_REFRESH_MS = 120;

type GlSpritesProps = {
  map: MapLibreMap;
  links: Array<MapLink>;
  palette?: MapPalette;
  activeKeys: Set<string>;
};

const wantFor = (link: MapLink, palette?: MapPalette): SpriteWant | undefined =>
  link.sprite && {
    src: link.sprite.src,
    facing: link.sprite.facing,
    width: link.width,
    height: link.height,
    palette: palette?.on ? palette.objectsOf(link.floorId) : undefined,
  };

const layerSpec = (id: string, offset: boolean, minzoom?: number) => ({
  id,
  type: 'symbol' as const,
  source: id,
  ...(minzoom === undefined ? {} : { minzoom }),
  layout: {
    'icon-image': ['get', 'image'],
    'icon-anchor': 'bottom',
    'icon-allow-overlap': true,
    'icon-ignore-placement': true,
    'icon-pitch-alignment': 'viewport',
    'icon-rotation-alignment': 'viewport',
    'symbol-sort-key': ['get', 'sort'],
    'icon-size': FEATURE_ZOOM_SCALE(BASE_ZOOM, MIN_ZOOM, MAX_ZOOM) as never,
    ...(offset ? { 'icon-offset': [0, SPRITE_GLOW_PAD] } : {}),
  },
  paint: { 'icon-opacity': ['get', 'opacity'] },
});

export const GlSprites = ({
  map,
  links,
  palette,
  activeKeys,
}: GlSpritesProps) => {
  useEffect(() => {
    [IDLE, HI, ACTIVE].forEach((id) => {
      map.addSource(id, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer(
        layerSpec(
          id,
          id === ACTIVE,
          id === HI ? BASE_ZOOM + HI_FROM_ZOOM : undefined,
        ) as never,
        id === ACTIVE ? 'z-icons' : 'z-sprites-active',
      );
    });

    return () => {
      [ACTIVE, HI, IDLE].forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);

        if (map.getSource(id)) map.removeSource(id);
      });
    };
  }, [map]);

  const paletteId = palette?.on ? 'on' : 'off';

  const wantsOf = () =>
    links.flatMap((link) => {
      const want = wantFor(link, palette);

      return want ? [{ link, want }] : [];
    });

  const featureOf = (
    { link }: ReturnType<typeof wantsOf>[number],
    image: string,
    active: boolean,
  ) => ({
    type: 'Feature' as const,
    properties: {
      key: linkKey(link),
      image,
      opacity: link.sprite?.faded && !active ? FADED_OPACITY : 1,
      sort: link.y + link.height,
    },
    geometry: {
      type: 'Point' as const,
      coordinates: toLngLat(link.x + link.width / 2, link.y + link.height),
    },
  });

  const latestWants = useRef<ReturnType<typeof wantsOf>>([]);

  latestWants.current = wantsOf();

  useEffect(() => {
    let cancelled = false;
    const wants = latestWants.current;

    ensureSpriteImages(
      map,
      wants.map(({ want }) => want),
      SPRITE_LO_SCALE,
    ).then(() => {
      if (cancelled) return;

      (map.getSource(IDLE) as GeoJSONSource | undefined)?.setData({
        type: 'FeatureCollection',
        features: wants.map((item) =>
          featureOf(item, spriteImageName(item.want, SPRITE_LO_SCALE), false),
        ),
      });
    });

    return () => {
      cancelled = true;
    };
  }, [map, links, paletteId]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const refresh = () => {
      const source = map.getSource(HI) as GeoJSONSource | undefined;

      if (fromGlZoom(map.getZoom()) < HI_PREPARE_ZOOM) {
        source?.setData({ type: 'FeatureCollection', features: [] });

        return;
      }

      const bounds = map.getBounds();
      const west = bounds.getWest();
      const east = bounds.getEast();
      const south = bounds.getSouth();
      const north = bounds.getNorth();
      const padX = (east - west) * HI_VIEW_PADDING;
      const padY = (north - south) * HI_VIEW_PADDING;
      const nearby = latestWants.current.filter(({ link }) => {
        const [lng, lat] = toLngLat(
          link.x + link.width / 2,
          link.y + link.height,
        );

        return (
          lng >= west - padX &&
          lng <= east + padX &&
          lat >= south - padY &&
          lat <= north + padY
        );
      });

      ensureSpriteImages(
        map,
        nearby.map(({ want }) => want),
        SPRITE_HI_SCALE,
      ).then(() => {
        if (cancelled) return;

        source?.setData({
          type: 'FeatureCollection',
          features: nearby.map((item) =>
            featureOf(item, spriteImageName(item.want, SPRITE_HI_SCALE), false),
          ),
        });
      });
    };

    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(refresh, HI_REFRESH_MS);
    };

    map.on('moveend', schedule);
    map.on('zoomend', schedule);
    schedule();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      map.off('moveend', schedule);
      map.off('zoomend', schedule);
    };
  }, [map, links, paletteId]);

  useEffect(() => {
    let cancelled = false;
    const wants = latestWants.current.filter(({ link }) =>
      activeKeys.has(linkKey(link)),
    );

    ensureSpriteGlows(
      map,
      wants.map(({ link, want }) => ({
        want,
        color: linkColor(link.className),
      })),
    ).then(() => {
      if (cancelled) return;

      (map.getSource(ACTIVE) as GeoJSONSource | undefined)?.setData({
        type: 'FeatureCollection',
        features: wants.map((item) =>
          featureOf(
            item,
            spriteGlowName(item.want, linkColor(item.link.className)),
            true,
          ),
        ),
      });
    });

    return () => {
      cancelled = true;
    };
  }, [map, links, paletteId, activeKeys]);

  return null;
};
