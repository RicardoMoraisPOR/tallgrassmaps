import { pokeapiSprite } from '@/data/sprites';
import { cn } from '@/lib/utils';

type SpriteImageProps = {
  src: string;
  alt: string;
  size: number;
  pixelArt?: boolean;
  className?: string;
};

export const SpriteImage = ({
  src,
  alt,
  size,
  pixelArt = true,
  className,
}: SpriteImageProps) => (
  <img
    src={src}
    alt={alt}
    width={size}
    height={size}
    loading="lazy"
    decoding="async"
    className={cn(
      'object-contain',
      pixelArt && '[image-rendering:pixelated]',
      className,
    )}
    style={{ width: size, height: size }}
  />
);

type PokemonImageProps = {
  number: number;
  name: string;
  size: number;
  className?: string;
};

export const PokemonImage = ({
  number,
  name,
  size,
  className,
}: PokemonImageProps) => (
  <SpriteImage
    src={pokeapiSprite(number)}
    alt={name}
    size={size}
    className={className}
  />
);
