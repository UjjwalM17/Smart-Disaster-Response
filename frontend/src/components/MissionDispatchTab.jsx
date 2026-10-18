import React, { useState } from 'react';
import { 
  Compass, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Users, 
  Package, 
  Trash2, 
  X, 
  Bell, 
  CheckSquare, 
  Square,
  Sparkles,
  ShieldCheck 
} from 'lucide-react';
import { dispatchEngine } from '../services/dispatchEngine';

export default function MissionDispatchTab({
  missions = [],
  incidents = [],
  teams = [],
  resources = [],
  onDispatchMission,
  onCompleteMission,
  onDeleteMission,
  onViewAlerts,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Dispatch Form State
  const [selectedIncident, setSelectedIncident] = useState('');
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedResources, setSelectedResources] = useState([]);
  const [priority, setPriority] = useState('HIGH');
  const [remarks, setRemarks] = useState('');
  const [recommendation, setRecommendation] = useState(null);

  const availableTeams = teams.filter((t) => t.availabilityStatus === 'AVAILABLE');
  const availableResources = resources.filter((r) => r.availabilityStatus === 'AVAILABLE');

  const toggleTeam = (teamId) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  };

  const toggleResource = (resourceId) => {
    setSelectedResources((prev) =>
      prev.includes(resourceId) ? prev.filter((id) => id !== resourceId) : [...prev, resourceId]
    );
  };

  const handleDispatch = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedIncident) {
      setError('Please select an active Incident to coordinate.');
      return;
    }
    if (selectedTeams.length === 0) {
      setError('Please assign at least one Rescue Team.');
      return;
    }
    if (selectedResources.length === 0) {
      setError('Please allocate at least one Emergency Resource.');
      return;
    }

    try {
      setSubmitting(true);
      await onDispatchMission({
        incidentId: parseInt(selectedIncident, 10),
        rescueTeamIds: selectedTeams,
        resourceIds: selectedResources,
        priority,
        remarks: remarks || 'Emergency rescue mission coordinated and dispatched.',
      });
      setIsModalOpen(false);
      setSelectedIncident('');
      setSelectedTeams([]);
      setSelectedResources([]);
      setRemarks('');
      setPriority('HIGH');
    } catch (err) {
      setError(err.message || 'Mission dispatch failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-500" />
            Rescue Mission Coordination & Dispatch
          </h2>
          <p className="text-xs text-slate-400">
            Synchronously orchestrate incidents, tactical units, resources, and automated alerts
          </p>
        </div>
        <button
          onClick={() => {
            setError('');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-amber-950/60 active:scale-95"
        >
          <Send className="w-4 h-4" />
          Dispatch Rescue Mission
        </button>
      </div>

      {/* Missions List */}
      {missions.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-xl border border-slate-800">
          <Compass className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No rescue missions dispatched yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {missions.map((m) => {
            const isCompleted = m.status === 'COMPLETED';
            const matchedIncident = incidents.find((i) => i.incidentId === m.incidentId);

            return (
              <div
                key={m.missionId}
                className="bg-slate-900 rounded-xl border border-slate-800 p-5 hover:border-slate-700 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-amber-400 text-sm">
                      #{m.missionId}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">
                          Target: Incident #{m.incidentId}
                        </h3>
                        {matchedIncident && (
                          <span className="text-xs text-slate-400">({matchedIncident.location})</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Assigned:{' '}
                        {m.assignedTime ? new Date(m.assignedTime).toLocaleString() : 'Just now'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        m.priority === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : m.priority === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {m.priority} PRIORITY
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {m.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 flex items-center gap-1">
                      <Users className="w-3 h-3 text-blue-400" />
                      Assigned Teams ({m.rescueTeamIds?.length || 0})
                    </span>
                    <p className="text-slate-200 mt-1 font-mono">
                      Teams: {m.rescueTeamIds?.join(', ') || 'None'}
                    </p>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 flex items-center gap-1">
                      <Package className="w-3 h-3 text-emerald-400" />
                      Allocated Resources ({m.resourceIds?.length || 0})
                    </span>
                    <p className="text-slate-200 mt-1 font-mono">
                      Resources: {m.resourceIds?.join(', ') || 'None'}
                    </p>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      Coordinator Remarks
                    </span>
                    <p className="text-slate-200 mt-1 truncate">{m.remarks || 'No remarks provided'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <button
                    onClick={() => onViewAlerts(m.missionId)}
                    className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    View Mission Alerts
                  </button>

                  <div className="flex items-center gap-2">
                    {!isCompleted && (
                      <button
                        onClick={() => onCompleteMission(m.missionId)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all text-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Mark Mission Completed
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteMission(m.missionId)}
                      title="Delete Mission"
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dispatch Mission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-500" />
                Dispatch Tactical Rescue Mission
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-lg flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleDispatch} className="space-y-4 text-xs">
              {/* Step 1: Incident Selection */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">1. Select Target Incident *</label>
                {incidents.length === 0 ? (
                  <p className="text-amber-400 text-xs">No incidents available. Report an incident first!</p>
                ) : (
                  <select
                    value={selectedIncident}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedIncident(val);
                      const inc = incidents.find((i) => String(i.incidentId) === String(val));
                      if (inc) {
                        const rec = dispatchEngine.recommendDispatch({
                          incident: inc,
                          availableTeams,
                          availableResources,
                        });
                        setRecommendation(rec);
                        setPriority((inc.priorityScore && inc.priorityScore >= 80) ? 'CRITICAL' : 'HIGH');
                      } else {
                        setRecommendation(null);
                      }
                    }}
                    required
                    className="w-full p-2.5 bg-slate-950 text-white rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500 text-xs"
                  >
                    <option value="">-- Choose Disaster Incident --</option>
                    {incidents.map((inc) => (
                      <option key={inc.incidentId} value={inc.incidentId}>
                        Incident #{inc.incidentId} - {inc.location} ({inc.disasterType} · {inc.severity})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* AI Dispatch Recommendation Card */}
              {recommendation && (
                <div className="p-3 bg-[#0d1629] rounded-xl border border-blue-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Automated Policy Recommendation
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (recommendation.recommendedTeamIds?.length > 0) {
                          setSelectedTeams(recommendation.recommendedTeamIds);
                        }
                        if (recommendation.recommendedResourceIds?.length > 0) {
                          setSelectedResources(recommendation.recommendedResourceIds);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold shadow"
                    >
                      Apply Allocation
                    </button>
                  </div>
                  <ul className="text-[11px] text-slate-300 space-y-0.5 list-disc list-inside">
                    {recommendation.rationale.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                  {recommendation.requiresHumanConfirmation && (
                    <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-800/40 text-[10px] text-amber-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Safety Rule: Critical priority incident requires manual Operations Commander confirmation.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Rescue Teams Selection */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium flex items-center justify-between">
                  <span>2. Assign Available Rescue Teams *</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {selectedTeams.length} selected
                  </span>
                </label>
                {availableTeams.length === 0 ? (
                  <p className="text-amber-400/80 text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-800">
                    No teams currently marked as AVAILABLE. Register or free up a team first.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-950 rounded-lg border border-slate-800">
                    {availableTeams.map((team) => {
                      const isSelected = selectedTeams.includes(team.teamId);
                      return (
                        <div
                          key={team.teamId}
                          onClick={() => toggleTeam(team.teamId)}
                          className={`p-2 rounded-md border cursor-pointer flex items-center justify-between text-xs transition-all ${
                            isSelected
                              ? 'bg-blue-950/60 border-blue-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <p className="font-semibold">{team.teamName}</p>
                            <span className="text-[10px] text-slate-400">{team.teamType} · {team.currentLocation}</span>
                          </div>
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 3: Emergency Resources Selection */}
              <div className="space-y-1">
                <label className="text-slate-300 font-medium flex items-center justify-between">
                  <span>3. Allocate Emergency Resources *</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {selectedResources.length} selected
                  </span>
                </label>
                {availableResources.length === 0 ? (
                  <p className="text-amber-400/80 text-[11px] bg-slate-950 p-2 rounded-lg border border-slate-800">
                    No resources currently marked as AVAILABLE. Register or free up inventory first.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-950 rounded-lg border border-slate-800">
                    {availableResources.map((res) => {
                      const isSelected = selectedResources.includes(res.resourceId);
                      return (
                        <div
                          key={res.resourceId}
                          onClick={() => toggleResource(res.resourceId)}
                          className={`p-2 rounded-md border cursor-pointer flex items-center justify-between text-xs transition-all ${
                            isSelected
                              ? 'bg-emerald-950/60 border-emerald-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div>
                            <p className="font-semibold">{res.resourceName}</p>
                            <span className="text-[10px] text-slate-400">{res.quantity} units · {res.location}</span>
                          </div>
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 4: Priority & Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Mission Priority *</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-2 bg-slate-950 text-white rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value="CRITICAL">Critical (Immediate Deployment)</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Remarks / Instructions</label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="e.g. Prioritize stranded elderly residents"
                    className="w-full p-2 bg-slate-950 text-white rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold uppercase tracking-wider disabled:opacity-50"
                >
                  {submitting ? 'Dispatching...' : 'Dispatch Mission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
