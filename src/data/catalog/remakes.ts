const RED_BLUE = ['firered', 'leafgreen'];
const GOLD_SILVER = ['heartgold', 'soulsilver'];
const RUBY_SAPPHIRE = ['omega-ruby', 'alpha-sapphire'];
const DIAMOND_PEARL = ['brilliant-diamond', 'shining-pearl'];

export const remakesOf: Record<string, Array<string>> = {
  red: RED_BLUE,
  blue: RED_BLUE,
  yellow: ['lets-go-pikachu', 'lets-go-eevee'],
  gold: GOLD_SILVER,
  silver: GOLD_SILVER,
  ruby: RUBY_SAPPHIRE,
  sapphire: RUBY_SAPPHIRE,
  diamond: DIAMOND_PEARL,
  pearl: DIAMOND_PEARL,
};
