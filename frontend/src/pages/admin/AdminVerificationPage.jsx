import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Eye,
  Sparkles,
  MapPin,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { incidentStore } from '../../services/incidentStore';
import { getPriorityColor, getPriorityLabel } from '../../components/Map/IncidentMap';
import IncidentDetailDrawer from '../../components/AdminDashboard/IncidentDetailDrawer';

export default function AdminVerificationPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Reject modal
  const [rejectItem, setRejectItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('Duplicate or invalid citizen submission');

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

  const handleVerify = async (id) => {
    await incidentStore.verifyIncident(id);
    loadIncidents();
  };

  const handleReject = async () => {
    if (rejectItem) {
      await incidentStore.rejectIncident(rejectItem.incidentId || rejectItem.id, rejectReason);
      setRejectItem(null);
      loadIncidents();
    }
  };

  // Filter pending items
  const pendingIncidents = incidents.filter(
    (i) => !i.verified && i.verificationStatus !== 'REJECTED'
  );

  const filtered = pendingIncidents.filter((inc) => {
    const matchesSearch =
      (inc.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.aiLabel || '').toLowerCase().includes(searchTerm.toLowerCase());

    const score = inc.priorityScore || 50;
    if (filterPriority === 'CRITICAL') return matchesSearch && score >= 75;
    if (filterPriority === 'HIGH') return matchesSearch && score >= 50 && score < 75;
    if (filterPriority === 'MEDIUM') return matchesSearch && score >= 25 && score < 50;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Incident Verification Queue
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
              {pendingIncidents.length} Pending
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Review aerial/citizen photo submissions, confirm AI damage triage, and approve response dispatch.
          </p>
        </div>

        <button
          onClick={loadIncidents}
          className="p-2 self-start rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          title="Refresh Queue"
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
            placeholder="Search pending incidents by location, description, or hazard..."
            className="w-full bg-[#121b2f] text-white text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
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

      {/* Verification Queue Cards Grid */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-[#121b2f] border border-slate-800 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h2 className="text-base font-bold text-white">No Incidents Awaiting Verification</h2>
          <p className="text-xs text-slate-400">All submissions are verified or match current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((inc) => {
            const score = inc.priorityScore || 60;
            const color = getPriorityColor(score);
            const label = getPriorityLabel(score);

            return (
              <div
                key={inc.incidentId || inc.id}
                className="bg-[#121b2f] border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div>
                  {/* Photo Preview */}
                  <div className="relative h-44 bg-slate-900 group">
                    <img
                      src={inc.imageUrl || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80'}
                      alt="Incident proof"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md"
                        style={{
                          backgroundColor: `${color}f0`,
                          color: '#ffffff',
                        }}
                      >
                        {label} ({score})
                      </span>
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
                      <span className="text-[11px] font-semibold text-emerald-400">
                        {inc.aiConfidence || 92}% Confidence
                      </span>
                    </div>

                    <p className="text-slate-300 line-clamp-2 leading-relaxed">
                      {inc.description}
                    </p>

                    <div className="space-y-1 text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                      <div className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="truncate">{inc.location}</span>
                      </div>
                      <div className="text-slate-500 text-[10px]">
                        Reporter: {inc.reporterName || 'Citizen'} ({inc.reportedBy || 'Web'})
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-4 border-t border-slate-800 bg-[#0e1628] flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setSelectedIncident(inc);
                      setIsDrawerOpen(true);
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                    title="View Full Telemetry Drawer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRejectItem(inc)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 text-xs font-semibold border border-slate-700 hover:border-red-700 transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      onClick={() => handleVerify(inc.incidentId || inc.id)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Verify
                    </button>
                  </div>
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

      {/* Reject Modal */}
      {rejectItem && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#10182b] border border-slate-700 rounded-2xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">
              Reject Incident #{rejectItem.incidentId || rejectItem.id}
            </h3>
            <p className="text-xs text-slate-400">
              Provide justification for marking this incident rejected:
            </p>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-[#0d1629] text-white text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-red-500"
            />
            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setRejectItem(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
