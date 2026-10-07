export type SignPrize = {
  pokemon?: { number: number; name: string };
  level?: number;
  item?: string;
  coins: number;
};

export type MapSign = {
  path: string;
  floor?: string;
  x: number;
  y: number;
  text: string;
  sprite?: string;
  spriteSize?: [width: number, height: number];
  spriteOffset?: [x: number, y: number];
  opens?: 'pokedex' | 'town-map';
  prizes?: Array<SignPrize>;
  games: Array<string>;
};
