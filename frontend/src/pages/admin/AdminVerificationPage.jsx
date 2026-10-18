import { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Eye,
  MapPin,
  RefreshCw,
  Search,
  Filter,
  Layers,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { incidentStore } from '../../services/incidentStore';
import { getPriorityColor, getPriorityLabel } from '../../components/Map/IncidentMap';
import IncidentDetailDrawer from '../../components/AdminDashboard/IncidentDetailDrawer';
import IncidentImage from '../../components/common/IncidentImage';

export default function AdminVerificationPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filterType, setFilterType] = useState('ALL'); // ALL, FLAGGED, AUTO_VERIFIED, DUPLICATES
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

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

  const autoVerifiedCount = incidents.filter((i) => i.verified).length;
  const flaggedCount = incidents.filter((i) => !i.verified || (i.aiConfidence && i.aiConfidence < 70)).length;
  const duplicateCount = incidents.filter((i) => i.duplicateGroupId).length;

  const filtered = incidents.filter((inc) => {
    const matchesSearch =
      (inc.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.aiLabel || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(inc.incidentId || inc.id || '').includes(searchTerm);

    if (!matchesSearch) return false;

    // Filter by autonomous verification state
    if (filterType === 'FLAGGED' && (inc.verified && (!inc.aiConfidence || inc.aiConfidence >= 70))) {
      return false;
    }
    if (filterType === 'AUTO_VERIFIED' && (!inc.verified || (inc.aiConfidence && inc.aiConfidence < 70))) {
      return false;
    }
    if (filterType === 'DUPLICATES' && !inc.duplicateGroupId) {
      return false;
    }

    // Filter by priority score
    const score = inc.priorityScore || 50;
    if (filterPriority === 'CRITICAL') return score >= 75;
    if (filterPriority === 'HIGH') return score >= 50 && score < 75;
    if (filterPriority === 'MEDIUM') return score >= 25 && score < 50;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              AI Triage & Exception Monitor
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous verification telemetry. Routine reports are verified automatically (≥70% confidence) while uncertain predictions and duplicates are flagged for oversight.
          </p>
        </div>

        <button
          onClick={loadIncidents}
          className="p-2 self-start rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          title="Refresh Triage Feeds"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Autonomous Triage Metric Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <button
          onClick={() => setFilterType('AUTO_VERIFIED')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filterType === 'AUTO_VERIFIED'
              ? 'bg-emerald-950/60 border-emerald-500/80 shadow-lg shadow-emerald-950/40'
              : 'bg-[#121b2f] border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Auto-Verified (≥70%)
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30">
              Active
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white mt-1.5">{autoVerifiedCount}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Automated verification passed & status updated</p>
        </button>

        <button
          onClick={() => setFilterType('FLAGGED')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filterType === 'FLAGGED'
              ? 'bg-amber-950/60 border-amber-500/80 shadow-lg shadow-amber-950/40'
              : 'bg-[#121b2f] border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Flagged Low-Conf (&lt;70%)
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30">
              Exceptions
            </span>
          </div>
          <div className="text-2xl font-extrabold text-amber-300 mt-1.5">{flaggedCount}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Low-confidence predictions held for operator review</p>
        </button>

        <button
          onClick={() => setFilterType('DUPLICATES')}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filterType === 'DUPLICATES'
              ? 'bg-blue-950/60 border-blue-500/80 shadow-lg shadow-blue-950/40'
              : 'bg-[#121b2f] border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-400" /> Duplicate Clusters
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/30">
              De-duplicated
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white mt-1.5">{duplicateCount}</div>
          <p className="text-[10px] text-slate-400 mt-0.5">Clustered within 500m & 3h to avoid double-counting</p>
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
            placeholder="Search telemetry by location, description, ID, or hazard..."
            className="w-full bg-[#121b2f] text-white text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#121b2f] text-white text-xs px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All AI Triage Records</option>
            <option value="AUTO_VERIFIED">Auto-Verified Only (≥70%)</option>
            <option value="FLAGGED">Flagged Low-Confidence (&lt;70%)</option>
            <option value="DUPLICATES">Duplicate Clusters</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-[#121b2f] text-white text-xs px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical Priority (75+)</option>
            <option value="HIGH">High Priority (50-74)</option>
            <option value="MEDIUM">Medium Priority (25-49)</option>
          </select>
        </div>
      </div>

      {/* AI Triage Cards Grid */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-[#121b2f] border border-slate-800 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h2 className="text-base font-bold text-white">No Matching Incidents in Triage Feed</h2>
          <p className="text-xs text-slate-400">All submissions are processed or match current filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((inc) => {
            const score = inc.priorityScore || 60;
            const color = getPriorityColor(score);
            const label = getPriorityLabel(score);
            const isVerified = Boolean(inc.verified) && (!inc.aiConfidence || inc.aiConfidence >= 70);

            return (
              <div
                key={inc.incidentId || inc.id}
                className="bg-[#121b2f] border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div>
                  {/* Photo Preview (Clickable to open drawer) */}
                  <div
                    onClick={() => {
                      setSelectedIncident(inc);
                      setIsDrawerOpen(true);
                    }}
                    className="relative h-44 bg-slate-900 group cursor-pointer overflow-hidden"
                  >
                    <IncidentImage
                      src={inc.imageUrl}
                      disasterType={inc.aiLabel || inc.disasterType}
                      alt={inc.aiLabel || inc.disasterType || 'Incident proof'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md"
                        style={{
                          backgroundColor: `${color}f0`,
                          color: '#ffffff',
                        }}
                      >
                        {label} ({score})
                      </span>

                      {inc.duplicateGroupId && (
                        <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-600/90 text-white shadow-md">
                          Cluster: {inc.duplicateGroupId}
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono">
                      #{inc.incidentId || inc.id}
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span>{inc.aiLabel || inc.disasterType}</span>
                      </div>
                      <span className={`text-[11px] font-bold ${isVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {inc.aiConfidence || 85}% Confidence
                      </span>
                    </div>

                    {/* Autonomous Verification Status Pill */}
                    <div className="pt-0.5">
                      {isVerified ? (
                        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>AI Auto-Verified: Dispatched to active pipeline</span>
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Flagged: Low confidence (&lt;70%) — requires field confirmation</span>
                        </div>
                      )}
                    </div>

                    <p className="text-slate-300 line-clamp-2 leading-relaxed">
                      {inc.description}
                    </p>

                    <div className="space-y-1 text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                      <div className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="truncate">{inc.location}</span>
                      </div>
                      <div className="text-slate-500 text-[10px] flex items-center justify-between">
                        <span>Reporter: {inc.reporterName || 'Citizen PWA'}</span>
                        <span className="font-mono">{inc.reportedTime ? String(inc.reportedTime).substring(0, 16) : 'Just now'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action: View Telemetry (No manual approve/reject) */}
                <div className="p-4 border-t border-slate-800 bg-[#0e1628] flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Auto-Processed</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIncident(inc);
                      setIsDrawerOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white text-xs font-bold border border-blue-500/40 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-400" /> Inspect Telemetry
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
