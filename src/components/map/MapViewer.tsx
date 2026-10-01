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
  divIcon,
  DomEvent,
  type LatLngBoundsLiteral,
  type LatLngTuple,
  type LeafletEventHandlerFnMap,
  type Map as LeafletMap,
  type Marker as LeafletMarker,
  type PointTuple,
  type SVGOverlay as LeafletSVGOverlay,
  Util,
} from 'leaflet';
import { createPortal } from 'react-dom';
import 'leaflet/dist/leaflet.css';
import {
  ImageOverlay,
  MapContainer,
  Marker,
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

import { useThemeStyle } from '@/components/settings/themes';
import type { Direction, MapImage, Rect } from '@/data/maps';
import type { SpriteFacing } from '@/data/trainers/types';
import { travelState } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { ThemeStyle } from '@/stores/settings';

import { imageBounds, toLatLng } from './coordinates';

const MAX_ZOOM = 3;
const FOCUS_DELAY = 250;
const FOCUS_DURATION = 0.6;
const FOCUS_BELOW_ZOOM = 1;
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
  tooltipOnClick?: boolean;
  tooltipAtClick?: boolean;
  behind?: boolean;
  outline?: Array<Array<[number, number]>>;
  sprite?: { src: string; facing: SpriteFacing; faded?: boolean };
  icon?: MapIconKind;
};

export type MapIconKind =
  | { kind: 'arrow'; direction: Direction }
  | { kind: 'door' }
  | { kind: 'exit' }
  | { kind: 'stairs' }
  | { kind: 'ladder' }
  | { kind: 'sign' };

type MapViewerProps = {
  map: MapImage;
  links?: Array<MapLink>;
  highlightable?: Array<MapLink>;
  highlighted?: string;
  pinRequest?: { key: string };
  focusKey?: string;
  className?: string;
};

