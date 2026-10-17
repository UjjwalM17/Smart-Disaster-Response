import { Link } from 'react-router-dom';
import { Shield, PhoneCall, Search, FileText } from 'lucide-react';

export default function CitizenHeader() {
  return (
    <header className="sticky top-0 z-50 bg-[#0d1527]/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Simple Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-wider text-white">RESQ</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                CITIZEN
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-none">
              Disaster Response & Telemetry
            </p>
          </div>
        </Link>

        {/* Citizen Navigation Links */}
        <div className="flex items-center gap-3">
          <Link
            to="/report"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" /> Report Incident
          </Link>
          <Link
            to="/track"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-blue-400" /> Track Status
          </Link>
          <a
            href="tel:112"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-all"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
            <span>SOS 112</span>
          </a>
        </div>
      </div>
    </header>
  );
}
