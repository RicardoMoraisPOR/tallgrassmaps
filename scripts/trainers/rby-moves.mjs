import { readdirSync } from 'node:fs';
import { basename, join } from 'node:path';

import { forGame, read } from '../rby/disassembly.mjs';

const NUM_MOVES = 4;

const GYM_LEADERS = [
  'BROCK',
  'MISTY',
  'LT_SURGE',
  'ERIKA',
  'KOGA',
  'SABRINA',
  'BLAINE',
  'GIOVANNI',
];

const CHAMPION_STARTER_MOVES = {
  VENUSAUR: 'MEGA_DRAIN',
  CHARIZARD: 'FIRE_BLAST',
  BLASTOISE: 'BLIZZARD',
};

const stylizedMoveNames = {
  DOUBLESLAP: 'DoubleSlap',
  THUNDERPUNCH: 'ThunderPunch',
  VICEGRIP: 'ViceGrip',
  SONICBOOM: 'SonicBoom',
  BUBBLEBEAM: 'BubbleBeam',
  POISONPOWDER: 'PoisonPowder',
  SOLARBEAM: 'SolarBeam',
  THUNDERSHOCK: 'ThunderShock',
  SMOKESCREEN: 'SmokeScreen',
};

const titleCase = (name) =>
  stylizedMoveNames[name] ??
  name.toLowerCase().replace(/(^|[\s-])(\w)/g, (match) => match.toUpperCase());

const moveNames = (dir) => {
  const constants = [
    ...read(dir, 'constants/move_constants.asm').matchAll(/^\s*const (\w+)/gm),
  ].map(([, constant]) => constant);
  const names = [
    ...read(dir, 'data/moves/names.asm').matchAll(/^\s*li "(.+)"/gm),
  ].map(([, name]) => name);

  if (constants[0] !== 'NO_MOVE')
    throw new Error(`${dir}: move constants do not start with NO_MOVE`);

  return new Map(
    names.map((name, index) => [constants[index + 1], titleCase(name)]),
  );
};

const levelOneMoves = (dir) =>
  new Map(
    readdirSync(join(dir, 'data/pokemon/base_stats')).map((file) => {
      const text = read(dir, `data/pokemon/base_stats/${file}`);
      const species = text.match(/db DEX_(\w+)/)[1];
      const moves = text
        .match(/db (\w+), (\w+), (\w+), (\w+) ; level 1 learnset/)
        .slice(1)
        .filter((move) => move !== 'NO_MOVE');

      return [species, moves];
    }),
  );

const learnsets = (game, species) => {
  const byLabel = new Map();
  let current;

  for (const line of forGame(
    read(game.dir, 'data/pokemon/evos_moves.asm'),
    game.define,
  )) {
    const label = line.match(/^(\w+)EvosMoves:$/);
    const move = line.match(/^db (\d+), (\w+)$/);

    if (label) {
      current = { ended: 0, moves: [] };
      byLabel.set(label[1].toUpperCase(), current.moves);
    } else if (current && line === 'db 0') {
      current.ended++;
    } else if (current?.ended === 1 && move) {
      current.moves.push({ level: Number(move[1]), move: move[2] });
    }
  }

  return new Map(
    species.map((constant) => {
      const moves = byLabel.get(constant.replaceAll('_', ''));

      if (!moves) throw new Error(`${game.id}: no learnset for ${constant}`);

      return [constant, moves];
    }),
  );
};

const gymLeaderScripts = (dir) => {
  const wram = read(dir, 'ram/wram.asm');

  if (!/wLoneAttackNo::\s*(?:;.*\s*)*wGymLeaderNo::/.test(wram))
    throw new Error('wLoneAttackNo no longer shares wGymLeaderNo');

  const scripts = new Map();

  for (const fileName of readdirSync(join(dir, 'scripts'))) {
    const match = read(dir, `scripts/${fileName}`).match(
      /ld a, (\$?\w+)\n\s*ld \[wGymLeaderNo\], a/,
    );

    if (match) {
      const value = match[1].startsWith('$')
        ? Number.parseInt(match[1].slice(1), 16)
        : Number(match[1]);

      scripts.set(basename(fileName, '.asm'), value);
    }
  }

  return scripts;
};

