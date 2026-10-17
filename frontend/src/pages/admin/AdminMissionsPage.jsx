import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import MissionDispatchTab from '../../components/MissionDispatchTab';
import { RefreshCw } from 'lucide-react';

export default function AdminMissionsPage() {
  const [missions, setMissions] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, inc, t, r] = await Promise.allSettled([
        api.getMissions(),
        api.getIncidents(),
        api.getRescueTeams(),
        api.getResources(),
      ]);
      if (m.status === 'fulfilled' && Array.isArray(m.value)) setMissions(m.value);
      if (inc.status === 'fulfilled' && Array.isArray(inc.value)) setIncidents(inc.value);
      if (t.status === 'fulfilled' && Array.isArray(t.value)) setTeams(t.value);
      if (r.status === 'fulfilled' && Array.isArray(r.value)) setResources(r.value);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateMission = async (payload) => {
    await api.createMission(payload);
    loadData();
  };

  const handleUpdateStatus = async (id, status) => {
    await api.updateMissionStatus(id, status);
    loadData();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Tactical Mission Dispatch</h1>
          <p className="text-xs text-slate-400">Pair rescue teams and critical resources with verified disaster incidents.</p>
        </div>
        <button
          onClick={loadData}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <MissionDispatchTab
        missions={missions}
        incidents={incidents}
        rescueTeams={teams}
        resources={resources}
        onDispatchMission={handleCreateMission}
        onUpdateMissionStatus={handleUpdateStatus}
      />
    </div>
  );
}
