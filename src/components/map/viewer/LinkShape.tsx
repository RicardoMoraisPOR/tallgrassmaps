import { type ReactNode } from 'react';

import {
  type LeafletEventHandlerFnMap,
  type Path as LeafletPath,
} from 'leaflet';
import { Polygon, Rectangle } from 'react-leaflet';

import { toLatLng } from '../coordinates';
import type { MapLink } from './types';

export const LinkShape = ({
  link,
  shapeRef,
  ...props
}: {
  link: MapLink;
  className: string;
  eventHandlers?: LeafletEventHandlerFnMap;
  interactive?: boolean;
  shapeRef?: (shape: LeafletPath | null) => void;
  pane?: string;
  children?: ReactNode;
}) =>
  link.outline ? (
    <Polygon
      ref={shapeRef}
      positions={link.outline.map((ring) =>
        ring.map(([x, y]) => toLatLng(x, y)),
      )}
      {...props}
    />
  ) : (
    <Rectangle
      ref={shapeRef}
      bounds={[
        toLatLng(link.x, link.y + link.height),
        toLatLng(link.x + link.width, link.y),
      ]}
      {...props}
    />
  );
