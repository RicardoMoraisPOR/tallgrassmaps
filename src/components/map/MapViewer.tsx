import { useMemo, useRef, useState } from 'react';

import { CRS, DomEvent, type Path as LeafletPath } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ImageOverlay, MapContainer, Pane, Tooltip } from 'react-leaflet';
import { useNavigate } from 'react-router';

import type { MapImage } from '@/data/maps';
import { travelState } from '@/lib/motion';
import { cn } from '@/lib/utils';

import { imageBounds, toLatLng } from './coordinates';
import { MapZoomControls, type ZoomPosition } from './MapZoomControls';
import { MAX_ZOOM } from './viewer/constants';
import { type FloorFrame, FloorFrames, FlyToFloor } from './viewer/FloorFrames';
import { HoverCard } from './viewer/HoverCard';
import { linkKey, spriteKey } from './viewer/links';
import { LinkShape } from './viewer/LinkShape';
import { MapIcon } from './viewer/MapIcon';
import { MapSprite } from './viewer/MapSprite';
import {
  PinOnRequest,
  UnpinOnDismiss,
  UnpinWhenOffscreen,
} from './viewer/PinControls';
import type { MapLink } from './viewer/types';
import { RememberView, RestoreHandedOffView } from './viewer/viewHandoff';
import {
  FitToViewport,
  IconSizeForZoom,
  PanBounds,
  PixelatedWhenZoomedIn,
  ResyncAfterInterruptedZoom,
} from './viewer/ViewportEffects';

const MAP_IMAGE_PANE = 'map-image';
const BEHIND_PANE = 'behind-links';

const stackedShapes = new WeakSet<LeafletPath>();

export type FloorStack = {
  floors: Array<FloorFrame & { image: string; pixelated: boolean }>;
  selected: string;
  onSelect: (id: string) => void;
  flyOnMount?: boolean;
  faded?: boolean;
  outlineSelected?: boolean;
};

type MapViewerProps = {
  map: MapImage;
  stack?: FloorStack;
  links?: Array<MapLink>;
  highlightable?: Array<MapLink>;
  highlighted?: string;
  pinRequest?: { key: string; initial?: boolean };
  focusKey?: string;
  zoomPosition?: ZoomPosition;
  className?: string;
};

export const MapViewer = ({
  map,
  stack,
  links = [],
  highlightable = links,
  highlighted,
  pinRequest,
  focusKey,
  zoomPosition,
  className,
}: MapViewerProps) => {
  const navigate = useNavigate();
  const bounds = useMemo(() => imageBounds(map), [map]);
  const [hoveredSprite, setHoveredSprite] = useState<string>();
  const spriteShapes = useRef(
    new Map<string, { shape: LeafletPath; bottom: number }>(),
  );
  const [hoverCardKey, setHoverCardKey] = useState<string>();

  const [pinnedCardKey, setPinnedCardKey] = useState<string>();
  const [pinnedAnchor, setPinnedAnchor] = useState<{ x: number; y: number }>();

  const cardKey = pinnedCardKey ?? hoverCardKey;
  const hoverCard = links.find(
    (link) => link.tooltip && linkKey(link) === cardKey,
  );

  const onSelectedFloor = (link: MapLink) =>
    !stack || link.floorId === stack.selected;

  const otherFloorId = (link: MapLink) =>
    stack && link.floorId && link.floorId !== stack.selected
      ? link.floorId
      : undefined;

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

  const stackSpriteShapes = () =>
    [...spriteShapes.current.values()]
      .toSorted((a, b) => a.bottom - b.bottom)
      .forEach(({ shape }) => shape.bringToFront());

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
      zoomControl={false}
      className={cn('isolate', className)}
      style={{ background: 'var(--muted)' }}
    >
      <MapZoomControls position={zoomPosition ?? 'topleft'} />
      <Pane name={MAP_IMAGE_PANE} style={{ zIndex: 300 }}>
        {stack ? (
          stack.floors.map((floor) => (
            <ImageOverlay
              key={floor.id}
              url={floor.image}
              className="map-tile-fade"
              opacity={stack.faded && floor.id !== stack.selected ? 0 : 1}
              bounds={[
                toLatLng(floor.x, floor.y + floor.height),
                toLatLng(floor.x + floor.width, floor.y),
              ]}
            />
          ))
        ) : (
          <ImageOverlay url={map.image} bounds={bounds} />
        )}
      </Pane>
      {stack && (
        <FlyToFloor
          frame={stack.floors.find(({ id }) => id === stack.selected)}
          skip={focusPoint !== undefined}
          flyOnMount={stack.flyOnMount ?? false}
        />
      )}
      {stack && (
        <FloorFrames
          frames={stack.floors}
          selected={stack.selected}
          onSelect={stack.onSelect}
          faded={stack.faded}
          outlineSelected={stack.outlineSelected}
        />
      )}
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
              onFloorSwitch={
                otherFloorId(link)
                  ? () => stack?.onSelect(otherFloorId(link)!)
                  : undefined
              }
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
      <Pane name={BEHIND_PANE} style={{ zIndex: 350 }} />
      <Pane name="links" style={{ zIndex: 450 }}>
        {links
          .filter((link) => !link.icon)
          .map((link) => (
            <LinkShape
              key={linkKey(link)}
              link={link}
              pane={link.behind ? BEHIND_PANE : undefined}
              shapeRef={link.sprite ? spriteShapeRef(link) : undefined}
              className={cn(
                'map-link',
                !link.href &&
                  !link.onClick &&
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
                  const floorId = otherFloorId(link);

                  if (floorId) {
                    DomEvent.stopPropagation(event);
                    stack?.onSelect(floorId);

                    return;
                  }

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
              {!link.tooltip && (
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
      {pinnedCardKey && (
        <UnpinOnDismiss onDismiss={() => setPinnedCardKey(undefined)} />
      )}
      <PinOnRequest
        request={pinRequest}
        links={links.filter(onSelectedFloor)}
        onPin={(link) => {
          setPinnedAnchor(undefined);
          setPinnedCardKey(linkKey(link));
        }}
      />
      <PanBounds bounds={bounds} />
      <FitToViewport map={map} focus={focusPoint} />
      <RestoreHandedOffView />
      <RememberView />
      {map.pixelated && <PixelatedWhenZoomedIn />}
      <IconSizeForZoom />
      <ResyncAfterInterruptedZoom />
    </MapContainer>
  );
};