export const MapViewer = ({
  map,
  links = [],
  highlightable = links,
  highlighted,
  pinRequest,
  focusKey,
  className,
}: MapViewerProps) => {
  const navigate = useNavigate();
  const bounds = useMemo(() => imageBounds(map), [map]);
  const [hoveredSprite, setHoveredSprite] = useState<string>();
  const [hoverCardKey, setHoverCardKey] = useState<string>();

  const [pinnedCardKey, setPinnedCardKey] = useState<string>();
  const [pinnedAnchor, setPinnedAnchor] = useState<{ x: number; y: number }>();

  const cardKey = pinnedCardKey ?? hoverCardKey;
  const hoverCard = links.find(
    (link) => link.tooltip && linkKey(link) === cardKey,
  );

  const focusLink =
    focusKey &&
    links.find((link) => [link.highlightKey].flat().includes(focusKey));
  const focusPoint = focusLink
    ? toLatLng(
        focusLink.x + focusLink.width / 2,
        focusLink.y + focusLink.height / 2,
      )
    : undefined;

  const iconHrefs = new Set(
    links.flatMap((link) => (link.icon && link.href ? [link.href] : [])),
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
              active={
                hoveredSprite === spriteKey(link) ||
                pinnedCardKey === linkKey(link) ||
                isHighlighted(link)
              }
              revealed={
                hoveredSprite === spriteKey(link) ||
                pinnedCardKey === linkKey(link) ||
                isHighlighted(link)
              }
            />
          ),
      )}
      {links.map(
        (link) =>
          link.icon && (
            <MapIcon
              key={`icon-${linkKey(link)}`}
              link={link}
              icon={link.icon}
              active={isHighlighted(link) || pinnedCardKey === linkKey(link)}
              onSelect={
                link.tooltip && link.tooltipOnClick
                  ? () =>
                      setPinnedCardKey((current) =>
                        current === linkKey(link) ? undefined : linkKey(link),
                      )
                  : undefined
              }
            />
          ),
      )}
      <Pane name="links" style={{ zIndex: 450 }}>
        {links
          .filter((link) => !link.icon)
          .map((link) => (
            <LinkShape
              key={linkKey(link)}
              link={link}
              className={cn(
                'map-link',
                !link.href &&
                  !link.onClick &&
                  !link.popup &&
                  !link.tooltipOnClick &&
                  'map-link-static',
                link.sprite && 'map-link-sprite',
                link.className,
              )}
              eventHandlers={{
                add: ({ target }) => {
                  if (link.behind) target.bringToBack();
                },
                mouseover: () => {
                  if (link.sprite) setHoveredSprite(spriteKey(link));
                  if (link.tooltip && !link.tooltipOnClick)
                    setHoverCardKey(linkKey(link));
                },
                mouseout: () => {
                  if (link.sprite) setHoveredSprite(undefined);
                  if (link.tooltip && !link.tooltipOnClick)
                    setHoverCardKey(undefined);
                },
                click: (event) => {
                  link.onClick?.();

                  if (link.tooltip && link.tooltipOnClick) {
                    DomEvent.stopPropagation(event);
                    setPinnedAnchor(
                      link.tooltipAtClick
                        ? { x: event.latlng.lng, y: -event.latlng.lat }
                        : undefined,
                    );
                    setPinnedCardKey((current) =>
                      current === linkKey(link) ? undefined : linkKey(link),
                    );
                  }

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
            .filter(
              (link) =>
                !link.sprite &&
                !link.icon &&
                !(link.href && iconHrefs.has(link.href)) &&
                isHighlighted(link),
            )
            .map((link) => (
              <LinkShape
                key={`highlight-${link.x},${link.y}`}
                link={link}
                interactive={false}
                className={cn('map-link-highlight', link.className)}
              />
            ))}
        {hoverCard &&
          pinnedCardKey === linkKey(hoverCard) &&
          !hoverCard.sprite &&
          !hoverCard.icon && (
            <LinkShape
              key={`pinned-${linkKey(hoverCard)}`}
              link={hoverCard}
              interactive={false}
              className={cn('map-link-pinned', hoverCard.className)}
            />
          )}
      </Pane>
      {hoverCard && (
        <HoverCard
          key={`${linkKey(hoverCard)}@${pinnedAnchor?.x},${pinnedAnchor?.y}`}
          link={hoverCard}
          anchor={pinnedCardKey ? pinnedAnchor : undefined}
          interactive={pinnedCardKey !== undefined}
        />
      )}
      {pinnedCardKey && (
        <UnpinOnDismiss onDismiss={() => setPinnedCardKey(undefined)} />
      )}
      <PinOnRequest
        request={pinRequest}
        links={links}
        onPin={(link) => {
          setPinnedAnchor(undefined);
          setPinnedCardKey(linkKey(link));
        }}
      />
      <PanBounds bounds={bounds} />
      <ClosePopupOnOutsidePress />
      <FitToViewport map={map} focus={focusPoint} />
      {map.pixelated && <PixelatedWhenZoomedIn />}
      <IconSizeForZoom />
    </MapContainer>
  );
};

const LinkShape = ({
  link,
  ...props
}: {
  link: MapLink;
  className: string;
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

const MAP_ICON_SIZE = 28;

const edgeAnchors: Record<Direction, PointTuple> = {
  north: [MAP_ICON_SIZE / 2, 0],
  south: [MAP_ICON_SIZE / 2, MAP_ICON_SIZE],
  west: [0, MAP_ICON_SIZE / 2],
  east: [MAP_ICON_SIZE, MAP_ICON_SIZE / 2],
};

const iconArt: Record<MapIconKind['kind'], Record<ThemeStyle, string>> = {
  arrow: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>',
    game: '<svg viewBox="0 0 7 7" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M3 0h1v1h1v1h1v1h1v1h-2v3h-3v-3h-2v-1h1v-1h1v-1h1z"/></svg>',
  },
  exit: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>',
    game: '<svg viewBox="0 0 8 7" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M0 0h4v1h-4zM0 1h1v5h-1zM0 6h4v1h-4zM2 3h6v1h-6zM5 1h1v1h-1zM5 2h2v1h-2zM5 4h2v1h-2zM5 5h1v1h-1z"/></svg>',
  },
  stairs: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h5v-5h5v-5h5V6h3"/></svg>',
    game: '<svg viewBox="0 0 8 8" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M6 0h2v8h-8v-2h2v-2h2v-2h2z"/></svg>',
  },
  ladder: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3v18"/><path d="M16 3v18"/><path d="M8 7h8"/><path d="M8 12h8"/><path d="M8 17h8"/></svg>',
    game: '<svg viewBox="0 0 7 8" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M1 0h1v8h-1zM5 0h1v8h-1zM2 1h3v1h-3zM2 4h3v1h-3zM2 7h3v1h-3z"/></svg>',
  },
  sign: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 13v8"/><path d="M12 3v3"/><path d="M18 6a2 2 0 0 1 1.387.56l2.307 2.22a1 1 0 0 1 0 1.44l-2.307 2.22A2 2 0 0 1 18 13H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"/></svg>',
    game: '<svg viewBox="0 0 8 8" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M0 0h8v5h-8zM1 1h6v1h-6zM1 3h4v1h-4z"/><path fill="currentColor" d="M3 5h2v3h-2z"/></svg>',
  },
  door: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 20H2"/><path d="M11 4.562v16.157a1 1 0 0 0 1.242.97L19 20V5.562a2 2 0 0 0-1.515-1.94l-4-1A2 2 0 0 0 11 4.561z"/><path d="M11 4H8a2 2 0 0 0-2 2v14"/><path d="M14 12h.01"/><path d="M22 20h-3"/></svg>',
    game: '<svg viewBox="0 0 7 8" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M1 0h5v7h-5zM4 3h1v1h-1z"/><path fill="currentColor" d="M0 7h7v1h-7z"/></svg>',
  },
};

