import { useEffect, useState } from 'react';

import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';

import { useThemeStyle } from '@/components/settings/themes';

import { linkKey } from '../viewer/links';
import type { MapLink, TileCluster } from '../viewer/types';
import { badgeCenter } from '../viewer/WildAreaArt';
import {
  badgeImage,
  badgeImageName,
  clusterImage,
  clusterImageName,
  ensureImage,
} from './glBadgeImages';
import { toLngLat } from './glCoordinates';
import { iconScaleStops } from './glLayers';

const BADGES = 'badges';
const CLUSTERS = 'clusters';

type GlBadgesProps = {
  map: MapLibreMap;
  links: Array<MapLink>;
  clusters?: Array<TileCluster>;
};

export const GlBadges = ({ map, links, clusters }: GlBadgesProps) => {
  const style = useThemeStyle('mapIcons');
  const [dark, setDark] = useState(
    document.documentElement.classList.contains('dark'),
  );

  useEffect(() => {
    const observer = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains('dark')),
    );

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    [BADGES, CLUSTERS].forEach((id) => {
      map.addSource(id, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer(
        {
          id,
          type: 'symbol',
          source: id,
          layout: {
            'icon-image': ['get', 'image'],
            'icon-anchor': 'center',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'icon-pitch-alignment': 'viewport',
            'icon-rotation-alignment': 'viewport',
            ...(id === BADGES
              ? { 'icon-size': iconScaleStops(28) as never }
              : {}),
          },
        },
        'z-top',
      );
    });

    return () => {
      [CLUSTERS, BADGES].forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);

        if (map.getSource(id)) map.removeSource(id);
      });
    };
  }, [map]);

  useEffect(() => {
    let cancelled = false;
    const badged = links.filter((link) => Boolean(link.badge));

    Promise.all(
      [...new Set(badged.map((link) => link.badge ?? 0))].map((count) =>
        ensureImage(map, badgeImageName(count, style), () =>
          badgeImage(count, style),
        ),
      ),
    ).then(() => {
      if (cancelled) return;

      (map.getSource(BADGES) as GeoJSONSource | undefined)?.setData({
        type: 'FeatureCollection',
        features: badged.map((link) => {
          const { x, y } = badgeCenter(link);

          return {
            type: 'Feature',
            properties: {
              key: linkKey(link),
              image: badgeImageName(link.badge ?? 0, style),
            },
            geometry: { type: 'Point', coordinates: toLngLat(x, y) },
          };
        }),
      });
    });

    return () => {
      cancelled = true;
    };
  }, [map, links, style, dark]);

  useEffect(() => {
    let cancelled = false;
    const list = clusters ?? [];
    const pillsOf = (cluster: TileCluster) =>
      cluster.counts.map(({ count, color }) => ({
        text: String(count),
        color,
      }));

    Promise.all(
      list.map((cluster) =>
        ensureImage(
          map,
          clusterImageName(pillsOf(cluster), Boolean(cluster.compact)),
          () => clusterImage(pillsOf(cluster), Boolean(cluster.compact)),
        ),
      ),
    ).then(() => {
      if (cancelled) return;

      (map.getSource(CLUSTERS) as GeoJSONSource | undefined)?.setData({
        type: 'FeatureCollection',
        features: list.map((cluster) => ({
          type: 'Feature',
          properties: {
            cluster: cluster.tileId,
            x: cluster.x,
            y: cluster.y,
            image: clusterImageName(pillsOf(cluster), Boolean(cluster.compact)),
          },
          geometry: {
            type: 'Point',
            coordinates: toLngLat(cluster.x, cluster.y),
          },
        })),
      });
    });

    return () => {
      cancelled = true;
    };
  }, [map, clusters, dark]);

  return null;
};
