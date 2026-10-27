export type TodoGroup = {
  title: string;
  items: Array<{ id: string; text: string }>;
};

export const todoGroups: Array<TodoGroup> = [
  {
    title: 'Maps',
    items: [
      {
        id: 'maps-credits-line',
        text: 'Credit the map tiles rendered from pret game data (credits only mention sprites, people, trainers and items)',
      },
      {
        id: 'maps-yellow-outdoor',
        text: 'Yellow outdoor maps have no variants, so they show Red tiles (pokeyellow redrew the outdoor tileset)',
      },
    ],
  },
  {
    title: 'Cleanup',
    items: [
      {
        id: 'cleanup-home-entrance',
        text: 'HomePage riseIn is the last page entrance not using the shared ENTER class',
      },
    ],
  },
];