const MapIcon = ({
  link,
  icon,
  active,
  onSelect,
}: {
  link: MapLink;
  icon: MapIconKind;
  active: boolean;
  onSelect?: () => void;
}) => {
  const navigate = useNavigate();
  const style = useThemeStyle('mapIcons');
  const markerRef = useRef<LeafletMarker>(null);

  const direction = icon.kind === 'arrow' ? icon.direction : undefined;
  const marker = useMemo(
    () =>
      divIcon({
        className: cn(
          'map-icon-anchor',
          direction && `map-icon-anchor-${direction}`,
        ),
        html: `<span class="${cn('map-icon', link.className, style === 'game' && 'map-icon-game')}"${direction ? ` data-direction="${direction}"` : ''}>${iconArt[icon.kind][style]}</span>`,
        iconSize: [MAP_ICON_SIZE, MAP_ICON_SIZE],
        iconAnchor: direction
          ? edgeAnchors[direction]
          : [MAP_ICON_SIZE / 2, MAP_ICON_SIZE / 2],
      }),
    [style, icon.kind, direction, link.className],
  );

  useEffect(() => {
    markerRef.current
      ?.getElement()
      ?.querySelector('.map-icon')
      ?.classList.toggle('map-icon-active', active);
  }, [active, marker]);

  return (
    <Marker
      ref={markerRef}
      position={toLatLng(link.x, link.y)}
      icon={marker}
      title={link.label}
      eventHandlers={{
        click: (event) => {
          if (onSelect) {
            DomEvent.stopPropagation(event);
            onSelect();
          }

          if (link.href)
            navigate(link.href, { state: travelState(link.travel) });
        },
      }}
    />
  );
};

const spriteKey = (link: MapLink) => `${link.x},${link.y}`;

const linkKey = (link: MapLink) =>
  `${link.href ?? link.label}@${link.x},${link.y}`;

