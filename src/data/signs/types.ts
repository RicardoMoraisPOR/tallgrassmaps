export type MapSign = {
  path: string;
  floor?: string;
  x: number;
  y: number;
  text: string;
  sprite?: string;
  spriteSize?: [width: number, height: number];
  spriteOffset?: [x: number, y: number];
  opens?: 'pokedex' | 'town-map' | 'hall-of-fame';
  games: Array<string>;
};
