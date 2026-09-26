export type MapSource = {
  name: string;
  url: string;
  credit: string;
};

export type MapImage = {
  image: string;
  width: number;
  height: number;
  pixelated: boolean;
  source: MapSource;
};

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Direction = 'north' | 'south' | 'east' | 'west';

export type Hotspot = Rect & {
  target: string;
  travel?: Direction;
  floor?: string;
};

export type LocationHotspot = Hotspot & {
  kind: 'exit' | 'entrance';
};

export type MarkerKind = 'house' | 'mart' | 'center';

export type MapMarker = Rect & {
  kind: MarkerKind;
  name: string;
};

export type LocationKind = 'town' | 'route' | 'dungeon' | 'building';

export type LocationFloor = MapImage & {
  id: string;
  name: string;
  hotspots: Array<LocationHotspot>;
};

export type Location = MapImage & {
  id: string;
  name: string;
  kind: LocationKind;
  locations: Array<Location>;
  hotspots: Array<LocationHotspot>;
  markers: Array<MapMarker>;
  floors?: Array<LocationFloor>;
};

export type SpriteAnimation = {
  frames: Array<string>;
  frameMs?: number;
};

export type RegionPointer = {
  hover: SpriteAnimation;
  fly: SpriteAnimation;
  size: number;
  pixelated: boolean;
  source: MapSource;
};

export type RegionCursor = {
  image: string;
  size: number;
  pixelated: boolean;
  blink?: {
    visibleMs: number;
    hiddenMs: number;
  };
};

export type RegionLabel = {
  x: number;
  y: number;
  size: number;
  fontFamily: string;
  color: string;
  uppercase: boolean;
};

export type Region = MapImage & {
  id: string;
  name: string;
  versionGroup: string;
  pokedexSize: number;
  locations: Array<Location>;
  hotspots: Array<Hotspot>;
  cursor?: RegionCursor;
  pointer?: RegionPointer;
  label?: RegionLabel;
};
