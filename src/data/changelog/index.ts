export type ChangelogEntry = {
  version: string;
  title: string;
  date: string;
  intro: string;
  changes: Array<string>;
};

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

const unquote = (value: string) => value.replace(/^(['"])(.*)\1$/, '$2');

const parseEntry = (source: string): ChangelogEntry => {
  const [, header = '', body = ''] = source.match(FRONTMATTER) ?? [];
  const fields = Object.fromEntries(
    header.split(/\r?\n/).flatMap((line) => {
      const separator = line.indexOf(':');

      return separator < 0
        ? []
        : [
            [
              line.slice(0, separator).trim(),
              unquote(line.slice(separator + 1).trim()),
            ],
          ];
    }),
  );

  const lines = body.split(/\r?\n/);

  return {
    version: fields.version,
    title: fields.title,
    date: fields.date,
    intro: lines
      .filter((line) => line.trim() && !line.startsWith('- '))
      .join(' '),
    changes: lines
      .filter((line) => line.startsWith('- '))
      .map((line) => line.slice(2).trim()),
  };
};

const sources = import.meta.glob<string>('./*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export const changelog: Array<ChangelogEntry> = Object.values(sources)
  .map(parseEntry)
  .toSorted(
    (a, b) =>
      b.date.localeCompare(a.date) ||
      b.version.localeCompare(a.version, undefined, { numeric: true }),
  );

export const latestChangelog = changelog[0];
