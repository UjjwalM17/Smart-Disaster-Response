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

  const filtered = incidents.filter((inc) => {
    const matchesSearch =
      (inc.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.aiLabel || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(inc.incidentId || inc.id).includes(searchTerm);

    if (statusFilter === 'VERIFIED') return matchesSearch && inc.verified;
    if (statusFilter === 'PENDING') return matchesSearch && !inc.verified;
    if (statusFilter === 'IN_PROGRESS') return matchesSearch && inc.status === 'IN_PROGRESS';
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-blue-400" /> All Logged Incidents
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete database of emergency occurrences, priority scoring, and telemetry logs.
          </p>
        </div>

        <button
          onClick={loadIncidents}
          className="p-2 self-start rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          title="Refresh Incidents"
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
            placeholder="Search incidents by ID, location, disaster type..."
            className="w-full bg-[#121b2f] text-white text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#121b2f] text-white text-xs px-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Statuses ({incidents.length})</option>
            <option value="VERIFIED">Verified Only</option>
            <option value="PENDING">Pending Verification</option>
            <option value="IN_PROGRESS">Active Operations</option>
          </select>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-[#121b2f] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e1628] text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Photo</th>
                <th className="py-3 px-4">Hazard & Confidence</th>
                <th className="py-3 px-4">Priority Score</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((inc) => {
                const score = inc.priorityScore || 50;
                const color = getPriorityColor(score);
                const label = getPriorityLabel(score);

                return (
                  <tr
                    key={inc.incidentId || inc.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-300">
                      #{inc.incidentId || inc.id}
                    </td>
                    <td className="py-3 px-4">
                      <IncidentImage
                        src={inc.imageUrl}
                        disasterType={inc.aiLabel || inc.disasterType}
                        alt={inc.aiLabel || inc.disasterType || 'Thumbnail'}
                        className="w-12 h-9 object-cover rounded-lg border border-slate-700 cursor-pointer"
                        onClick={() => {
                          setSelectedIncident(inc);
                          setIsDrawerOpen(true);
                        }}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span>{inc.aiLabel || inc.disasterType}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {inc.aiConfidence || 92}% Confidence
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
                      {inc.verified ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1 w-fit">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                      {inc.status}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedIncident(inc);
                          setIsDrawerOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
                        title="Open Details Drawer"
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
