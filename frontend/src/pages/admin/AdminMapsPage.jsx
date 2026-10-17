import { useState, useEffect } from 'react';
import { MapPin, RefreshCw, Layers, ShieldAlert, Sparkles } from 'lucide-react';
import IncidentMap from '../../components/Map/IncidentMap';
import IncidentDetailDrawer from '../../components/AdminDashboard/IncidentDetailDrawer';
import { incidentStore } from '../../services/incidentStore';

export default function AdminMapsPage() {
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const handleSelectIncident = (inc) => {
    setSelectedIncident(inc);
    setIsDrawerOpen(true);
  };

  const validIncidents = incidents.filter((i) => i.latitude && i.longitude);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-400" /> Full Tactical Operations Map
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time geospatial tracking of disaster hotspots, triage levels, and deployed resources.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono">
            {validIncidents.length} Geocoded Hotspots Active
          </span>
          <button
            onClick={loadIncidents}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Refresh GPS Feeds"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Full Map Canvas */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
        <IncidentMap
          incidents={incidents}
          onSelectIncident={handleSelectIncident}
          height="75vh"
        />
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
