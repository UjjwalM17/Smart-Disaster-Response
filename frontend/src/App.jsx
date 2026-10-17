import React, { useState, useEffect, useCallback } from 'react';
import TopHeader from './components/AdminDashboard/TopHeader';
import Sidebar from './components/AdminDashboard/Sidebar';
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import CitizenPortal from './components/CitizenPortal/CitizenPortal';
import IncidentsTab from './components/IncidentsTab';
import RescueTeamsTab from './components/RescueTeamsTab';
import ResourcesTab from './components/ResourcesTab';
import MissionDispatchTab from './components/MissionDispatchTab';
import AlertsTab from './components/AlertsTab';
import { api } from './services/api';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState('admin'); // 'admin' | 'citizen'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Microservice Data States
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
    } catch {
      // Graceful fallback for demo
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Actions
  const handleAddIncident = async (data) => {
    try {
      await api.createIncident(data);
      showToast('Disaster incident registered and queued for AI verification!');
      await fetchAllData();
    } catch (err) {
      showToast(err.message, 'error');
    }
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

  const handleDispatchRecommendedMission = async (assessment) => {
    // If incidents exist, pick the first or create mission
    const targetIncident = incidents[0]?.incidentId || 1;
    const assignedTeamIds = teams.filter((t) => t.availabilityStatus === 'AVAILABLE').slice(0, 2).map((t) => t.teamId);
    const assignedResourceIds = resources.filter((r) => r.availabilityStatus === 'AVAILABLE').slice(0, 2).map((r) => r.resourceId);

    try {
      await api.createMission({
        incidentId: targetIncident,
        rescueTeamIds: assignedTeamIds.length > 0 ? assignedTeamIds : [1],
        resourceIds: assignedResourceIds.length > 0 ? assignedResourceIds : [1],
        priority: assessment.priorityLevel || 'CRITICAL',
        remarks: `AI Recommended Dispatch: ${assessment.category} (${assessment.damageLevel}). Hazards: ${assessment.hazards}`,
      });
      showToast('Tactical Rescue Mission Dispatched! Emergency alerts broadcasted.');
      await fetchAllData();
      setActiveTab('reports');
    } catch (err) {
      showToast(`Mission dispatch: ${err.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <TopHeader
        currentRole={currentRole}
        onToggleRole={setCurrentRole}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        alerts={alerts}
        onNavigateToAlerts={() => setActiveTab('reports')}
        onNavigateToSettings={() => setActiveTab('settings')}
        onNavigateToReports={() => setActiveTab('reports')}
        onSyncData={fetchAllData}
      />

      {/* Main Body */}
      {currentRole === 'citizen' ? (
        /* Citizen / User Portal */
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <CitizenPortal
            onSubmitReport={handleAddIncident}
            liveIncidents={incidents}
          />
        </main>
      ) : (
        /* Admin Command Dashboard */
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Center Content View */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 space-y-4">
            {activeTab === 'dashboard' && (
              <AdminDashboard
                incidents={incidents}
                teams={teams}
                resources={resources}
                missions={missions}
                onDispatchMission={handleDispatchRecommendedMission}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'new-incident' && (
              <IncidentsTab
                incidents={incidents}
                onAddIncident={handleAddIncident}
                onDeleteIncident={handleDeleteIncident}
              />
            )}

            {activeTab === 'ai-assessment' && (
              <AdminDashboard
                incidents={incidents}
                teams={teams}
                resources={resources}
                missions={missions}
                onDispatchMission={handleDispatchRecommendedMission}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'verification-queue' && (
              <div className="bg-[#121b2f] border border-slate-800/80 rounded-2xl p-6">
                <IncidentsTab
                  incidents={incidents}
                  onAddIncident={handleAddIncident}
                  onDeleteIncident={handleDeleteIncident}
                />
              </div>
            )}

            {activeTab === 'incident-list' && (
              <IncidentsTab
                incidents={incidents}
                onAddIncident={handleAddIncident}
                onDeleteIncident={handleDeleteIncident}
              />
            )}

            {activeTab === 'resource-management' && (
              <div className="space-y-6">
                <RescueTeamsTab
                  teams={teams}
                  onAddTeam={async (data) => {
                    await api.createRescueTeam(data);
                    showToast('Team registered!');
                    fetchAllData();
                  }}
                  onToggleStatus={async (id, status) => {
                    await api.updateTeamStatus(id, status);
                    showToast('Status updated!');
                    fetchAllData();
                  }}
                  onDeleteTeam={async (id) => {
                    await api.deleteRescueTeam(id);
                    fetchAllData();
                  }}
                />
                <ResourcesTab
                  resources={resources}
                  onAddResource={async (data) => {
                    await api.createResource(data);
                    showToast('Resource added!');
                    fetchAllData();
                  }}
                  onToggleStatus={async (id, status) => {
                    await api.updateResourceStatus(id, status);
                    showToast('Status updated!');
                    fetchAllData();
                  }}
                  onDeleteResource={async (id) => {
                    await api.deleteResource(id);
                    fetchAllData();
                  }}
                />
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-6">
                <MissionDispatchTab
                  missions={missions}
                  incidents={incidents}
                  teams={teams}
                  resources={resources}
                  onDispatchMission={async (data) => {
                    await api.createMission(data);
                    showToast('Mission dispatched!');
                    fetchAllData();
                  }}
                  onCompleteMission={async (id) => {
                    await api.updateMissionStatus(id, 'COMPLETED');
                    showToast('Mission completed!');
                    fetchAllData();
                  }}
                  onDeleteMission={async (id) => {
                    await api.deleteMission(id);
                    fetchAllData();
                  }}
                  onViewAlerts={(id) => {
                    setSelectedMissionFilter(id);
                    setActiveTab('alerts');
                  }}
                />
                <AlertsTab
                  alerts={alerts}
                  selectedMissionFilter={selectedMissionFilter}
                  onClearFilter={() => setSelectedMissionFilter(null)}
                />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-2xl bg-[#121b2f] border border-slate-800/80 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white">System & Microservice Settings</h3>
                <p className="text-xs text-slate-400">
                  Manage connection parameters and operational defaults for Spring Boot services.
                </p>
                <div className="space-y-3 text-xs pt-2">
                  {/* Hugging Face AI Configuration */}
                  <div className="p-4 bg-[#0e1627] rounded-xl border border-blue-900/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-amber-400">
                          🤗
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">Hugging Face AI Vision Service</p>
                          <p className="text-[10px] text-slate-400">Official Inference Router: dima806/disaster_image_classification</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800/60">
                        INFERENCE API
                      </span>
                    </div>

                    <div className="space-y-1 pt-1">
                      <label className="text-[10px] text-slate-400 font-medium">User Access Token (hf_...)</label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          placeholder="Enter your Hugging Face Token (starts with hf_)"
                          defaultValue={localStorage.getItem('resq_hf_token') || ''}
                          id="hf-token-input"
                          className="flex-1 bg-[#131d33] text-white text-[11px] px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 font-mono"
                        />
                        <button
                          onClick={async () => {
                            const input = document.getElementById('hf-token-input');
                            if (input) {
                              const val = input.value.trim();
                              if (val) {
                                localStorage.setItem('resq_hf_token', val);
                                showToast('Testing Hugging Face token...');
                                try {
                                  const res = await fetch('https://huggingface.co/api/whoami-v2', {
                                    headers: { Authorization: `Bearer ${val}` },
                                  });
                                  if (res.ok) {
                                    const user = await res.json();
                                    showToast(`Connected as @${user.name || 'user'}! Token saved.`);
                                  } else {
                                    showToast('Token rejected by Hugging Face.', 'error');
                                  }
                                } catch (e) {
                                  showToast('Connection error to huggingface.co', 'error');
                                }
                              } else {
                                localStorage.removeItem('resq_hf_token');
                                showToast('Hugging Face token cleared.');
                              }
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                        >
                          Save & Verify
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 pt-0.5">
                        Get your free user token at{' '}
                        <a
                          href="https://huggingface.co/settings/tokens"
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          huggingface.co/settings/tokens
                        </a>. If left blank, the app uses the built-in local AI disaster heuristics.
                      </p>
                    </div>
                  </div>

                  {/* Microservices */}
                  <div className="flex items-center justify-between p-3 bg-[#0e1627] rounded-xl border border-slate-800">
                    <div>
                      <p className="font-semibold text-white">Spring Cloud Gateway</p>
                      <p className="text-[11px] text-slate-400">http://127.0.0.1:8086</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                      CONNECTED
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#0e1627] rounded-xl border border-slate-800">
                    <div>
                      <p className="font-semibold text-white">Database Engine</p>
                      <p className="text-[11px] text-slate-400">PostgreSQL 18 (Multi-Tenant microservice DBs)</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-2xl text-xs font-semibold ${
              toast.type === 'error'
                ? 'bg-red-950/90 border-red-800 text-red-200 shadow-red-950/50'
                : 'bg-[#121b2f] border-blue-500/50 text-white shadow-blue-950/50'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
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
