import { datasets, rowsOf } from './datasets';
import { display, numberStats, type Row, sortRows, valueCounts } from './table';

export type NerdStat = {
  label: string;
  value: string;
  detail?: string | Array<string>;
};

const format = new Intl.NumberFormat('en');

const rowsFor = (id: string) => {
  const dataset = datasets.find((candidate) => candidate.id === id);

  return dataset ? rowsOf(dataset) : [];
};

const words = (rows: Array<Row>) =>
  rows.reduce(
    (sum, row) =>
      sum + display(row.dialogue).split(/\s+/).filter(Boolean).length,
    0,
  );

export const nerdStats = (): Array<NerdStat> => {
  const pokemon = rowsFor('pokemon');
  const encounters = rowsFor('encounters');
  const trainers = rowsFor('trainers');
  const teams = rowsFor('trainer-pokemon');
  const items = rowsFor('items');
  const people = rowsFor('people');
  const signs = rowsFor('signs');
  const places = rowsFor('places');
  const statics = rowsFor('static');
  const totalRows = datasets.reduce(
    (sum, dataset) => sum + rowsOf(dataset).length,
    0,
  );
  const [topTeamMate] = valueCounts(teams, 'pokemon');
  const [topItem] = valueCounts(items, 'item');
  const [strongest] = sortRows(teams, { column: 'level', direction: 'desc' });
  const [busiestPlace] = valueCounts(encounters, 'place');
  const levels = numberStats(teams, 'level');
  const [toughest] = sortRows(statics, { column: 'level', direction: 'desc' });

  return [
    {
      label: 'Rows of data',
      value: format.format(totalRows),
      detail: `across ${datasets.length} datasets`,
    },
    {
      label: 'Pokédex entries',
      value: format.format(pokemon.length),
    },
    {
      label: 'Ways to get a Pokémon',
      value: format.format(encounters.length),
      detail: busiestPlace
        ? `${busiestPlace[0]} has the most (${busiestPlace[1]})`
        : undefined,
    },
    {
      label: 'Trainer battles',
      value: format.format(trainers.length),
      detail: `${format.format(teams.length)} Pokémon across all teams`,
    },
    {
      label: 'Most-used trainer Pokémon',
      value: topTeamMate?.[0] ?? '–',
      detail: topTeamMate
        ? `on ${format.format(topTeamMate[1])} teams`
        : undefined,
    },
    {
      label: 'Strongest trainer Pokémon',
      value: strongest ? `Lv. ${strongest.level}` : '–',
      detail: strongest
        ? [
            `${display(strongest.pokemon)}, ${display(strongest.trainer)}`,
            display(strongest.games),
          ]
        : undefined,
    },
    {
      label: 'Average trainer Pokémon level',
      value: levels ? levels.mean.toFixed(1) : '–',
      detail: levels ? `median ${levels.median}` : undefined,
    },
    {
      label: 'Items on the ground',
      value: format.format(items.length),
      detail: topItem
        ? `most common: ${topItem[0]} (${topItem[1]})`
        : undefined,
    },
    {
      label: 'Gifts and one-off Pokémon',
      value: format.format(statics.length),
      detail: toughest
        ? [
            `toughest: ${display(toughest.pokemon)}, Lv. ${toughest.level}`,
            display(toughest.games),
          ]
        : undefined,
    },
    {
      label: 'Talking people',
      value: format.format(people.length),
      detail: `${format.format(words(people))} words of dialogue`,
    },
    {
      label: 'Signs to read',
      value: format.format(signs.length),
    },
    {
      label: 'Places mapped',
      value: format.format(places.length),
    },
  ];
};
