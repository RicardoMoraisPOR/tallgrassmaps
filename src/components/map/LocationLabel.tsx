import '@fontsource/press-start-2p';
import type { Region } from '@/data/maps';

import { percent } from './coordinates';

type LocationLabelProps = {
  region: Region;
  name: string;
};

export default function LocationLabel({ region, name }: LocationLabelProps) {
  const { label } = region;
  if (!label) return null;

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute leading-none whitespace-nowrap select-none"
      style={{
        left: percent(label.x, region.width),
        top: percent(label.y, region.height),
        fontSize: `${(label.size / region.width) * 100}cqw`,
        fontFamily: label.fontFamily,
        color: label.color,
        textTransform: label.uppercase ? 'uppercase' : undefined,
      }}
    >
      {name}
    </span>
  );
}
