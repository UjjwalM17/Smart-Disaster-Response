import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [28.6139, 77.2090]; // Delhi NCR default

function createDraggablePin() {
  return L.divIcon({
    className: 'custom-picker-pin',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: grab;">
        <div style="
          width: 34px;
          height: 34px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          background: #2563eb;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 14px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="transform: rotate(45deg); width: 8px; height: 8px; border-radius: 50%; background: #ffffff;"></div>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
}

export default function LocationPickerMap({
  latitude,
  longitude,
  onChangeLocation,
  height = '220px',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const currentLat = latitude || DEFAULT_CENTER[0];
  const currentLng = longitude || DEFAULT_CENTER[1];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([currentLat, currentLng], 14);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const basemapKey = import.meta.env.VITE_BASEMAP_KEY || 'cb1_4nhl_1_64952bce502d32dff4977e54';
      const tileUrl = basemapKey
        ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${basemapKey}`
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      const marker = L.marker([currentLat, currentLng], {
        icon: createDraggablePin(),
        draggable: true,
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        if (onChangeLocation) {
          onChangeLocation(pos.lat, pos.lng);
        }
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        if (onChangeLocation) {
          onChangeLocation(e.latlng.lat, e.latlng.lng);
        }
      });

      markerRef.current = marker;
      mapInstanceRef.current = map;
    } else {
      const map = mapInstanceRef.current;
      const marker = markerRef.current;
      if (marker && (marker.getLatLng().lat !== currentLat || marker.getLatLng().lng !== currentLng)) {
        marker.setLatLng([currentLat, currentLng]);
        map.panTo([currentLat, currentLng], { animate: true });
      }
    }

    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 200);
  }, [currentLat, currentLng, onChangeLocation]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-700/80 shadow-inner bg-slate-900">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />
      <div className="absolute top-2 left-2 z-[1000] bg-slate-900/85 backdrop-blur-sm text-[10px] text-slate-300 font-medium px-2 py-1 rounded-lg border border-slate-800 shadow">
        Drag pin or tap map to pinpoint incident location
      </div>
    </div>
  );
}