const loneMoves = (dir) => {
  const text = read(dir, 'data/trainers/special_moves.asm');
  const lone = [
    ...text
      .slice(text.indexOf('LoneMoves:'), text.indexOf('TeamMoves:'))
      .matchAll(/^\s*db (\d+), (\w+)/gm),
  ].map(([, mon, move]) => ({ mon: Number(mon), move }));
  const team = new Map(
    [
      ...text
        .slice(text.indexOf('TeamMoves:'))
        .matchAll(/^\s*db (\w+),\s*(\w+)/gm),
    ].map(([, trainer, move]) => [trainer, move]),
  );

  if (lone.length !== GYM_LEADERS.length)
    throw new Error(
      `${lone.length} lone moves for ${GYM_LEADERS.length} leaders`,
    );

  return { lone, team };
};

const specialTrainerMoves = (dir) => {
  const entries = new Map();
  let current;

  for (const line of forGame(
    read(dir, 'data/trainers/special_moves.asm'),
    '_YELLOW',
  )) {
    const header = line.match(/^db ([A-Z]\w*), (\d+)$/);
    const move = line.match(/^db (\d+), (\d+), (\w+)$/);

    if (header) {
      current = [];
      entries.set(`${header[1]}|${header[2]}`, current);
    } else if (current && move) {
      current.push({
        mon: Number(move[1]) - 1,
        slot: Number(move[2]) - 1,
        move: move[3],
      });
    }
  }

  return entries;
};

export const trainerMoves = (game) => {
  const names = moveNames(game.dir);
  const levelOne = levelOneMoves(game.dir);
  const learned = learnsets(game, [...levelOne.keys()]);
  const yellow = game.id === 'yellow';
  const special = yellow ? specialTrainerMoves(game.dir) : undefined;
  const { lone, team } = yellow ? {} : loneMoves(game.dir);
  const leaderScripts = yellow ? new Map() : gymLeaderScripts(game.dir);

  const movesAt = (species, level) => {
    const moves = [...levelOne.get(species)];

    for (const entry of learned.get(species)) {
      if (entry.level > level) break;
      if (moves.includes(entry.move)) continue;
      if (moves.length === NUM_MOVES) moves.shift();

      moves.push(entry.move);
    }

    return moves;
  };

  const overridesFor = ({ file, trainer, index, party }) => {
    if (yellow) return special.get(`${trainer}|${index}`) ?? [];
    if (!party.special) return [];

    const leader = leaderScripts.get(file);

    if (leader) {
      if (GYM_LEADERS[leader - 1] !== trainer)
        throw new Error(`${file} sets gym leader ${leader} for ${trainer}`);

      return [{ ...lone[leader - 1], slot: 2 }];
    }

    if (team.has(trainer))
      return [{ mon: 4, slot: 2, move: team.get(trainer) }];

    if (trainer === 'RIVAL3') {
      const starter = CHAMPION_STARTER_MOVES[party.at(-1).species];

      if (!starter)
        throw new Error(`Champion team ends with ${party.at(-1).species}`);

      return [
        { mon: 0, slot: 2, move: 'SKY_ATTACK' },
        { mon: 5, slot: 2, move: starter },
      ];
    }

    return [];
  };

  return (battle) => {
    const moves = battle.party.map(({ species, level }) => {
      const known = movesAt(species, level);

      return Array.from({ length: NUM_MOVES }, (_, slot) => known[slot]);
    });

    for (const { mon, slot, move } of overridesFor(battle)) {
      if (!moves[mon])
        throw new Error(
          `${game.id}: ${battle.trainer} #${battle.index} has no Pokémon ${mon + 1}`,
        );

      moves[mon][slot] = move;
    }

    return moves.map((slots) =>
      slots.filter(Boolean).map((move) => {
        const name = names.get(move);

        if (!name) throw new Error(`${game.id}: unknown move ${move}`);

        return name;
      }),
    );
  };
};
