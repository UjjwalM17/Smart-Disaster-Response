import { useState } from 'react';
import { X, PhoneCall, UploadCloud, MapPin, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import LocationPickerMap from '../Map/LocationPickerMap';
import { analyzeIncident } from '../../lib/ai';
import { incidentStore } from '../../services/incidentStore';

export default function CallerReportModal({ isOpen, onClose, onIncidentCreated }) {
  const [description, setDescription] = useState('');
  const [peopleAffected, setPeopleAffected] = useState('25');
  const [notes, setNotes] = useState('Caller reports urgent water ingress');
  const [contactPhone, setContactPhone] = useState('9876543210');
  const [callerName, setCallerName] = useState('Emergency Caller');
  const [location, setLocation] = useState('Central District, New Delhi');
  const [latitude, setLatitude] = useState(28.6139);
  const [longitude, setLongitude] = useState(77.2090);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80');

  const [step, setStep] = useState('form'); // 'form' | 'submitting' | 'done'
  const [stepText, setStepText] = useState('');
  const [createdIncident, setCreatedIncident] = useState(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please enter a description from the caller.');
      return;
    }

    setStep('submitting');
    setStepText('Uploading & parsing dispatch telemetry...');

    // 1. AI analysis (multipart analyze -> HF -> keyword mock)
    setStepText('Running AI hazard & damage analysis...');
    const aiResult = await analyzeIncident(imageFile, description, notes, peopleAffected);

    // 2. Create Incident with reportedBy: 'Command Dispatch (Caller)'
    setStepText('Registering incident with Command Center...');
    const newInc = await incidentStore.createIncident({
      reporterName: `${callerName} (via Dispatch)`,
      contactPhone,
      location,
      latitude,
      longitude,
      description,
      notes,
      peopleAffected,
      imageUrl: imagePreview,
      aiLabel: aiResult.aiLabel,
      aiConfidence: aiResult.aiConfidence,
      priorityScore: aiResult.priorityScore,
      reportedBy: 'Command Dispatch (Caller)',
    });

    setCreatedIncident(newInc);
    setStep('done');
    if (onIncidentCreated) onIncidentCreated(newInc);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0e172a] border border-blue-900/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-[#121d36] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  DISPATCH OPERATOR MODE
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                Report Incident on Behalf of Caller
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {step === 'submitting' && (
            <div className="py-16 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin"></div>
              <p className="text-sm font-semibold text-white">{stepText}</p>
              <p className="text-xs text-slate-400">Broadcasting dispatch telemetry...</p>
            </div>
          )}

          {step === 'done' && createdIncident && (
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Incident Successfully Logged</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Incident ID: <strong className="text-blue-400">#{createdIncident.incidentId}</strong> — Tagged as <em>Command Dispatch (Caller)</em>
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold"
              >
                Close & Return to Command Center
              </button>
            </div>
          )}

          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Caller / Citizen Name:</label>
                  <input
                    type="text"
                    value={callerName}
                    onChange={(e) => setCallerName(e.target.value)}
                    className="w-full bg-[#131f38] text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Ramesh Kumar"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Contact Phone:</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-[#131f38] text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
                    placeholder="10-digit mobile"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Description (Required):</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#131f38] text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
                  placeholder="Describe disaster, current water levels, damage, trapped persons..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Estimated People Affected:</label>
                  <input
                    type="number"
                    value={peopleAffected}
                    onChange={(e) => setPeopleAffected(e.target.value)}
                    className="w-full bg-[#131f38] text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Hazard / Urgency Notes:</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-[#131f38] text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Elderly stranded, gas leakage"
                  />
                </div>
              </div>

              {/* Location Picker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" /> Caller Address & GPS Coordinates:
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </span>
                </div>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#131f38] text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
                  placeholder="Address or landmark"
                />
                <LocationPickerMap
                  latitude={latitude}
                  longitude={longitude}
                  onChangeLocation={(lat, lng) => {
                    setLatitude(lat);
                    setLongitude(lng);
                  }}
                  height="160px"
                />
              </div>

              {/* Photo Attachment */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Attach Reference / Incident Image:</label>
                <div className="flex items-center gap-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-700"
                  />
                  <label className="flex-1 border border-dashed border-slate-700 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer hover:border-blue-500 bg-[#131f38]">
                    <UploadCloud className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300">Upload Dispatch Photo (JPG/PNG)</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-lg shadow-blue-900/30"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Log Incident on Behalf of Caller
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
