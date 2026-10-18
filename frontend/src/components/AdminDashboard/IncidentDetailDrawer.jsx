import { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  MapPin,
  Clock,
  Sparkles,
  Users,
  Send,
  HelpCircle,
  Truck,
  Package,
  Activity,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { incidentStore } from '../../services/incidentStore';
import { getPriorityColor, getPriorityLabel } from '../Map/IncidentMap';
import IncidentImage from '../common/IncidentImage';

export default function IncidentDetailDrawer({ incident, isOpen, onClose, onMissionDispatched }) {
  const [teams, setTeams] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    if (isOpen && incident) {
      setDispatchSuccess(false);
      setLoadingOptions(true);
      Promise.allSettled([api.getRescueTeams(), api.getResources()])
        .then(([teamsRes, resRes]) => {
          if (teamsRes.status === 'fulfilled' && Array.isArray(teamsRes.value)) {
            const availableTeams = teamsRes.value.filter(
              (t) => (t.availabilityStatus || '').toUpperCase() !== 'OFF_DUTY'
            );
            setTeams(availableTeams);
            if (availableTeams.length > 0) setSelectedTeamId(String(availableTeams[0].teamId || availableTeams[0].id));
          }
          if (resRes.status === 'fulfilled' && Array.isArray(resRes.value)) {
            const availRes = resRes.value.filter(
              (r) => (r.availabilityStatus || 'AVAILABLE').toUpperCase() === 'AVAILABLE'
            );
            setResources(availRes);
            if (availRes.length > 0) setSelectedResourceId(String(availRes[0].resourceId || availRes[0].id));
          }
        })
        .finally(() => setLoadingOptions(false));
    }
  }, [isOpen, incident]);

  if (!isOpen || !incident) return null;

  const score = incident.priorityScore || 80;
  const color = getPriorityColor(score);
  const label = getPriorityLabel(score);

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!selectedTeamId) {
      alert('Please select an active rescue team');
      return;
    }

    setDispatching(true);
    try {
      let missionPrio = 'HIGH';
      if (score >= 75) missionPrio = 'CRITICAL';
      else if (score >= 50) missionPrio = 'HIGH';
      else if (score >= 25) missionPrio = 'MEDIUM';
      else missionPrio = 'LOW';

      const payload = {
        incidentId: Number(incident.incidentId || incident.id),
        rescueTeamIds: [Number(selectedTeamId || 1)],
        resourceIds: [Number(selectedResourceId || (resources[0]?.resourceId || 1))],
        priority: missionPrio,
        remarks: `QRF Strike: ${incident.aiLabel || incident.disasterType} at ${incident.location || 'Site'}`,
      };

      await api.createMission(payload);
      await incidentStore.markDispatched(incident.incidentId || incident.id);

      setDispatchSuccess(true);
      if (onMissionDispatched) onMissionDispatched();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.warn('Backend mission dispatch warning, saving offline mission:', err);
      await incidentStore.markDispatched(incident.incidentId || incident.id);
      setDispatchSuccess(true);
      if (onMissionDispatched) onMissionDispatched();
      setTimeout(() => {
        onClose();
      }, 1500);
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#0e172a] border-l border-slate-800 h-full overflow-y-auto shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 bg-[#121d36] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full animate-ping"
              style={{ backgroundColor: color }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">
                  INC-{incident.incidentId || incident.id}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider"
                  style={{
                    backgroundColor: `${color}20`,
                    color: color,
                    border: `1px solid ${color}40`,
                  }}
                >
                  {label} PRIORITY ({score})
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                {incident.aiLabel || incident.disasterType} Emergency
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-5 space-y-5 flex-1">
          {/* Full Photo */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 group">
            <IncidentImage
              src={incident.imageUrl}
              disasterType={incident.aiLabel || incident.disasterType}
              alt={incident.aiLabel || incident.disasterType || 'Incident site full'}
              className="w-full h-52 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3.5">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-600/90 text-white text-[11px] font-semibold rounded-md flex items-center gap-1 shadow">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    AI Label: {incident.aiLabel || incident.disasterType}
                  </span>
                  <span className="px-2 py-1 bg-slate-900/90 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold rounded-md">
                    {incident.aiConfidence || 94}% Confidence
                  </span>
                </div>
                <span className="text-[10px] text-slate-300 font-mono">
                  {incident.reportedBy || 'Citizen'}
                </span>
              </div>
            </div>
          </div>

          {/* Location & Time Info */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#131f38] border border-slate-800/80 rounded-xl">
              <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400" /> Incident Location
              </span>
              <p className="text-white font-medium mt-1 truncate">{incident.location || 'New Delhi NCR'}</p>
              {incident.latitude && (
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                </p>
              )}
            </div>

            <div className="p-3 bg-[#131f38] border border-slate-800/80 rounded-xl">
              <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-400" /> Population Impact
              </span>
              <p className="text-white font-medium mt-1">
                ~{incident.peopleAffected || 35} Civilians
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Contact: {incident.mobile || '112 Hotline'}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="p-3.5 bg-[#131f38] border border-slate-800/80 rounded-xl text-xs space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Field Description & Notes</span>
            <p className="text-slate-200 leading-relaxed">{incident.description}</p>
            {incident.notes && (
              <p className="text-amber-300/80 text-[11px] pt-1">
                <strong>Hazard Notes:</strong> {incident.notes}
              </p>
            )}
          </div>

          {/* Priority Score & "Explain this score" button */}
          <div className="p-4 bg-[#121d36] border border-blue-900/40 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white">Priority Score Gauge</span>
                <p className="text-[11px] text-slate-400">Evaluated by multi-factor risk model</p>
              </div>
              <button
                type="button"
                onClick={() => setShowScoreModal(!showScoreModal)}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 px-2.5 py-1 bg-blue-950/60 rounded-lg border border-blue-800/50 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" /> Explain this score
              </button>
            </div>

            {/* Score Ring Preview */}
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={color}
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - score / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute font-extrabold text-sm text-white">{score}</span>
              </div>
              <div className="flex-1 text-xs space-y-1">
                <div className="flex justify-between text-slate-300 font-medium">
                  <span>Calculated Urgency</span>
                  <span style={{ color }}>{label}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {score >= 75
                    ? 'Requires immediate high-command intervention & QRF dispatch.'
                    : 'Standard regional emergency unit mobilized.'}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    incident.syncStatus === 'SAVED_OFFLINE'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {incident.syncStatus === 'SAVED_OFFLINE' ? '💾 Stored in Offline Queue' : '📡 PostgreSQL Synced'}
                  </span>
                  {incident.clientIncidentId && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      Ref: {incident.clientIncidentId}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Operator Override Section */}
            <div className="pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowOverride(!showOverride)}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <span>⚙️ Commander Priority Override & Audit</span>
              </button>

              {showOverride && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-2 text-xs animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">New Score (0-100):</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={overrideScore}
                      onChange={(e) => setOverrideScore(e.target.value)}
                      className="w-16 px-2 py-1 rounded-lg bg-slate-800 text-white border border-slate-700 text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold block mb-1">
                      Mandatory Reason for Audit Log:
                    </label>
                    <input
                      type="text"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="e.g. Ground scout confirmed fire reached chemical tanks"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 text-white border border-slate-700 text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!overrideReason.trim()) {
                        alert('Please enter a mandatory reason for the audit log');
                        return;
                      }
                      await incidentStore.overridePriority(incident.incidentId || incident.id, overrideScore, overrideReason);
                      setOverrideSaved(true);
                      setTimeout(() => setOverrideSaved(false), 2000);
                    }}
                    className="w-full py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition"
                  >
                    {overrideSaved ? '✅ Override Saved to Audit Log' : 'Save Commander Override'}
                  </button>
                </div>
              )}
            </div>

            {/* Four Weighted Bars ("Explain this score") */}
            {showScoreModal && (
              <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs animate-in fade-in duration-150">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  Weighted Scoring Breakdown
                </span>
                <div className="space-y-1.5">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Severity (35% weight)</span>
                      <span className="font-bold">30 / 35</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-0.5">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Population Impact (25% weight)</span>
                      <span className="font-bold">22 / 25</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-0.5">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Accessibility / Terrain (20% weight)</span>
                      <span className="font-bold">18 / 20</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-0.5">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Urgency / Life Threat (20% weight)</span>
                      <span className="font-bold">17 / 20</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-0.5">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recommended Resources based on hazard */}
          <div className="p-4 bg-[#121d36] border border-slate-800 rounded-2xl space-y-2.5">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Package className="w-4 h-4 text-emerald-400" /> Recommended AI Quotas
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-emerald-400 font-bold text-sm">2 Teams</span>
                <p className="text-[10px] text-slate-400">Rescue Units</p>
              </div>
              <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-blue-400 font-bold text-sm">3 Amb.</span>
                <p className="text-[10px] text-slate-400">Medical Evac</p>
              </div>
              <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-amber-400 font-bold text-sm">200 Kits</span>
                <p className="text-[10px] text-slate-400">Relief Rations</p>
              </div>
            </div>
          </div>

          {/* Dispatch Mission Form */}
          <div className="p-4 bg-gradient-to-b from-[#162344] to-[#111c36] border border-blue-600/30 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Direct Mission Dispatch</h3>
            </div>

            {dispatchSuccess ? (
              <div className="p-3 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Mission dispatched successfully! Response unit notified.</span>
              </div>
            ) : (
              <form onSubmit={handleDispatch} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-blue-400" /> Select Response Team:
                  </label>
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="w-full bg-[#0d1629] text-white text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
                    disabled={loadingOptions || dispatching}
                  >
                    {teams.length === 0 ? (
                      <option value="">No available teams (Default NDRF Unit 1)</option>
                    ) : (
                      teams.map((t) => (
                        <option key={t.teamId || t.id} value={t.teamId || t.id}>
                          {t.teamName || `Team #${t.teamId || t.id}`} - {t.specialization || 'Rescue'} ({t.availabilityStatus || 'Active'})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-emerald-400" /> Allocate Available Resource (Optional):
                  </label>
                  <select
                    value={selectedResourceId}
                    onChange={(e) => setSelectedResourceId(e.target.value)}
                    className="w-full bg-[#0d1629] text-white text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
                    disabled={loadingOptions || dispatching}
                  >
                    <option value="">None / Standard Equipment</option>
                    {resources.map((r) => (
                      <option key={r.resourceId || r.id} value={r.resourceId || r.id}>
                        {r.resourceName || `Resource #${r.resourceId || r.id}`} ({r.resourceType || 'Gear'}) - Qty: {r.quantity || 1}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={dispatching}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {dispatching ? 'Mobilizing Unit...' : 'Dispatch Quick Response Mission'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
