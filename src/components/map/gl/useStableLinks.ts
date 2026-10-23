import { useState } from 'react';

import { linkKey } from '../viewer/links';
import type { MapLink } from '../viewer/types';

const signatureOf = (links: Array<MapLink>) =>
  links
    .map(
      (link) =>
        `${linkKey(link)}|${link.className ?? ''}|${link.sprite?.src ?? ''}|${link.sprite?.facing ?? ''}|${link.sprite?.faded ? 1 : 0}|${link.badge ?? ''}|${link.floorId ?? ''}|${link.tooltip ? 1 : 0}`,
    )
    .join('\n');

export const useStableLinks = (links: Array<MapLink>) => {
  const signature = signatureOf(links);
  const [stable, setStable] = useState({ signature, links });

  if (stable.signature !== signature) setStable({ signature, links });

  return stable.signature === signature ? stable.links : links;
};
