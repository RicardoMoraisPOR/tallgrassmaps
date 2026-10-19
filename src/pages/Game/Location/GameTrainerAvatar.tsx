import { Swords } from 'lucide-react';

export const GameTrainerAvatar = ({ sprite }: { sprite?: string }) =>
  sprite ? (
    <img
      src={sprite}
      alt=""
      className="size-8 flex-none object-cover object-top pixelated"
    />
  ) : (
    <Swords aria-hidden className="size-6 flex-none" />
  );
