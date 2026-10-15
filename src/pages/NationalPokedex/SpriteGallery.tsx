import { SpriteImage } from './PokemonImage';
import { type SpriteOption, spriteGroups } from './pokemonProfile';

type SpriteGalleryProps = {
  name: string;
  sprites: Array<SpriteOption>;
};

const PLATE_SIZE = 104;

export const SpriteGallery = ({ name, sprites }: SpriteGalleryProps) => {
  const groups = spriteGroups(sprites);

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <div key={group.name} className="flex flex-col gap-2">
          {groups.length > 1 && (
            <h4 className="text-xs font-medium">{group.name}</h4>
          )}
          <ul className="flex flex-wrap gap-3">
            {group.sprites.map((sprite) => (
              <li
                key={sprite.key}
                className="flex flex-col items-center gap-1.5"
              >
                <span
                  className="flex items-center justify-center overflow-hidden rounded-lg bg-muted/50"
                  style={{ width: PLATE_SIZE, height: PLATE_SIZE }}
                >
                  <SpriteImage
                    src={sprite.src}
                    alt={`${name}, ${group.name}, ${sprite.source}`}
                    size={sprite.size}
                    pixelArt={sprite.pixelArt}
                  />
                </span>
                <span
                  className="max-w-26 truncate text-[11px] leading-none text-muted-foreground"
                  title={sprite.source}
                >
                  {sprite.source}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
