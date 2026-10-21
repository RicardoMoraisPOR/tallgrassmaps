import { useEffect, useMemo, useRef, useState } from 'react';

import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl';
import { useNavigate } from 'react-router';

import { travelState } from '@/lib/motion';

import type { FloorStack } from '../MapViewer';
import { linkKey, spriteKey } from '../viewer/links';
import type { MapLink } from '../viewer/types';
import { badgeCenter } from '../viewer/WildAreaArt';
import { fromLngLat, toGlZoom, toLngLat } from './glCoordinates';
import { isShape, type ShapeMode } from './GlShapes';

const CLUSTER_SELECT_MS = 800;
const ICON_PRESS_MS = 150;
const PRESS_ANIMATION_MS = 260;
const HIT_PRIORITY: Record<string, number> = {
  'icons-active': 3,
  icons: 3,
  'sprites-active': 2,
  sprites: 2,
  'shapes-fill': 1,
  'areas-grass': 1,
  'areas-water': 1,
  'areas-hit': 1,
  'frames-labels': 2.5,
  'frames-hit': 0.5,
  badges: 3,
  clusters: 4,
};
const HIT_LAYERS = Object.keys(HIT_PRIORITY);

type Anchor = { x: number; y: number };

type ClusterHit = { tileId: string; x: number; y: number };

type Hit =
  | { frame: string; link?: undefined; cluster?: undefined }
  | { link: MapLink; layer: string; frame?: undefined; cluster?: undefined }
  | { cluster: ClusterHit; link?: undefined; frame?: undefined };

type Options = {
  map: MapLibreMap;
  links: Array<MapLink>;
  highlightable: Array<MapLink>;
  highlighted?: string;
  stack?: FloorStack;
  onDeselect?: () => void;
  clusterZoom?: number;
};

