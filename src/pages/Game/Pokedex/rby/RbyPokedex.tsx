import type { PokedexProps } from '../types';
import { RbyDrawer } from './RbyDrawer';
import { RbyList } from './RbyList';
import { RbySearch } from './RbySearch';
import { RbyTitle } from './RbyTitle';

export const RbyPokedex = ({
  game,
  region,
  href,
  nameOf,
  open,
  focus,
  onClose,
  search,
}: PokedexProps) => (
  <RbyDrawer
    open={open}
    onClose={onClose}
    header={<RbyTitle game={game} region={region} />}
  >
    <div className="flex flex-col gap-3">
      <RbySearch search={search} />
      <RbyList
        game={game}
        region={region}
        href={href}
        nameOf={nameOf}
        entries={search.visible}
        focus={focus}
      />
    </div>
  </RbyDrawer>
);
