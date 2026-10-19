import type { MapLink } from '@/components/map/viewer/types';
import type { GameRoute } from '@/hooks/useGameRoute';

import { EncountersTab } from './EncountersTab';
import type { LayerSection } from './links/types';
import { EmptyTab, type PanelTab } from './LocationPanel';
import type { buildLocationView } from './locationView';
import { MapInfoTab } from './MapInfoTab';
import type { MapLayerId } from './mapLayers';
import { TrainersTab } from './TrainersTab';

type PanelView = Pick<
  ReturnType<typeof buildLocationView>,
  'trainerGroups' | 'pokedex' | 'listedBattles' | 'encounters' | 'links'
>;

type LocationPanelTabsOptions = {
  route: GameRoute;
  dataPath: string;
  view: PanelView;
  sections: Array<LayerSection>;
  hiddenLayers: Set<MapLayerId>;
  onHighlight: (key: string | undefined) => void;
  onSelectTrainer: (key: string | undefined) => void;
  onPin: (key: string) => void;
};

export const locationPanelTabs = ({
  route,
  dataPath,
  view,
  sections,
  hiddenLayers,
  onHighlight,
  onSelectTrainer,
  onPin,
}: LocationPanelTabsOptions): Array<PanelTab> => {
  const { trainerGroups, pokedex, listedBattles, encounters, links } = view;
  const pokemonCount = new Set(
    encounters.flatMap((group) => group.rows.map((row) => row.entry.number)),
  ).size;

  return [
    {
      id: 'info',
      label: 'Map',
      count: sections.reduce(
        (total, { groups }) =>
          total + groups.reduce((sum, { entries }) => sum + entries.length, 0),
        0,
      ),
      content: (
        <MapInfoTab
          sections={sections}
          onHighlight={onHighlight}
          onOpen={(key) => {
            const action = links.find(
              (link: MapLink) =>
                link.onClick && [link.highlightKey].flat().includes(key),
            )?.onClick;

            if (listedBattles.some((listed) => listed.key === key))
              onSelectTrainer(key);
            else if (action) action();
            else {
              onPin(key);

              return true;
            }

            return false;
          }}
          hiddenLayers={hiddenLayers}
        />
      ),
    },
    {
      id: 'pokemon',
      label: 'Pokémon',
      count: pokemonCount,
      content:
        pokedex && pokemonCount > 0 ? (
          <EncountersTab
            game={route.game}
            path={dataPath}
            groups={encounters}
            onHighlight={onHighlight}
          />
        ) : (
          <EmptyTab>No Pokémon to catch here.</EmptyTab>
        ),
    },
    {
      id: 'trainers',
      label: 'Battles',
      count: listedBattles.length,
      content:
        pokedex && listedBattles.length > 0 ? (
          <TrainersTab
            game={route.game}
            groups={trainerGroups}
            pokedex={pokedex}
            onHighlight={onHighlight}
            onSelect={onSelectTrainer}
          />
        ) : (
          <EmptyTab>No trainer battles here.</EmptyTab>
        ),
    },
  ];
};
