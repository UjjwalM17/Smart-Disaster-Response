import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import AlertsTab from '../../components/AlertsTab';
import { RefreshCw } from 'lucide-react';

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [a, m] = await Promise.allSettled([api.getAlerts(), api.getMissions()]);
      if (a.status === 'fulfilled' && Array.isArray(a.value)) setAlerts(a.value);
      if (m.status === 'fulfilled' && Array.isArray(m.value)) setMissions(m.value);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Emergency Broadcasts & Alert Logs</h1>
          <p className="text-xs text-slate-400">Automated SMS, push notification, and siren broadcasts dispatched by microservices.</p>
        </div>
        <button
          onClick={loadData}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <AlertsTab alerts={alerts} missions={missions} />
    </div>
  );
}
