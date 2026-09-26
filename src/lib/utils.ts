export { cn } from 'cn';

const listFormat = new Intl.ListFormat('en-GB', { type: 'conjunction' });

export const formatList = (items: string[]) => listFormat.format(items);

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
