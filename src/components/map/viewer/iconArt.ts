import type { ThemeStyle } from '@/stores/settings';

import type { MapIconKind } from './types';

export const mapIconArt: Record<
  MapIconKind['kind'],
  Record<ThemeStyle, string>
> = {
  arrow: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>',
    game: '<svg viewBox="0 0 7 7" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M3 0h1v1h1v1h1v1h1v1h-2v3h-3v-3h-2v-1h1v-1h1v-1h1z"/></svg>',
  },
  exit: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>',
    game: '<svg viewBox="0 0 8 7" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M0 0h4v1h-4zM0 1h1v5h-1zM0 6h4v1h-4zM2 3h6v1h-6zM5 1h1v1h-1zM5 2h2v1h-2zM5 4h2v1h-2zM5 5h1v1h-1z"/></svg>',
  },
  stairs: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h5v-5h5v-5h5V6h3"/></svg>',
    game: '<svg viewBox="0 0 8 8" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M6 0h2v8h-8v-2h2v-2h2v-2h2z"/></svg>',
  },
  ladder: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3v18"/><path d="M16 3v18"/><path d="M8 7h8"/><path d="M8 12h8"/><path d="M8 17h8"/></svg>',
    game: '<svg viewBox="0 0 7 8" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M1 0h1v8h-1zM5 0h1v8h-1zM2 1h3v1h-3zM2 4h3v1h-3zM2 7h3v1h-3z"/></svg>',
  },
  teleport: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="18" rx="9" ry="3.5"/><path d="M7 14V7"/><path d="M12 14V3"/><path d="M17 14V7"/></svg>',
    game: '<svg viewBox="0 0 8 7" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M1 1h1v3h-1zM3 0h2v4h-2zM6 1h1v3h-1zM1 5h6v1h-6zM0 6h8v1h-8z"/></svg>',
  },
  current: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>',
    game: '<svg viewBox="0 0 8 7" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M0 1h1v1h-1zM1 0h2v1h-2zM3 1h2v1h-2zM5 0h2v1h-2zM7 1h1v1h-1zM0 5h1v1h-1zM1 4h2v1h-2zM3 5h2v1h-2zM5 4h2v1h-2zM7 5h1v1h-1z"/></svg>',
  },
  hole: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="12" rx="10" ry="6"/><ellipse cx="12" cy="13" rx="5.5" ry="2.5" fill="currentColor"/></svg>',
    game: '<svg viewBox="0 0 8 6" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M2 0h4v1h-4zM1 1h1v1h-1zM6 1h1v1h-1zM0 2h1v2h-1zM7 2h1v2h-1zM2 2h4v2h-4zM1 4h1v1h-1zM6 4h1v1h-1zM2 5h4v1h-4z"/></svg>',
  },
  sign: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 13v8"/><path d="M12 3v3"/><path d="M18 6a2 2 0 0 1 1.387.56l2.307 2.22a1 1 0 0 1 0 1.44l-2.307 2.22A2 2 0 0 1 18 13H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"/></svg>',
    game: '<svg viewBox="0 0 8 8" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M0 0h8v5h-8zM1 1h6v1h-6zM1 3h4v1h-4z"/><path fill="currentColor" d="M3 5h2v3h-2z"/></svg>',
  },
  door: {
    'tall-grass':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 20H2"/><path d="M11 4.562v16.157a1 1 0 0 0 1.242.97L19 20V5.562a2 2 0 0 0-1.515-1.94l-4-1A2 2 0 0 0 11 4.561z"/><path d="M11 4H8a2 2 0 0 0-2 2v14"/><path d="M14 12h.01"/><path d="M22 20h-3"/></svg>',
    game: '<svg viewBox="0 0 7 8" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M1 0h5v7h-5zM4 3h1v1h-1z"/><path fill="currentColor" d="M0 7h7v1h-7z"/></svg>',
  },
};

export const mapStepArt: Record<ThemeStyle, string> = {
  'tall-grass':
    '<svg viewBox="-3 -3 30 30" aria-hidden="true"><path d="M12 1.5 23 13h-6.5v9.5h-9V13H1z" fill="var(--step-ink)" stroke="var(--step-edge)" stroke-width="4.5" stroke-linejoin="round" paint-order="stroke"/></svg>',
  game: '<svg viewBox="0 0 9 9" shape-rendering="crispEdges" aria-hidden="true"><path fill="var(--step-edge)" d="M3 0h3v1h-3zM2 1h5v1h-5zM1 2h7v1h-7zM0 3h9v3h-9zM2 6h5v3h-5z"/><path fill="var(--step-ink)" d="M4 1h1v1h-1zM3 2h3v1h-3zM2 3h5v1h-5zM1 4h7v1h-7zM3 5h3v3h-3z"/></svg>',
};
