import { useState, useEffect } from 'react';
import { Download, Trash2, CheckCircle2, HardDrive, Map, AlertCircle, RefreshCw, X } from 'lucide-react';
import { mapPackageService } from '../../services/mapPackageService';

export default function OfflineMapDownloader({ isOpen, onClose }) {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });

  const loadRegions = async () => {
    setLoading(true);
    try {
      const data = await mapPackageService.getRegionsWithStatus();
      setRegions(data);
    } catch (e) {
      console.error('Error loading regions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRegions();
    }
  }, [isOpen]);

  const handleDownload = async (regionId) => {
    setDownloadingId(regionId);
    setProgress({ completed: 0, total: 0, percentage: 0 });
    try {
      await mapPackageService.downloadRegion(regionId, (prog) => {
        setProgress(prog);
      });
      await loadRegions();
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (regionId) => {
    if (!window.confirm('Delete this offline map package from local storage?')) return;
    try {
      await mapPackageService.removeRegion(regionId);
      await loadRegions();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Preload Offline Regional Maps</h2>
              <p className="text-xs text-slate-400">
                Cache map packages into IndexedDB for remote areas with zero cell connectivity.
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

        {/* Regional Packages List */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-400" />
              Scanning local tile storage...
            </div>
          ) : (
            regions.map((reg) => (
              <div
                key={reg.regionId}
                className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-white">{reg.name}</h3>
                      {reg.isDownloaded && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Cached Locally
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{reg.description}</p>
                  </div>

                  {reg.isDownloaded ? (
                    <button
                      onClick={() => handleDelete(reg.regionId)}
                      className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/20 flex items-center gap-1 transition shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  ) : downloadingId === reg.regionId ? (
                    <div className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-semibold flex items-center gap-1.5 shrink-0">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> {progress.percentage}%
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDownload(reg.regionId)}
                      disabled={downloadingId !== null}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition shrink-0 shadow"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  )}
                </div>

                {downloadingId === reg.regionId && (
                  <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all duration-200"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/40">
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-slate-500" />
                    {reg.isDownloaded
                      ? `${reg.tileCount} tiles (${Math.round((reg.sizeBytes || 0) / 1024)} KB)`
                      : '~40 tiles (~2.2 MB estimated)'}
                  </span>
                  <span>Landmarks: {reg.landmarks.slice(0, 2).join(', ')}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-xs text-blue-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p>
            Offline map data works strictly within downloaded regional boundaries. When offline, GPS position and incident pins will render on top of the cached vector/raster tiles without internet.
          </p>
        </div>

        <div className="flex justify-end pt-2">
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
