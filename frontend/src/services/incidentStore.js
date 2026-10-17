/**
 * Incident State & Persistence Service
 * Bridges backend microservices (/api/incidents) with rich disaster metadata,
 * coordinate mapping, verification workflows, and timeline tracking.
 */

import { api } from './api';

const LOCAL_STORAGE_KEY = 'resq_rich_incidents';

// Initial realistic incidents with coordinates for map display
const INITIAL_INCIDENTS = [
  {
    incidentId: 101,
    id: 101,
    reporterName: 'Priya Sharma',
    mobile: '9876543210',
    location: 'Sector 4, Rohini, New Delhi',
    latitude: 28.7041,
    longitude: 77.1025,
    disasterType: 'Flood',
    aiLabel: 'Flood',
    aiConfidence: 94,
    severity: 'HIGH',
    priorityScore: 87,
    peopleAffected: 65,
    description: 'Residential streets submerged under 4 feet of rainwater. Multiple senior citizens trapped on ground floor.',
    notes: 'Power grid cut off in block B.',
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
    status: 'IN_PROGRESS',
    verified: true,
    verificationStatus: 'VERIFIED',
    reportedBy: 'Citizen Web',
    reportedTime: new Date(Date.now() - 3600000 * 2).toISOString(),
    timeline: [
      { stage: 'Received', time: '2 hours ago', done: true },
      { stage: 'Under verification', time: '1 hour ago', done: true },
      { stage: 'Verified', time: '45 mins ago', done: true },
      { stage: 'Response dispatched', time: '30 mins ago', done: true },
    ],
  },
  {
    incidentId: 102,
    id: 102,
    reporterName: 'Anil Mehta',
    mobile: '9811223344',
    location: 'Old Rajinder Nagar, New Delhi',
    latitude: 28.6387,
    longitude: 77.1895,
    disasterType: 'Building Collapse',
    aiLabel: 'Building Collapse',
    aiConfidence: 91,
    severity: 'CRITICAL',
    priorityScore: 92,
    peopleAffected: 120,
    description: 'Four-story commercial complex structural collapse following foundation waterlogging. Sounds of people trapped in basement.',
    notes: 'Gas smell reported nearby.',
    imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=600&q=80',
    status: 'REPORTED',
    verified: false,
    verificationStatus: 'PENDING',
    reportedBy: 'Citizen Web',
    reportedTime: new Date(Date.now() - 1800000).toISOString(),
    timeline: [
      { stage: 'Received', time: '30 mins ago', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: 'Pending', done: false },
      { stage: 'Response dispatched', time: 'Pending', done: false },
    ],
  },
  {
    incidentId: 103,
    id: 103,
    reporterName: 'Ramesh Verma',
    mobile: '9845012345',
    location: 'Mayur Vihar Phase 1, Yamuna Floodplain',
    latitude: 28.6083,
    longitude: 77.2942,
    disasterType: 'Flood',
    aiLabel: 'Flood',
    aiConfidence: 89,
    severity: 'HIGH',
    priorityScore: 78,
    peopleAffected: 80,
    description: 'Yamuna river water breach reaching temporary shelter colonies. Urgent evacuation boats required.',
    notes: 'Road connectivity severed.',
    imageUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80',
    status: 'REPORTED',
    verified: false,
    verificationStatus: 'PENDING',
    reportedBy: 'Command Dispatch (Caller)',
    reportedTime: new Date(Date.now() - 900000).toISOString(),
    timeline: [
      { stage: 'Received', time: '15 mins ago', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: 'Pending', done: false },
      { stage: 'Response dispatched', time: 'Pending', done: false },
    ],
  },
  {
    incidentId: 104,
    id: 104,
    reporterName: 'Sunita Rao',
    mobile: '9712345678',
    location: 'Okhla Industrial Area Phase 2',
    latitude: 28.5304,
    longitude: 77.2711,
    disasterType: 'Fire',
    aiLabel: 'Fire',
    aiConfidence: 96,
    severity: 'CRITICAL',
    priorityScore: 84,
    peopleAffected: 45,
    description: 'Chemical warehouse fire spreading towards adjacent garment packaging units. Thick toxic black smoke plume.',
    notes: 'Chemical drums exploding.',
    imageUrl: 'https://images.unsplash.com/photo-1602980085566-4c9103848b88?auto=format&fit=crop&w=600&q=80',
    status: 'REPORTED',
    verified: false,
    verificationStatus: 'PENDING',
    reportedBy: 'Citizen Web',
    reportedTime: new Date(Date.now() - 600000).toISOString(),
    timeline: [
      { stage: 'Received', time: '10 mins ago', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: 'Pending', done: false },
      { stage: 'Response dispatched', time: 'Pending', done: false },
    ],
  },
  {
    incidentId: 105,
    id: 105,
    reporterName: 'Vikram Joshi',
    mobile: '9833445566',
    location: 'Ridge Valley Road, Dhaula Kuan',
    latitude: 28.5916,
    longitude: 77.1614,
    disasterType: 'Landslide',
    aiLabel: 'Landslide',
    aiConfidence: 86,
    severity: 'MEDIUM',
    priorityScore: 42,
    peopleAffected: 15,
    description: 'Soil erosion and fallen retaining wall blocking 2 lanes of vehicular traffic. No human casualties observed.',
    notes: 'Traffic diversion required.',
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
    status: 'COMPLETED',
    verified: true,
    verificationStatus: 'VERIFIED',
    reportedBy: 'Traffic Police',
    reportedTime: new Date(Date.now() - 86400000).toISOString(),
    timeline: [
      { stage: 'Received', time: 'Yesterday', done: true },
      { stage: 'Under verification', time: 'Yesterday', done: true },
      { stage: 'Verified', time: 'Yesterday', done: true },
      { stage: 'Response dispatched', time: 'Completed', done: true },
    ],
  },
];

