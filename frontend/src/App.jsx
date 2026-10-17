import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import DashboardOverview from './components/DashboardOverview';
import IncidentsTab from './components/IncidentsTab';
import RescueTeamsTab from './components/RescueTeamsTab';
import ResourcesTab from './components/ResourcesTab';
import MissionDispatchTab from './components/MissionDispatchTab';
import AlertsTab from './components/AlertsTab';
import { api } from './services/api';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [serviceError, setServiceError] = useState('');

  // Data states
  const [incidents, setIncidents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [resources, setResources] = useState([]);
  const [missions, setMissions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedMissionFilter, setSelectedMissionFilter] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setServiceError('');
    try {
      const [
        incidentsRes,
        teamsRes,
        resourcesRes,
        missionsRes,
        alertsRes,
      ] = await Promise.allSettled([
        api.getIncidents(),
        api.getRescueTeams(),
        api.getResources(),
        api.getMissions(),
        api.getAlerts(),
      ]);

      if (incidentsRes.status === 'fulfilled' && Array.isArray(incidentsRes.value)) {
        setIncidents(incidentsRes.value);
      }
      if (teamsRes.status === 'fulfilled' && Array.isArray(teamsRes.value)) {
        setTeams(teamsRes.value);
      }
      if (resourcesRes.status === 'fulfilled' && Array.isArray(resourcesRes.value)) {
        setResources(resourcesRes.value);
      }
      if (missionsRes.status === 'fulfilled' && Array.isArray(missionsRes.value)) {
        setMissions(missionsRes.value);
      }
      if (alertsRes.status === 'fulfilled' && Array.isArray(alertsRes.value)) {
        setAlerts(alertsRes.value);
      }

      // Check if all failed (services offline)
      const allFailed = [incidentsRes, teamsRes, resourcesRes, missionsRes, alertsRes].every(
        (r) => r.status === 'rejected'
      );
      if (allFailed) {
        setServiceError(
          'Unable to reach microservices via Gateway (port 8086). Ensure your Spring Boot backend services are running.'
        );
      }
    } catch (err) {
      setServiceError('Error synchronizing with disaster response services.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Incident Actions
  const handleAddIncident = async (data) => {
    await api.createIncident(data);
    showToast('Disaster incident registered successfully!');
    await fetchAllData();
  };

  const handleDeleteIncident = async (id) => {
    if (!window.confirm(`Delete Incident #${id}?`)) return;
    try {
      await api.deleteIncident(id);
      showToast(`Incident #${id} removed.`);
      await fetchAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Team Actions
  const handleAddTeam = async (data) => {
    await api.createRescueTeam(data);
    showToast('Rescue team registered successfully!');
    await fetchAllData();
  };

  const handleToggleTeamStatus = async (id, newStatus) => {
    try {
      await api.updateTeamStatus(id, newStatus);
      showToast(`Team #${id} status updated to ${newStatus}.`);
      await fetchAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteTeam = async (id) => {
    if (!window.confirm(`Delete Rescue Team #${id}?`)) return;
    try {
      await api.deleteRescueTeam(id);
      showToast(`Rescue Team #${id} deleted.`);
      await fetchAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Resource Actions
  const handleAddResource = async (data) => {
    await api.createResource(data);
    showToast('Emergency resource registered successfully!');
    await fetchAllData();
  };

  const handleToggleResourceStatus = async (id, newStatus) => {
    try {
      await api.updateResourceStatus(id, newStatus);
      showToast(`Resource #${id} status updated to ${newStatus}.`);
      await fetchAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm(`Delete Resource #${id}?`)) return;
    try {
      await api.deleteResource(id);
      showToast(`Resource #${id} deleted.`);
      await fetchAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Mission Actions
  const handleDispatchMission = async (data) => {
    const res = await api.createMission(data);
    showToast(`Mission #${res.missionId || ''} dispatched successfully! Alerts generated.`);
    await fetchAllData();
    setActiveTab('missions');
  };

  const handleCompleteMission = async (id) => {
    try {
      await api.updateMissionStatus(id, 'COMPLETED');
      showToast(`Mission #${id} marked as COMPLETED! Teams and resources updated.`);
      await fetchAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteMission = async (id) => {
    if (!window.confirm(`Delete Mission #${id}?`)) return;
    try {
      await api.deleteMission(id);
      showToast(`Mission #${id} deleted.`);
      await fetchAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleViewAlertsForMission = (missionId) => {
    setSelectedMissionFilter(missionId);
    setActiveTab('alerts');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={fetchAllData}
        loading={loading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Connection Warning Banner */}
        {serviceError && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{serviceError}</span>
            </div>
            <button
              onClick={fetchAllData}
              className="px-3 py-1 bg-red-800 hover:bg-red-700 rounded text-white font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Tab Views */}
        {activeTab === 'overview' && (
          <DashboardOverview
            incidents={incidents}
            teams={teams}
            resources={resources}
            missions={missions}
            alerts={alerts}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'incidents' && (
          <IncidentsTab
            incidents={incidents}
            onAddIncident={handleAddIncident}
            onDeleteIncident={handleDeleteIncident}
          />
        )}

        {activeTab === 'teams' && (
          <RescueTeamsTab
            teams={teams}
            onAddTeam={handleAddTeam}
            onToggleStatus={handleToggleTeamStatus}
            onDeleteTeam={handleDeleteTeam}
          />
        )}

        {activeTab === 'resources' && (
          <ResourcesTab
            resources={resources}
            onAddResource={handleAddResource}
            onToggleStatus={handleToggleResourceStatus}
            onDeleteResource={handleDeleteResource}
          />
        )}

        {activeTab === 'missions' && (
          <MissionDispatchTab
            missions={missions}
            incidents={incidents}
            teams={teams}
            resources={resources}
            onDispatchMission={handleDispatchMission}
            onCompleteMission={handleCompleteMission}
            onDeleteMission={handleDeleteMission}
            onViewAlerts={handleViewAlertsForMission}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsTab
            alerts={alerts}
            selectedMissionFilter={selectedMissionFilter}
            onClearFilter={() => setSelectedMissionFilter(null)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <p>Smart Disaster Response Coordination System · Powered by Spring Boot Microservices & React</p>
      </footer>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-2xl text-xs font-medium ${
              toast.type === 'error'
                ? 'bg-red-950 border-red-800 text-red-200'
                : 'bg-slate-900 border-amber-500/50 text-white shadow-amber-500/10'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
