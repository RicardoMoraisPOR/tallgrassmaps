export const VERSION_GROUPS: Array<[id: string, label: string]> = [
  ['RBY', 'Red, Blue and Yellow'],
  ['ZA', 'Legends: Z-A'],
];

export const versionGroupLabel = (id: string) =>
  VERSION_GROUPS.find(([group]) => group === id)?.[1];
