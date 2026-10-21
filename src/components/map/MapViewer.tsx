import { memo, useEffect, useMemo, useRef, useState } from 'react';

import {
  CRS,
  DomEvent,
  type LatLngTuple,
  type LeafletEventHandlerFnMap,
  type ImageOverlay as LeafletImageOverlay,
  type LeafletMouseEvent,
  type Path as LeafletPath,
} from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ImageOverlay, MapContainer, Pane, Tooltip } from 'react-leaflet';
import { useNavigate } from 'react-router';

import type { MapImage } from '@/data/maps';
import type { GbcPaletteId } from '@/data/maps/gbcPalettes';
import { travelState } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings';

import { imageBounds, toLatLng } from './coordinates';
import { GlMapViewer } from './gl/GlMapViewer';
import { MapZoomControls, type ZoomPosition } from './MapZoomControls';
import { MAX_ZOOM } from './viewer/constants';
import { type FloorFrame, FloorFrames, FlyToFloor } from './viewer/FloorFrames';
import { HoverCard } from './viewer/HoverCard';
import { linkKey, spriteKey } from './viewer/links';
import { LinkShape } from './viewer/LinkShape';
import { MapIcon } from './viewer/MapIcon';
import { MapSprite } from './viewer/MapSprite';
import {
  type MapPalette,
  PaletteFilters,
  paletteClass,
  setPaletteClass,
  usePaletteApplied,
} from './viewer/PaletteFilters';
import {
  DeselectOnEmptyClick,
  PinOnRequest,
  UnpinOnDismiss,
  UnpinWhenOffscreen,
} from './viewer/PinControls';
import { type TileCluster, TileClusters } from './viewer/TileClusters';
import {
  DEFAULT_TILT_DEGREES,
  TiltView,
  tiltFromSearch,
} from './viewer/TiltView';
import type { MapLink } from './viewer/types';
import {
  type MapView,
  RememberView,
  RestoreHandedOffView,
} from './viewer/viewHandoff';
import {
  FitToViewport,
  IconSizeForZoom,
  PanBounds,
  PixelatedWhenZoomedIn,
  UnitSizeForZoom,
  FitToBounds,
  type FitBounds,
  ReportViewBox,
  ReportZoom,
  type ViewBox,
  ResyncAfterInterruptedZoom,
} from './viewer/ViewportEffects';
import { badgeCenter, WildAreaPatterns, WildBadge } from './viewer/WildAreaArt';

const CLUSTER_SELECT_MS = 800;
const ICON_PRESS_MS = 150;
const MAP_IMAGE_PANE = 'map-image';
const BEHIND_PANE = 'behind-links';

const stackedShapes = new WeakSet<LeafletPath>();

export type FloorStack = {
  floors: Array<FloorFrame & { image: string; pixelated: boolean }>;
  selected: string;
  onSelect: (id: string) => void;
  flyOnMount?: boolean;
  stayOnMapSelect?: boolean;
  faded?: boolean;
  outlineSelected?: boolean;
  dottedSelected?: boolean;
  actOnAnyFloor?: boolean;
  dimmed?: Set<string>;
};

export type MapViewerProps = {
  map: MapImage;
  stack?: FloorStack;
  links?: Array<MapLink>;
  highlightable?: Array<MapLink>;
  highlighted?: string;
  pinRequest?: { key: string; initial?: boolean };
  focusKey?: string;
  onZoomChange?: (zoom: number) => void;
  fitBounds?: FitBounds;
  onViewChange?: (view: MapView) => void;
  clusters?: Array<TileCluster>;
  clusterZoom?: number;
  onDeselect?: () => void;
  zoomPosition?: ZoomPosition;
  worldView?: { on: boolean; onToggle: () => void };
  palette?: MapPalette;
  className?: string;
};

type FloorImageProps = {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hidden: boolean;
  dimmed: boolean;
  palette: string;
};

