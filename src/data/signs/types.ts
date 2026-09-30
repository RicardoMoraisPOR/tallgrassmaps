export type MapSign = {
  path: string;
  floor?: string;
  x: number;
  y: number;
  text: string;
  sprite?: string;
  opens?: 'pokedex' | 'town-map';
  games: Array<string>;
};
