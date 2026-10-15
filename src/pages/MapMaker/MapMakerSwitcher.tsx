import { NavLink } from 'react-router';

import { cn } from '@/lib/utils';

const MAKERS = [
  { to: '/legends-za/map-maker', label: 'Legends: Z-A' },
  { to: '/rby/map-maker', label: 'Red · Blue · Yellow' },
];

export const MapMakerSwitcher = ({ className }: { className?: string }) => {
  return (
    <nav
      aria-label="Map maker"
      className={cn(
        'pointer-events-auto flex gap-1 rounded-lg border bg-card/95 p-1 shadow-sm',
        className,
      )}
    >
      {MAKERS.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'rounded-sm px-2.5 py-1 text-xs font-medium whitespace-nowrap',
              isActive
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
};
