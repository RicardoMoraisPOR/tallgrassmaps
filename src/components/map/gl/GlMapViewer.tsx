import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';

import { Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/stores/settings';

import type { MapViewerProps } from '../MapViewer';
import { DEFAULT_TILT_DEGREES, tiltFromSearch } from '../viewer/tilt';
import { markCreated } from './glArrival';
import { GlBadges } from './GlBadges';
import { GlCamera, MAX_ZOOM } from './GlCamera';
import { BASE_ZOOM, toGlZoom, toLngLat } from './glCoordinates';
import { GlFloorImages } from './GlFloorImages';
import { GlFrames } from './GlFrames';
import { GlHoverCard } from './GlHoverCard';
import './glWorker';
import { GlIcons } from './GlIcons';
import { GlLabelTooltip } from './GlLabelTooltip';
import { addAnchors } from './glLayers';
import { GlPinOnRequest, GlUnpinWhenOffscreen } from './GlPinControls';
import { GlShadows } from './GlShadows';
import { GlShapes } from './GlShapes';
import { GlSprites } from './GlSprites';
import { GlZoomControls } from './GlZoomControls';
import { useGlInteractions } from './useGlInteractions';
import { useStableLinks } from './useStableLinks';

const MAX_PITCH = 60;
const SMALL_TILE = { width: 480, height: 288 };
const READY_TIMEOUT_MS = 1500;
const FULL_QUALITY_ZOOM = -BASE_ZOOM;

const crispZoomFor = (clusterZoom?: number, floorCount = 0) =>
  clusterZoom === undefined && floorCount <= 1
    ? FULL_QUALITY_ZOOM
    : Math.min(clusterZoom ?? 0, 0);

export const GlMapViewer = ({
  map: image,
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
  const container = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MapLibreMap>();
  const [ready, setReady] = useState(false);
  const tilted = useSettingsStore((state) => state.tilted);
  const setTilted = useSettingsStore((state) => state.setTilted);
  const tiltDegrees =
    tiltFromSearch(window.location.search) ?? DEFAULT_TILT_DEGREES;

  useEffect(() => {
    if (tiltFromSearch(window.location.search) !== undefined) setTilted(true);
  }, [setTilted]);

  const initialPitch = useEffectEvent(() => (tilted ? tiltDegrees : 0));

  useEffect(() => {
    const element = container.current;

    if (!element) return undefined;

    const instance = new MapLibreMap({
      container: element,
      style: { version: 8, sources: {}, layers: [] },
      center: toLngLat(image.width / 2, image.height / 2),
      zoom: toGlZoom(0),
      pitch: initialPitch(),
      maxPitch: MAX_PITCH,
      maxZoom: toGlZoom(MAX_ZOOM),
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      renderWorldCopies: false,
      attributionControl: false,
      fadeDuration: 0,
    });

    markCreated(instance);
    instance.touchZoomRotate.disableRotation();

    if (import.meta.env.DEV)
      (window as unknown as { __gl: MapLibreMap }).__gl = instance;

    instance.on('load', () => {
      addAnchors(instance);
      setMap(instance);
    });

    return () => {
      setMap(undefined);
      instance.remove();
    };
  }, [image.width, image.height]);

  useEffect(() => {
    if (!map) return undefined;

    let cancelled = false;
    const done = () => {
      if (!cancelled) setReady(true);
    };
    const timer = setTimeout(done, READY_TIMEOUT_MS);
    const frame = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (map.loaded()) done();
        else map.once('idle', done);
      }),
    );

    return () => {
      cancelled = true;
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      map.off('idle', done);
    };
  }, [map]);

  const recenterOn = stack?.floors.find(({ id }) => id === stack.selected);

  return (
    <div
      className={cn('relative isolate overflow-hidden', className)}
      style={{ background: 'var(--muted)' }}
    >
      <div
        data-page-transition-target
        data-page-transition-pending={ready ? undefined : ''}
        className="absolute inset-0"
      >
        <div ref={container} style={{ position: 'absolute', inset: 0 }} />
        {map && (
          <GlLayers
            map={map}
            image={image}
            stack={stack}
            links={links}
            highlightable={highlightable}
            highlighted={highlighted}
            pinRequest={pinRequest}
            focusKey={focusKey}
            fitBounds={fitBounds}
            clusters={clusters}
            clusterZoom={clusterZoom}
            onZoomChange={onZoomChange}
            onViewChange={onViewChange}
            onDeselect={onDeselect}
            palette={palette}
            tiltDegrees={tilted ? tiltDegrees : 0}
          />
        )}
      </div>
      {map && (
        <GlZoomControls
          map={map}
          width={image.width}
          height={image.height}
          position={zoomPosition ?? 'topleft'}
          recenterOn={recenterOn}
          worldView={worldView}
          tilt={{ on: tilted, onToggle: () => setTilted(!tilted) }}
          colors={palette}
        />
      )}
    </div>
  );
};

