export const priorities = ['high', 'medium', 'low'] as const;

export type Priority = (typeof priorities)[number];

export const priorityLabels: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const priorityRank = (priority: Priority) =>
  priorities.indexOf(priority);
