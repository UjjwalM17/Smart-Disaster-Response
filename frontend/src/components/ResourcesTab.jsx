import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  MapPin, 
  Layers, 
  Trash2, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

export default function ResourcesTab({
  resources = [],
  onAddResource,
  onToggleStatus,
  onDeleteResource,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    resourceName: '',
    resourceType: 'RESCUE_BOAT',
    quantity: 1,
    location: '',
    availabilityStatus: 'AVAILABLE',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setSubmitting(true);
      await onAddResource({ ...formData, quantity: parseInt(formData.quantity, 10) });
      setIsModalOpen(false);
      setFormData({
        resourceName: '',
        resourceType: 'RESCUE_BOAT',
        quantity: 1,
        location: '',
        availabilityStatus: 'AVAILABLE',
      });
    } catch (err) {
      setError(err.message || 'Failed to add resource');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-500" />
            Emergency Resource Inventory
          </h2>
          <p className="text-xs text-slate-400">Track life-saving equipment, medical vehicles, and emergency provisions</p>
        </div>
        <button
          onClick={() => {
            setError('');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/60 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Resource Inventory
        </button>
      </div>

      {resources.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-xl border border-slate-800">
          <Package className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No emergency resources registered yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((res) => {
            const isAvailable = res.availabilityStatus === 'AVAILABLE';
            return (
              <div
                key={res.resourceId}
                className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                      {res.resourceType}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          isAvailable
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                        }`}
                      >
                        {isAvailable ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {res.availabilityStatus}
                      </span>
                      <button
                        onClick={() => onDeleteResource(res.resourceId)}
                        title="Delete Resource"
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{res.resourceName}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      Quantity: <span className="font-semibold text-white">{res.quantity} Units</span>
                    </p>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1 pt-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{res.location}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500">ID: #{res.resourceId}</span>
                  <button
                    onClick={() =>
                      onToggleStatus(res.resourceId, isAvailable ? 'IN_USE' : 'AVAILABLE')
                    }
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isAvailable
                        ? 'bg-slate-800 hover:bg-slate-700 text-red-400 border border-red-500/30'
                        : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60'
                    }`}
                  >
                    Mark as {isAvailable ? 'In Use' : 'Available'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Resource Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-500" />
                Add Emergency Resource
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Resource Name *</label>
                <input
                  type="text"
                  name="resourceName"
                  required
                  value={formData.resourceName}
                  onChange={handleInputChange}
                  placeholder="e.g. Inflatable Rescue Boat Pack"
                  className="w-full p-2 bg-slate-950 text-white rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Resource Type *</label>
                  <select
                    name="resourceType"
                    value={formData.resourceType}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-slate-950 text-white rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value="RESCUE_BOAT">Rescue Boat</option>
                    <option value="AMBULANCE">Ambulance</option>
                    <option value="FOOD_PACK">Food Provisions Pack</option>
                    <option value="MEDICINE">Medical Kit</option>
                    <option value="GENERATOR">Power Generator</option>
                    <option value="HELICOPTER">Evacuation Helicopter</option>
                    <option value="WATER_PURIFIER">Water Purification Unit</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Quantity Available *</label>
                  <input
                    type="number"
                    name="quantity"
                    min={1}
                    required
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-slate-950 text-white rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Storage Depot / Base Location *</label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Central Depot Warehouse"
                  className="w-full p-2 bg-slate-950 text-white rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
