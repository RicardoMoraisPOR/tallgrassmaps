import { useEffect, useMemo } from 'react';

import { CRS, Util } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ImageOverlay,
  MapContainer,
  Pane,
  Rectangle,
  Tooltip,
  useMap,
} from 'react-leaflet';
import { useNavigate } from 'react-router';

import type { Direction, MapImage, Rect } from '@/data/maps';
import { travelState } from '@/lib/motion';
import { cn } from '@/lib/utils';

import { imageBounds, toLatLng } from './coordinates';

const MAX_ZOOM = 3;

export type MapLink = Rect & {
  href?: string;
  label: string;
  travel?: Direction;
  className?: string;
  replace?: boolean;
};

type MapViewerProps = {
  map: MapImage;
  links?: Array<MapLink>;
  highlightedHref?: string;
  className?: string;
};

export const MapViewer = ({
  map,
  links = [],
  highlightedHref,
  className,
}: MapViewerProps) => {
  const navigate = useNavigate();
  const bounds = useMemo(() => imageBounds(map), [map]);

  return (
    <MapContainer
      key={map.image}
      crs={CRS.Simple}
      bounds={bounds}
      maxBounds={bounds}
      maxBoundsViscosity={1}
      zoomSnap={1}
      minZoom={-8}
      maxZoom={MAX_ZOOM}
      attributionControl={false}
      className={cn('isolate', className)}
      style={{ background: 'var(--muted)' }}
    >
      <ImageOverlay url={map.image} bounds={bounds} />
      <Pane name="links" style={{ zIndex: 450 }}>
        {links.map((link) => (
          <Rectangle
            key={`${link.href ?? link.label}@${link.x},${link.y}`}
            bounds={[
              toLatLng(link.x, link.y + link.height),
              toLatLng(link.x + link.width, link.y),
            ]}
            pathOptions={{
              className: cn(
                'map-link',
                !link.href && 'map-link-static',
                link.className,
              ),
            }}
            eventHandlers={{
              click: () => {
                if (link.href)
                  navigate(link.href, {
                    state: travelState(link.travel),
                    replace: link.replace,
                    preventScrollReset: link.replace,
                  });
              },
            }}
          >
            <Tooltip sticky pane="tooltipPane">
              {link.label}
            </Tooltip>
          </Rectangle>
        ))}
        {highlightedHref &&
          links
            .filter((link) => link.href === highlightedHref)
            .map((link) => (
              <Rectangle
                key={`highlight-${link.x},${link.y}`}
                bounds={[
                  toLatLng(link.x, link.y + link.height),
                  toLatLng(link.x + link.width, link.y),
                ]}
                interactive={false}
                pathOptions={{
                  className: cn('map-link-highlight', link.className),
                }}
              />
            ))}
      </Pane>
      <FitToViewport map={map} />
      {map.pixelated && <PixelatedWhenZoomedIn />}
    </MapContainer>
  );
};

const FitToViewport = ({ map }: { map: MapImage }) => {
  const leafletMap = useMap();

  useEffect(() => {
    const fitZoom = () => {
      const { x, y } = leafletMap.getSize();
      const zoom = Math.log2(Math.min(x / map.width, y / map.height));

      return zoom < 0 ? zoom : Math.floor(zoom);
    };

    const fitView = () => {
      const zoom = fitZoom();

      Util.setOptions(leafletMap, { zoomSnap: 0 });
      leafletMap.setView(toLatLng(map.width / 2, map.height / 2), zoom, {
        animate: false,
      });
      Util.setOptions(leafletMap, { zoomSnap: 1 });
      leafletMap.setMinZoom(zoom);
    };

    fitView();

    const onResize = () => {
      const zoom = fitZoom();
      const current = leafletMap.getZoom();

      if (current <= leafletMap.getMinZoom() || current < zoom) {
        fitView();
      } else {
        leafletMap.setMinZoom(zoom);
      }
    };

    leafletMap.on('resize', onResize);

    const observer = new ResizeObserver(() =>
      leafletMap.invalidateSize({ pan: false }),
    );

    observer.observe(leafletMap.getContainer());

    return () => {
      observer.disconnect();
      leafletMap.off('resize', onResize);
    };
  }, [leafletMap, map]);

  return null;
};

const PixelatedWhenZoomedIn = () => {
  const leafletMap = useMap();

  useEffect(() => {
    const container = leafletMap.getContainer();
    const update = () =>
      container.classList.toggle('map-pixelated', leafletMap.getZoom() >= 0);

    update();
    leafletMap.on('zoomend', update);

    return () => {
      leafletMap.off('zoomend', update);
    };
  }, [leafletMap]);

  return null;
};
