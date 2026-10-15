import { mapIconArt, mapStepArt } from '@/components/map/viewer/iconArt';
import { themeStyles } from '@/components/settings/themes';

export const MapIconSamples = () => {
  return (
    <div className="flex flex-col gap-3">
      {themeStyles.map(({ style, label }) => (
        <div key={style} className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">{label}</h3>
          <ul className="flex flex-wrap gap-2">
            {Object.entries(mapIconArt).map(([kind, art]) => (
              <li
                key={kind}
                className="flex w-20 flex-col items-center gap-1 rounded-sm border p-2"
              >
                <span
                  aria-hidden
                  className="size-8 text-foreground [&_svg]:size-full"
                  dangerouslySetInnerHTML={{ __html: art[style] }}
                />
                <span className="font-mono text-[10px] text-muted-foreground">
                  {kind}
                </span>
              </li>
            ))}
            <li className="flex w-20 flex-col items-center gap-1 rounded-sm border p-2">
              <span
                aria-hidden
                className="size-8 [--step-edge:var(--background)] [--step-ink:var(--foreground)] [&_svg]:size-full"
                dangerouslySetInnerHTML={{ __html: mapStepArt[style] }}
              />
              <span className="font-mono text-[10px] text-muted-foreground">
                step
              </span>
            </li>
          </ul>
        </div>
      ))}
    </div>
  );
};