type GlLayersProps = Pick<
  MapViewerProps,
  | 'stack'
  | 'highlighted'
  | 'pinRequest'
  | 'focusKey'
  | 'fitBounds'
  | 'clusters'
  | 'clusterZoom'
  | 'onZoomChange'
  | 'onViewChange'
  | 'onDeselect'
  | 'palette'
> & {
  map: MapLibreMap;
  image: MapViewerProps['map'];
  links: NonNullable<MapViewerProps['links']>;
  highlightable: NonNullable<MapViewerProps['highlightable']>;
  tiltDegrees: number;
};

const GlLayers = ({
  map,
  image,
  stack,
  links: rawLinks,
  highlightable: rawHighlightable,
  highlighted,
  pinRequest,
  focusKey,
  fitBounds,
  clusters,
  clusterZoom,
  onZoomChange,
  onViewChange,
  onDeselect,
  palette,
  tiltDegrees,
}: GlLayersProps) => {
  const links = useStableLinks(rawLinks);
  const highlightable = useStableLinks(rawHighlightable);
  const interactions = useGlInteractions({
    map,
    links,
    highlightable,
    highlighted,
    stack,
    onDeselect,
    clusterZoom,
  });

  const shapeLinks = useMemo(
    () => [
      ...interactions.highlightLinks,
      ...(interactions.revealedArea ? [interactions.revealedArea] : []),
    ],
    [interactions.highlightLinks, interactions.revealedArea],
  );

  const focusLink =
    focusKey &&
    highlightable.find(
      (link) =>
        interactions.isOnSelectedFloor(link) &&
        [link.highlightKey].flat().includes(focusKey),
    );
  const focusTile = stack?.floors.find(({ id }) => id === stack.selected) ?? {
    x: 0,
    y: 0,
    width: image.width,
    height: image.height,
  };
  const smallTile =
    focusTile.width <= SMALL_TILE.width &&
    focusTile.height <= SMALL_TILE.height;
  const focusPoint = focusLink
    ? smallTile
      ? {
          x: focusTile.x + focusTile.width / 2,
          y: focusTile.y + focusTile.height / 2,
          bounds: focusTile,
        }
      : {
          x: focusLink.x + focusLink.width / 2,
          y: focusLink.y + focusLink.height / 2,
          zoom: focusLink.zoom,
        }
    : undefined;

  return (
    <>
      <GlFloorImages
        map={map}
        image={image}
        stack={stack}
        palette={palette}
        crispZoom={crispZoomFor(clusterZoom, stack?.floors.length)}
      />
      {stack && (
        <GlFrames
          map={map}
          frames={stack.floors}
          selected={stack.selected}
          outlineSelected={stack.outlineSelected}
          dottedSelected={stack.dottedSelected}
        />
      )}
      <GlShapes
        map={map}
        links={links}
        modes={interactions.shapeModes}
        highlightLinks={shapeLinks}
      />
      <GlBadges map={map} links={links} clusters={clusters} />
      <GlShadows map={map} links={links} tilted={tiltDegrees > 0} />
      <GlSprites
        map={map}
        links={links}
        palette={palette}
        activeKeys={interactions.activeSprites}
      />
      <GlIcons
        map={map}
        links={links}
        activeKeys={interactions.activeIcons}
        hoveredKey={interactions.hoveredIcon}
      />
      <GlCamera
        map={map}
        image={image}
        stack={stack}
        skipFlight={
          focusPoint !== undefined ||
          pinRequest?.initial === true ||
          interactions.mapSelect.current
        }
        focusPoint={focusPoint}
        fitBounds={fitBounds}
        tiltDegrees={tiltDegrees}
        onZoomChange={onZoomChange}
        onViewChange={onViewChange}
      />
      {interactions.labelLink && (
        <GlLabelTooltip map={map} link={interactions.labelLink} />
      )}
      {interactions.hoverCard && (
        <GlHoverCard
          key={`${interactions.hoverCard.label}@${interactions.hoverCard.x},${interactions.hoverCard.y}@${interactions.pinnedAnchor?.x},${interactions.pinnedAnchor?.y}`}
          map={map}
          link={interactions.hoverCard}
          anchor={
            interactions.pinnedCardKey ? interactions.pinnedAnchor : undefined
          }
          interactive={interactions.pinnedCardKey !== undefined}
        />
      )}
      {interactions.pinnedCardKey && interactions.hoverCard && (
        <GlUnpinWhenOffscreen
          map={map}
          link={interactions.hoverCard}
          anchor={interactions.pinnedAnchor}
          onDismiss={interactions.unpin}
        />
      )}
      <GlPinOnRequest
        map={map}
        request={pinRequest}
        links={highlightable.filter(interactions.isOnSelectedFloor)}
        minZoom={
          clusterZoom === undefined ? undefined : Math.max(clusterZoom + 1, 0)
        }
        onPin={interactions.pin}
      />
    </>
  );
};
