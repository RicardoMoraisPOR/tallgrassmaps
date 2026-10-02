export type MapItem = {
  path: string;
  floor?: string;
  x: number;
  y: number;
  item: string;
  hidden: boolean;
  sprite?: string;
  note?: string;
  games: Array<string>;
};
