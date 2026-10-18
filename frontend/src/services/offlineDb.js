/**
 * ResQ Offline IndexedDB Engine (resq_offline_db)
 * High-performance, durable storage for:
 * 1. Offline incident reports & raw media blobs (photos/videos)
 * 2. Upload sync queue with retry & idempotency tracking
 * 3. Preloaded regional offline map tiles
 * 4. Regional map boundaries and package manifests
 * 5. Incident audit logging
 */

const DB_NAME = 'resq_offline_db';
const DB_VERSION = 2;

export const SYNC_STATUS = {
  SAVED_OFFLINE: 'SAVED_OFFLINE',
  PENDING_SYNC: 'PENDING_SYNC',
  SYNCING: 'SYNCING',
  SYNCED: 'SYNCED',
  ANALYSIS_PENDING: 'ANALYSIS_PENDING',
  FAILED: 'FAILED',
};

class OfflineDbService {
  constructor() {
    this.dbPromise = null;
  }

  getDb() {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 1. Incidents store
        if (!db.objectStoreNames.contains('incidents')) {
          const store = db.createObjectStore('incidents', { keyPath: 'clientIncidentId' });
          store.createIndex('syncStatus', 'syncStatus', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('disasterType', 'disasterType', { unique: false });
        }

        // 2. Offline map tiles store
        if (!db.objectStoreNames.contains('offline_tiles')) {
          const tileStore = db.createObjectStore('offline_tiles', { keyPath: 'tileKey' });
          tileStore.createIndex('regionName', 'regionName', { unique: false });
        }

        // 3. Offline map regions metadata store
        if (!db.objectStoreNames.contains('offline_regions')) {
          db.createObjectStore('offline_regions', { keyPath: 'regionId' });
        }

        // 4. Audit logs store
        if (!db.objectStoreNames.contains('audit_logs')) {
          const auditStore = db.createObjectStore('audit_logs', { autoIncrement: true, keyPath: 'logId' });
          auditStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        console.error('[ResQ OfflineDb] Open failed:', event.target.error);
        reject(event.target.error);
      };
    });

    return this.dbPromise;
  }

  // =========================================================================
  // INCIDENTS & MEDIA BLOBS
  // =========================================================================

  /**
   * Saves an incident locally with durable offline status and media blob
   */
  async saveIncident(incidentData, mediaBlob = null) {
    const db = await this.getDb();
    const clientIncidentId = incidentData.clientIncidentId || `RESQ-LOCAL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const record = {
      ...incidentData,
      clientIncidentId,
      mediaBlob: mediaBlob || incidentData.mediaBlob || null,
      syncStatus: incidentData.syncStatus || SYNC_STATUS.SAVED_OFFLINE,
      syncAttempts: incidentData.syncAttempts || 0,
      createdAt: incidentData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(['incidents'], 'readwrite');
      const store = tx.objectStore('incidents');
      const req = store.put(record);

      req.onsuccess = () => resolve(record);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  /**
   * Retrieves all locally saved incidents
   */
  async getAllLocalIncidents() {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['incidents'], 'readonly');
      const store = tx.objectStore('incidents');
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  /**
   * Retrieves an incident by client ID
   */
  async getIncidentByClientId(clientIncidentId) {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['incidents'], 'readonly');
      const store = tx.objectStore('incidents');
      const req = store.get(clientIncidentId);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  /**
   * Retrieves all incidents pending sync
   */
  async getPendingSyncIncidents() {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['incidents'], 'readonly');
      const store = tx.objectStore('incidents');
      const req = store.getAll();

      req.onsuccess = () => {
        const list = req.result || [];
        const pending = list.filter(
          (inc) =>
            inc.syncStatus === SYNC_STATUS.SAVED_OFFLINE ||
            inc.syncStatus === SYNC_STATUS.PENDING_SYNC ||
            inc.syncStatus === SYNC_STATUS.FAILED
        );
        resolve(pending);
      };
      req.onerror = (e) => reject(e.target.error);
    });
  }

  /**
   * Updates an incident status (e.g. SYNCED, FAILED)
   */
  async updateIncidentStatus(clientIncidentId, syncStatus, extraFields = {}) {
    const db = await this.getDb();
    const incident = await this.getIncidentByClientId(clientIncidentId);
    if (!incident) return null;

    const updated = {
      ...incident,
      ...extraFields,
      syncStatus,
      updatedAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(['incidents'], 'readwrite');
      const store = tx.objectStore('incidents');
      const req = store.put(updated);

      req.onsuccess = () => resolve(updated);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  // =========================================================================
  // OFFLINE MAP TILES & REGIONAL PACKAGES
  // =========================================================================

  /**
   * Caches a map tile in IndexedDB
   */
  async saveTile(z, x, y, tileBlob, regionName = 'General') {
    const db = await this.getDb();
    const tileKey = `${z}_${x}_${y}`;
    const record = {
      tileKey,
      z,
      x,
      y,
      tileBlob,
      regionName,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(['offline_tiles'], 'readwrite');
      const store = tx.objectStore('offline_tiles');
      const req = store.put(record);

      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  /**
   * Retrieves a cached map tile from IndexedDB
   */
  async getTile(z, x, y) {
    const db = await this.getDb();
    const tileKey = `${z}_${x}_${y}`;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(['offline_tiles'], 'readonly');
      const store = tx.objectStore('offline_tiles');
      const req = store.get(tileKey);

      req.onsuccess = () => resolve(req.result ? req.result.tileBlob : null);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  /**
   * Saves metadata for a pre-downloaded offline map region
   */
  async saveRegionMetadata(region) {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['offline_regions'], 'readwrite');
      const store = tx.objectStore('offline_regions');
      const req = store.put(region);

      req.onsuccess = () => resolve(region);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  /**
   * Retrieves all pre-downloaded map regions
   */
  async getDownloadedRegions() {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['offline_regions'], 'readonly');
      const store = tx.objectStore('offline_regions');
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  /**
   * Removes a downloaded region and its tiles
   */
  async deleteRegion(regionId) {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['offline_regions', 'offline_tiles'], 'readwrite');
      const regStore = tx.objectStore('offline_regions');
      const tileStore = tx.objectStore('offline_tiles');

      regStore.delete(regionId);

      const index = tileStore.index('regionName');
      const req = index.openCursor(IDBKeyRange.only(regionId));
      req.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          tileStore.delete(cursor.primaryKey);
          cursor.continue();
        }
      };

      tx.oncomplete = () => resolve(true);
      tx.onerror = (e) => reject(e.target.error);
    });
  }

  // =========================================================================
  // AUDIT LOGGING
  // =========================================================================

  async logAudit(action, performedBy, details = {}) {
    const db = await this.getDb();
    const entry = {
      action,
      performedBy,
      details,
      timestamp: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(['audit_logs'], 'readwrite');
      const store = tx.objectStore('audit_logs');
      const req = store.add(entry);

      req.onsuccess = () => resolve(entry);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async getAuditLogs(limit = 100) {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['audit_logs'], 'readonly');
      const store = tx.objectStore('audit_logs');
      const req = store.getAll();

      req.onsuccess = () => {
        const list = req.result || [];
        list.reverse();
        resolve(list.slice(0, limit));
      };
      req.onerror = (e) => reject(e.target.error);
    });
  }
}

export const offlineDb = new OfflineDbService();
