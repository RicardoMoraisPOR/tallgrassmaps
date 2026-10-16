export type ShopItem = {
  name: string;
  price: number;
};

export type Shop = {
  id: string;
  building: string;
  name: string;
  path: string;
  floor?: string;
  x: number;
  y: number;
  stock: Array<ShopItem>;
  games: Array<string>;
};
