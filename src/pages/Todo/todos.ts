export type TodoGroup = {
  title: string;
  items: Array<{ id: string; text: string }>;
};

export const todoGroups: Array<TodoGroup> = [
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
