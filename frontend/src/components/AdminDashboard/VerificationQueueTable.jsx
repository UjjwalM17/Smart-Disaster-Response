import React from 'react';
import { ArrowUpRight, Sparkles, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';
import { getDisasterImage } from '../../utils/disasterAssets';
import IncidentImage from '../common/IncidentImage';

export default function VerificationQueueTable({ incidents = [], onViewAll, onSelectIncident }) {
  // Map incidents for the AI Triage telemetry feed
  const feedItems = (incidents || []).slice(0, 5).map((inc) => {
    const isAutoVerified = Boolean(inc.verified) && (!inc.aiConfidence || inc.aiConfidence >= 70);
    return {
      id: `#INC-${String(inc.incidentId || inc.id).padStart(3, '0')}`,
      rawId: inc.incidentId || inc.id,
      rawIncident: inc,
      image: inc.imageUrl || getDisasterImage(inc.disasterType || 'Flood'),
      assessment: `${inc.disasterType || inc.aiLabel || 'Flood'} (${inc.severity || 'HIGH'})`,
      confidence: `Confidence: ${inc.aiConfidence || 85}%`,
      priorityScore: inc.priorityScore || 70,
      isAutoVerified,
    };
  });

  return (
    <div className="bg-[#121b2f] border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-white">AI Autonomous Triage Feed</h3>
          </div>
          <button
            onClick={onViewAll}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            Full Monitor <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {feedItems.length === 0 ? (
          <p className="text-xs text-slate-500 py-10 text-center">
            No incidents reported yet.
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
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {feedItems.map((row) => (
                  <tr key={row.id} className="hover:bg-[#131d33] transition-colors group">
                    <td className="py-2.5 font-mono text-[11px] text-slate-400">{row.id}</td>
                    <td className="py-2.5">
                      <IncidentImage
                        src={row.image}
                        disasterType={row.assessment}
                        alt="feed item"
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
                    <td className="py-2.5">
                      {row.isAutoVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> Auto-Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400">
                          <AlertTriangle className="w-3 h-3" /> Flagged Low-Conf
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => onSelectIncident && onSelectIncident(row.rawIncident)}
                        className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="View Telemetry"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
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
