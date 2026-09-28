import { type ReactNode, useEffect, useMemo } from 'react';

import {
  CRS,
  type LatLngBoundsLiteral,
  type LeafletEventHandlerFnMap,
  type PathOptions,
  Util,
} from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ImageOverlay,
  MapContainer,
  Pane,
  Polygon,
  Popup,
  Rectangle,
  Tooltip,
  useMap,
  useMapEvents,
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
  highlightKey?: string | Array<string>;
  onClick?: () => void;
  popup?: ReactNode;
  behind?: boolean;
  outline?: Array<Array<[number, number]>>;
};

type MapViewerProps = {
  map: MapImage;
  links?: Array<MapLink>;
  highlightable?: Array<MapLink>;
  highlighted?: string;
  className?: string;
};

export const MapViewer = ({
  map,
  links = [],
  highlightable = links,
  highlighted,
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
          <LinkShape
            key={`${link.href ?? link.label}@${link.x},${link.y}`}
            link={link}
            pathOptions={{
              className: cn(
                'map-link',
                !link.href && !link.onClick && !link.popup && 'map-link-static',
                link.className,
              ),
            }}
            eventHandlers={{
              add: ({ target }) => {
                if (link.behind) target.bringToBack();
              },
              click: () => {
                link.onClick?.();

                if (link.href)
                  navigate(link.href, {
                    state: travelState(link.travel),
                    replace: link.replace,
                    preventScrollReset: link.replace,
                  });
              },
            }}
          >
            {link.popup ? (
              <Popup
                className="map-popup"
                pane="popupPane"
                maxWidth={280}
                autoPanPaddingTopLeft={[16, 64]}
                autoPanPaddingBottomRight={[16, 16]}
              >
                {link.popup}
              </Popup>
            ) : (
              <Tooltip sticky pane="tooltipPane">
                {link.label}
              </Tooltip>
            )}
          </LinkShape>
        ))}
        {highlighted &&
          highlightable
            .filter((link) =>
              [link.highlightKey ?? link.href].flat().includes(highlighted),
            )
            .map((link) => (
              <LinkShape
                key={`highlight-${link.x},${link.y}`}
                link={link}
                interactive={false}
                pathOptions={{
                  className: cn('map-link-highlight', link.className),
                }}
              />
            ))}
      </Pane>
      <PanPastEdgesForPopups bounds={bounds} />
      <ClosePopupOnOutsidePress />
      <FitToViewport map={map} />
      {map.pixelated && <PixelatedWhenZoomedIn />}
    </MapContainer>
  );
};

const LinkShape = ({
  link,
  ...props
}: {
  link: MapLink;
  pathOptions: PathOptions;
  eventHandlers?: LeafletEventHandlerFnMap;
  interactive?: boolean;
  children?: ReactNode;
}) =>
  link.outline ? (
    <Polygon
      positions={link.outline.map((ring) =>
        ring.map(([x, y]) => toLatLng(x, y)),
      )}
      {...props}
    />
  ) : (
    <Rectangle
      bounds={[
        toLatLng(link.x, link.y + link.height),
        toLatLng(link.x + link.width, link.y),
      ]}
      {...props}
    />
  );

const PanPastEdgesForPopups = ({ bounds }: { bounds: LatLngBoundsLiteral }) => {
  useMapEvents({
    popupopen: ({ target }) => target.setMaxBounds(undefined),
    popupclose: ({ target }) => target.setMaxBounds(bounds),
  });

  return null;
};

const ClosePopupOnOutsidePress = () => {
  const leafletMap = useMap();

  useEffect(() => {
    const closeIfOutside = (event: PointerEvent) => {
      if (!leafletMap.getContainer().contains(event.target as Node))
        leafletMap.closePopup();
    };

    document.addEventListener('pointerdown', closeIfOutside);

    return () => document.removeEventListener('pointerdown', closeIfOutside);
  }, [leafletMap]);

  return null;
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
