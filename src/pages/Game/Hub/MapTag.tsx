import {
  versionGroupNames,
  versionGroupParts,
} from '@/data/catalog/versionGroups';
import { formatList } from '@/lib/utils';

export const MapTag = ({ versionGroup }: { versionGroup: string }) => (
  <span
    title={`Same maps in ${formatList(versionGroupNames(versionGroup))}`}
    className="inline-flex h-6 items-center rounded-full border bg-muted/50 px-2.5 pb-1 text-xs leading-none font-medium text-foreground"
  >
    {versionGroupParts(versionGroup).map(({ text, color }, index) => (
      <span key={index} style={color ? { color } : undefined}>
        {text}
      </span>
    ))}
    &nbsp;map
  </span>
);
