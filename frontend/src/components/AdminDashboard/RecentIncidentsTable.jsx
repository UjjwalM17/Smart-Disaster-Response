import React from 'react';
import { ArrowUpRight, Flame, ShieldAlert, Sparkles } from 'lucide-react';

export default function RecentIncidentsTable({ incidents = [], onViewAll }) {
  // Demo images for disaster categories
  const sampleIncidents = [
    {
      id: '#INC-001',
      image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=150&q=80',
      category: 'Flood',
      location: 'Riverside area, several houses submerged',
      priority: 'Critical',
      status: 'Verified',
      time: '2 hours ago',
    },
    {
      id: '#INC-002',
      image: 'https://images.unsplash.com/photo-1599818816945-81643c16223d?auto=format&fit=crop&w=150&q=80',
      category: 'Fire',
      location: 'Industrial warehouse fire',
      priority: 'High',
      status: 'Pending',
      time: '3 hours ago',
    },
    {
      id: '#INC-003',
      image: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=150&q=80',
      category: 'Building Collapse',
      location: 'Residential building partial collapse',
      priority: 'High',
      status: 'Verified',
      time: '5 hours ago',
    },
    {
      id: '#INC-004',
      image: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=150&q=80',
      category: 'Flood',
      location: 'Main road water logging',
      priority: 'Medium',
      status: 'Pending',
      time: '6 hours ago',
    },
    {
      id: '#INC-005',
      image: 'https://images.unsplash.com/photo-1599818816945-81643c16223d?auto=format&fit=crop&w=150&q=80',
      category: 'Fire',
      location: 'Forest area fire',
      priority: 'Medium',
      status: 'Verified',
      time: '8 hours ago',
    },
  ];

  // Merge live incidents if available
  const displayList = incidents.length > 0 ? incidents : sampleIncidents;

  return (
    <div className="bg-[#121b2f] border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-white">Recent Incidents</h3>
          </div>
          <button
            onClick={onViewAll}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            View All <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800/60">
                <th className="pb-2.5">ID</th>
                <th className="pb-2.5">Image</th>
                <th className="pb-2.5">Category</th>
                <th className="pb-2.5">Location/Description</th>
                <th className="pb-2.5">Priority</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {displayList.slice(0, 5).map((row, idx) => (
                <tr key={idx} className="hover:bg-[#131d33] transition-colors group">
                  <td className="py-2.5 font-mono text-[11px] text-slate-400">{row.id || `#INC-${row.incidentId}`}</td>
                  <td className="py-2.5">
                    <img
                      src={row.image || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=100&q=80'}
                      alt="thumbnail"
                      className="w-10 h-8 rounded-lg object-cover border border-slate-700/60"
                    />
                  </td>
                  <td className="py-2.5 font-medium text-slate-200">{row.category || row.disasterType}</td>
                  <td className="py-2.5 text-slate-400 text-[11px] max-w-[160px] truncate">
                    {row.location || row.description}
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        (row.priority || row.severity) === 'Critical' || (row.priority || row.severity) === 'HIGH'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : (row.priority || row.severity) === 'High'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {row.priority || row.severity}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        row.status === 'Verified' || row.status === 'REPORTED'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                          : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-[10px] text-slate-500 whitespace-nowrap">
                    {row.time || (row.reportedTime ? new Date(row.reportedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
