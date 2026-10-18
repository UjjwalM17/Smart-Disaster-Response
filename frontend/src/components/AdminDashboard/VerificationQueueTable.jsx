import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle, Check, X } from 'lucide-react';
import { getDisasterImage } from '../../utils/disasterAssets';
import IncidentImage from '../common/IncidentImage';

export default function VerificationQueueTable({ onViewAll, onVerify, onReject }) {
  const [queue, setQueue] = useState([
    {
      id: '#INC-006',
      image: getDisasterImage('Flood'),
      assessment: 'Flood (Severe)',
      confidence: 'Confidence: 90%',
      priorityScore: 87,
    },
    {
      id: '#INC-007',
      image: getDisasterImage('Fire'),
      assessment: 'Fire (High)',
      confidence: 'Confidence: 85%',
      priorityScore: 76,
    },
    {
      id: '#INC-008',
      image: getDisasterImage('Building Collapse'),
      assessment: 'Building Collapse (Moderate)',
      confidence: 'Confidence: 78%',
      priorityScore: 68,
    },
    {
      id: '#INC-009',
      image: getDisasterImage('Flood'),
      assessment: 'Flood (Moderate)',
      confidence: 'Confidence: 80%',
      priorityScore: 62,
    },
    {
      id: '#INC-010',
      image: getDisasterImage('Fire'),
      assessment: 'Fire (High)',
      confidence: 'Confidence: 82%',
      priorityScore: 71,
    },
  ]);

  const handleVerifyItem = (id) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
    if (onVerify) onVerify(id);
  };

  const handleRejectItem = (id) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
    if (onReject) onReject(id);
  };

  return (
    <div className="bg-[#121b2f] border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-white">Verification Queue</h3>
          </div>
          <button
            onClick={onViewAll}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            View All <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {queue.length === 0 ? (
          <p className="text-xs text-slate-500 py-10 text-center">
            All pending incidents verified! Queue is clear.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800/60">
                  <th className="pb-2.5">ID</th>
                  <th className="pb-2.5">Image</th>
                  <th className="pb-2.5">AI Assessment</th>
                  <th className="pb-2.5">Priority</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {queue.map((row) => (
                  <tr key={row.id} className="hover:bg-[#131d33] transition-colors group">
                    <td className="py-2.5 font-mono text-[11px] text-slate-400">{row.id}</td>
                    <td className="py-2.5">
                      <IncidentImage
                        src={row.image}
                        disasterType={row.assessment}
                        alt="queue item"
                        className="w-10 h-8 rounded-lg object-cover border border-slate-700/60"
                      />
                    </td>
                    <td className="py-2.5">
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-200 text-[11px]">{row.assessment}</p>
                        <p className="text-[10px] text-slate-400">{row.confidence}</p>
                      </div>
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[11px] font-bold ${
                          row.priorityScore >= 80
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : row.priorityScore >= 70
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {row.priorityScore}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleVerifyItem(row.id)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-[10px] font-bold transition-all shadow-sm"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => handleRejectItem(row.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-red-950/80 text-slate-400 hover:text-red-400 border border-slate-700/60 hover:border-red-800/80 text-[10px] font-bold transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
