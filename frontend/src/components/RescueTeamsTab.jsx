import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Phone, 
  MapPin, 
  UserCheck, 
  Shield, 
  Trash2, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

export default function RescueTeamsTab({
  teams = [],
  onAddTeam,
  onToggleStatus,
  onDeleteTeam,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    teamName: '',
    teamType: 'NDRF',
    leaderName: '',
    contactNumber: '',
    teamSize: 10,
    currentLocation: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^[0-9]{10}$/.test(formData.contactNumber)) {
      setError('Contact number must be exactly 10 digits.');
      return;
    }

    try {
      setSubmitting(true);
      await onAddTeam({ ...formData, teamSize: parseInt(formData.teamSize, 10) });
      setIsModalOpen(false);
      setFormData({
        teamName: '',
        teamType: 'NDRF',
        leaderName: '',
        contactNumber: '',
        teamSize: 10,
        currentLocation: '',
      });
    } catch (err) {
      setError(err.message || 'Failed to register team');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Rescue Teams Deployment
          </h2>
          <p className="text-xs text-slate-400">Manage specialized tactical response units and their live status</p>
        </div>
        <button
          onClick={() => {
            setError('');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-blue-950/60 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Register Rescue Team
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-xl border border-slate-800">
          <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No rescue teams registered yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => {
            const isAvailable = team.availabilityStatus === 'AVAILABLE';
            return (
              <div
                key={team.teamId}
                className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800/80">
                      {team.teamType}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          isAvailable
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                        }`}
                      >
                        {isAvailable ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {team.availabilityStatus}
                      </span>
                      <button
                        onClick={() => onDeleteTeam(team.teamId)}
                        title="Delete Team"
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{team.teamName}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                      Leader: <span className="text-slate-200">{team.leaderName}</span> ({team.teamSize} personnel)
                    </p>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1 pt-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{team.currentLocation}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="font-mono">{team.contactNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500">ID: #{team.teamId}</span>
                  <button
                    onClick={() =>
                      onToggleStatus(team.teamId, isAvailable ? 'ON_MISSION' : 'AVAILABLE')
                    }
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isAvailable
                        ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60'
                    }`}
                  >
                    Mark as {isAvailable ? 'On Mission' : 'Available'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Register Team Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Register Emergency Rescue Team
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
                <label className="text-slate-300 font-medium">Team Name *</label>
                <input
                  type="text"
                  name="teamName"
                  required
                  value={formData.teamName}
                  onChange={handleInputChange}
                  placeholder="e.g. NDRF Quick Response Alpha"
                  className="w-full p-2 bg-slate-950 text-white rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Team Type *</label>
                  <select
                    name="teamType"
                    value={formData.teamType}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-slate-950 text-white rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value="NDRF">NDRF</option>
                    <option value="FIRE">Fire & Rescue</option>
                    <option value="MEDICAL">Medical Emergency</option>
                    <option value="POLICE">Police Tactical</option>
                    <option value="VOLUNTEER">Civil Volunteer</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Team Size (Personnel) *</label>
                  <input
                    type="number"
                    name="teamSize"
                    min={1}
                    required
                    value={formData.teamSize}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-slate-950 text-white rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Team Leader Name *</label>
                  <input
                    type="text"
                    name="leaderName"
                    required
                    value={formData.leaderName}
                    onChange={handleInputChange}
                    placeholder="e.g. Commander Rajesh"
                    className="w-full p-2 bg-slate-950 text-white rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Leader Contact (10 digits) *</label>
                  <input
                    type="text"
                    name="contactNumber"
                    required
                    maxLength={10}
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. 9811223344"
                    className="w-full p-2 bg-slate-950 text-white rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Current Staging Base / Location *</label>
                <input
                  type="text"
                  name="currentLocation"
                  required
                  value={formData.currentLocation}
                  onChange={handleInputChange}
                  placeholder="e.g. Riverside Station 4"
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
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Register Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
