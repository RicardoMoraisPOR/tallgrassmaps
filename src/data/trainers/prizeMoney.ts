import type { TrainerBattle } from './types';

const BASE_MONEY: Record<string, number> = {
  youngster: 15,
  'bug-catcher': 10,
  lass: 15,
  sailor: 30,
  'jr-trainer-m': 20,
  'jr-trainer-f': 20,
  pokemaniac: 50,
  'super-nerd': 25,
  hiker: 35,
  biker: 20,
  burglar: 90,
  engineer: 50,
  juggler: 35,
  fisher: 35,
  swimmer: 5,
  'cue-ball': 25,
  gambler: 70,
  beauty: 70,
  'psychic-tr': 10,
  rocker: 25,
  tamer: 40,
  'bird-keeper': 25,
  blackbelt: 25,
  rival1: 35,
  chief: 30,
  scientist: 50,
  giovanni: 99,
  rocket: 30,
  'cooltrainer-m': 35,
  'cooltrainer-f': 35,
  bruno: 99,
  brock: 99,
  misty: 99,
  'lt-surge': 99,
  erika: 99,
  koga: 99,
  blaine: 99,
  sabrina: 99,
  gentleman: 70,
  rival2: 65,
  rival3: 99,
  lorelei: 99,
  channeler: 30,
  agatha: 99,
  lance: 99,
};

export const prizeMoney = ({ trainerClass, parties }: TrainerBattle) => {
  const base = BASE_MONEY[trainerClass];
  const lastLevel = parties[0]?.pokemon.at(-1)?.level;

  return base !== undefined && lastLevel !== undefined
    ? base * lastLevel
    : undefined;
};