const FloorImage = memo(
  ({ url, x, y, width, height, hidden, dimmed, palette }: FloorImageProps) => {
    const bounds = useMemo(
      () =>
        [toLatLng(x, y + height), toLatLng(x + width, y)] as [
          LatLngTuple,
          LatLngTuple,
        ],
      [x, y, width, height],
    );
    const overlay = useRef<LeafletImageOverlay>(null);

    useEffect(() => {
      const element = overlay.current?.getElement();

      if (element) setPaletteClass(element, palette);
    }, [palette, url]);

    useEffect(() => {
      const element = overlay.current?.getElement();

      if (element) element.decoding = 'async';
    }, [url]);

    return (
      <ImageOverlay
        ref={overlay}
        url={url}
        className="map-tile-fade"
        opacity={hidden ? 0 : dimmed ? 0.25 : 1}
        bounds={bounds}
      />
    );
  },
);

type MapActions = {
  hoverSprite: (link: MapLink | undefined) => void;
  hoverCard: (link: MapLink | undefined) => void;
  iconClick: (link: MapLink, event: LeafletMouseEvent) => void;
  shapeClick: (link: MapLink, event: LeafletMouseEvent) => void;
  spriteShapeRef: (link: MapLink) => (shape: LeafletPath | null) => void;
  badgeClick: (link: MapLink, event: LeafletMouseEvent) => void;
};

const SpriteItem = memo(
  ({
    link,
    active,
    palette,
  }: {
    link: MapLink;
    active: boolean;
    palette?: GbcPaletteId;
  }) =>
    link.sprite && (
      <MapSprite
        link={link}
        sprite={link.sprite}
        active={active}
        revealed={active}
        palette={palette}
      />
    ),
);

const IconItem = memo(
  ({
    link,
    active,
    actions,
  }: {
    link: MapLink;
    active: boolean;
    actions: MapActions;
  }) =>
    link.icon && (
      <MapIcon
        link={link}
        icon={link.icon}
        active={active}
        onClick={(event) => actions.iconClick(link, event)}
      />
    ),
);

const ShapeItem = memo(
  ({
    link,
    actions,
    selected = false,
  }: {
    link: MapLink;
    actions: MapActions;
    selected?: boolean;
  }) => {
    const handlers = useMemo<LeafletEventHandlerFnMap>(
      () => ({
        add: ({ target }) => {
          if (link.behind) target.bringToBack();
        },
        mouseover: () => {
          if (link.sprite) actions.hoverSprite(link);
          if (link.tooltip && !link.tooltipOnClick) actions.hoverCard(link);
        },
        mouseout: () => {
          if (link.sprite) actions.hoverSprite(undefined);
          if (link.tooltip && !link.tooltipOnClick)
            actions.hoverCard(undefined);
        },
        click: (event) => actions.shapeClick(link, event as LeafletMouseEvent),
      }),
      [link, actions],
    );
    const shapeRef = useMemo(
      () => (link.sprite ? actions.spriteShapeRef(link) : undefined),
      [link, actions],
    );

    return (
      <LinkShape
        link={link}
        pane={link.behind ? BEHIND_PANE : undefined}
        shapeRef={shapeRef}
        className={cn(
          'map-link',
          !link.href &&
            !link.onClick &&
            !link.tooltipOnClick &&
            'map-link-static',
          link.sprite && 'map-link-sprite',
          selected && 'map-link-selected',
          link.className,
        )}
        eventHandlers={handlers}
      >
        {!link.tooltip && (
          <Tooltip sticky pane="tooltipPane" className="map-tooltip">
            <span className="map-tooltip-label">{link.label}</span>
          </Tooltip>
        )}
      </LinkShape>
    );
  },
);

