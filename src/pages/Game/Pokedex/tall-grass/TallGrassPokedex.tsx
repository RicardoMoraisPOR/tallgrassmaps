import type { PokedexProps } from '../types';
import { TallGrassDrawer } from './TallGrassDrawer';
import { TallGrassList } from './TallGrassList';
import { TallGrassSearch } from './TallGrassSearch';
import { TallGrassTitle } from './TallGrassTitle';

export const TallGrassPokedex = ({
  game,
  region,
  href,
  nameOf,
  open,
  focus,
  onClose,
  search,
}: PokedexProps) => (
  <TallGrassDrawer
    open={open}
    onClose={onClose}
    header={<TallGrassTitle game={game} region={region} />}
  >
    <div className="flex flex-col gap-3">
      <TallGrassSearch search={search} />
      <TallGrassList
        game={game}
        region={region}
        href={href}
        nameOf={nameOf}
        entries={search.visible}
        focus={focus}
      />
    </div>
  </TallGrassDrawer>
);
