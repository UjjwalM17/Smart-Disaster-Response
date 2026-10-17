import React from 'react';
import { 
  Flame, 
  Users, 
  Package, 
  Compass, 
  Bell, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';

export default function DashboardOverview({
  incidents = [],
  teams = [],
  resources = [],
  missions = [],
  alerts = [],
  onNavigate,
}) {
  const highSeverityIncidents = incidents.filter(i => i.severity === 'HIGH').length;
  const availableTeams = teams.filter(t => t.availabilityStatus === 'AVAILABLE').length;
  const activeTeams = teams.filter(t => t.availabilityStatus === 'ON_MISSION').length;
  const availableResources = resources.filter(r => r.availabilityStatus === 'AVAILABLE').length;
  const inUseResources = resources.filter(r => r.availabilityStatus === 'IN_USE').length;
  const activeMissions = missions.filter(m => m.status !== 'COMPLETED').length;

  const stats = [
    {
      title: 'Total Incidents',
      value: incidents.length,
      sub: `${highSeverityIncidents} High Severity`,
      icon: Flame,
      color: 'text-red-400',
      bg: 'bg-red-950/40 border-red-800/50',
      tab: 'incidents',
    },
    {
      title: 'Rescue Teams',
      value: teams.length,
      sub: `${availableTeams} Ready · ${activeTeams} Deployed`,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-950/40 border-blue-800/50',
      tab: 'teams',
    },
    {
      title: 'Emergency Resources',
      value: resources.length,
      sub: `${availableResources} Available · ${inUseResources} In Use`,
      icon: Package,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/40 border-emerald-800/50',
      tab: 'resources',
    },
    {
      title: 'Active Missions',
      value: activeMissions,
      sub: `${missions.filter(m => m.status === 'COMPLETED').length} Completed`,
      icon: Compass,
      color: 'text-amber-400',
      bg: 'bg-amber-950/40 border-amber-800/50',
      tab: 'missions',
    },
    {
      title: 'Emergency Alerts',
      value: alerts.length,
      sub: `${alerts.filter(a => a.severity === 'HIGH').length} High Priority`,
      icon: Bell,
      color: 'text-purple-400',
      bg: 'bg-purple-950/40 border-purple-800/50',
      tab: 'alerts',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner / Incident Ticker */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/80 via-slate-900 to-amber-950/60 p-6 sm:p-8 border border-red-900/40 shadow-xl">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-900/80 text-red-200 border border-red-700/60">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Central Emergency Operations Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Smart Disaster Response System
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Coordinating multi-agency rescue teams, resource inventories, live incident triage, and automated emergency alert broadcasts across 6 Spring Boot microservices.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onNavigate('missions')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              <Compass className="w-4 h-4" />
              Dispatch Rescue Mission
            </button>
            <button
              onClick={() => onNavigate('incidents')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              <Flame className="w-4 h-4" />
              Report New Incident
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              onClick={() => onNavigate(stat.tab)}
              className={`p-4 rounded-xl border ${stat.bg} cursor-pointer hover:border-slate-600 transition-all group`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{stat.title}</span>
                <Icon className={`w-4 h-4 ${stat.color} group-hover:scale-110 transition-transform`} />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white tracking-tight">{stat.value}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400 truncate">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Recent Incidents & Active Missions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidents Card */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-400" />
              <h2 className="text-sm font-semibold text-white">Recent Reported Incidents</h2>
            </div>
            <button
              onClick={() => onNavigate('incidents')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          {incidents.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No disaster incidents reported yet.</p>
          ) : (
            <div className="space-y-2.5">
              {incidents.slice(0, 4).map((inc) => (
                <div
                  key={inc.incidentId}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{inc.location}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-950 text-red-300 border border-red-800/60">
                        {inc.disasterType}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] truncate max-w-xs">{inc.description}</p>
                  </div>
                  <div className="text-right">
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
                    <p className="text-[10px] text-slate-500 mt-1">{inc.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Missions Card */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white">Active Missions Status</h2>
            </div>
            <button
              onClick={() => onNavigate('missions')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
            >
              View all <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          {missions.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No missions currently dispatched.</p>
          ) : (
            <div className="space-y-2.5">
              {missions.slice(0, 4).map((m) => (
                <div
                  key={m.missionId}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">Mission #{m.missionId}</span>
                      <span className="text-slate-400">· Incident #{m.incidentId}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] truncate max-w-xs">{m.remarks || 'No remarks provided'}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        m.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                      }`}
                    >
                      {m.status === 'COMPLETED' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                      {m.status}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">Priority: {m.priority}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
