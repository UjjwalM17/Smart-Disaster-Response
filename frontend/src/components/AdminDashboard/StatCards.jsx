import React from 'react';
import { Bell, AlertTriangle, FileText, Users, Package } from 'lucide-react';

export default function StatCards({
  totalIncidents = 24,
  criticalPriority = 8,
  awaitingVerification = 0,
  autoVerifiedCount = null,
  availableTeams = 12,
  reliefSupplies = 350,
}) {
  const verifiedCount = autoVerifiedCount != null ? autoVerifiedCount : Math.max(0, totalIncidents - awaitingVerification);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* 1. Total Incidents */}
      <div className="bg-[#121b2f] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800/60 flex items-center justify-center text-red-400">
            <Bell className="w-5 h-5" />
          </div>
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            Active
          </span>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">{totalIncidents}</h3>
            <p className="text-xs text-slate-400 font-medium">Total Incidents</p>
          </div>
          {/* Green Sparkline */}
          <svg className="w-16 h-7 text-emerald-400" fill="none" viewBox="0 0 60 25" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2 18 L15 14 L28 17 L42 8 L58 4" />
          </svg>
        </div>
      </div>

      {/* 2. Critical Priority */}
      <div className="bg-[#121b2f] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">{criticalPriority}</h3>
            <p className="text-xs text-slate-400 font-medium">Critical Priority</p>
          </div>
          {/* Orange Sparkline */}
          <svg className="w-16 h-7 text-amber-500" fill="none" viewBox="0 0 60 25" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2 20 L16 12 L30 18 L44 9 L58 13" />
          </svg>
        </div>
      </div>

      {/* 3. AI Auto-Verified */}
      <div className="bg-[#121b2f] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            Automated
          </span>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">{verifiedCount}</h3>
            <p className="text-xs text-slate-400 font-medium">AI Auto-Verified</p>
          </div>
          {/* Blue Sparkline */}
          <svg className="w-16 h-7 text-emerald-400" fill="none" viewBox="0 0 60 25" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2 12 L15 16 L28 10 L42 14 L58 8" />
          </svg>
        </div>
      </div>

      {/* 4. Available Teams */}
      <div className="bg-[#121b2f] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">{availableTeams}</h3>
            <p className="text-xs text-slate-400 font-medium">Available Teams</p>
          </div>
          {/* Emerald Sparkline */}
          <svg className="w-16 h-7 text-emerald-400" fill="none" viewBox="0 0 60 25" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2 19 L15 15 L28 17 L45 8 L58 5" />
          </svg>
        </div>
      </div>

      {/* 5. Relief Supplies (Kits) */}
      <div className="bg-[#121b2f] border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
            <Package className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">{reliefSupplies}</h3>
            <p className="text-xs text-slate-400 font-medium">Relief Supplies (Kits)</p>
          </div>
          {/* Purple Sparkline */}
          <svg className="w-16 h-7 text-purple-400" fill="none" viewBox="0 0 60 25" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2 20 L15 18 L30 14 L42 16 L58 4" />
          </svg>
        </div>
      </div>
    </div>
  );
}
