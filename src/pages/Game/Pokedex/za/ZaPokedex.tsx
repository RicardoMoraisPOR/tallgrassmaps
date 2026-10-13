import { useState } from 'react';

import { entryKey } from '@/data/pokedex/master';

import type { PokedexProps } from '../types';
import { ZaDrawer } from './ZaDrawer';
import { ZaEmptyPreview } from './ZaEmptyPreview';
import { ZaList } from './ZaList';
import { ZaPreview } from './ZaPreview';
import { ZaSearch } from './ZaSearch';
import { ZaTitle } from './ZaTitle';

export const ZaPokedex = ({
  game,
  region,
  href,
  nameOf,
  open,
  focus,
  onClose,
  search,
}: PokedexProps) => {
  const [selectedKey, setSelectedKey] = useState(
    focus ? String(focus) : undefined,
  );
  const [detailsOpen, setDetailsOpen] = useState(!!focus);
  const [seen, setSeen] = useState({ open, focus });

  if (open !== seen.open || focus !== seen.focus) {
    setSeen({ open, focus });

    if (open) {
      setSelectedKey(focus ? String(focus) : undefined);
      setDetailsOpen(!!focus);
    }
  }

  const selected = search.visible.find(
    (entry) => entryKey(entry) === selectedKey,
  );

  return (
    <ZaDrawer
      open={open}
      onClose={onClose}
      header={<ZaTitle game={game} region={region} />}
    >
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {selected ? (
          <ZaPreview
            key={entryKey(selected)}
            entry={selected}
            game={game}
            region={region}
            href={href}
            nameOf={nameOf}
            detailsOpen={detailsOpen}
            onToggleDetails={() => setDetailsOpen((current) => !current)}
          />
        ) : (
          <ZaEmptyPreview />
        )}
        <div className="mx-0 flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-2xl bg-(--za-panel)/90 lg:mr-8 lg:mb-6 lg:rounded-2xl">
          <ZaSearch search={search} />
          <div data-vaul-no-drag className="min-h-0 flex-1 overflow-y-auto">
            <ZaList
              entries={search.visible}
              game={game}
              region={region}
              href={href}
              nameOf={nameOf}
              selectedKey={selected && entryKey(selected)}
              focus={focus}
              onSelectKey={setSelectedKey}
            />
          </div>
        </div>
      </div>
    </ZaDrawer>
  );
};
