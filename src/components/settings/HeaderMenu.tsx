import { useState } from 'react';

import {
  Award,
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
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { SettingsDialog } from './SettingsDialog';

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
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={() => setSettingsOpen(true)}>
            <Settings aria-hidden />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/maps">
              <MapIcon aria-hidden />
              Explore maps
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/data-lake">
              <Database aria-hidden />
              Data Lake
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/changelog">
              <ScrollText aria-hidden />
              Changelog
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/credits">
              <Award aria-hidden />
              Credits
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
};
