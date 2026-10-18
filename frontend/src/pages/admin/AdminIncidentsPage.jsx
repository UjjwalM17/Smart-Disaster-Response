import { useState, useEffect } from 'react';
import {
  AlertOctagon,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  History,
  Send,
  Radio,
  Truck,
  CheckCheck,
} from 'lucide-react';
import { incidentStore } from '../../services/incidentStore';
import { getPriorityColor, getPriorityLabel } from '../../components/Map/IncidentMap';
import IncidentDetailDrawer from '../../components/AdminDashboard/IncidentDetailDrawer';
import IncidentImage from '../../components/common/IncidentImage';

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [hazardFilter, setHazardFilter] = useState('ALL');
  const [verificationFilter, setVerificationFilter] = useState('ALL');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const list = await incidentStore.getAllIncidents();
      setIncidents(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  // Compute actions taken for each incident
  const getActionsTaken = (inc) => {
    const actions = [];
    const isAutoVerified = Boolean(inc.verified) && (!inc.aiConfidence || inc.aiConfidence >= 70);
    
    if (isAutoVerified) {
      actions.push({ label: 'AI Auto-Verified', icon: Sparkles, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' });
    } else {
      actions.push({ label: 'Low-Conf Flag', icon: AlertTriangle, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' });
    }

    if (inc.status === 'IN_PROGRESS' || inc.status === 'COMPLETED' || inc.priorityScore >= 70) {
      actions.push({ label: 'Alert Broadcasted', icon: Radio, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' });
    }

    if (inc.status === 'IN_PROGRESS') {
      actions.push({ label: 'Response Dispatched', icon: Truck, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' });
    } else if (inc.status === 'COMPLETED') {
      actions.push({ label: 'Mission Completed', icon: CheckCheck, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' });
    }

    return actions;
  };

  const filtered = incidents.filter((inc) => {
    const term = searchTerm.toLowerCase();
    const dateStr = inc.reportedTime ? String(inc.reportedTime).toLowerCase() : '';
    const locationStr = (inc.location || '').toLowerCase();
    const descStr = (inc.description || '').toLowerCase();
    const hazardStr = (inc.aiLabel || inc.disasterType || '').toLowerCase();
    const idStr = String(inc.incidentId || inc.id || '');
    const severityStr = (inc.severity || '').toLowerCase();

    const matchesSearch =
      locationStr.includes(term) ||
      descStr.includes(term) ||
      hazardStr.includes(term) ||
      idStr.includes(term) ||
      dateStr.includes(term) ||
      severityStr.includes(term);

    if (!matchesSearch) return false;

    if (statusFilter !== 'ALL' && inc.status !== statusFilter) return false;

    if (hazardFilter !== 'ALL' && hazardStr !== hazardFilter.toLowerCase()) return false;

    if (verificationFilter === 'AUTO_VERIFIED' && !inc.verified) return false;
    if (verificationFilter === 'FLAGGED' && inc.verified) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-blue-400" /> Disaster History & Incident Archive
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Searchable historical and real-time records documenting every incident, date, location, imagery, AI analysis, severity, actions taken, and final lifecycle status.
          </p>
        </div>

        <button
          onClick={loadIncidents}
          className="p-2 self-start rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          title="Refresh History"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search disaster records by date (YYYY-MM-DD), location, ID, AI hazard, or actions..."
            className="w-full bg-[#121b2f] text-white text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#121b2f] text-white text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Lifecycle Statuses</option>
              <option value="REPORTED">REPORTED (New)</option>
              <option value="IN_PROGRESS">IN_PROGRESS (Active)</option>
              <option value="COMPLETED">COMPLETED (Resolved)</option>
            </select>
          </div>

          <select
            value={hazardFilter}
            onChange={(e) => setHazardFilter(e.target.value)}
            className="bg-[#121b2f] text-white text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Hazards</option>
            <option value="Flood">Flood</option>
            <option value="Fire">Fire</option>
            <option value="Building Collapse">Building Collapse</option>
            <option value="Landslide">Landslide</option>
            <option value="Cyclone">Cyclone</option>
          </select>

          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="bg-[#121b2f] text-white text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Verification Types</option>
            <option value="AUTO_VERIFIED">AI Auto-Verified (≥70%)</option>
            <option value="FLAGGED">Flagged Low-Conf (&lt;70%)</option>
          </select>
        </div>
      </div>

      {/* Disaster History Table */}
      <div className="bg-[#121b2f] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e1628] text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date & ID</th>
                <th className="py-3 px-4">Evidence</th>
                <th className="py-3 px-4">AI Analysis & Confidence</th>
                <th className="py-3 px-4">Severity & Priority</th>
                <th className="py-3 px-4">Location & Coordinates</th>
                <th className="py-3 px-4">Actions Taken</th>
                <th className="py-3 px-4">Final Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 text-xs">
                    No disaster records found matching search and filters.
                  </td>
                </tr>
              ) : (
                filtered.map((inc) => {
                  const score = inc.priorityScore || 50;
                  const color = getPriorityColor(score);
                  const label = getPriorityLabel(score);
                  const actions = getActionsTaken(inc);
                  const dateDisplay = inc.reportedTime
                    ? String(inc.reportedTime).replace('T', ' ').substring(0, 16)
                    : '2026-10-18';

                  return (
                    <tr
                      key={inc.incidentId || inc.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-white text-[12px]">
                          #{inc.incidentId || inc.id}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{dateDisplay}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <IncidentImage
                          src={inc.imageUrl}
                          disasterType={inc.aiLabel || inc.disasterType}
                          alt={inc.aiLabel || inc.disasterType || 'Thumbnail'}
                          className="w-14 h-10 object-cover rounded-lg border border-slate-700 cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => {
                            setSelectedIncident(inc);
                            setIsDrawerOpen(true);
                          }}
                        />
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                          <span>{inc.aiLabel || inc.disasterType}</span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold ${
                          inc.verified ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {inc.aiConfidence || 85}% Confidence
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold inline-block"
                          style={{
                            backgroundColor: `${color}20`,
                            color: color,
                            border: `1px solid ${color}40`,
                          }}
                        >
                          {inc.severity || label} ({score})
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="text-slate-200 truncate font-medium">{inc.location}</div>
                        {inc.latitude && inc.longitude && (
                          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                            <span>{inc.latitude.toFixed(4)}, {inc.longitude.toFixed(4)}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {actions.map((act, idx) => {
                            const IconComponent = act.icon;
                            return (
                              <span
                                key={idx}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold border flex items-center gap-1 ${act.color}`}
                              >
                                <IconComponent className="w-2.5 h-2.5" />
                                {act.label}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          inc.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : inc.status === 'IN_PROGRESS'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {inc.status || 'REPORTED'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedIncident(inc);
                            setIsDrawerOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Open Full Disaster Record & Telemetry"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Detail Drawer */}
      <IncidentDetailDrawer
        incident={selectedIncident}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onMissionDispatched={loadIncidents}
      />
    </div>
  );
}
