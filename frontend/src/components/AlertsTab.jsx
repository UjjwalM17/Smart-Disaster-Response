import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Calendar 
} from 'lucide-react';

export default function AlertsTab({ alerts = [], selectedMissionFilter, onClearFilter }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const filteredAlerts = alerts.filter((alert) => {
    const matchesMission =
      !selectedMissionFilter || alert.missionId === selectedMissionFilter;
    const matchesSearch =
      (alert.message && alert.message.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (alert.alertType && alert.alertType.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSeverity = filterSeverity === 'ALL' || alert.severity === filterSeverity;
    return matchesMission && matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-500" />
            Emergency Alerts & Broadcasts
          </h2>
          <p className="text-xs text-slate-400">
            Real-time feed of multi-channel emergency broadcast notifications
          </p>
        </div>

        {selectedMissionFilter && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
            <span>Filtered for Mission #{selectedMissionFilter}</span>
            <button
              onClick={onClearFilter}
              className="ml-1 text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search alerts by message or broadcast channel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-950 text-white rounded-lg border border-slate-800 focus:outline-none focus:border-purple-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Severity:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-950 text-white rounded-lg border border-slate-800 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Severities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Alerts Grid */}
      {filteredAlerts.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-xl border border-slate-800">
          <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No emergency alerts match the current filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.alertId}
              className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800/80 flex items-center justify-center text-purple-300">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Alert #{alert.alertId}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-950 text-purple-300 border border-purple-800/60">
                        {alert.alertType}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Target Mission: #{alert.missionId}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 mt-1 font-medium">{alert.message}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      alert.severity === 'HIGH'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : alert.severity === 'MEDIUM'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {alert.severity}
                  </span>
                  <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-500">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{alert.status || 'PENDING'}</span>
                  </div>
                </div>
              </div>

              {alert.createdTime && (
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(alert.createdTime).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
