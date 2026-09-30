import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  CRS,
  type LatLngBoundsLiteral,
  type LeafletEventHandlerFnMap,
  type PathOptions,
  type SVGOverlay as LeafletSVGOverlay,
  Util,
} from 'leaflet';
import { createPortal } from 'react-dom';
import 'leaflet/dist/leaflet.css';
import {
  ImageOverlay,
  MapContainer,
  Pane,
  Polygon,
  Popup,
  Rectangle,
  SVGOverlay,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import { useNavigate } from 'react-router';

import type { Direction, MapImage, Rect } from '@/data/maps';
import type { SpriteFacing } from '@/data/trainers/types';
import { travelState } from '@/lib/motion';
import { cn } from '@/lib/utils';

import { imageBounds, toLatLng } from './coordinates';

const MAX_ZOOM = 3;
const HOVER_CARD_GAP = 10;
const HOVER_CARD_EDGE = 8;
const SPRITE_SIZE = 16;
const SPRITE_FRAMES = 3;

const facingFrames: Record<SpriteFacing, number> = {
  down: 0,
  up: 1,
  left: 2,
  right: 2,
};

export type MapLink = Rect & {
  href?: string;
  label: string;
  travel?: Direction;
  className?: string;
  replace?: boolean;
  highlightKey?: string | Array<string>;
  onClick?: () => void;
  popup?: ReactNode;
  tooltip?: ReactNode;
  behind?: boolean;
  outline?: Array<Array<[number, number]>>;
  sprite?: { src: string; facing: SpriteFacing };
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
  const [hoveredSprite, setHoveredSprite] = useState<string>();
  const [hoverCardKey, setHoverCardKey] = useState<string>();

  const hoverCard = links.find(
    (link) => link.tooltip && linkKey(link) === hoverCardKey,
  );

  const isHighlighted = (link: MapLink) =>
    highlighted !== undefined &&
    [link.highlightKey ?? link.href].flat().includes(highlighted);

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
      {links.map(
        (link) =>
          link.sprite && (
            <MapSprite
              key={`sprite-${link.x},${link.y}`}
              link={link}
              sprite={link.sprite}
              active={hoveredSprite === spriteKey(link) || isHighlighted(link)}
            />
          ),
      )}
      <Pane name="links" style={{ zIndex: 450 }}>
        {links.map((link) => (
          <LinkShape
            key={linkKey(link)}
            link={link}
            pathOptions={{
              className: cn(
                'map-link',
                !link.href && !link.onClick && !link.popup && 'map-link-static',
                link.sprite && 'map-link-sprite',
                link.className,
              ),
            }}
            eventHandlers={{
              add: ({ target }) => {
                if (link.behind) target.bringToBack();
              },
              mouseover: () => {
                if (link.sprite) setHoveredSprite(spriteKey(link));
                if (link.tooltip) setHoverCardKey(linkKey(link));
              },
              mouseout: () => {
                if (link.sprite) setHoveredSprite(undefined);
                if (link.tooltip) setHoverCardKey(undefined);
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
            ) : link.tooltip ? null : (
              <Tooltip sticky pane="tooltipPane">
                {link.label}
              </Tooltip>
            )}
          </LinkShape>
        ))}
        {highlighted &&
          highlightable
            .filter((link) => !link.sprite && isHighlighted(link))
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
      {hoverCard && <HoverCard key={linkKey(hoverCard)} link={hoverCard} />}
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

const spriteKey = (link: MapLink) => `${link.x},${link.y}`;

const linkKey = (link: MapLink) =>
  `${link.href ?? link.label}@${link.x},${link.y}`;

const HoverCard = ({ link }: { link: MapLink }) => {
  const leafletMap = useMap();
  const card = useRef<HTMLDivElement>(null);
  const [, setViewChanges] = useState(0);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useMapEvents({
    move: () => setViewChanges((count) => count + 1),
    zoom: () => setViewChanges((count) => count + 1),
  });

  useLayoutEffect(() => {
    setSize({
      width: card.current?.offsetWidth ?? 0,
      height: card.current?.offsetHeight ?? 0,
    });
  }, []);

  const centerX = link.x + link.width / 2;
  const top = leafletMap.latLngToContainerPoint(toLatLng(centerX, link.y));
  const bottom = leafletMap.latLngToContainerPoint(
    toLatLng(centerX, link.y + link.height),
  );
  const container = leafletMap.getSize();
  const below = top.y - HOVER_CARD_GAP - size.height < HOVER_CARD_EDGE;
  const left = Math.min(
    Math.max(top.x - size.width / 2, HOVER_CARD_EDGE),
    container.x - size.width - HOVER_CARD_EDGE,
  );

  return createPortal(
    <div
      ref={card}
      className="pointer-events-none absolute z-1000 animate-in duration-100 fade-in-0 zoom-in-95"
      style={{
        left,
        top: below
          ? bottom.y + HOVER_CARD_GAP
          : top.y - HOVER_CARD_GAP - size.height,
        visibility: size.height === 0 ? 'hidden' : undefined,
      }}
    >
      {link.tooltip}
    </div>,
    leafletMap.getContainer(),
  );
};

const MapSprite = ({
  link,
  sprite: { src, facing },
  active,
}: {
  link: MapLink;
  sprite: NonNullable<MapLink['sprite']>;
  active: boolean;
}) => {
  const overlay = useRef<LeafletSVGOverlay>(null);

  useEffect(() => {
    overlay.current
      ?.getElement()
      ?.classList.toggle('map-sprite-active', active);
  }, [active]);

  return (
    <SVGOverlay
      ref={overlay}
      bounds={[
        toLatLng(link.x, link.y + link.height),
        toLatLng(link.x + link.width, link.y),
      ]}
      attributes={{
        viewBox: `0 ${facingFrames[facing] * SPRITE_SIZE} ${SPRITE_SIZE} ${SPRITE_SIZE}`,
        class: cn('map-sprite', link.className),
      }}
      interactive={false}
    >
      <image
        href={src}
        width={SPRITE_SIZE}
        height={SPRITE_SIZE * SPRITE_FRAMES}
        transform={
          facing === 'right'
            ? `translate(${SPRITE_SIZE} 0) scale(-1 1)`
            : undefined
        }
      />
    </SVGOverlay>
  );
};

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
