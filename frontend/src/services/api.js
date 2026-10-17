const BASE_URL = '/api';

async function handleResponse(response) {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const parsed = JSON.parse(errorText);
      errorMessage = parsed.message || parsed.error || JSON.stringify(parsed);
    } catch {
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

export const api = {
  // Incidents
  getIncidents: () => fetch(`${BASE_URL}/incidents`).then(handleResponse),
  getIncidentById: (id) => fetch(`${BASE_URL}/incidents/${id}`).then(handleResponse),
  createIncident: (data) =>
    fetch(`${BASE_URL}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
  updateIncident: (id, data) =>
    fetch(`${BASE_URL}/incidents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
  deleteIncident: (id) =>
    fetch(`${BASE_URL}/incidents/${id}`, { method: 'DELETE' }).then(handleResponse),

  // Rescue Teams
  getRescueTeams: () => fetch(`${BASE_URL}/rescue-teams`).then(handleResponse),
  getRescueTeamById: (id) => fetch(`${BASE_URL}/rescue-teams/${id}`).then(handleResponse),
  createRescueTeam: (data) =>
    fetch(`${BASE_URL}/rescue-teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
  updateTeamStatus: (id, status) =>
    fetch(`${BASE_URL}/rescue-teams/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ availabilityStatus: status }),
    }).then(handleResponse),
  deleteRescueTeam: (id) =>
    fetch(`${BASE_URL}/rescue-teams/${id}`, { method: 'DELETE' }).then(handleResponse),

  // Resources
  getResources: () => fetch(`${BASE_URL}/resources`).then(handleResponse),
  getResourceById: (id) => fetch(`${BASE_URL}/resources/${id}`).then(handleResponse),
  createResource: (data) =>
    fetch(`${BASE_URL}/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
  updateResourceStatus: (id, status) =>
    fetch(`${BASE_URL}/resources/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ availabilityStatus: status }),
    }).then(handleResponse),
  deleteResource: (id) =>
    fetch(`${BASE_URL}/resources/${id}`, { method: 'DELETE' }).then(handleResponse),

  // Missions
  getMissions: () => fetch(`${BASE_URL}/missions`).then(handleResponse),
  getMissionById: (id) => fetch(`${BASE_URL}/missions/${id}`).then(handleResponse),
  createMission: (data) =>
    fetch(`${BASE_URL}/missions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),
  updateMissionStatus: (id, status) =>
    fetch(`${BASE_URL}/missions/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then(handleResponse),
  deleteMission: (id) =>
    fetch(`${BASE_URL}/missions/${id}`, { method: 'DELETE' }).then(handleResponse),

  // Alerts
  getAlerts: () => fetch(`${BASE_URL}/alerts`).then(handleResponse),
  getAlertsByMission: (missionId) =>
    fetch(`${BASE_URL}/alerts/mission/${missionId}`).then(handleResponse),
};
