import { Images, MapPinned, Palette, Wrench } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const devLinks = [
  { to: '/pokemon-sprites', label: 'Pokémon Sprites', icon: Images },
  { to: '/theme', label: 'Theme', icon: Palette },
];

const mapMakers = [
  { to: '/legends-za/map-maker', label: 'Legends: Z-A' },
  { to: '/rby/map-maker', label: 'Red · Blue · Yellow' },
];

export const DevMenu = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="outline"
        size="icon"
        aria-label="Dev tools"
        className="size-11 sm:size-9"
      >
        <Wrench aria-hidden />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-44">
      <DropdownMenuLabel>Dev tools</DropdownMenuLabel>
      <DropdownMenuSeparator />
      {devLinks.map(({ to, label, icon: Icon }) => (
        <DropdownMenuItem key={to} asChild>
          <Link to={to}>
            <Icon aria-hidden />
            {label}
          </Link>
        </DropdownMenuItem>
      ))}
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <MapPinned aria-hidden />
          Map Maker
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          {mapMakers.map(({ to, label }) => (
            <DropdownMenuItem key={to} asChild>
              <Link to={to}>{label}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </DropdownMenuContent>
  </DropdownMenu>
);