const HoverCard = ({
  link,
  anchor,
  interactive,
}: {
  link: MapLink;
  anchor?: { x: number; y: number };
  interactive: boolean;
}) => {
  const leafletMap = useMap();
  const card = useRef<HTMLDivElement>(null);
  const [, setViewChanges] = useState(0);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useMapEvents({
    move: () => setViewChanges((count) => count + 1),
    zoom: () => setViewChanges((count) => count + 1),
  });

  useLayoutEffect(() => {
    const measure = () =>
      setSize({
        width: card.current?.offsetWidth ?? 0,
        height: card.current?.offsetHeight ?? 0,
      });
    const observer = new ResizeObserver(measure);

    measure();

    if (card.current) observer.observe(card.current);

    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (interactive && card.current) {
      DomEvent.disableClickPropagation(card.current);
      DomEvent.disableScrollPropagation(card.current);
    }
  }, [interactive]);

  const centerX = anchor?.x ?? link.x + link.width / 2;
  const top = leafletMap.latLngToContainerPoint(
    toLatLng(centerX, anchor?.y ?? link.y),
  );
  const bottom = leafletMap.latLngToContainerPoint(
    toLatLng(centerX, anchor?.y ?? link.y + link.height),
  );
  const container = leafletMap.getSize();
  const gap =
    link.icon && !anchor ? MAP_ICON_SIZE / 2 + HOVER_CARD_GAP : HOVER_CARD_GAP;
  const below = top.y - gap - size.height < HOVER_CARD_EDGE;
  const left = Math.min(
    Math.max(top.x - size.width / 2, HOVER_CARD_EDGE),
    container.x - size.width - HOVER_CARD_EDGE,
  );

  return createPortal(
    <div
      ref={card}
      className={cn(
        'map-card absolute z-1000 w-max animate-in duration-50 fade-in-0 zoom-in-95',
        !interactive && 'pointer-events-none',
      )}
      style={{
        left,
        top: below ? bottom.y + gap : top.y - gap - size.height,
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
  sprite: { src, facing, faded },
  active,
  revealed,
}: {
  link: MapLink;
  sprite: NonNullable<MapLink['sprite']>;
  active: boolean;
  revealed: boolean;
}) => {
  const overlay = useRef<LeafletSVGOverlay>(null);

  useEffect(() => {
    overlay.current
      ?.getElement()
      ?.classList.toggle('map-sprite-active', active);
  }, [active]);

  useEffect(() => {
    overlay.current
      ?.getElement()
      ?.classList.toggle('map-sprite-faded', Boolean(faded) && !revealed);
  }, [faded, revealed]);

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

const UnpinOnDismiss = ({ onDismiss }: { onDismiss: () => void }) => {
  const leafletMap = useMapEvents({ click: onDismiss });

  useEffect(() => {
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss();
    };
    const dismissOutside = (event: PointerEvent) => {
      if (!leafletMap.getContainer().contains(event.target as Node))
        onDismiss();
    };

    document.addEventListener('keydown', dismissOnEscape);
    document.addEventListener('pointerdown', dismissOutside, true);

    return () => {
      document.removeEventListener('keydown', dismissOnEscape);
      document.removeEventListener('pointerdown', dismissOutside, true);
    };
  }, [leafletMap, onDismiss]);

  return null;
};

const PinOnRequest = ({
  request,
  links,
  onPin,
}: {
  request?: { key: string };
  links: Array<MapLink>;
  onPin: (link: MapLink) => void;
}) => {
  const leafletMap = useMap();
  const handled = useRef(request);

  useEffect(() => {
    if (!request || handled.current === request) return;

    handled.current = request;

    const link = links.find(
      (entry) =>
        entry.tooltip && [entry.highlightKey].flat().includes(request.key),
    );

    if (!link) return;

    leafletMap.panInside(
      toLatLng(link.x + link.width / 2, link.y + link.height / 2),
      { padding: [96, 96] },
    );
    onPin(link);
  }, [leafletMap, request, links, onPin]);

  return null;
};

const PanBounds = ({ bounds }: { bounds: LatLngBoundsLiteral }) => {
  const [[bottom, left], [top, right]] = bounds;
  const popupOpen = useRef(false);

  const update = (leafletMap: LeafletMap) => {
    if (popupOpen.current) return leafletMap.setMaxBounds(undefined);
    if (leafletMap.getZoom() <= leafletMap.getMinZoom())
      return leafletMap.setMaxBounds(bounds);

    const { x, y } = leafletMap.getSize();
    const scale = 2 ** leafletMap.getZoom();
    const padX = x / scale / 2;
    const padY = y / scale / 2;

    leafletMap.setMaxBounds([
      [bottom - padY, left - padX],
      [top + padY, right + padX],
    ]);
  };

  useMapEvents({
    zoomend: ({ target }) => update(target),
    resize: ({ target }) => update(target),
    popupopen: ({ target }) => {
      popupOpen.current = true;
      update(target);
    },
    popupclose: ({ target }) => {
      popupOpen.current = false;
      update(target);
    },
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

const FitToViewport = ({
  map,
  focus,
}: {
  map: MapImage;
  focus?: LatLngTuple;
}) => {
  const leafletMap = useMap();
  const { width, height } = map;
  const [focusLat, focusLng] = focus ?? [];

  useEffect(() => {
    const fitZoom = () => {
      const { x, y } = leafletMap.getSize();
      const zoom = Math.log2(Math.min(x / width, y / height));

      return zoom < 0 ? zoom : Math.floor(zoom);
    };

    const fitView = () => {
      const zoom = fitZoom();

      Util.setOptions(leafletMap, { zoomSnap: 0 });
      leafletMap.setView(toLatLng(width / 2, height / 2), zoom, {
        animate: false,
      });
      Util.setOptions(leafletMap, { zoomSnap: 1 });
      leafletMap.setMinZoom(zoom);
    };

    fitView();

    const focusOn = (lat: number, lng: number) =>
      leafletMap.flyTo(
        [lat, lng],
        Math.min(Math.floor(leafletMap.getMinZoom()) + 1, MAX_ZOOM),
        { duration: FOCUS_DURATION },
      );

    const focusTimer =
      focusLat !== undefined &&
      focusLng !== undefined &&
      leafletMap.getMinZoom() < FOCUS_BELOW_ZOOM
        ? setTimeout(() => focusOn(focusLat, focusLng), FOCUS_DELAY)
        : undefined;

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
      clearTimeout(focusTimer);
      observer.disconnect();
      leafletMap.off('resize', onResize);
    };
  }, [leafletMap, width, height, focusLat, focusLng]);

  return null;
};

const TILE = 16;
const MIN_ICON_SIZE = 16;
const ICON_TILE_RATIO = 1.3;

const IconSizeForZoom = () => {
  const leafletMap = useMap();

  useEffect(() => {
    const container = leafletMap.getContainer();
    const update = () => {
      const tile =
        leafletMap.latLngToContainerPoint(toLatLng(TILE, 0)).x -
        leafletMap.latLngToContainerPoint(toLatLng(0, 0)).x;
      const size = Math.min(
        MAP_ICON_SIZE,
        Math.max(MIN_ICON_SIZE, tile * ICON_TILE_RATIO),
      );

      container.style.setProperty('--map-icon-size', `${size}px`);
    };

    update();
    leafletMap.on('zoomend resize', update);

    return () => {
      leafletMap.off('zoomend resize', update);
    };
  }, [leafletMap]);

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
