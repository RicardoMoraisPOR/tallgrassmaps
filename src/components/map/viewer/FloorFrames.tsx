import { memo, useCallback, useEffect, useMemo, useRef } from 'react';

import { type DivIcon, type LatLngTuple, divIcon } from 'leaflet';
import { Marker, Pane, Rectangle, useMap } from 'react-leaflet';

import { toLatLng } from '../coordinates';

const FRAME_PANE = 'floor-frames';
const FLIGHT_PADDING_PIXELS = 24;
const FLIGHT_SECONDS = 0.7;
const FIRST_FLIGHT_DELAY_MS = 350;

export type FloorFrame = {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type FrameOutlineProps = Omit<FloorFrame, 'name'> & {
  highlighted: boolean;
  onSelect: (id: string) => void;
};

const FrameOutline = memo(
  ({ id, x, y, width, height, highlighted, onSelect }: FrameOutlineProps) => {
    const bounds = useMemo(
      () =>
        [toLatLng(x, y + height), toLatLng(x + width, y)] as [
          LatLngTuple,
          LatLngTuple,
        ],
      [x, y, width, height],
    );

    return (
      <Rectangle
        bounds={bounds}
        pane={FRAME_PANE}
        className={
          highlighted ? 'floor-frame floor-frame-selected' : 'floor-frame'
        }
        fill
        fillOpacity={0}
        eventHandlers={{ click: () => onSelect(id) }}
      />
    );
  },
);

const FrameLabel = memo(
  ({
    id,
    x,
    y,
    icon,
    onSelect,
  }: {
    id: string;
    x: number;
    y: number;
    icon: DivIcon | undefined;
    onSelect: (id: string) => void;
  }) => {
    const position = useMemo(() => toLatLng(x, y), [x, y]);

    return (
      <Marker
        position={position}
        icon={icon}
        eventHandlers={{ click: () => onSelect(id) }}
      />
    );
  },
);

type FloorFramesProps = {
  frames: Array<FloorFrame>;
  selected: string;
  onSelect: (id: string) => void;
  faded?: boolean;
  outlineSelected?: boolean;
};

export const FloorFrames = ({
  frames,
  selected,
  onSelect,
  faded = false,
  outlineSelected = true,
}: FloorFramesProps) => {
  const leafletMap = useMap();
  const latestSelect = useRef(onSelect);
  const selectFrame = useCallback((id: string) => latestSelect.current(id), []);

  useEffect(() => {
    latestSelect.current = onSelect;
  });

  const frameKey = frames.map(({ id, name }) => `${id}:${name}`).join('|');

  useEffect(() => {
    const pane = leafletMap.getPane(FRAME_PANE);

    if (pane) pane.style.opacity = faded ? '0' : '1';
  }, [leafletMap, faded]);

  const icons = useMemo(
    () =>
      new Map(
        frameKey.split('|').map((entry) => {
          const [id, name] = entry.split(':');

          return [
            id,
            divIcon({
              className: 'floor-label-anchor',
              html: `<span class="floor-label ${id === selected ? 'floor-label-selected' : ''}">${name}</span>`,
              iconSize: [0, 22],
              iconAnchor: [-2, 24],
            }),
          ];
        }),
      ),
    [frameKey, selected],
  );

  return (
    <Pane name={FRAME_PANE} className="map-tile-fade" style={{ zIndex: 320 }}>
      {frames.map((frame) => (
        <FrameOutline
          key={`${frame.id}:${frame.id === selected}`}
          id={frame.id}
          x={frame.x}
          y={frame.y}
          width={frame.width}
          height={frame.height}
          highlighted={outlineSelected && frame.id === selected}
          onSelect={selectFrame}
        />
      ))}
      {frames.map((frame) => (
        <FrameLabel
          key={`label-${frame.id}`}
          id={frame.id}
          onSelect={selectFrame}
          x={frame.x}
          y={frame.y}
          icon={icons.get(frame.id)}
        />
      ))}
    </Pane>
  );
};

type FlyToFloorProps = {
  frame: FloorFrame | undefined;
  skip: boolean;
  flyOnMount: boolean;
};

export const FlyToFloor = ({ frame, skip, flyOnMount }: FlyToFloorProps) => {
  const leafletMap = useMap();
  const flown = useRef(flyOnMount ? undefined : frame?.id);
  const { id, x, y, width, height } = frame ?? {};

  useEffect(() => {
    if (
      id === undefined ||
      x === undefined ||
      y === undefined ||
      width === undefined ||
      height === undefined ||
      flown.current === id
    )
      return;

    if (skip) {
      flown.current = id;

      return;
    }

    const timer = setTimeout(
      () => {
        flown.current = id;
        leafletMap.flyToBounds(
          [toLatLng(x, y + height), toLatLng(x + width, y)],
          {
            padding: [FLIGHT_PADDING_PIXELS, FLIGHT_PADDING_PIXELS],
            duration: FLIGHT_SECONDS,
          },
        );
      },
      flown.current === undefined ? FIRST_FLIGHT_DELAY_MS : 0,
    );

    return () => clearTimeout(timer);
  }, [leafletMap, id, x, y, width, height, skip]);

  return null;
};