const LeafletMapViewer = ({
  map,
  stack,
  links = [],
  highlightable = links,
  highlighted,
  pinRequest,
  focusKey,
  onZoomChange,
  fitBounds,
  onViewChange,
  clusters,
  clusterZoom,
  onDeselect,
  zoomPosition,
  worldView,
  palette,
  className,
}: MapViewerProps) => {
  const navigate = useNavigate();
  const bounds = useMemo(() => imageBounds(map), [map]);
  const [hoveredSprite, setHoveredSprite] = useState<string>();
  const spriteShapes = useRef(
    new Map<string, { shape: LeafletPath; bottom: number }>(),
  );
  const [viewBox, setViewBox] = useState<ViewBox>();
  const [hoverCardKey, setHoverCardKey] = useState<string>();

  const [pinnedCardKey, setPinnedCardKey] = useState<string>();
  const [revealedArea, setRevealedArea] = useState<MapLink>();
  const [pinnedAnchor, setPinnedAnchor] = useState<{ x: number; y: number }>();

  const cardKey = pinnedCardKey ?? hoverCardKey;
  const hoverCard = [...links, ...(revealedArea ? [revealedArea] : [])].find(
    (link) => link.tooltip && linkKey(link) === cardKey,
  );

  useEffect(() => {
    if (!pinnedCardKey) setRevealedArea(undefined);
  }, [pinnedCardKey]);

  const off = useMemo(
    () =>
      new Set(
        (new URLSearchParams(window.location.search).get('off') ?? '').split(
          ',',
        ),
      ),
    [],
  );
  const inView = (x: number, y: number, width: number, height: number) =>
    viewBox !== undefined &&
    x <= viewBox.maxX &&
    x + width >= viewBox.minX &&
    y <= viewBox.maxY &&
    y + height >= viewBox.minY;
  const shownLinks = links.filter(({ x, y, width, height }) =>
    inView(x, y, width, height),
  );

  const onSelectedFloor = (link: MapLink) =>
    !stack || link.floorId === stack.selected;

  const focusLink =
    focusKey &&
    links.find(
      (link) =>
        onSelectedFloor(link) && [link.highlightKey].flat().includes(focusKey),
    );
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
    onSelectedFloor(link) &&
    [link.highlightKey ?? link.href].flat().includes(highlighted);

  const stackQueued = useRef(false);
  const stackSpriteShapes = () => {
    if (stackQueued.current) return;

    stackQueued.current = true;
    queueMicrotask(() => {
      stackQueued.current = false;
      [...spriteShapes.current.values()]
        .toSorted((a, b) => a.bottom - b.bottom)
        .forEach(({ shape }) => shape.bringToFront());
    });
  };

  const spriteShapeRef = (link: MapLink) => (shape: LeafletPath | null) => {
    if (!shape) {
      spriteShapes.current.delete(linkKey(link));

      return;
    }

    spriteShapes.current.set(linkKey(link), {
      shape,
      bottom: link.y + link.height,
    });

    if (!stackedShapes.has(shape)) {
      stackedShapes.add(shape);
      shape.on('add', stackSpriteShapes);
    }
  };

  const mapSelect = useRef(false);
  const selectFromMap = (id: string) => {
    if (stack?.stayOnMapSelect) {
      mapSelect.current = true;
      setTimeout(() => {
        mapSelect.current = false;
      }, CLUSTER_SELECT_MS);
    }

    stack?.onSelect(id);
  };

  const latest = useRef({ stack, navigate, spriteShapeRef, selectFromMap });

  latest.current = { stack, navigate, spriteShapeRef, selectFromMap };

  const actions = useMemo<MapActions>(() => {
    const select = (link: MapLink) => {
      const { stack: current } = latest.current;

      if (
        current?.actOnAnyFloor &&
        link.floorId &&
        link.floorId !== current.selected
      )
        latest.current.selectFromMap(link.floorId);
    };
    const otherFloor = (link: MapLink) => {
      const { stack: current } = latest.current;

      return current &&
        !current.actOnAnyFloor &&
        link.floorId &&
        link.floorId !== current.selected
        ? link.floorId
        : undefined;
    };
    const togglePin = (link: MapLink) =>
      setPinnedCardKey((current) =>
        current === linkKey(link) ? undefined : linkKey(link),
      );
    const open = (link: MapLink) => {
      if (link.href)
        latest.current.navigate(link.href, {
          state: travelState(link.travel),
          replace: link.replace,
          preventScrollReset: link.replace,
        });
    };

    return {
      hoverSprite: (link) => setHoveredSprite(link && spriteKey(link)),
      hoverCard: (link) => setHoverCardKey(link && linkKey(link)),
      iconClick: (link, event) => {
        const floorId = otherFloor(link);

        if (floorId) {
          DomEvent.stopPropagation(event);
          latest.current.selectFromMap(floorId);

          return;
        }

        select(link);

        if (link.tooltip && link.tooltipOnClick) {
          DomEvent.stopPropagation(event);
          setPinnedAnchor(undefined);
          togglePin(link);
        }

        if (link.href) setTimeout(() => open(link), ICON_PRESS_MS);
        else link.onClick?.();
      },
      shapeClick: (link, event) => {
        const floorId = otherFloor(link);

        if (floorId) {
          DomEvent.stopPropagation(event);
          latest.current.selectFromMap(floorId);

          return;
        }

        select(link);
        link.onClick?.();

        if (link.tooltip && link.tooltipOnClick) {
          DomEvent.stopPropagation(event);
          setPinnedAnchor(
            link.tooltipAtClick
              ? { x: event.latlng.lng, y: -event.latlng.lat }
              : undefined,
          );
          togglePin(link);
        }

        open(link);
      },
      spriteShapeRef: (link) => latest.current.spriteShapeRef(link),
      badgeClick: (link, event) => {
        const area = link.area;

        if (!area) return;

        DomEvent.stopPropagation(event);
        select(link);

        const key = linkKey(area);

        setPinnedCardKey((current) => {
          if (current === key) {
            setRevealedArea(undefined);

            return undefined;
          }

          setRevealedArea(area);
          setPinnedAnchor(badgeCenter(link));

          return key;
        });
      },
    };
  }, []);

  const tilted = useSettingsStore((state) => state.tilted);
  const setTilted = useSettingsStore((state) => state.setTilted);

  useEffect(() => {
    if (tiltFromSearch(window.location.search) !== undefined) setTilted(true);
  }, [setTilted]);

  const paletteApplied = usePaletteApplied(palette?.on ?? false);
  const floorPalette = (floorId: string | undefined) =>
    paletteApplied && palette ? paletteClass(palette.of(floorId)) : '';
  const baseOverlay = useRef<LeafletImageOverlay>(null);
  const basePalette = floorPalette(undefined);

  useEffect(() => {
    const element = baseOverlay.current?.getElement();

    if (element) setPaletteClass(element, basePalette);
  }, [basePalette, map.image]);

  const tiltDegrees =
    tiltFromSearch(window.location.search) ?? DEFAULT_TILT_DEGREES;

  return (
    <>
      <WildAreaPatterns />
      <PaletteFilters on={palette?.on ?? false} />
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
        zoomControl={false}
        className={cn('isolate', className)}
        style={{ background: 'var(--muted)' }}
      >
        <MapZoomControls
          position={zoomPosition ?? 'topleft'}
          worldView={worldView}
          recenterOn={stack?.floors.find(({ id }) => id === stack.selected)}
          tilt={{ on: tilted, onToggle: () => setTilted(!tilted) }}
          colors={palette}
        />
        <Pane name={MAP_IMAGE_PANE} style={{ zIndex: 300 }}>
          {stack ? (
            stack.floors
              .filter(
                (floor) =>
                  floor.id === stack.selected ||
                  inView(floor.x, floor.y, floor.width, floor.height),
              )
              .map((floor) => (
                <FloorImage
                  key={floor.id}
                  url={floor.image}
                  x={floor.x}
                  y={floor.y}
                  width={floor.width}
                  height={floor.height}
                  hidden={Boolean(stack.faded) && floor.id !== stack.selected}
                  dimmed={stack.dimmed?.has(floor.id) ?? false}
                  palette={floorPalette(floor.id)}
                />
              ))
          ) : (
            <ImageOverlay ref={baseOverlay} url={map.image} bounds={bounds} />
          )}
        </Pane>
        {stack && (
          <FlyToFloor
            frame={stack.floors.find(({ id }) => id === stack.selected)}
            skip={focusPoint !== undefined || mapSelect.current}
            flyOnMount={stack.flyOnMount ?? false}
          />
        )}
        {stack && (
          <FloorFrames
            frames={stack.floors}
            selected={stack.selected}
            onSelect={selectFromMap}
            faded={stack.faded}
            outlineSelected={stack.outlineSelected}
            dottedSelected={stack.dottedSelected}
          />
        )}
        {shownLinks.map(
          (link) =>
            !off.has('sprites') &&
            link.sprite && (
              <SpriteItem
                key={`sprite-${link.x},${link.y}`}
                link={link}
                palette={
                  palette?.on ? palette.objectsOf(link.floorId) : undefined
                }
                active={
                  hoveredSprite === spriteKey(link) ||
                  pinnedCardKey === linkKey(link) ||
                  isHighlighted(link)
                }
              />
            ),
        )}
        {shownLinks.map(
          (link) =>
            !off.has('icons') &&
            link.icon && (
              <IconItem
                key={`icon-${linkKey(link)}`}
                link={link}
                active={isHighlighted(link) || pinnedCardKey === linkKey(link)}
                actions={actions}
              />
            ),
        )}
        {shownLinks.map(
          (link) =>
            !off.has('badges') &&
            Boolean(link.badge) && (
              <WildBadge
                key={`badge-${linkKey(link)}`}
                link={link}
                onClick={(event) => actions.badgeClick(link, event)}
              />
            ),
        )}
        {clusters
          ?.filter(({ x, y }) => !off.has('clusters') && inView(x, y, 0, 0))
          .map((cluster) => (
            <TileClusters
              key={cluster.tileId}
              cluster={cluster}
              zoomTo={clusterZoom ?? 0}
              onSelect={(tileId) => {
                mapSelect.current = true;
                setTimeout(() => {
                  mapSelect.current = false;
                }, CLUSTER_SELECT_MS);
                stack?.onSelect(tileId);
              }}
            />
          ))}
        <Pane name={BEHIND_PANE} style={{ zIndex: 350 }} />
        <Pane name="links" style={{ zIndex: 450 }}>
          {shownLinks
            .filter((link) => !off.has('shapes') && !link.icon && !link.badge)
            .map((link) => (
              <ShapeItem
                key={`${linkKey(link)}${pinnedCardKey === linkKey(link) ? ':selected' : ''}`}
                link={link}
                actions={actions}
                selected={pinnedCardKey === linkKey(link)}
              />
            ))}
          {revealedArea &&
            !shownLinks.some(
              (link) => linkKey(link) === linkKey(revealedArea),
            ) && (
              <ShapeItem
                key={`revealed-${linkKey(revealedArea)}`}
                link={revealedArea}
                actions={actions}
                selected
              />
            )}
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
                  pane={link.behind ? BEHIND_PANE : undefined}
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
                pane={hoverCard.behind ? BEHIND_PANE : undefined}
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
        {pinnedCardKey && hoverCard && (
          <UnpinWhenOffscreen
            link={hoverCard}
            anchor={pinnedAnchor}
            onDismiss={() => setPinnedCardKey(undefined)}
          />
        )}
        {onDeselect && !pinnedCardKey && (
          <DeselectOnEmptyClick onDeselect={onDeselect} />
        )}
        {pinnedCardKey && (
          <UnpinOnDismiss onDismiss={() => setPinnedCardKey(undefined)} />
        )}
        <PinOnRequest
          request={pinRequest}
          links={highlightable.filter(onSelectedFloor)}
          minZoom={
            clusterZoom === undefined ? undefined : Math.max(clusterZoom + 1, 0)
          }
          onPin={(link) => {
            setPinnedAnchor(undefined);
            setPinnedCardKey(linkKey(link));
          }}
        />
        <TiltView degrees={tilted ? tiltDegrees : 0} />
        <PanBounds bounds={bounds} />
        <FitToViewport map={map} focus={focusPoint} />
        <RestoreHandedOffView />
        <RememberView onChange={onViewChange} />
        {map.pixelated && <PixelatedWhenZoomedIn />}
        <IconSizeForZoom />
        <UnitSizeForZoom />
        <ResyncAfterInterruptedZoom />
        <ReportViewBox onChange={setViewBox} />
        {onZoomChange && <ReportZoom onZoomChange={onZoomChange} />}
        {fitBounds && <FitToBounds target={fitBounds} />}
      </MapContainer>
    </>
  );
};

let webglChecked: boolean | undefined;

const webglSupported = () => {
  if (webglChecked !== undefined) return webglChecked;

  try {
    webglChecked = Boolean(
      document.createElement('canvas').getContext('webgl2'),
    );
  } catch {
    webglChecked = false;
  }

  return webglChecked;
};

export const MapViewer = (props: MapViewerProps) => {
  const renderer = useSettingsStore((state) => state.mapRenderer);
  const setRenderer = useSettingsStore((state) => state.setMapRenderer);
  const param = new URLSearchParams(window.location.search).get('gl');

  useEffect(() => {
    if (param === '0') setRenderer('classic');

    if (param === '1') setRenderer('webgl');
  }, [param, setRenderer]);

  return renderer === 'webgl' && webglSupported() ? (
    <GlMapViewer key={props.map.image} {...props} />
  ) : (
    <LeafletMapViewer {...props} />
  );
};
