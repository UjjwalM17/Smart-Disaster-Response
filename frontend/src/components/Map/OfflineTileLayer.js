/**
 * ResQ Offline TileLayer for Leaflet
 * 
 * Fetches tiles from local IndexedDB first (`resq_offline_db.offline_tiles`).
 * If tile is missing and network is offline, draws an informative vector grid canvas
 * showing lat/lon gridlines instead of failing with broken image icons.
 */

import L from 'leaflet';
import { offlineDb } from '../../services/offlineDb';

export const OfflineTileLayer = L.TileLayer.extend({
  createTile(coords, done) {
    const tile = document.createElement('img');

    L.DomEvent.on(tile, 'load', L.Util.bind(this._tileOnLoad, this, done, tile));
    L.DomEvent.on(tile, 'error', L.Util.bind(this._tileOnError, this, done, tile));

    if (this.options.crossOrigin || this.options.crossOrigin === '') {
      tile.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
    }

    tile.alt = '';
    tile.setAttribute('role', 'presentation');

    // 1. Check IndexedDB offline tile cache
    offlineDb
      .getTile(coords.z, coords.x, coords.y)
      .then((blob) => {
        if (blob) {
          tile.src = URL.createObjectURL(blob);
        } else if (navigator.onLine) {
          // If online and not in local cache, load from URL
          tile.src = this.getTileUrl(coords);
        } else {
          // If offline and not in cache, draw an elegant offline canvas tile
          const canvas = document.createElement('canvas');
          canvas.width = 256;
          canvas.height = 256;
          const ctx = canvas.getContext('2d');

          // Dark slate background
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, 256, 256);

          // Grid lines
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1;
          ctx.strokeRect(0, 0, 256, 256);

          // Subtle diagonal grid
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(256, 256);
          ctx.strokeStyle = '#1e293b';
          ctx.stroke();

          // Coordinate and offline label
          ctx.fillStyle = '#64748b';
          ctx.font = '10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`Zoom ${coords.z}`, 128, 110);
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.fillText('📡 Offline Boundary', 128, 130);
          ctx.fillStyle = '#475569';
          ctx.font = '9px Inter, sans-serif';
          ctx.fillText('Region not pre-downloaded', 128, 146);

          tile.src = canvas.toDataURL();
        }
      })
      .catch(() => {
        if (navigator.onLine) {
          tile.src = this.getTileUrl(coords);
        } else {
          done(null, tile);
        }
      });

    return tile;
  },
});

export function createOfflineTileLayer(urlTemplate, options) {
  return new OfflineTileLayer(urlTemplate, options);
}
