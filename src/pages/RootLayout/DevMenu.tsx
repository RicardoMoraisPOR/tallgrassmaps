import { Images, MapPinned, Wrench } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const devLinks = [
  { to: '/pokemon-sprites', label: 'Pokémon Sprites', icon: Images },
  { to: '/legends-za/map-maker', label: 'Map Maker', icon: MapPinned },
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
    </DropdownMenuContent>
  </DropdownMenu>
);
