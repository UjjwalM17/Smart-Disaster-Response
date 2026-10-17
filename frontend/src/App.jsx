import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Public Citizen Pages
import LandingPage from './pages/LandingPage';
import CitizenReportPage from './pages/CitizenReportPage';
import ReportSuccessPage from './pages/ReportSuccessPage';
import TrackIncidentPage from './pages/TrackIncidentPage';

// Admin Authentication & Pages
import AdminLoginPage from './pages/AdminLoginPage';
import AdminLayout from './components/AdminDashboard/AdminLayout';
import AdminCommandCenterPage from './pages/admin/AdminCommandCenterPage';
import AdminIncidentsPage from './pages/admin/AdminIncidentsPage';
import AdminVerificationPage from './pages/admin/AdminVerificationPage';
import AdminResourcesPage from './pages/admin/AdminResourcesPage';
import AdminTeamsPage from './pages/admin/AdminTeamsPage';
import AdminMissionsPage from './pages/admin/AdminMissionsPage';
import AdminAlertsPage from './pages/admin/AdminAlertsPage';
import AdminMapsPage from './pages/admin/AdminMapsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC CITIZEN ROUTES ================= */}
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Mobile-first Citizen Emergency Report */}
        <Route path="/report" element={<CitizenReportPage />} />

        {/* Report Submission Success with Status Timeline */}
        <Route path="/report/success/:id" element={<ReportSuccessPage />} />

        {/* Incident Tracking */}
        <Route path="/track" element={<TrackIncidentPage />} />

        {/* ================= ADMIN COMMAND ROUTES (Login Required) ================= */}
        {/* Admin Login (hackathon level authentication) */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Admin Shell */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Command Center Dashboard */}
          <Route index element={<AdminCommandCenterPage />} />

          {/* All Incidents Database */}
          <Route path="incidents" element={<AdminIncidentsPage />} />

          {/* Verification Queue (with pending-count badge) */}
          <Route path="verification" element={<AdminVerificationPage />} />

          {/* Resource Management */}
          <Route path="resources" element={<AdminResourcesPage />} />

          {/* Rescue Teams Management */}
          <Route path="teams" element={<AdminTeamsPage />} />

          {/* Mission Dispatch & Operations */}
          <Route path="missions" element={<AdminMissionsPage />} />

          {/* Broadcasts & Alerts */}
          <Route path="alerts" element={<AdminAlertsPage />} />

          {/* Full Tactical Geospatial Map */}
          <Route path="maps" element={<AdminMapsPage />} />
        </Route>

        {/* Fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
