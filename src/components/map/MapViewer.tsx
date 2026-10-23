import type { MapImage } from '@/data/maps';

import { GlMapViewer } from './gl/GlMapViewer';
import type { ZoomPosition } from './MapZoomControls';
import type {
  FitBounds,
  FloorFrame,
  MapLink,
  MapPalette,
  TileCluster,
} from './viewer/types';
import type { MapView } from './viewer/viewHandoff';

export type FloorStack = {
  floors: Array<FloorFrame & { image: string; pixelated: boolean }>;
  selected: string;
  onSelect: (id: string) => void;
  flyOnMount?: boolean;
  stayOnMapSelect?: boolean;
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

export const MapViewer = (props: MapViewerProps) => (
  <GlMapViewer key={props.map.image} {...props} />
);
