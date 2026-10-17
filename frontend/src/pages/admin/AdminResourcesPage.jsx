import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import ResourcesTab from '../../components/ResourcesTab';
import { RefreshCw } from 'lucide-react';

export default function AdminResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadResources = async () => {
    setLoading(true);
    try {
      const data = await api.getResources();
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Error loading resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleAdd = async (payload) => {
    await api.createResource(payload);
    loadResources();
  };

  const handleToggleStatus = async (id, newStatus) => {
    await api.updateResourceStatus(id, newStatus);
    loadResources();
  };

  const handleDelete = async (id) => {
    await api.deleteResource(id);
    loadResources();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Emergency Resources Inventory</h1>
          <p className="text-xs text-slate-400">Track and allocate rescue boats, ambulances, food rations, and medical kits.</p>
        </div>
        <button
          onClick={loadResources}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <ResourcesTab
        resources={resources}
        onAddResource={handleAdd}
        onToggleStatus={handleToggleStatus}
        onDeleteResource={handleDelete}
      />
    </div>
  );
}
