import { cn } from '@/lib/utils';

type TrainerSpriteProps = {
  src: string;
  className?: string;
};

export const TrainerSprite = ({ src, className }: TrainerSpriteProps) => (
  <span
    aria-hidden
    className={cn(
      'pixelated inline-block size-8 flex-none bg-no-repeat',
      className,
    )}
    style={{
      backgroundImage: `url(${src})`,
      backgroundSize: '100% 300%',
      backgroundPosition: 'top',
    }}
  />
);