export const useGlInteractions = ({
  map,
  links,
  highlightable,
  highlighted,
  stack,
  onDeselect,
  clusterZoom,
}: Options) => {
  const navigate = useNavigate();
  const [hoveredSprite, setHoveredSprite] = useState<string>();
  const [hoveredIcon, setHoveredIcon] = useState<string>();
  const [hoveredShape, setHoveredShape] = useState<string>();
  const [pressedIcon, setPressedIcon] = useState<string>();
  const [labelLink, setLabelLink] = useState<MapLink>();
  const [hoverCardKey, setHoverCardKey] = useState<string>();
  const [pinnedCardKey, setPinnedCardKey] = useState<string>();
  const [revealedArea, setRevealedArea] = useState<MapLink>();
  const [pinnedAnchor, setPinnedAnchor] = useState<Anchor>();
  const mapSelect = useRef(false);

  const onSelectedFloor = (link: MapLink) =>
    !stack || link.floorId === stack.selected;

  const isHighlighted = (link: MapLink) =>
    highlighted !== undefined &&
    onSelectedFloor(link) &&
    [link.highlightKey ?? link.href].flat().includes(highlighted);

  const latest = useRef({
    links,
    stack,
    navigate,
    onDeselect,
    pinnedCardKey,
    clusterZoom,
  });

  latest.current = {
    links,
    stack,
    navigate,
    onDeselect,
    pinnedCardKey,
    clusterZoom,
  };

  const cardKey = pinnedCardKey ?? hoverCardKey;
  const hoverCard = [...links, ...(revealedArea ? [revealedArea] : [])].find(
    (link) => link.tooltip && linkKey(link) === cardKey,
  );

  useEffect(() => {
    if (!pinnedCardKey) setRevealedArea(undefined);
  }, [pinnedCardKey]);

  useEffect(() => {
    const byKey = () =>
      new Map(latest.current.links.map((link) => [linkKey(link), link]));

    const hitAt = (event: MapMouseEvent): Hit | undefined => {
      const layers = HIT_LAYERS.filter((id) => map.getLayer(id));
      const features = map
        .queryRenderedFeatures(event.point, { layers })
        .toSorted(
          (a, b) =>
            (HIT_PRIORITY[b.layer.id] ?? 0) - (HIT_PRIORITY[a.layer.id] ?? 0),
        );
      const lookup = byKey();

      for (const feature of features) {
        const frame = feature.properties?.frame;
        const cluster = feature.properties?.cluster;

        if (cluster !== undefined)
          return {
            cluster: {
              tileId: String(cluster),
              x: Number(feature.properties?.x),
              y: Number(feature.properties?.y),
            },
          };

        if (frame !== undefined) return { frame: String(frame) };

        const link = lookup.get(String(feature.properties?.key));

        if (link) return { link, layer: feature.layer.id };
      }

      return undefined;
    };

    const selectFromMap = (id: string) => {
      const { stack: current } = latest.current;

      if (current?.stayOnMapSelect) {
        mapSelect.current = true;
        setTimeout(() => {
          mapSelect.current = false;
        }, CLUSTER_SELECT_MS);
      }

      current?.onSelect(id);
    };

    const select = (link: MapLink) => {
      const { stack: current } = latest.current;

      if (
        current?.actOnAnyFloor &&
        link.floorId &&
        link.floorId !== current.selected
      )
        selectFromMap(link.floorId);
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

    const clearHover = () => {
      setHoveredSprite(undefined);
      setHoveredIcon(undefined);
      setHoveredShape(undefined);
      setHoverCardKey(undefined);
      setLabelLink(undefined);
    };

    const process = (event: MapMouseEvent) => {
      const hit = hitAt(event);

      if (hit && !hit.link) {
        map.getCanvas().style.cursor = 'pointer';
        clearHover();

        return;
      }

      const inert =
        hit &&
        isShape(hit.link) &&
        !hit.link.href &&
        !hit.link.onClick &&
        !hit.link.tooltipOnClick;

      map.getCanvas().style.cursor = hit && !inert ? 'pointer' : '';

      if (!hit) {
        clearHover();

        return;
      }

      const { link } = hit;

      if (link.icon || link.badge) {
        setHoveredIcon(link.icon ? linkKey(link) : undefined);
        setHoveredSprite(undefined);
        setHoveredShape(undefined);
        setHoverCardKey(
          link.tooltip && !link.tooltipOnClick ? linkKey(link) : undefined,
        );
        setLabelLink(link.tooltip || link.badge ? undefined : link);

        return;
      }

      setHoveredIcon(undefined);
      setHoveredSprite(link.sprite ? spriteKey(link) : undefined);
      setHoveredShape(isShape(link) && !inert ? linkKey(link) : undefined);
      setHoverCardKey(
        link.tooltip && !link.tooltipOnClick ? linkKey(link) : undefined,
      );
      setLabelLink(link.tooltip ? undefined : link);
    };

    let frame = 0;
    let lastMove: MapMouseEvent | undefined;

    const onMove = (event: MapMouseEvent) => {
      lastMove = event;

      if (frame || map.isMoving()) return;

      frame = requestAnimationFrame(() => {
        frame = 0;

        if (lastMove && !map.isMoving()) process(lastMove);
      });
    };

    const onMoveStart = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      clearHover();
    };

    const onClick = (event: MapMouseEvent) => {
      const hit = hitAt(event);
      const pinned = latest.current.pinnedCardKey;

      if (!hit) {
        if (pinned) setPinnedCardKey(undefined);
        else latest.current.onDeselect?.();

        return;
      }

      const togglesPin =
        hit.link !== undefined &&
        Boolean(hit.link.tooltip && hit.link.tooltipOnClick);

      if (pinned && !togglesPin && !hit.link?.badge)
        setPinnedCardKey(undefined);

      if (hit.frame !== undefined) {
        selectFromMap(hit.frame);

        return;
      }

      if (hit.cluster) {
        const { tileId, x, y } = hit.cluster;

        selectFromMap(tileId);
        map.flyTo({
          center: toLngLat(x, y),
          zoom: Math.max(
            map.getZoom() + 1,
            toGlZoom(latest.current.clusterZoom ?? 0),
          ),
        });

        return;
      }

      const { link } = hit;
      const floorId = otherFloor(link);

      if (floorId) {
        selectFromMap(floorId);

        return;
      }

      select(link);

      if (link.badge) {
        const area = link.area;

        if (!area) return;

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

        return;
      }

      if (link.icon) {
        setPressedIcon(linkKey(link));
        setTimeout(() => setPressedIcon(undefined), PRESS_ANIMATION_MS);

        if (link.tooltip && link.tooltipOnClick) {
          setPinnedAnchor(undefined);
          togglePin(link);
        }

        if (link.href) setTimeout(() => open(link), ICON_PRESS_MS);
        else link.onClick?.();

        return;
      }

      link.onClick?.();

      if (link.tooltip && link.tooltipOnClick) {
        setPinnedAnchor(
          link.tooltipAtClick ? fromLngLat(event.lngLat) : undefined,
        );
        togglePin(link);
      }

      open(link);
    };

    map.on('mousemove', onMove);
    map.on('movestart', onMoveStart);
    map.on('mouseout', clearHover);
    map.on('click', onClick);

    return () => {
      cancelAnimationFrame(frame);
      map.off('mousemove', onMove);
      map.off('movestart', onMoveStart);
      map.off('mouseout', clearHover);
      map.off('click', onClick);
    };
  }, [map]);

  useEffect(() => {
    if (!pinnedCardKey) return undefined;

    const dismiss = () => setPinnedCardKey(undefined);
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
    };
    const dismissOutside = (event: PointerEvent) => {
      if (!map.getContainer().contains(event.target as Node)) dismiss();
    };

    document.addEventListener('keydown', dismissOnEscape);
    document.addEventListener('pointerdown', dismissOutside, true);

    return () => {
      document.removeEventListener('keydown', dismissOnEscape);
      document.removeEventListener('pointerdown', dismissOutside, true);
    };
  }, [map, pinnedCardKey]);

  const activeSprites = useMemo(
    () =>
      new Set(
        links.flatMap((link) =>
          link.sprite &&
          (hoveredSprite === spriteKey(link) ||
            pinnedCardKey === linkKey(link) ||
            isHighlighted(link))
            ? [linkKey(link)]
            : [],
        ),
      ),
    [links, hoveredSprite, pinnedCardKey, highlighted, stack?.selected],
  );

  const activeIcons = useMemo(
    () =>
      new Set(
        links.flatMap((link) =>
          link.icon &&
          (hoveredIcon === linkKey(link) ||
            pinnedCardKey === linkKey(link) ||
            isHighlighted(link))
            ? [linkKey(link)]
            : [],
        ),
      ),
    [links, hoveredIcon, pinnedCardKey, highlighted, stack?.selected],
  );

  const iconHrefs = useMemo(
    () =>
      new Set(
        links.flatMap((link) => (link.icon && link.href ? [link.href] : [])),
      ),
    [links],
  );

  const highlightLinks = useMemo(
    () =>
      highlighted === undefined
        ? []
        : highlightable.filter(
            (link) =>
              isShape(link) &&
              !(link.href && iconHrefs.has(link.href)) &&
              isHighlighted(link),
          ),
    [highlightable, highlighted, iconHrefs, stack?.selected],
  );

  const shapeModes = useMemo(() => {
    const modes = new Map<string, ShapeMode>();
    const wild = (link: MapLink) =>
      (link.className ?? '').includes('map-link-wild-pokemon');

    if (hoveredShape) modes.set(hoveredShape, 'hover');

    highlightLinks.forEach((link) => modes.set(linkKey(link), 'highlight'));

    if (pinnedCardKey && hoverCard && isShape(hoverCard))
      modes.set(pinnedCardKey, wild(hoverCard) ? 'selected' : 'pinned');

    return modes;
  }, [hoveredShape, highlightLinks, pinnedCardKey, hoverCard]);

  return {
    pressedIcon,
    hoveredIcon,
    revealedArea,
    labelLink,
    shapeModes,
    highlightLinks,
    hoverCard,
    pinnedCardKey,
    pinnedAnchor,
    activeSprites,
    activeIcons,
    mapSelect,
    unpin: () => setPinnedCardKey(undefined),
    pin: (link: MapLink) => {
      setPinnedAnchor(undefined);
      setPinnedCardKey(linkKey(link));
    },
    isOnSelectedFloor: onSelectedFloor,
    highlightable,
  };
};
