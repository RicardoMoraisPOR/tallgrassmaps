export type ItemDetails = {
  effect?: string;
  moveName?: string;
  moveType?: string;
};

const MACHINE_TYPES: Record<string, Array<string>> = {
  TM: [
    'normal',
    'normal',
    'normal',
    'normal',
    'normal',
    'poison',
    'normal',
    'normal',
    'normal',
    'normal',
    'water',
    'water',
    'ice',
    'ice',
    'normal',
    'normal',
    'fighting',
    'fighting',
    'fighting',
    'normal',
    'grass',
    'grass',
    'dragon',
    'electric',
    'electric',
    'ground',
    'ground',
    'ground',
    'psychic',
    'psychic',
    'normal',
    'normal',
    'psychic',
    'normal',
    'normal',
    'normal',
    'normal',
    'fire',
    'normal',
    'normal',
    'normal',
    'psychic',
    'flying',
    'psychic',
    'electric',
    'psychic',
    'normal',
    'rock',
    'normal',
    'normal',
  ],
  HM: ['normal', 'flying', 'water', 'normal', 'normal'],
};

const MOVE_NAMES: Record<string, Array<string>> = {
  TM: [
    'Mega Punch',
    'Razor Wind',
    'Swords Dance',
    'Whirlwind',
    'Mega Kick',
    'Toxic',
    'Horn Drill',
    'Body Slam',
    'Take Down',
    'Double-Edge',
    'Bubble Beam',
    'Water Gun',
    'Ice Beam',
    'Blizzard',
    'Hyper Beam',
    'Pay Day',
    'Submission',
    'Counter',
    'Seismic Toss',
    'Rage',
    'Mega Drain',
    'Solar Beam',
    'Dragon Rage',
    'Thunderbolt',
    'Thunder',
    'Earthquake',
    'Fissure',
    'Dig',
    'Psychic',
    'Teleport',
    'Mimic',
    'Double Team',
    'Reflect',
    'Bide',
    'Metronome',
    'Selfdestruct',
    'Egg Bomb',
    'Fire Blast',
    'Swift',
    'Skull Bash',
    'Softboiled',
    'Dream Eater',
    'Sky Attack',
    'Rest',
    'Thunder Wave',
    'Psywave',
    'Explosion',
    'Rock Slide',
    'Tri Attack',
    'Substitute',
  ],
  HM: ['Cut', 'Fly', 'Surf', 'Strength', 'Flash'],
};

const EFFECTS: Record<string, string> = {
  Bicycle: 'Lets you travel faster outdoors.',
  'Bike Voucher': 'Trade it in at the Bike Shop for a Bicycle.',
  'Coin Case': 'Holds up to 9,999 coins.',
  'Dome Fossil': 'Can be revived into a Pokémon at the Cinnabar Lab.',
  'Exp. All': 'Shares Exp. Points with your whole team.',
  'Good Rod': 'Fish for Pokémon in the water.',
  'Helix Fossil': 'Can be revived into a Pokémon at the Cinnabar Lab.',
  Itemfinder: 'Detects hidden items nearby.',
  'Master Ball': 'Catches any wild Pokémon without fail.',
  "Oak's Parcel": 'Deliver it to Prof. Oak.',
  'Old Amber': 'Can be revived into a Pokémon at the Cinnabar Lab.',
  'Old Rod': 'Fish for weak Pokémon in the water.',
  'Poke Flute': 'Wakes up sleeping Pokémon.',
  Pokedex: 'Records data on the Pokémon you see.',
  'S.S. Ticket': 'Lets you board the S.S. Anne.',
  'Super Rod': 'Fish for a wider range of Pokémon in the water.',
  'Town Map': 'Shows a map of Kanto.',
  Antidote: 'Cures poison.',
  Awakening: 'Wakes a sleeping Pokémon.',
  Calcium: "Permanently raises a Pokémon's Special.",
  Carbos: "Permanently raises a Pokémon's Speed.",
  'Card Key': 'Opens the locked doors in Silph Co.',
  Elixer: 'Restores 10 PP to every move of one Pokémon.',
  'Escape Rope': 'Returns you to the entrance of a cave or dungeon.',
  Ether: 'Restores 10 PP to one move.',
  'Full Heal': 'Cures any status problem.',
  'Full Restore': 'Fully restores HP and cures any status problem.',
  'Gold Teeth': "The Warden's lost teeth. Give them back for HM04.",
  'Great Ball': 'A good Poké Ball with a better catch rate than a Poké Ball.',
  'Guard Spec': 'Protects your team from stat drops for the battle.',
  'HP Up': "Permanently raises a Pokémon's max HP.",
  'Hyper Potion': 'Restores 200 HP.',
  Iron: "Permanently raises a Pokémon's Defense.",
  'Lift Key': 'Works the elevator in the Rocket Hideout.',
  'Max Elixer': 'Fully restores the PP of every move of one Pokémon.',
  'Max Ether': 'Fully restores the PP of one move.',
  'Max Potion': 'Fully restores HP.',
  'Max Revive': 'Revives a fainted Pokémon with full HP.',
  'Moon Stone': 'Makes certain Pokémon evolve.',
  Nugget: 'A valuable lump of gold. Sells for a lot.',
  'PP Up': "Raises one move's max PP.",
  'Poke Ball': 'Catches wild Pokémon.',
  Potion: 'Restores 20 HP.',
  Protein: "Permanently raises a Pokémon's Attack.",
  'Rare Candy': "Raises a Pokémon's level by one.",
  Revive: 'Revives a fainted Pokémon with half its HP.',
  'Secret Key': 'Opens the Cinnabar Island Gym.',
  'Silph Scope': 'Lets you see ghosts in Pokémon Tower.',
  'Super Potion': 'Restores 50 HP.',
  'Ultra Ball': 'A high-performance Poké Ball.',
  'X Accuracy': 'Raises accuracy for the battle.',
  'X Special': 'Raises Special for the battle.',
};

const COINS = /^\d+ Coins$/;

const plain = (name: string) =>
  name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[’']/g, "'");

export const itemDetails = (name: string): ItemDetails => {
  const machine = /^(TM|HM)(\d+)(?:\s|$)/.exec(name);

  if (machine) {
    const index = Number(machine[2]) - 1;

    return {
      moveName: MOVE_NAMES[machine[1]][index],
      moveType: MACHINE_TYPES[machine[1]][index],
    };
  }

  if (COINS.test(name)) return { effect: 'Coins for the Game Corner.' };

  return { effect: EFFECTS[plain(name)] };
};
