import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  ShieldAlert,
  MapPin,
  ArrowRight,
  PhoneCall,
  Search,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import CitizenHeader from '../components/Citizen/CitizenHeader';
import { incidentStore } from '../services/incidentStore';

export default function ReportSuccessPage() {
  const { id } = useParams();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      incidentStore.getIncidentById(id).then((data) => {
        setIncident(data);
        setLoading(false);
      });
    }
  }, [id]);

  // Default timeline stages
  const timelineStages = [
    { key: 'received', label: 'Received', desc: 'Broadcasted to Command Center' },
    { key: 'under_verification', label: 'Under Verification', desc: 'AI damage scoring & satellite review' },
    { key: 'verified', label: 'Verified', desc: 'Validated by Incident Commander' },
    { key: 'dispatched', label: 'Response Dispatched', desc: 'NDRF Quick Response Team en-route' },
  ];

  const currentStageIndex = incident?.timeline
    ? incident.timeline.filter((s) => s.done).length - 1
    : 1;

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      <CitizenHeader />

      <main className="flex-1 max-w-2xl mx-auto px-4 py-8 sm:py-12 w-full space-y-8">
        {/* Success Card */}
        <div className="bg-[#10182b] border border-blue-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            {incident?.syncStatus === 'SAVED_OFFLINE' ? (
              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Saved Locally (Offline Queue)
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  Report ID: {incident?.clientIncidentId || id}
                </h1>
                <div className="p-3 bg-amber-950/60 border border-amber-700/50 rounded-xl text-amber-300 text-xs text-left space-y-1">
                  <p className="font-bold">⚠️ Has NOT yet reached Emergency Command Center</p>
                  <p>
                    This report and your photos are safely encrypted in your browser's IndexedDB. The ResQ store-and-forward engine will automatically transmit this report once internet or radio mesh connectivity returns.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider inline-block">
                  Transmitted to Operations Center
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  Incident ID #{incident?.incidentId || id}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                  Your disaster report has been logged in PostgreSQL and dispatched to the real-time AI triage engine.
                </p>
              </div>
            )}
          </div>

          {/* Status Timeline */}
          <div className="pt-4 pb-2 border-t border-b border-slate-800 text-left">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-5 flex items-center justify-between">
              <span>Emergency Response Status Timeline</span>
              <span className="text-blue-400 font-mono text-[11px] normal-case">Stage {currentStageIndex + 1} of 4</span>
            </h2>

            <div className="relative pl-6 space-y-6 border-l-2 border-slate-800 ml-3">
              {timelineStages.map((stage, idx) => {
                const isPassed = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div key={stage.key} className="relative group">
                    {/* Step Marker */}
                    <div
                      className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                        isPassed
                          ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-slate-900 border-slate-700 text-slate-500'
                      }`}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <span className="text-[10px] font-bold">{idx + 1}</span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-bold ${isCurrent ? 'text-blue-400' : isPassed ? 'text-white' : 'text-slate-500'}`}>
                          {stage.label}
                        </h3>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{stage.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Incident Meta Summary */}
          {incident && (
            <div className="p-4 bg-[#0d1629] border border-slate-800 rounded-2xl text-xs text-left space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" /> Location:
                </span>
                <span className="font-semibold text-white truncate max-w-[200px]">{incident.location}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Classification:
                </span>
                <span className="font-semibold text-emerald-400">{incident.aiLabel || incident.disasterType} ({incident.aiConfidence || 92}%)</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Logged At:
                </span>
                <span className="text-slate-300 font-mono">
                  {new Date(incident.reportedTime || Date.now()).toLocaleTimeString()}
                </span>
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {incident?.syncStatus === 'SAVED_OFFLINE' && (
              <button
                type="button"
                onClick={async () => {
                  const { syncEngine } = await import('../services/syncEngine');
                  const res = await syncEngine.manualSync();
                  if (res.syncedCount > 0) {
                    alert('Successfully synchronized report to emergency server!');
                    const updated = await incidentStore.getIncidentById(id);
                    setIncident(updated);
                  } else {
                    alert('Device appears offline or server unreachable. Report will remain queued in IndexedDB.');
                  }
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Sync Now</span>
              </button>
            )}
            <Link
              to={`/track?id=${id}`}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track Live Status</span>
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1 transition-colors border border-slate-700"
            >
              <span>Return Home</span>
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center p-4 rounded-2xl bg-red-950/30 border border-red-900/40 text-xs text-slate-400 space-y-1">
          <p className="font-bold text-red-400 flex items-center justify-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5" /> In immediate danger? Call 112.
          </p>
          <p className="text-[11px]">
            Keep this Incident ID handy when speaking with emergency coordinators.
          </p>
        </div>
      </main>
    </div>
  );
}
