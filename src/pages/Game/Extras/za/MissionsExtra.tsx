import { useState } from 'react';

import { ChevronDown, MapPin, Search } from 'lucide-react';
import { Link } from 'react-router';

import { Collapse } from '@/components/Collapse';
import { Input } from '@/components/ui/input';
import { missionsFor } from '@/data/missions';
import type { Mission } from '@/data/missions/types';
import { locationHref } from '@/lib/paths';

import type { ExtraContentProps } from '../types';

export const MissionsExtra = ({ game, region }: ExtraContentProps) => {
  const [openId, setOpenId] = useState<string>();
  const [query, setQuery] = useState('');

  const missions = missionsFor(region.versionGroup) ?? [];
  const groups = [...new Set(missions.map((mission) => mission.group))];
  const needle = query.trim().toLowerCase();
  const matches = (mission: Mission) =>
    !needle ||
    mission.title.toLowerCase().includes(needle) ||
    String(mission.number ?? mission.label?.toLowerCase()) === needle;
  const found = missions.filter(matches).length;

  const toggle = (id: string) =>
    setOpenId((current) => (current === id ? undefined : id));

  return (
    <>
      <p className="text-sm text-muted-foreground">
        {missions.length} missions in total.
      </p>
      <label className="relative block">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <span className="sr-only">Search by name or number</span>
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or number…"
          className="h-9 pl-8"
        />
      </label>
      {found === 0 && (
        <p className="py-6 text-center text-xs text-muted-foreground">
          No missions match &ldquo;{query.trim()}&rdquo;.
        </p>
      )}
      {groups.map((group) => {
        const entries = missions.filter(
          (mission) => mission.group === group && matches(mission),
        );

        if (entries.length === 0) return null;

        return (
          <div key={group} className="flex flex-col gap-2">
            <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {group} · {entries.length}
            </h3>
            <ul className="flex flex-col divide-y rounded-lg border">
              {entries.map((mission) => (
                <MissionRow
                  key={mission.id}
                  mission={mission}
                  open={openId === mission.id}
                  onToggle={() => toggle(mission.id)}
                  locationName={
                    mission.location
                      ? region.locations.find(
                          ({ id }) => id === mission.location,
                        )?.name
                      : undefined
                  }
                  href={
                    mission.location
                      ? locationHref(game.id, mission.location)
                      : undefined
                  }
                />
              ))}
            </ul>
          </div>
        );
      })}
    </>
  );
};

type MissionRowProps = {
  mission: Mission;
  open: boolean;
  onToggle: () => void;
  locationName: string | undefined;
  href: string | undefined;
};

const MissionRow = ({
  mission,
  open,
  onToggle,
  locationName,
  href,
}: MissionRowProps) => {
  const panelId = `mission-${mission.id}`;

  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs hover:bg-muted/50"
      >
        {(mission.number ?? mission.label) !== undefined && (
          <span className="w-8 flex-none text-xs text-muted-foreground tabular-nums">
            {mission.number ?? mission.label}
          </span>
        )}
        <span className="flex-1 font-medium">{mission.title}</span>
        <ChevronDown
          aria-hidden
          className={`size-4 flex-none text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <Collapse
        open={open}
        id={panelId}
        className="flex flex-col gap-2 px-3 pb-3"
      >
        <p className="text-xs text-muted-foreground">{mission.description}</p>
        {href && (
          <Link
            to={href}
            className="inline-flex items-center gap-1.5 self-start text-xs font-medium text-brand hover:underline"
          >
            <MapPin aria-hidden className="size-3.5" />
            {locationName ?? 'Show on the map'}
          </Link>
        )}
      </Collapse>
    </li>
  );
};
