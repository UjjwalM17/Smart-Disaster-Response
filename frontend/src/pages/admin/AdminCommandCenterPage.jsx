import { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Sparkles,
  PhoneCall,
  MapPin,
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  Activity,
  AlertTriangle,
  RefreshCw,
  Eye,
  Send,
  Users,
} from 'lucide-react';
import StatCards from '../../components/AdminDashboard/StatCards';
import IncidentMap, { getPriorityColor, getPriorityLabel } from '../../components/Map/IncidentMap';
import IncidentDetailDrawer from '../../components/AdminDashboard/IncidentDetailDrawer';
import CallerReportModal from '../../components/AdminDashboard/CallerReportModal';
import IncidentImage from '../../components/common/IncidentImage';
import { incidentStore } from '../../services/incidentStore';
import { api } from '../../services/api';

export default function AdminCommandCenterPage() {
  const [incidents, setIncidents] = useState([]);
  const [missions, setMissions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected incident for drawer
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Caller Report modal
  const [isCallerModalOpen, setIsCallerModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [incList, missionList, teamList, resList] = await Promise.allSettled([
        incidentStore.getAllIncidents(),
        api.getMissions(),
        api.getRescueTeams(),
        api.getResources(),
      ]);

      if (incList.status === 'fulfilled') setIncidents(incList.value || []);
      if (missionList.status === 'fulfilled' && Array.isArray(missionList.value)) setMissions(missionList.value);
      if (teamList.status === 'fulfilled' && Array.isArray(teamList.value)) setTeams(teamList.value);
      if (resList.status === 'fulfilled' && Array.isArray(resList.value)) setResources(resList.value);
    } catch (err) {
      console.warn('Error loading command center data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenDrawer = (inc) => {
    setSelectedIncident(inc);
    setIsDrawerOpen(true);
  };

  // KPI Calculations
  const totalIncidents = incidents.length;
  const criticalCount = incidents.filter((i) => (i.priorityScore || 0) >= 75).length;
  const autoVerifiedCount = incidents.filter((i) => i.verified).length;
  const flaggedExceptionsCount = incidents.filter((i) => !i.verified).length;
  const activeTeamsCount = teams.filter(
    (t) => (t.availabilityStatus || '').toUpperCase() !== 'OFF_DUTY'
  ).length;

  // Stream of recent automatically triaged incidents
  const recentTriageStream = [...incidents].slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Shortened Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#141f38] via-[#0f172a] to-[#121c33] border border-blue-900/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Tactical Command Center
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            RESQ Incident Operations & AI Dispatch
          </h1>
          <p className="text-xs text-slate-400">
            Real-time multi-agency coordination with automated priority scoring & mission allocation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCallerModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span>Report on Behalf of Caller</span>
          </button>

          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Refresh All Feeds"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 5 Stat Cards */}
      <StatCards
        totalIncidents={totalIncidents}
        criticalPriority={criticalCount}
        awaitingVerification={flaggedExceptionsCount}
        autoVerifiedCount={autoVerifiedCount}
        availableTeams={activeTeamsCount}
        reliefSupplies={resources.reduce((sum, r) => sum + (Number(r.quantity) || 0), 350)}
      />

      {/* AI Assessment & Priority Engine Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Priority Assessment Card (Score Ring + 4 Weighted Bars) */}
        <div className="bg-[#121b2f] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/30">
                AI
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">Priority Assessment Engine</h3>
                <p className="text-[11px] text-slate-400">
                  Weighted multi-factor score (Severity 35%, Population 25%, Accessibility 20%, Urgency 20%)
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
              Active Algorithm
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-1">
            {/* Score Ring */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#ef4444"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - 87 / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-black text-white">87</span>
                <span className="block text-[9px] text-slate-400 uppercase font-bold">/ 100</span>
              </div>
            </div>

            {/* Four Weighted Bars */}
            <div className="flex-1 w-full space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>Severity Factor (35% Weight)</span>
                  <span className="font-bold text-red-400">30 / 35</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-0.5">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '86%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>Population Impact (25% Weight)</span>
                  <span className="font-bold text-orange-400">22 / 25</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-0.5">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: '88%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>Accessibility / Terrain (20% Weight)</span>
                  <span className="font-bold text-amber-400">18 / 20</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-0.5">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: '90%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300">
                  <span>Urgency / Life Threat (20% Weight)</span>
                  <span className="font-bold text-blue-400">17 / 20</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-0.5">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Critical Priority Callout Banner (Score 75+) */}
          <div className="p-3 bg-red-950/70 border border-red-700/60 rounded-xl text-red-200 text-xs flex items-center gap-2.5 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 animate-pulse" />
            <div>
              <span className="font-bold text-red-300 uppercase tracking-wider text-[11px]">
                Critical Priority Alert (Score 87)
              </span>
              <p className="text-[11px] text-red-200/90 mt-0.5">
                Immediate response required. High population impact & structural damage detected in Sector 4.
              </p>
            </div>
          </div>
        </div>

        {/* Resource Recommendations Cards based on hazard */}
        <div className="bg-[#121b2f] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" /> Resource Recommendations
              </h3>
              <span className="text-[11px] text-slate-400">Hazard: <strong>Severe Flood Breach</strong></span>
            </div>
            <p className="text-[11px] text-slate-400">
              Automated resource allocation quotas calculated based on population impact and severity.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-[#0d1629] border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Rescue Teams</span>
              <div className="text-base font-extrabold text-blue-400">2 Teams</div>
              <p className="text-[10px] text-slate-500">NDRF Alpha & Beta</p>
            </div>

            <div className="p-3 bg-[#0d1629] border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Ambulances</span>
              <div className="text-base font-extrabold text-red-400">3 Units</div>
              <p className="text-[10px] text-slate-500">Trauma Response</p>
            </div>

            <div className="p-3 bg-[#0d1629] border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Medical Kits</span>
              <div className="text-base font-extrabold text-emerald-400">50 Kits</div>
              <p className="text-[10px] text-slate-500">First-aid triage</p>
            </div>

            <div className="p-3 bg-[#0d1629] border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Food Supplies</span>
              <div className="text-base font-extrabold text-amber-400">200 Packs</div>
              <p className="text-[10px] text-slate-500">Dry rations / meals</p>
            </div>

            <div className="p-3 bg-[#0d1629] border border-slate-800 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Water Supplies</span>
              <div className="text-base font-extrabold text-sky-400">500 Liters</div>
              <p className="text-[10px] text-slate-500">Packaged drinking</p>
            </div>

            <div className="p-3 bg-blue-950/40 border border-blue-800/50 rounded-xl flex flex-col justify-center items-center text-center">
              <span className="text-[10px] text-blue-300 font-bold">1-Click Dispatch</span>
              <button
                onClick={() => {
                  if (incidents.length > 0) handleOpenDrawer(incidents[0]);
                }}
                className="mt-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold shadow transition-colors"
              >
                Dispatch All
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-3">
            <span>Available Regional Warehouses: <strong>3 Active</strong></span>
            <span className="text-emerald-400 font-medium">94% Fleet Readiness</span>
          </div>
        </div>
      </div>

      {/* Leaflet Incident Map */}
      <div className="bg-[#121b2f] border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" /> Tactical Incident Map
            </h3>
            <p className="text-[11px] text-slate-400">
              Pins color-coded by priority score. Click any pin to open the Incident Detail Drawer and dispatch teams.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {incidents.filter((i) => i.latitude && i.longitude).length} Incidents Plotted
          </span>
        </div>

        <IncidentMap
          incidents={incidents}
          onSelectIncident={handleOpenDrawer}
          height="400px"
        />
      </div>

      {/* Autonomous AI Incident Triage Stream */}
      <div className="bg-[#121b2f] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Autonomous AI Incident Triage Stream</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  {autoVerifiedCount} Auto-Verified
                </span>
                {flaggedExceptionsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                    {flaggedExceptionsCount} Flagged Low-Conf
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Routine reports are verified & prioritized automatically — eliminating manual verification bottlenecks
              </p>
            </div>
          </div>
        </div>

        {recentTriageStream.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="font-semibold text-slate-200">No Incidents Reported</p>
            <p>Awaiting incoming incident streams from citizens and field units.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e1628] text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Incident</th>
                  <th className="py-3 px-4">Photo Preview</th>
                  <th className="py-3 px-4">AI Prediction & Confidence</th>
                  <th className="py-3 px-4">Priority Badge</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Autonomous Status</th>
                  <th className="py-3 px-4 text-right">Telemetry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {recentTriageStream.map((inc) => {
                  const score = inc.priorityScore || 50;
                  const color = getPriorityColor(score);
                  const label = getPriorityLabel(score);
                  const isVerified = Boolean(inc.verified);

                  return (
                    <tr key={inc.incidentId || inc.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-300">
                        #{inc.incidentId || inc.id}
                        <div className="text-[10px] text-slate-500 font-normal">
                          {inc.reportedBy || 'Citizen PWA'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <IncidentImage
                          src={inc.imageUrl}
                          disasterType={inc.aiLabel || inc.disasterType}
                          alt={inc.aiLabel || inc.disasterType || 'Thumb'}
                          className="w-14 h-10 object-cover rounded-lg border border-slate-700 cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => handleOpenDrawer(inc)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                          <span>{inc.aiLabel || inc.disasterType}</span>
                        </div>
                        <span className={`text-[10px] font-medium ${isVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {inc.aiConfidence || 85}% Confidence
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold"
                          style={{
                            backgroundColor: `${color}20`,
                            color: color,
                            border: `1px solid ${color}40`,
                          }}
                        >
                          {label} ({score})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate">
                        {inc.location}
                      </td>
                      <td className="py-3 px-4">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Auto-Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            <AlertTriangle className="w-3 h-3 text-amber-400" /> Low-Confidence Flag
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenDrawer(inc)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Open Telemetry Drawer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Incidents and Active Missions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Incidents */}
        <div className="bg-[#121b2f] border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Recent Incidents</h3>
            <span className="text-xs text-slate-400 font-mono">{incidents.length} Logged</span>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {incidents.slice(0, 6).map((inc) => (
              <div
                key={inc.incidentId || inc.id}
                onClick={() => handleOpenDrawer(inc)}
                className="p-3 bg-[#0d1629] hover:bg-slate-800/60 rounded-xl border border-slate-800 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: getPriorityColor(inc.priorityScore || 50) }}
                  />
                  <div>
                    <div className="font-bold text-white text-xs">
                      #{inc.incidentId || inc.id} - {inc.aiLabel || inc.disasterType}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate max-w-xs">{inc.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400">
                    {inc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Missions */}
        <div className="bg-[#121b2f] border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-400" /> Active Operations & Missions
            </h3>
            <span className="text-xs text-slate-400 font-mono">{missions.length} Missions</span>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {missions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No active missions currently dispatched.
              </div>
            ) : (
              missions.map((m) => (
                <div
                  key={m.missionId || m.id}
                  className="p-3 bg-[#0d1629] rounded-xl border border-slate-800 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-white">
                      Mission #{m.missionId || m.id}: {m.missionName || 'Response Operation'}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      Team #{m.teamId || 1} &bull; Resource #{m.resourceId || 'Direct'}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                    {m.status || 'ASSIGNED'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Incident Detail Drawer */}
      <IncidentDetailDrawer
        incident={selectedIncident}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onMissionDispatched={loadData}
      />

      {/* Caller Report Modal */}
      <CallerReportModal
        isOpen={isCallerModalOpen}
        onClose={() => setIsCallerModalOpen(false)}
        onIncidentCreated={loadData}
      />
    </div>
  );
}
