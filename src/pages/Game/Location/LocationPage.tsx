import MapViewer from '@/components/map/MapViewer';
import { useGameRoute } from '@/hooks/useGameRoute';
import { trailPath } from '@/lib/paths';
import NotFoundPage from '@/pages/NotFound/NotFoundPage';

import SidebarLayout from '../SidebarLayout';
import { locationLinks } from './locationLinks';
import PlaceCard from './PlaceCard';

export default function LocationPage() {
  const route = useGameRoute();
  const trail = route?.trail;
  const location = trail?.at(-1);

  if (!route || !trail || !location) {
    return <NotFoundPage />;
  }

  const { links, inside, connections } = locationLinks(
    route.region,
    location,
    trailPath(trail),
    route.href,
  );

  return (
    <SidebarLayout
      aside={
        <PlaceCard
          kind={location.kind}
          groups={[
            { label: 'Inside', links: inside },
            { label: 'Connects to', links: connections },
          ]}
        />
      }
    >
      <MapViewer
        map={location}
        links={links}
        className="h-[60svh] min-w-0 overflow-hidden rounded-[14px] border lg:h-[min(72svh,760px)]"
      />
    </SidebarLayout>
  );
}
