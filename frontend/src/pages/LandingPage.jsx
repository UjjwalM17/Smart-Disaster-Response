import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowRight,
  Search,
  PhoneCall,
  MapPin,
  Clock,
  CheckCircle2,
  Users,
  Lock,
  Radio,
  Building,
} from 'lucide-react';
import CitizenHeader from '../components/Citizen/CitizenHeader';
import IncidentMap from '../components/Map/IncidentMap';
import { incidentStore } from '../services/incidentStore';

export default function LandingPage() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    incidentStore.getAllIncidents().then((list) => setIncidents(list));
  }, []);

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      <CitizenHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 w-full">
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden border border-blue-900/40 bg-gradient-to-b from-[#131f3b] via-[#0f172a] to-[#0b1120] p-6 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>National Emergency Telemetry & Multi-Agency Dispatch Active</span>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              AI-Powered Real-Time <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
                Disaster Response Network
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Instantly report local flood, fire, structural collapse, or cyclone incidents. Our vision AI analyzes damage in seconds to dispatch rescue teams and emergency relief directly to your coordinates.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/report"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Report Disaster Incident</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/track"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 flex items-center justify-center gap-2 transition-all hover:border-slate-600"
            >
              <Search className="w-4 h-4 text-blue-400" />
              <span>Track Incident Status</span>
            </Link>
          </div>
        </div>

        {/* Live Active Map */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" /> Live Response Coordinates Map
              </h2>
              <p className="text-xs text-slate-400">
                Visualizing active incidents classified by multi-factor priority scoring
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {incidents.filter((i) => i.latitude).length} Geo-tagged Incidents
            </span>
          </div>

          <IncidentMap incidents={incidents} height="380px" />
        </div>

        {/* Shelter & Helpline Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-[#11192e] border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Open Relief Shelters</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Over 18 emergency shelters equipped with clean drinking water, cots, hot meals, and paramedic staff are currently operating in Delhi NCR.
            </p>
            <div className="text-xs text-blue-400 font-medium">Capacity: 74% Occupied</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#11192e] border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">NDRF & Quick Response Units</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              12 tactical rescue teams, amphibious evacuation boats, and airborne reconnaissance drones are currently deployed on 24/7 rotational field duty.
            </p>
            <div className="text-xs text-amber-400 font-medium">Avg Response Time: 8.4 mins</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#11192e] border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <h3 className="text-sm font-bold text-white">Immediate Danger? Call 112</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              If life is in immediate peril or medical evacuation is needed without cellular internet, dial 112 directly for priority voice routing.
            </p>
            <a
              href="tel:112"
              className="inline-block px-3 py-1 bg-red-600/20 border border-red-500/40 text-red-300 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-colors"
            >
              Call 112 Direct Hotline &rarr;
            </a>
          </div>
        </div>
      </main>

      {/* Citizen Footer */}
      <footer className="border-t border-slate-800 bg-[#080d19] py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">RESQ System</span>
            <span>&bull;</span>
            <span>Emergency Telemetry & Disaster Response Portal</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-rose-400 font-semibold">In immediate danger? Call 112</span>
            <Link
              to="/admin/login"
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
            >
              <Lock className="w-3.5 h-3.5" /> Authorized Personnel Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
