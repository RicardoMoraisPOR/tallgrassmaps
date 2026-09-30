import type { Meta, StoryObj } from '@storybook/react-vite';

import { useThemeStyle } from '@/components/settings/themes';

const directions = ['north', 'east', 'south', 'west'] as const;

const MapIcons = () => {
  const style = useThemeStyle('mapIcons');
  const gameStyle = style === 'game';

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-background p-6">
      <h1 className="w-full text-xl">Map Icons</h1>
      <p className="w-full text-xs text-muted-foreground">
        Hover or focus an icon to preview its interaction animation.
      </p>

      <h3 className="w-full text-muted-foreground">Map Connections</h3>
      {directions.map((direction) => (
        <span
          key={direction}
          className={`map-arrow${gameStyle ? ' map-arrow-game' : ''}`}
          data-direction={direction}
          title={direction}
        >
          {gameStyle ? (
            <svg
              viewBox="0 0 7 7"
              shapeRendering="crispEdges"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M3 0h1v1h1v1h1v1h1v1h-2v3h-3v-3h-2v-1h1v-1h1v-1h1z"
              />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m5 12 7-7 7 7" />
              <path d="M12 19V5" />
            </svg>
          )}
        </span>
      ))}
    </div>
  );
};

const meta = {
  title: 'Map/Map Icons',
  component: MapIcons,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof MapIcons>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Preview: Story = {};
