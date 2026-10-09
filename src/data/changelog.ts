export type ChangelogEntry = {
  version: string;
  title: string;
  date: string;
  changes: Array<string>;
};

export const changelog: Array<ChangelogEntry> = [
  {
    version: '1.0',
    title: 'Red, Blue and Yellow',
    date: '2026-09-27',
    changes: ['TODO'],
  },
];

export const latestChangelog = changelog[0];
