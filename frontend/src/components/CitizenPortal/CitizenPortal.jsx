import React, { useState } from 'react';
import { 
  AlertCircle, 
  MapPin, 
  Phone, 
  Send, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  UploadCloud, 
  Compass, 
  LifeBuoy, 
  Radio, 
  Users, 
  X, 
  Navigation, 
  Activity, 
  PhoneCall 
} from 'lucide-react';

export default function CitizenPortal({ onSubmitReport, liveIncidents = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    disasterType: 'FLOOD',
    description: '',
    peopleTrapped: '2',
    urgentMedicalHelp: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [sosSent, setSosSent] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [beaconCoords, setBeaconCoords] = useState('28.6139° N, 77.2090° E');
  const [beaconId, setBeaconId] = useState('SOS-9821');

  const handleSOS = () => {
    // Generate unique beacon ID
    const newBeaconId = `SOS-${Math.floor(1000 + Math.random() * 9000)}`;
    setBeaconId(newBeaconId);
    setSosSent(true);

    // Attempt to acquire real browser GPS coordinates
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = `${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`;
          setBeaconCoords(coords);
          transmitEmergencyIncident(newBeaconId, coords);
        },
        () => {
          const fallbackCoords = '28.6139° N, 77.2090° E (Downtown Flood Sector)';
          setBeaconCoords(fallbackCoords);
          transmitEmergencyIncident(newBeaconId, fallbackCoords);
        }
      );
    } else {
      transmitEmergencyIncident(newBeaconId, beaconCoords);
    }

    // Open modern in-app SOS modal (NO jarring browser alert)
    setShowSOSModal(true);
  };

  const transmitEmergencyIncident = (id, coords) => {
    if (onSubmitReport) {
      onSubmitReport({
        reporterName: `Emergency Beacon (${id})`,
        mobile: '9876543210',
        location: coords,
        disasterType: 'FLOOD',
        severity: 'HIGH',
        description: `🚨 CRITICAL DISTRESS BEACON: Citizen activated one-tap SOS at ${coords}. Immediate evacuation requested.`,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmitReport) {
      onSubmitReport({
        reporterName: formData.name,
        mobile: formData.phone,
        location: formData.location,
        disasterType: formData.disasterType,
        severity: formData.urgentMedicalHelp ? 'HIGH' : 'MEDIUM',
        description: `${formData.description} (People trapped: ${formData.peopleTrapped})`,
      });
    }
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Citizen Hero & Emergency SOS Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950/90 via-slate-900 to-amber-950/80 p-6 sm:p-8 border border-red-900/50 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-900/80 text-red-200 border border-red-700/60">
              <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              Citizen Emergency & Rescue Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Are you or someone near you in danger?
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Report active emergencies, request urgent evacuation boats, find open relief shelters, or trigger an instant emergency beacon.
            </p>
          </div>

          {/* SOS Beacon Button */}
          <div className="shrink-0 w-full md:w-auto text-center">
            <button
              onClick={handleSOS}
              className={`w-full md:w-48 h-16 sm:h-20 rounded-2xl flex flex-col items-center justify-center font-black uppercase tracking-wider text-white shadow-2xl transition-all active:scale-95 border-2 relative overflow-hidden group ${
                sosSent
                  ? 'bg-emerald-600 border-emerald-400 shadow-emerald-950/80 animate-pulse'
                  : 'bg-gradient-to-tr from-red-700 to-rose-500 border-red-400 shadow-red-900/80 hover:scale-105'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
                <span className="text-base sm:text-lg">{sosSent ? 'BEACON ACTIVE' : 'ONE-TAP SOS'}</span>
              </div>
              <span className="text-[10px] font-normal text-red-100 opacity-90 mt-0.5">
                {sosSent ? 'Rescue Units Notified' : 'Broadcast GPS Beacon'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Report Emergency Form */}
        <div className="lg:col-span-2 bg-[#121b2f] border border-slate-800/80 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-red-500" />
                Report Disaster & Request Evacuation
              </h2>
              <p className="text-xs text-slate-400">
                Reports are analyzed immediately by AI triage and dispatched to response units
              </p>
            </div>
          </div>

          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Emergency Report Dispatched!</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Your report has been logged into the Central Command system and queued for immediate rescue verification.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
              >
                Submit Another Report
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full bg-[#0e1627] text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Contact Phone * (10 digits)</label>
                  <input
                    type="tel"
                    required
                    pattern="[6-9][0-9]{9}"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-[#0e1627] text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Current Location / Landmark *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Sector 14 near City Hospital"
                    className="w-full bg-[#0e1627] text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Disaster Type *</label>
                  <select
                    value={formData.disasterType}
                    onChange={(e) => setFormData({ ...formData, disasterType: e.target.value })}
                    className="w-full bg-[#0e1627] text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="FLOOD">Flash Flood / High Water</option>
                    <option value="FIRE">Structural Fire</option>
                    <option value="BUILDING_COLLAPSE">Building Collapse</option>
                    <option value="LANDSLIDE">Landslide / Mudflow</option>
                    <option value="CYCLONE">Severe Cyclone / Storm</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Situation Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell us what is happening: are roads cut off? Are power lines down? What immediate help is needed?"
                  className="w-full bg-[#0e1627] text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.urgentMedicalHelp}
                    onChange={(e) =>
                      setFormData({ ...formData, urgentMedicalHelp: e.target.checked })
                    }
                    className="rounded border-slate-700 text-red-600 focus:ring-red-500"
                  />
                  <span className="font-semibold text-red-400">
                    Urgent medical assistance needed on site!
                  </span>
                </label>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  Transmit Rescue Report
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Col: Safe Zones & Emergency Broadcasts */}
        <div className="space-y-4">
          {/* Active Safe Shelters */}
          <div className="bg-[#121b2f] border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              Designated Evacuation Shelters
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-[#0e1627] rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white">Govt. Model School Relief Camp</p>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800/60">
                    OPEN
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" /> Sector 9 Highland Road
                </p>
                <p className="text-[10px] text-slate-500">Capacity: 450 beds · Food & Water available</p>
              </div>

              <div className="p-3 bg-[#0e1627] rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white">Community Sports Complex</p>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800/60">
                    OPEN
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" /> West Ridge Boulevard
                </p>
                <p className="text-[10px] text-slate-500">Medical staff on duty · Generator backup</p>
              </div>
            </div>
          </div>

          {/* Emergency Helpline Numbers */}
          <div className="bg-[#121b2f] border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-400" />
              Emergency Response Hotlines
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0e1627] border border-slate-800">
                <span className="text-slate-300 font-medium">NDRF Disaster Helpline</span>
                <span className="font-mono font-bold text-amber-400">1078</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0e1627] border border-slate-800">
                <span className="text-slate-300 font-medium">Ambulance & Medical</span>
                <span className="font-mono font-bold text-red-400">108</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0e1627] border border-slate-800">
                <span className="text-slate-300 font-medium">Fire & Rescue Service</span>
                <span className="font-mono font-bold text-orange-400">101</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= HIGH-TECH EMERGENCY SOS MODAL (NO BROWSER ALERT) ================= */}
      {showSOSModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#10182b] border-2 border-red-600 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl shadow-red-950/80 animate-in zoom-in-95 duration-150 relative overflow-hidden">
            {/* Background glowing beacon effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-900/60 animate-pulse">
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full animate-ping" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-950 text-red-300 border border-red-700/80 uppercase tracking-wider">
                      Distress Beacon Active
                    </span>
                    <span className="font-mono text-xs text-slate-400 font-semibold">{beaconId}</span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-0.5">
                    🚨 EMERGENCY SOS BROADCASTED
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowSOSModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Telemetry & GPS Card */}
            <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <Navigation className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                  Acquired Coordinates
                </span>
                <span className="font-mono font-bold text-amber-400 text-xs">{beaconCoords}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Command Center Status
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                  ACKNOWLEDGED
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Dispatched Tactical Unit
                </span>
                <span className="font-semibold text-white">NDRF Quick Response Alpha</span>
              </div>
            </div>

            {/* Critical Safety Instructions */}
            <div className="space-y-1.5 text-xs">
              <p className="font-bold text-slate-200">Critical Immediate Instructions:</p>
              <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                <li>Remain calm and move to the highest accessible structural level.</li>
                <li>Conserve mobile battery; rescue telemetry will ping your location.</li>
                <li>Wave a bright cloth or reflective object if search boats or copters approach.</li>
              </ul>
            </div>

            {/* Quick Emergency Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-800">
              <a
                href="tel:1078"
                className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/60 transition-all text-center"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                Call NDRF Helpline (1078)
              </a>
              <button
                onClick={() => setShowSOSModal(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
              >
                Close & Keep Tracking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
