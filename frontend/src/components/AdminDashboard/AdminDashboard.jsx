import React from 'react';
import StatCards from './StatCards';
import AIWorkflowGrid from './AIWorkflowGrid';
import RecentIncidentsTable from './RecentIncidentsTable';
import VerificationQueueTable from './VerificationQueueTable';

export default function AdminDashboard({
  incidents = [],
  teams = [],
  resources = [],
  missions = [],
  onDispatchMission,
  onNavigateTab,
}) {
  const highSeverityCount = incidents.filter(
    (i) => i.severity === 'HIGH' || i.severity === 'Critical'
  ).length || 8;

  const totalIncidentsCount = incidents.length > 0 ? incidents.length : 24;
  const availableTeamsCount = teams.filter((t) => t.availabilityStatus === 'AVAILABLE').length || 12;
  const reliefSuppliesCount = resources.reduce((acc, r) => acc + (r.quantity || 0), 0) || 350;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 5 KPI Stat Cards with Sparklines */}
      <StatCards
        totalIncidents={totalIncidentsCount}
        criticalPriority={highSeverityCount}
        awaitingVerification={6}
        availableTeams={availableTeamsCount}
        reliefSupplies={reliefSuppliesCount}
      />

      {/* Main 4-Step AI Workflow Grid (Matches Screenshot) */}
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
          onViewAll={() => onNavigateTab('verification-queue')}
          onVerify={(id) => {}}
          onReject={(id) => {}}
        />
      </div>
    </div>
  );
}
