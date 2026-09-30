import 'leaflet/dist/leaflet.css';
import type { ReactNode } from 'react';

export const MapPopupStoryFrame = ({ children }: { children: ReactNode }) => (
  <div
    className="leaflet-container"
    style={{ background: 'transparent', overflow: 'visible', padding: 40 }}
  >
    <div
      className="leaflet-popup map-popup"
      style={{ position: 'relative', left: 'auto', bottom: 'auto', margin: 0 }}
    >
      <a
        className="leaflet-popup-close-button"
        role="button"
        aria-label="Close popup"
        href="#close"
        onClick={(event) => event.preventDefault()}
      >
        <span aria-hidden>×</span>
      </a>
      <div className="leaflet-popup-content-wrapper">
        <div className="leaflet-popup-content">{children}</div>
      </div>
      <div className="leaflet-popup-tip-container">
        <div className="leaflet-popup-tip" />
      </div>
    </div>
  </div>
);
