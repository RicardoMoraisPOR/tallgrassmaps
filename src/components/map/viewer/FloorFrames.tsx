import { useEffect, useMemo, useRef } from 'react';

import { divIcon } from 'leaflet';
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

type FloorFramesProps = {
  frames: Array<FloorFrame>;
  selected: string;
  onSelect: (id: string) => void;
};

export const FloorFrames = ({
  frames,
  selected,
  onSelect,
}: FloorFramesProps) => {
  const frameKey = frames.map(({ id, name }) => `${id}:${name}`).join('|');
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
    <Pane name={FRAME_PANE} style={{ zIndex: 320 }}>
      {frames.map((frame) => (
        <Rectangle
          key={frame.id}
          bounds={[
            toLatLng(frame.x, frame.y + frame.height),
            toLatLng(frame.x + frame.width, frame.y),
          ]}
          pane={FRAME_PANE}
          pathOptions={{
            className:
              frame.id === selected
                ? 'floor-frame floor-frame-selected'
                : 'floor-frame',
            fill: true,
            fillOpacity: 0,
          }}
          eventHandlers={{ click: () => onSelect(frame.id) }}
        />
      ))}
      {frames.map((frame) => (
        <Marker
          key={`label-${frame.id}`}
          position={toLatLng(frame.x, frame.y)}
          interactive={false}
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
