import { Link } from 'react-router';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  gameContentSectionTitle,
  type Game,
  type GameContentStatus,
} from '@/data/games';

type MissingContentDialogProps = {
  game: Game;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const MissingContentDialog = ({
  game,
  open,
  onOpenChange,
}: MissingContentDialogProps) => {
  const statusOrder: Record<GameContentStatus, number> = {
    complete: 0,
    'in-progress': 1,
    missing: 2,
  };
  const sections = [...(game.contentStatus ?? [])].sort(
    (a, b) => statusOrder[a.status] - statusOrder[b.status],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{game.fullName} content status</DialogTitle>
          <DialogDescription>
            These content areas are still needed for a complete game entry.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-muted/60 text-xs text-muted-foreground">
              <tr>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Content
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Status
                </th>
                <th scope="col" className="px-3 py-2.5 font-medium">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sections.map(({ section, status, details }) => (
                <tr key={section}>
                  <th
                    scope="row"
                    className="w-1/3 px-3 py-2.5 align-top font-medium"
                  >
                    {gameContentSectionTitle(section)}
                  </th>
                  <td className="px-3 py-2.5 align-top">
                    <ContentStatusTag status={status} />
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    {status === 'in-progress' ? details : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <DialogFooter>
          <Button asChild>
            <Link to={`/${game.id}`}>Open map anyway</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const statusLabels: Record<GameContentStatus, string> = {
  complete: 'Complete',
  missing: 'Missing',
  'in-progress': 'In Progress',
};

const statusStyles: Record<GameContentStatus, string> = {
  complete: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  missing: 'bg-destructive/10 text-destructive',
  'in-progress': 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
};

const ContentStatusTag = ({ status }: { status: GameContentStatus }) => {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
};
