import type { Meta, StoryObj } from '@storybook/react-vite';
import { useGlobals } from 'storybook/preview-api';

import { mapIconArt, mapStepArt, type MapIconKind } from './MapViewer';

const groups: Array<{
  title: string;
  icons: Array<{ label: string; icon: MapIconKind; className?: string }>;
}> = [
  {
    title: 'Connection arrows',
    icons: (['north', 'east', 'south', 'west'] as const).map((direction) => ({
      label: direction,
      icon: { kind: 'arrow' as const, direction },
      className: 'map-link-connection',
    })),
  },
  {
    title: 'Map locations',
    icons: [
      {
        label: 'Exit',
        icon: { kind: 'exit' },
        className: 'map-link-connection',
      },
      { label: 'Door', icon: { kind: 'door' }, className: 'map-link-entrance' },
      { label: 'Sign', icon: { kind: 'sign' }, className: 'map-link-sign' },
    ],
  },
  {
    title: 'Stairs and ladders',
    icons: [
      {
        label: 'Stairs · up',
        icon: { kind: 'stairs', step: 'up' },
        className: 'map-link-connection',
      },
      {
        label: 'Stairs · down',
        icon: { kind: 'stairs', step: 'down' },
        className: 'map-link-connection',
      },
      {
        label: 'Ladder · up',
        icon: { kind: 'ladder', step: 'up' },
        className: 'map-link-connection',
      },
      {
        label: 'Ladder · down',
        icon: { kind: 'ladder', step: 'down' },
        className: 'map-link-connection',
      },
    ],
  },
];

const MapIcons = ({ style }: { style: 'game' | 'tall-grass' }) => {
  const gameStyle = style === 'game';

  return (
    <div className="flex max-w-3xl flex-wrap items-center gap-3 rounded-xl border bg-background p-6">
      <h1 className="w-full text-xl">Map Icons</h1>
      <p className="w-full text-xs text-muted-foreground">
        Hover or focus an icon to preview its interaction animation.
      </p>

      {groups.map(({ title, icons: groupIcons }) => (
        <section key={title} className="w-full">
          <h2 className="mb-2 text-sm font-medium">{title}</h2>
          <div className="flex flex-wrap gap-3">
            {groupIcons.map(({ label, icon, className }) => (
              <div
                key={label}
                className="flex min-w-20 flex-col items-center gap-2 p-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`map-icon ${className ?? ''}${gameStyle ? ' map-icon-game' : ''}`}
                    data-direction={
                      icon.kind === 'arrow' ? icon.direction : undefined
                    }
                    title={label}
                    aria-label={label}
                    dangerouslySetInnerHTML={{
                      __html: mapIconArt[icon.kind][style],
                    }}
                  />
                  {(icon.kind === 'stairs' || icon.kind === 'ladder') &&
                    icon.step && (
                      <span
                        className={`map-icon-step map-icon-step-preview${gameStyle ? ' map-icon-step-preview-game' : ''}`}
                        data-step={icon.step}
                        aria-hidden="true"
                        dangerouslySetInnerHTML={{ __html: mapStepArt[style] }}
                      />
                    )}
                </div>
                <span className="text-center text-xs text-muted-foreground">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>
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

export const Preview: Story = {
  render: () => {
    const [{ style: storyStyle }] = useGlobals();
    const style = storyStyle === 'game' ? 'game' : 'tall-grass';

    return <MapIcons style={style} />;
  },
};
