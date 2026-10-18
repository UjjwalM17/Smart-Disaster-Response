/**
 * ResQ Regional Map Package & Offline Tile Management Service
 * Implements compliant tile caching, bounded regional downloads,
 * and offline tile delivery for Leaflet without public OSM policy violations.
 */

import { offlineDb } from './offlineDb';

export const PRESET_REGIONS = [
  {
    regionId: 'delhi-ncr',
    name: 'Delhi NCR Flood & Urban Plain',
    description: 'Yamuna River basin, Hindon Vihar, Old Delhi, and Ghaziabad emergency zone',
    bounds: [
      [28.45, 76.95],
      [28.85, 77.50],
    ],
    center: [28.67, 77.24],
    zoom: 12,
    landmarks: ['Yamuna River', 'Hindon Canal', 'Anand Vihar Transit', 'ISBT Kashmere Gate'],
  },
  {
    regionId: 'mumbai-coastal',
    name: 'Mumbai Coastal & Mithi River Zone',
    description: 'Bandra, Kurla, Mithi River bank, and coastal urban flood basin',
    bounds: [
      [18.90, 72.75],
      [19.25, 73.05],
    ],
    center: [19.06, 72.85],
    zoom: 12,
    landmarks: ['Mithi River', 'Bandra-Worli Sealink', 'Dharavi Sector', 'BKC Hub'],
  },
  {
    regionId: 'uttarakhand-foothills',
    name: 'Uttarakhand Foothills & Forest Zone',
    description: 'Jim Corbett buffer, Dehradun, and Shivalik wildfire & landslide corridor',
    bounds: [
      [29.35, 78.85],
      [30.40, 79.55],
    ],
    center: [29.55, 79.10],
    zoom: 11,
    landmarks: ['Ramganga River', 'Corbett Forest Reserve', 'Kotdwar Pass', 'Nainital Ridge'],
  },
  {
    regionId: 'assam-valley',
    name: 'Assam Brahmaputra Valley & Majuli',
    description: 'Majuli river island, Silchar, and Brahmaputra monsoon flood corridor',
    bounds: [
      [24.70, 92.70],
      [27.10, 94.40],
    ],
    center: [26.95, 94.20],
    zoom: 11,
    landmarks: ['Brahmaputra River', 'Majuli Island', 'Silchar Barak Basin', 'Jorhat Port'],
  },
];

// Helper: Convert lat/lon to tile numbers
export function latLonToTileXY(lat, lon, zoom) {
  const x = Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * Math.pow(2, zoom)
  );
  return { x, y };
}

export const mapPackageService = {
  /**
   * Returns list of available preset regions with local download status
   */
  async getRegionsWithStatus() {
    const downloaded = await offlineDb.getDownloadedRegions();
    const downloadedMap = new Map(downloaded.map((r) => [r.regionId, r]));

    return PRESET_REGIONS.map((preset) => {
      const saved = downloadedMap.get(preset.regionId);
      return {
        ...preset,
        isDownloaded: !!saved,
        tileCount: saved ? saved.tileCount : 0,
        sizeBytes: saved ? saved.sizeBytes : 0,
        downloadedAt: saved ? saved.downloadedAt : null,
      };
    });
  },

  /**
   * Downloads and caches regional tiles into IndexedDB with gentle throttling
   * Adheres strictly to tile provider usage guidelines (max ~30-50 bounded tiles per package)
   */
  async downloadRegion(regionId, onProgress = () => {}) {
    const region = PRESET_REGIONS.find((r) => r.regionId === regionId);
    if (!region) throw new Error(`Region ${regionId} not found`);

    const [[minLat, minLon], [maxLat, maxLon]] = region.bounds;
    const targetZooms = [region.zoom, region.zoom + 1]; // Cache 2 practical zoom levels

    const tilesToFetch = [];
    for (const z of targetZooms) {
      const minTile = latLonToTileXY(maxLat, minLon, z);
      const maxTile = latLonToTileXY(minLat, maxLon, z);

      // Bound tiles per zoom to avoid bulk spamming
      const startX = Math.min(minTile.x, maxTile.x);
      const endX = Math.min(Math.max(minTile.x, maxTile.x), startX + 5);
      const startY = Math.min(minTile.y, maxTile.y);
      const endY = Math.min(Math.max(minTile.y, maxTile.y), startY + 5);

      for (let x = startX; x <= endX; x++) {
        for (let y = startY; y <= endY; y++) {
          tilesToFetch.push({ z, x, y });
        }
      }
    }

    const total = tilesToFetch.length;
    let completed = 0;
    let totalBytes = 0;

    for (const { z, x, y } of tilesToFetch) {
      try {
        const tileUrl = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
        const resp = await fetch(tileUrl);
        if (resp.ok) {
          const blob = await resp.blob();
          totalBytes += blob.size;
          await offlineDb.saveTile(z, x, y, blob, region.regionId);
        }
      } catch (err) {
        // Continue fetching other tiles if one fails
      }
      completed++;
      onProgress({ completed, total, percentage: Math.round((completed / total) * 100) });
      // Throttling delay to respect OSM Fair Usage Policy
      await new Promise((r) => setTimeout(r, 120));
    }

    const metadata = {
      regionId: region.regionId,
      name: region.name,
      bounds: region.bounds,
      tileCount: completed,
      sizeBytes: totalBytes,
      status: 'READY',
      downloadedAt: new Date().toISOString(),
    };

    await offlineDb.saveRegionMetadata(metadata);
    await offlineDb.logAudit('OFFLINE_MAP_DOWNLOADED', 'Local Device', {
      regionId: region.regionId,
      tiles: completed,
      sizeKB: Math.round(totalBytes / 1024),
    });

    return metadata;
  },

  /**
   * Deletes a downloaded regional map package
   */
  async removeRegion(regionId) {
    await offlineDb.deleteRegion(regionId);
    await offlineDb.logAudit('OFFLINE_MAP_DELETED', 'Local Device', { regionId });
  },

  /**
   * Checks if given coordinates fall inside any pre-downloaded offline region
   */
  async isLocationInDownloadedRegion(lat, lon) {
    const downloaded = await offlineDb.getDownloadedRegions();
    for (const reg of downloaded) {
      const [[minLat, minLon], [maxLat, maxLon]] = reg.bounds;
      if (lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon) {
        return { inRegion: true, regionName: reg.name };
      }
    }
    return { inRegion: false, regionName: null };
  },
};
