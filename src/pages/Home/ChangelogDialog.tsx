import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { changelog } from '@/data/changelog';

type ChangelogDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const dateFormat = new Intl.DateTimeFormat('en', { dateStyle: 'long' });

const formatDate = (date: string) =>
  dateFormat.format(new Date(`${date}T00:00:00`));

export const ChangelogDialog = ({
  open,
  onOpenChange,
}: ChangelogDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85svh] flex-col gap-6 overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>What&apos;s new</DialogTitle>
          <DialogDescription>The latest changes to the site.</DialogDescription>
        </DialogHeader>

        {changelog.map((entry) => (
          <section key={entry.version} className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <h3 className="font-semibold">{entry.title}</h3>
              <p className="text-[13px] text-muted-foreground">
                Version {entry.version} ·{' '}
                <time dateTime={entry.date}>{formatDate(entry.date)}</time>
              </p>
            </div>
            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-pretty marker:text-brand">
              {entry.changes.map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
          </section>
        ))}
      </DialogContent>
    </Dialog>
  );
};
