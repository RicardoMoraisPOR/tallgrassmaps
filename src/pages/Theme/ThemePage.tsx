import type { ReactNode } from 'react';

import { Container } from '@/components/Container';
import { PageTitle } from '@/components/PageTitle';
import { themeAreas, themeStyles } from '@/components/settings/themes';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ToggleChip } from '@/components/ToggleChip';
import { games } from '@/data/games';
import { pokemonTypeColors } from '@/pages/Game/Pokedex/pokemonTypeColors';
import { useSettingsStore } from '@/stores/settings';

import { ComponentSamples } from './ComponentSamples';
import { MapIconSamples } from './MapIconSamples';
import {
  coreTokens,
  fonts,
  gameBoyTokens,
  legendsZaTokens,
  mapTokens,
  radii,
  textSizes,
} from './tokens';
import { TokenSwatches } from './TokenSwatches';

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-heading text-xl font-bold tracking-tight">{title}</h2>
      {children}
    </section>
  );
};

const Preferences = () => {
  const themes = useSettingsStore((state) => state.themes);
  const setTheme = useSettingsStore((state) => state.setTheme);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-sm">
        <ThemeToggle />
        Light or dark mode.
      </div>
      <ul className="flex flex-col gap-2">
        {themeAreas.map(({ area, label, styleLabels }) => (
          <li key={area} className="flex flex-wrap items-center gap-2">
            <span className="w-36 text-sm">{label}</span>
            {themeStyles.map(({ style, label: styleLabel }) => (
              <ToggleChip
                key={style}
                pressed={themes[area] === style}
                onClick={() => setTheme(area, style)}
              >
                {styleLabels?.[style] ?? styleLabel}
              </ToggleChip>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const ThemePage = () => {
  return (
    <Container size="wide" className="flex flex-col gap-10 py-8">
      <header className="flex flex-col gap-2">
        <PageTitle>Theme</PageTitle>
        <p className="text-sm text-muted-foreground">
          Dev page. Every colour, type, radius, component and skin the site
          uses, read from the live styles.
        </p>
      </header>
      <Section title="Preferences">
        <Preferences />
      </Section>
      <Section title="Colour tokens">
        <TokenSwatches tokens={coreTokens} />
      </Section>
      <Section title="Map colours">
        <TokenSwatches tokens={mapTokens} />
      </Section>
      <Section title="Game colours">
        <ul className="flex flex-wrap gap-2">
          {games.map((game) => (
            <li
              key={game.id}
              className="flex items-center gap-2 rounded-sm border p-2 text-xs"
            >
              {game.colors.map((color) => (
                <span
                  key={color}
                  aria-hidden
                  className="size-6 rounded-sm border"
                  style={{ background: color }}
                />
              ))}
              {game.shortName}
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Pokémon type colours">
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-2">
          {Object.entries(pokemonTypeColors).map(([type, colors]) => (
            <li
              key={type}
              className="flex items-center gap-2 rounded-sm border p-2 text-xs capitalize"
            >
              <span
                aria-hidden
                className="size-6 rounded-sm border"
                style={{ background: colors.darkThemeColor }}
              />
              <span
                aria-hidden
                className="size-6 rounded-sm border"
                style={{ background: colors.whiteThemeColor }}
              />
              {type}
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Typography">
        <ul className="flex flex-col gap-1">
          {fonts.map(({ name, className, use }) => (
            <li key={name} className="flex flex-wrap items-baseline gap-3">
              <span className={`${className} text-2xl`}>{name}</span>
              <span className="text-xs text-muted-foreground">{use}</span>
            </li>
          ))}
        </ul>
        <ul className="flex flex-col gap-1">
          {textSizes.map((size) => (
            <li key={size} className="flex items-baseline gap-3">
              <span className="w-20 font-mono text-xs text-muted-foreground">
                {size}
              </span>
              <span className={size}>Tall grass hides everything</span>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Radius">
        <ul className="flex flex-wrap gap-3">
          {radii.map((radius) => (
            <li key={radius} className="flex flex-col items-center gap-1">
              <span className={`size-16 border bg-muted ${radius}`} />
              <span className="font-mono text-[10px] text-muted-foreground">
                {radius}
              </span>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Components">
        <ComponentSamples />
      </Section>
      <Section title="Map icons">
        <MapIconSamples />
      </Section>
      <Section title="Game Boy skin">
        <div className="pokedex-game flex flex-col gap-4 border-2 p-4">
          <TokenSwatches tokens={gameBoyTokens} />
          <ComponentSamples />
        </div>
      </Section>
      <Section title="Legends: Z-A skin">
        <div className="pokedex-za za-screen flex flex-col gap-4 rounded-lg p-4">
          <TokenSwatches tokens={legendsZaTokens} />
          <ComponentSamples />
        </div>
      </Section>
    </Container>
  );
};