function getStoredIncidents() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_INCIDENTS));
      return INITIAL_INCIDENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_INCIDENTS;
  }
}

function saveStoredIncidents(incidents) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(incidents));
  } catch (err) {
    console.error('Failed to persist incidents to localStorage', err);
  }
}

export const incidentStore = {
  /**
   * Get all incidents, blending backend records with local rich metadata
   */
  async getAllIncidents() {
    let localList = getStoredIncidents();

    try {
      const backendList = await api.getIncidents();
      if (Array.isArray(backendList) && backendList.length > 0) {
        // Merge backend list with local store
        const localMap = new Map(localList.map((inc) => [String(inc.incidentId || inc.id), inc]));

        backendList.forEach((bInc) => {
          const key = String(bInc.incidentId);
          if (localMap.has(key)) {
            // Update status if changed on backend
            localMap.get(key).status = bInc.status || localMap.get(key).status;
          } else {
            // New incident created via raw backend API
            const newEntry = {
              incidentId: bInc.incidentId,
              id: bInc.incidentId,
              reporterName: bInc.reporterName || 'Citizen Reporter',
              mobile: bInc.mobile || '9999999999',
              location: bInc.location || 'New Delhi',
              latitude: 28.6139 + (Math.random() - 0.5) * 0.1,
              longitude: 77.2090 + (Math.random() - 0.5) * 0.1,
              disasterType: bInc.disasterType || 'Flood',
              aiLabel: bInc.disasterType || 'Flood',
              aiConfidence: 90,
              severity: bInc.severity || 'HIGH',
              priorityScore: 78,
              peopleAffected: 30,
              description: bInc.description || 'Emergency incident reported.',
              imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
              status: bInc.status || 'REPORTED',
              verified: false,
              verificationStatus: 'PENDING',
              reportedBy: 'Citizen Web',
              reportedTime: bInc.reportedTime || new Date().toISOString(),
              timeline: [
                { stage: 'Received', time: 'Just now', done: true },
                { stage: 'Under verification', time: 'In progress', done: true },
                { stage: 'Verified', time: 'Pending', done: false },
                { stage: 'Response dispatched', time: 'Pending', done: false },
              ],
            };
            localMap.set(key, newEntry);
          }
        });

        localList = Array.from(localMap.values());
        saveStoredIncidents(localList);
      }
    } catch (err) {
      console.warn('Backend /api/incidents unavailable, using local store:', err.message);
    }

    return localList;
  },

  /**
   * Find incident by numeric or string ID
   */
  async getIncidentById(id) {
    const list = await this.getAllIncidents();
    const strId = String(id).replace('#', '').trim();
    return list.find((inc) => String(inc.incidentId) === strId || String(inc.id) === strId);
  },

  /**
   * Create an incident from Citizen Report or Admin caller form
   */
  async createIncident(formData) {
    let backendId = null;

    // Map severity to Spring Boot enum: LOW, MEDIUM, HIGH, CRITICAL
    let severityEnum = 'HIGH';
    const prio = formData.priorityScore || 80;
    if (prio >= 75) severityEnum = 'CRITICAL';
    else if (prio >= 50) severityEnum = 'HIGH';
    else if (prio >= 25) severityEnum = 'MEDIUM';
    else severityEnum = 'LOW';

    // 1. Submit to Backend /api/incidents
    try {
      const backendPayload = {
        reporterName: formData.reporterName || 'Citizen Reporter',
        mobile: formData.contactPhone && /^[6-9]\d{9}$/.test(formData.contactPhone)
          ? formData.contactPhone
          : '9876543210',
        location: formData.location || 'New Delhi NCR',
        disasterType: formData.aiLabel || formData.disasterType || 'Flood',
        severity: severityEnum,
        description: formData.description || 'Emergency disaster reported.',
      };

      const backendResp = await api.createIncident(backendPayload);
      if (backendResp && (backendResp.incidentId || backendResp.id)) {
        backendId = backendResp.incidentId || backendResp.id;
      }
    } catch (err) {
      console.warn('Backend incident creation error, saving locally:', err.message);
    }

    // 2. Generate local ID if backend didn't return one
    const localList = getStoredIncidents();
    const nextId = backendId || Math.max(105, ...localList.map((i) => Number(i.incidentId || i.id) || 0)) + 1;

    const newIncident = {
      incidentId: nextId,
      id: nextId,
      reporterName: formData.reporterName || 'Citizen Reporter',
      mobile: formData.contactPhone || '9876543210',
      location: formData.location || 'New Delhi NCR',
      latitude: formData.latitude || 28.6139,
      longitude: formData.longitude || 77.2090,
      disasterType: formData.aiLabel || 'Flood',
      aiLabel: formData.aiLabel || 'Flood',
      aiConfidence: formData.aiConfidence || 92,
      severity: severityEnum,
      priorityScore: formData.priorityScore || 85,
      peopleAffected: formData.peopleAffected ? Number(formData.peopleAffected) : 25,
      description: formData.description || '',
      notes: formData.notes || '',
      imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
      status: 'REPORTED',
      verified: false,
      verificationStatus: 'PENDING',
      reportedBy: formData.reportedBy || 'Citizen Web',
      reportedTime: new Date().toISOString(),
      timeline: [
        { stage: 'Received', time: 'Just now', done: true },
        { stage: 'Under verification', time: 'In progress', done: true },
        { stage: 'Verified', time: 'Pending', done: false },
        { stage: 'Response dispatched', time: 'Pending', done: false },
      ],
    };

    localList.unshift(newIncident);
    saveStoredIncidents(localList);

    return newIncident;
  },

  /**
   * Verify an incident in the Verification Queue
   * Calls PATCH /api/incidents/{id}/verify or fallback status update
   */
  async verifyIncident(id) {
    const strId = String(id);
    const localList = getStoredIncidents();
    const incident = localList.find((inc) => String(inc.incidentId) === strId || String(inc.id) === strId);

    if (incident) {
      incident.verified = true;
      incident.verificationStatus = 'VERIFIED';
      incident.status = 'IN_PROGRESS';
      if (incident.timeline && incident.timeline[2]) {
        incident.timeline[2].done = true;
        incident.timeline[2].time = 'Just now';
      }
      saveStoredIncidents(localList);

      // Attempt backend PATCH/PUT
      try {
        await fetch(`/api/incidents/${incident.incidentId}/verify`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e) {
        // Backend optional route
      }
    }
    return incident;
  },

  /**
   * Reject an incident in the Verification Queue
   */
  async rejectIncident(id, reason = 'Duplicate or unverified submission') {
    const strId = String(id);
    const localList = getStoredIncidents();
    const incident = localList.find((inc) => String(inc.incidentId) === strId || String(inc.id) === strId);

    if (incident) {
      incident.verified = false;
      incident.verificationStatus = 'REJECTED';
      incident.status = 'COMPLETED';
      incident.rejectReason = reason;
      saveStoredIncidents(localList);
    }
    return incident;
  },

  /**
   * Mark mission dispatched for incident
   */
  async markDispatched(id, missionId = null) {
    const strId = String(id);
    const localList = getStoredIncidents();
    const incident = localList.find((inc) => String(inc.incidentId) === strId || String(inc.id) === strId);

    if (incident) {
      incident.status = 'IN_PROGRESS';
      if (incident.timeline && incident.timeline[3]) {
        incident.timeline[3].done = true;
        incident.timeline[3].time = 'Dispatched';
      }
      saveStoredIncidents(localList);
    }
    return incident;
  },
};
