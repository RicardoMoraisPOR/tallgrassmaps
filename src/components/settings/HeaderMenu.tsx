import { useState } from 'react';

import { Award, Ellipsis, Settings, Trophy } from 'lucide-react';
import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HallOfFameMaker } from '@/pages/Game/HallOfFame/HallOfFameMaker';

import { SettingsDialog } from './SettingsDialog';

export const HeaderMenu = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [makerOpen, setMakerOpen] = useState(false);

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
          <DropdownMenuItem onSelect={() => setMakerOpen(true)}>
            <Trophy aria-hidden />
            Hall of Fame maker
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
      <HallOfFameMaker open={makerOpen} onClose={() => setMakerOpen(false)} />
    </>
  );
};
