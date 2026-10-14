import { useState } from 'react';

import {
  Award,
  BookOpen,
  Database,
  Ellipsis,
  Map as MapIcon,
  ScrollText,
  Settings,
} from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { SettingsDialog } from './SettingsDialog';

const menuSections = [
  {
    label: 'Explore',
    links: [
      {
        to: '/maps',
        label: 'Explore maps',
        icon: MapIcon,
        onBarOnDesktop: true,
      },
      {
        to: '/pokedex',
        label: 'National Pokédex',
        icon: BookOpen,
        onBarOnDesktop: true,
      },
      { to: '/data-lake', label: 'Data Lake', icon: Database },
    ],
  },
  {
    label: 'About',
    links: [
      { to: '/changelog', label: 'Changelog', icon: ScrollText },
      { to: '/credits', label: 'Credits', icon: Award },
    ],
  },
];

export const HeaderMenu = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label="Menu"
            className="size-11 sm:size-9"
          >
            <Ellipsis aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onSelect={() => setSettingsOpen(true)}>
            <Settings aria-hidden />
            Settings
          </DropdownMenuItem>
          {menuSections.map(({ label, links }) => (
            <DropdownMenuGroup key={label}>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>{label}</DropdownMenuLabel>
              {links.map(({ to, label: linkLabel, icon: Icon, ...link }) => (
                <DropdownMenuItem
                  key={to}
                  asChild
                  className={link.onBarOnDesktop ? 'sm:hidden' : undefined}
                >
                  <Link to={to}>
                    <Icon aria-hidden />
                    {linkLabel}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
};
