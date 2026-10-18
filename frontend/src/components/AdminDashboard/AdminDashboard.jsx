import React, { useMemo } from 'react';
import StatCards from './StatCards';
import AIWorkflowGrid from './AIWorkflowGrid';
import RecentIncidentsTable from './RecentIncidentsTable';
import VerificationQueueTable from './VerificationQueueTable';
import { duplicateDetectionEngine } from '../../services/duplicateDetectionEngine';
import { Layers, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function AdminDashboard({
  incidents = [],
  teams = [],
  resources = [],
  missions = [],
  onDispatchMission,
  onNavigateTab,
}) {
  // Real persisted metrics from PostgreSQL / Active Store
  const totalIncidentsCount = incidents.length;
  const criticalPriorityCount = incidents.filter(
    (i) => (i.priorityScore && i.priorityScore >= 80) || i.severity === 'HIGH' || i.severity === 'Critical'
  ).length;
  const awaitingVerificationCount = incidents.filter((i) => !i.verified).length;
  const availableTeamsCount = teams.filter((t) => (t.availabilityStatus || '').toUpperCase() === 'AVAILABLE').length;
  const reliefSuppliesCount = resources.reduce((acc, r) => acc + (Number(r.quantity) || 0), 0);

  // Automatic Duplicate Incident Clustering
  const duplicateClusters = useMemo(() => {
    return duplicateDetectionEngine.clusterIncidents(incidents);
  }, [incidents]);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 5 KPI Stat Cards with Real Persisted Metrics */}
      <StatCards
        totalIncidents={totalIncidentsCount}
        criticalPriority={criticalPriorityCount}
        awaitingVerification={awaitingVerificationCount}
        availableTeams={availableTeamsCount}
        reliefSupplies={reliefSuppliesCount}
      />

      {/* Exception-Focused Alert & Duplicate Incident Banner */}
      {duplicateClusters.groups?.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/40 shadow space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              Automated Duplicate Detection: {duplicateClusters.groups.length} Incident Cluster(s) Identified
            </span>
            <button
              onClick={() => onNavigateTab('incident-list')}
              className="text-[11px] text-amber-400 hover:text-amber-200 underline font-medium"
            >
              Review Corroborating Reports
            </button>
          </div>
          <p className="text-[11px] text-slate-300">
            ResQ spatial-temporal grouping merged {duplicateClusters.groups.reduce((acc, g) => acc + g.incidents.length, 0)} reports occurring within 500m to prevent duplicate rescue team dispatch while preserving all individual caller evidence.
          </p>
        </div>
      )}

      {/* Main 4-Step AI Workflow Grid */}
      <AIWorkflowGrid
        onDispatchMission={onDispatchMission}
        onIncidentReported={() => {}}
      />

      {/* Bottom Dual Tables: Recent Incidents & Verification Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentIncidentsTable
          incidents={incidents}
          onViewAll={() => onNavigateTab('incident-list')}
        />
        <VerificationQueueTable
          incidents={incidents}
          onViewAll={() => onNavigateTab('verification-queue')}
          onVerify={(id) => {}}
          onReject={(id) => {}}
        />
      </div>
    </div>
  );
}
