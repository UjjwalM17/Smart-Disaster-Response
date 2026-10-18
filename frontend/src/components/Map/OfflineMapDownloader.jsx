import { useState, useEffect } from 'react';
import { CheckCircle2, HardDrive, Map, AlertCircle, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { mapPackageService, INDIA_NATIONAL_PACKAGE } from '../../services/mapPackageService';

export default function OfflineMapDownloader({ isOpen, onClose }) {
  const [nationalMap, setNationalMap] = useState(INDIA_NATIONAL_PACKAGE);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });

  const [successMsg, setSuccessMsg] = useState('');

  const loadStatus = async () => {
    setLoading(true);
    setSuccessMsg('');
    try {
      const data = await mapPackageService.getIndiaMapStatus();
      setNationalMap(data);
    } catch (e) {
      console.error('Error checking India map status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setSuccessMsg('');
    setProgress({ completed: 0, total: 0, percentage: 0 });
    try {
      const updated = await mapPackageService.refreshNationalMap((prog) => {
        setProgress(prog);
      });
      setNationalMap(updated);
      setSuccessMsg('✅ National India map cache successfully verified & refreshed in IndexedDB.');
    } catch (err) {
      alert(`Refresh failed: ${err.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🇮🇳 Preloaded Offline Map of India</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                  Active
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Complete national basemap preloaded into IndexedDB for remote disaster zones.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* National Package Overview */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-white">{nationalMap.name}</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Preloaded Nationwide
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{nationalMap.description}</p>
            </div>

            {isRefreshing ? (
              <div className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-semibold flex items-center gap-1.5 shrink-0">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> {progress.percentage}%
              </div>
            ) : (
              <button
                onClick={handleRefresh}
                className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-xs font-semibold border border-blue-500/30 flex items-center gap-1.5 transition shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Cache
              </button>
            )}
          </div>

          {successMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {isRefreshing && (
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-200"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          )}

          {/* National Geographic Zones Covered */}
          <div className="pt-2 border-t border-slate-700/50 space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-300">National Corridors & Disaster Zones Preloaded:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Indo-Gangetic Basin (Delhi, UP, Bihar)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Brahmaputra Valley & NE Corridors</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Western Ghats & Mumbai Coastal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Himalayan Mountain & Landslide Belts</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-700/40">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3 h-3 text-slate-500" />
              {nationalMap.tileCount} national tiles (~{Math.round(nationalMap.sizeBytes / 1024)} KB stored locally in IndexedDB)
            </span>
            <span className="text-emerald-400 font-medium">Zero Region Switching Required</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/40 text-xs text-blue-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p>
            The offline map is preloaded for the entire country of India. Even when cell towers fail, satellite GPS coordinates and emergency incident pins render on top of the local Indian basemap without an internet connection.
          </p>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
