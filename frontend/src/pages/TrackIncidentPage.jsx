import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  ShieldAlert,
  PhoneCall,
  AlertTriangle,
  ArrowRight,
  Truck,
  Users,
} from 'lucide-react';
import CitizenHeader from '../components/Citizen/CitizenHeader';
import { incidentStore } from '../services/incidentStore';

export default function TrackIncidentPage() {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [searchId, setSearchId] = useState(initialId);
  const [incident, setIncident] = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (idToSearch) => {
    const query = (idToSearch || searchId).trim();
    if (!query) return;

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const found = await incidentStore.getIncidentById(query);
      if (found) {
        setIncident(found);
      } else {
        setIncident(null);
        setError(`No incident found with ID #${query}. Please check the number and retry.`);
      }
    } catch (err) {
      setError(`Error searching incident: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      handleSearch(initialId);
    }
  }, [initialId]);

  const timelineStages = [
    { key: 'received', label: 'Received', desc: 'Disaster report registered by system' },
    { key: 'under_verification', label: 'Under Verification', desc: 'AI triage and aerial analysis' },
    { key: 'verified', label: 'Verified', desc: 'Validated by Incident Commander' },
    { key: 'dispatched', label: 'Response Dispatched', desc: 'NDRF team & emergency relief mobilized' },
  ];

  const currentStageIndex = incident?.timeline
    ? incident.timeline.filter((s) => s.done).length - 1
    : 1;

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      <CitizenHeader />

      <main className="flex-1 max-w-2xl mx-auto px-4 py-8 sm:py-12 w-full space-y-6">
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Track Incident Response
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Enter your Incident ID to inspect live verification and team mobilization status.
          </p>
        </div>

        {/* Search Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Incident ID (e.g. 101, 102, 103...)"
              className="w-full bg-[#10182b] text-white text-xs pl-10 pr-4 py-3 rounded-2xl border border-slate-700 focus:outline-none focus:border-blue-500 shadow-xl"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-600/30 transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {/* Error message */}
        {error && (
          <div className="p-4 bg-red-950/80 border border-red-800/80 rounded-2xl text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Incident Result Display */}
        {incident && (
          <div className="bg-[#10182b] border border-blue-900/60 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-blue-400 font-bold">
                  INCIDENT #{incident.incidentId || incident.id}
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  {incident.aiLabel || incident.disasterType} Emergency
                </h2>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  incident.status === 'COMPLETED'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : incident.status === 'IN_PROGRESS'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                    : 'bg-blue-950 text-blue-300 border border-blue-800'
                }`}
              >
                {incident.status === 'IN_PROGRESS' ? 'MISSION ACTIVE' : incident.status}
              </span>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Live Status Progression
              </h3>
              <div className="relative pl-6 space-y-5 border-l-2 border-slate-800 ml-2">
                {timelineStages.map((stage, idx) => {
                  const isPassed = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;

                  return (
                    <div key={stage.key} className="relative">
                      <div
                        className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                          isPassed
                            ? 'bg-blue-600 border-blue-400 text-white shadow-md'
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
                          <span className={`text-xs font-bold ${isCurrent ? 'text-blue-400' : isPassed ? 'text-white' : 'text-slate-500'}`}>
                            {stage.label}
                          </span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              IN PROGRESS
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{stage.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Incident Details Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-800">
              <div className="p-3 bg-[#0d1629] rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" /> Location
                </span>
                <p className="text-white font-medium">{incident.location}</p>
              </div>

              <div className="p-3 bg-[#0d1629] rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-amber-400" /> Impact Assessment
                </span>
                <p className="text-white font-medium">~{incident.peopleAffected || 25} Affected Civilians</p>
              </div>
            </div>

            <div className="p-3 bg-[#0d1629] rounded-xl border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Field Notes</span>
              <p className="text-slate-300 leading-relaxed">{incident.description}</p>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="text-center p-4 rounded-2xl bg-red-950/30 border border-red-900/40 text-xs text-slate-400 space-y-1">
          <p className="font-bold text-red-400 flex items-center justify-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5" /> In immediate danger? Call 112.
          </p>
        </div>
      </main>
    </div>
  );
}
