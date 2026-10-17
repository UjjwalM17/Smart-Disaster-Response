import React, { useState } from 'react';
import { 
  Flame, 
  Plus, 
  MapPin, 
  Phone, 
  User, 
  AlertCircle, 
  Search, 
  X, 
  Trash2, 
  Calendar 
} from 'lucide-react';

export default function IncidentsTab({ incidents = [], onAddIncident, onDeleteIncident }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    reporterName: '',
    mobile: '',
    location: '',
    disasterType: 'FLOOD',
    severity: 'HIGH',
    description: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.mobile)) {
      setError('Mobile number must be a valid 10-digit Indian phone number starting with 6, 7, 8, or 9.');
      return;
    }

    try {
      setSubmitting(true);
      await onAddIncident(formData);
      setIsModalOpen(false);
      setFormData({
        reporterName: '',
        mobile: '',
        location: '',
        disasterType: 'FLOOD',
        severity: 'HIGH',
        description: '',
      });
    } catch (err) {
      setError(err.message || 'Failed to report incident');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      (inc.location && inc.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inc.disasterType && inc.disasterType.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inc.reporterName && inc.reporterName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSeverity = filterSeverity === 'ALL' || inc.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500" />
            Disaster Incidents Management
          </h2>
          <p className="text-xs text-slate-400">Track and report active natural and human-made disasters</p>
        </div>
        <button
          onClick={() => {
            setError('');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-red-950/60 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Report Disaster Incident
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by location, disaster type, reporter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-950 text-white rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Severity:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-950 text-white rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Severities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Incidents Grid */}
      {filteredIncidents.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-xl border border-slate-800">
          <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No disaster incidents match your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIncidents.map((inc) => (
            <div
              key={inc.incidentId}
              className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800/80">
                    {inc.disasterType}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        inc.severity === 'HIGH'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : inc.severity === 'MEDIUM'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {inc.severity}
                    </span>
                    <button
                      onClick={() => onDeleteIncident(inc.incidentId)}
                      title="Delete Incident"
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    {inc.location}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{inc.description}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" />
                    {inc.reporterName}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-slate-500">
                    <Phone className="w-3 h-3" />
                    {inc.mobile}
                  </span>
                </div>
                {inc.reportedTime && (
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(inc.reportedTime).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-amber-400/90">{inc.status || 'REPORTED'}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Incident Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500" />
                Report Disaster Incident
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Reporter Name *</label>
                  <input
                    type="text"
                    name="reporterName"
                    required
                    value={formData.reporterName}
                    onChange={handleInputChange}
                    placeholder="e.g. Commander Sharma"
                    className="w-full p-2 bg-slate-950 text-white rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Contact Mobile * (10 digits)</label>
                  <input
                    type="text"
                    name="mobile"
                    required
                    maxLength={10}
                    value={formData.mobile}
                    onChange={handleInputChange}
                    placeholder="e.g. 9876543210"
                    className="w-full p-2 bg-slate-950 text-white rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Incident Location *</label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Riverside Sector 12 Flood Plain"
                  className="w-full p-2 bg-slate-950 text-white rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Disaster Type *</label>
                  <select
                    name="disasterType"
                    value={formData.disasterType}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-slate-950 text-white rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value="FLOOD">Flood</option>
                    <option value="EARTHQUAKE">Earthquake</option>
                    <option value="FIRE">Fire</option>
                    <option value="LANDSLIDE">Landslide</option>
                    <option value="CYCLONE">Cyclone</option>
                    <option value="BUILDING_COLLAPSE">Building Collapse</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Severity Level *</label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-slate-950 text-white rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value="HIGH">High (Immediate Risk)</option>
                    <option value="MEDIUM">Medium (Escalating)</option>
                    <option value="LOW">Low (Monitored)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Incident Description *</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide urgent details on casualties, road access, rising water levels..."
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
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Dispatch Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
