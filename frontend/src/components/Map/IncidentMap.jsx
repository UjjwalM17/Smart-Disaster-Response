import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Priority Colors
export const PRIORITY_COLORS = {
  CRITICAL: '#ef4444', // 75+
  HIGH: '#f97316',     // 50-74
  MEDIUM: '#eab308',   // 25-49
  LOW: '#3b82f6',      // < 25
};

export function getPriorityColor(score) {
  if (score >= 75) return PRIORITY_COLORS.CRITICAL;
  if (score >= 50) return PRIORITY_COLORS.HIGH;
  if (score >= 25) return PRIORITY_COLORS.MEDIUM;
  return PRIORITY_COLORS.LOW;
}

export function getPriorityLabel(score) {
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'MEDIUM';
  return 'LOW';
}

function createCustomPin(score, isCritical) {
  const color = getPriorityColor(score);
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        ${
          isCritical
            ? `<div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: ${color}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
            : ''
        }
        <div style="
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          background: ${color};
          border: 2px solid #ffffff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            transform: rotate(45deg);
            color: #ffffff;
            font-size: 10px;
            font-weight: 800;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          ">${score}</span>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

export default function IncidentMap({
  incidents = [],
  onSelectIncident,
  height = '420px',
  center = [28.6139, 77.2090], // Default New Delhi
  zoom = 11,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map if not already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView(center, zoom);

      // OpenStreetMap tiles — free, no API key required
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    markersLayer.clearLayers();

    // Valid coordinates only
    const validIncidents = incidents.filter(
      (inc) => inc.latitude && inc.longitude && !isNaN(inc.latitude) && !isNaN(inc.longitude)
    );

    const latLngs = [];

    validIncidents.forEach((inc) => {
      const score = inc.priorityScore || 50;
      const isCritical = score >= 75;
      const icon = createCustomPin(score, isCritical);

      const marker = L.marker([inc.latitude, inc.longitude], { icon });

      // Marker click opens incident drawer
      marker.on('click', () => {
        if (onSelectIncident) {
          onSelectIncident(inc);
        }
      });

      // Hover tooltip
      marker.bindTooltip(
        `
        <div style="font-family: inherit; font-size: 12px; padding: 2px;">
          <strong style="color: ${getPriorityColor(score)};">[${getPriorityLabel(score)} ${score}]</strong>
          <span style="font-weight: 600; margin-left: 4px;">${inc.aiLabel || inc.disasterType}</span>
          <div style="color: #64748b; font-size: 11px; margin-top: 2px;">${inc.location || 'Location'}</div>
          <div style="color: #2563eb; font-size: 10px; margin-top: 4px; font-weight: 500;">Click to view drawer & dispatch &rarr;</div>
        </div>
      `,
        { direction: 'top', offset: [0, -30] }
      );

      markersLayer.addLayer(marker);
      latLngs.push([inc.latitude, inc.longitude]);
    });

    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [incidents, onSelectIncident]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {/* Legend Overlay */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-800 text-[11px] px-3 py-2 rounded-xl flex items-center gap-3 text-slate-300 shadow-lg">
        <span className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider">Priority:</span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-500/20 animate-pulse"></span> Critical (75+)
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> High (50-74)
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span> Med (25-49)
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Low (&lt;25)
        </span>
      </div>
    </div>
  );
}
