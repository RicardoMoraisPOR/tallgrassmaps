import { useEffect, useId, useRef, useState } from 'react';

import { Map as MapLibreMap, setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';

import { Switch } from '@/components/ui/switch';

import { toLngLat } from './projection';
import { addSpriteImages } from './spriteImages';
import { buildWorldData, type WorldData } from './worldData';
import {
  addWorldLayers,
  type LayerGroup,
  layerGroups,
  setGroupVisible,
  worldBounds,
  worldZoomLimits,
} from './worldLayers';

setWorkerUrl(workerUrl);

const GAME_ID = 'red';
const DEFAULT_PITCH = 40;
const MAX_PITCH = 60;
const FIT_PADDING = 40;
const HOVER_LAYERS = ['sprites', 'icons', 'dots', 'areas'];
const FRAME_MS_DECIMALS = 1;

type Stats = { frames: number; total: number; worst: number; last: number };

const emptyStats = (): Stats => ({ frames: 0, total: 0, worst: 0, last: 0 });

const groupLabels: Record<LayerGroup, string> = {
  sprites: 'Sprites',
  icons: 'Icons',
  dots: 'Dots',
  areas: 'Wild areas',
};

export const MapLibreDevPage = () => {
  const container = useRef<HTMLDivElement>(null);
  const hover = useRef<HTMLSpanElement>(null);
  const frames = useRef<HTMLSpanElement>(null);
  const mapRef = useRef<MapLibreMap | undefined>(undefined);
  const [counts, setCounts] = useState<Record<string, number>>();
  const [visible, setVisible] = useState<Record<LayerGroup, boolean>>({
    sprites: true,
    icons: true,
    dots: true,
    areas: true,
  });
  const [tilted, setTilted] = useState(true);
  const pitchId = useId();

  useEffect(() => {
    const element = container.current;
    const data: WorldData | undefined = buildWorldData(GAME_ID);

    if (!element || !data) return undefined;

    const map = new MapLibreMap({
      container: element,
      style: {
        version: 8,
        sources: {},
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: { 'background-color': '#1b1b1b' },
          },
        ],
      },
      center: toLngLat(data.width / 2, data.height / 2),
      zoom: worldZoomLimits.minZoom,
      pitch: DEFAULT_PITCH,
      maxPitch: MAX_PITCH,
      ...worldZoomLimits,
      renderWorldCopies: false,
      attributionControl: false,
    });

    mapRef.current = map;

    if (import.meta.env.DEV)
      (window as unknown as { __gl: MapLibreMap }).__gl = map;

    let stats = emptyStats();
    let moving = false;
    let previous = 0;

    map.on('movestart', () => {
      moving = true;
      stats = emptyStats();
      previous = performance.now();
    });
    map.on('render', () => {
      if (!moving) return;

      const now = performance.now();
      const frame = now - previous;

      previous = now;
      stats.frames += 1;
      stats.total += frame;
      stats.worst = Math.max(stats.worst, frame);
      stats.last = frame;

      if (frames.current && stats.frames % 10 === 0) {
        frames.current.textContent = `${(stats.total / stats.frames).toFixed(FRAME_MS_DECIMALS)} ms avg · ${stats.worst.toFixed(FRAME_MS_DECIMALS)} ms worst · ${stats.frames} frames`;
      }
    });
    map.on('moveend', () => {
      moving = false;

      if (frames.current && stats.frames > 0) {
        frames.current.textContent = `${(stats.total / stats.frames).toFixed(FRAME_MS_DECIMALS)} ms avg · ${stats.worst.toFixed(FRAME_MS_DECIMALS)} ms worst · ${stats.frames} frames`;
      }
    });

    map.on('load', async () => {
      await addSpriteImages(map, data.links);

      const added = addWorldLayers(map, data);

      setCounts(added.counts);
      map.fitBounds(worldBounds(data), {
        padding: FIT_PADDING,
        animate: false,
      });
    });

    map.on('mousemove', (event) => {
      const [feature] = map.queryRenderedFeatures(event.point, {
        layers: HOVER_LAYERS.filter((id) => map.getLayer(id)),
      });

      map.getCanvas().style.cursor = feature ? 'pointer' : '';

      if (hover.current) {
        hover.current.textContent = String(feature?.properties?.label ?? '');
      }
    });

    return () => {
      map.remove();
      mapRef.current = undefined;
    };
  }, []);

  useEffect(() => {
    mapRef.current?.easeTo({
      pitch: tilted ? DEFAULT_PITCH : 0,
      duration: 500,
    });
  }, [tilted]);

  const toggle = (group: LayerGroup, on: boolean) => {
    setVisible((current) => ({ ...current, [group]: on }));

    const map = mapRef.current;

    if (map?.getLayer(group)) setGroupVisible(map, group, on);
  };

  return (
    <div className="relative h-[calc(100svh-3.5rem)] w-full">
      <div ref={container} style={{ position: 'absolute', inset: 0 }} />
      <div className="absolute top-3 left-3 z-10 flex w-72 flex-col gap-3 rounded-sm border bg-card p-3 text-sm shadow-lg">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-heading text-base font-bold">MapLibre test</h1>
          <p className="text-xs text-muted-foreground">
            Same Kanto data as the real map, drawn with MapLibre GL (WebGL).
          </p>
        </div>
        {counts && (
          <p className="text-xs text-muted-foreground">
            {counts.floors} images · {counts.sprites} sprites · {counts.icons}{' '}
            icons · {counts.dots} dots · {counts.areas} areas
          </p>
        )}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium">While moving</span>
          <span
            ref={frames}
            className="text-xs text-muted-foreground tabular-nums"
          >
            Pan or zoom to measure
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <label htmlFor={pitchId}>Tilt</label>
          <Switch id={pitchId} checked={tilted} onCheckedChange={setTilted} />
        </div>
        {layerGroups.map((group) => (
          <div key={group} className="flex items-center justify-between gap-4">
            <span>{groupLabels[group]}</span>
            <Switch
              checked={visible[group]}
              onCheckedChange={(on) => toggle(group, on)}
            />
          </div>
        ))}
        <span ref={hover} className="min-h-4 text-xs text-muted-foreground" />
      </div>
    </div>
  );
};
