import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import RescueTeamsTab from '../../components/RescueTeamsTab';
import { RefreshCw } from 'lucide-react';

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const data = await api.getRescueTeams();
      setTeams(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Error loading rescue teams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleAddTeam = async (payload) => {
    await api.createRescueTeam(payload);
    loadTeams();
  };

  const handleToggleStatus = async (id, newStatus) => {
    await api.updateTeamStatus(id, newStatus);
    loadTeams();
  };

  const handleDeleteTeam = async (id) => {
    await api.deleteRescueTeam(id);
    loadTeams();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Rescue Teams Registry</h1>
          <p className="text-xs text-slate-400">Manage NDRF, quick response strike teams, medical corps, and air rescue units.</p>
        </div>
        <button
          onClick={loadTeams}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <RescueTeamsTab
        rescueTeams={teams}
        onAddTeam={handleAddTeam}
        onToggleStatus={handleToggleStatus}
        onDeleteTeam={handleDeleteTeam}
      />
    </div>
  );
}
