import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import {
  Shield,
  Search,
  Bell,
  ChevronDown,
  LayoutDashboard,
  AlertOctagon,
  CheckCircle,
  Truck,
  Users,
  Radio,
  Map,
  LogOut,
  Sparkles,
  PhoneCall,
  Activity,
  Layers,
} from 'lucide-react';
import { getAdminSession, clearAdminSession } from '../../pages/AdminLoginPage';
import { incidentStore } from '../../services/incidentStore';
import { api } from '../../services/api';
import CallerReportModal from './CallerReportModal';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [session, setSession] = useState(getAdminSession());
  const [pendingCount, setPendingCount] = useState(0);
  const [dutyStatus, setDutyStatus] = useState('ACTIVE');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [isCallerModalOpen, setIsCallerModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Critical Flood Alert', text: 'Water breach Sector 4', time: '5m ago', read: false },
    { id: 2, title: 'Mission Dispatched', text: 'Alpha Team on site', time: '12m ago', read: false },
  ]);

  // Auth Guard
  useEffect(() => {
    const currentSession = getAdminSession();
    if (!currentSession) {
      navigate('/admin/login', { replace: true });
    } else {
      setSession(currentSession);
    }
  }, [navigate]);

  // Poll / load low-confidence flagged count for AI Triage badge
  useEffect(() => {
    const updateCounts = async () => {
      try {
        const incidents = await incidentStore.getAllIncidents();
        const flagged = incidents.filter((i) => !i.verified || i.verificationStatus === 'FLAGGED_LOW_CONFIDENCE').length;
        setPendingCount(flagged);
      } catch (e) {
        // Fallback
      }
    };

    updateCounts();
    const timer = setInterval(updateCounts, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    clearAdminSession();
    navigate('/admin/login', { replace: true });
  };

  const navLinks = [
    { to: '/admin', label: 'Command Center', icon: LayoutDashboard },
    { to: '/admin/incidents', label: 'Disaster History', icon: AlertOctagon },
    {
      to: '/admin/verification',
      label: 'AI Triage & Monitor',
      icon: Sparkles,
      badge: pendingCount,
    },
    { to: '/admin/resources', label: 'Resources', icon: Layers },
    { to: '/admin/teams', label: 'Rescue Teams', icon: Users },
    { to: '/admin/missions', label: 'Missions', icon: Truck },
    { to: '/admin/alerts', label: 'Alerts', icon: Radio },
    { to: '/admin/maps', label: 'Operations Map', icon: Map },
  ];

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0e172a]/95 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link to="/admin" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-wider text-white">RESQ</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  COMMAND
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-none">
                AI Disaster Coordination
              </p>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                  {Boolean(link.badge) && link.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-500 text-white animate-pulse">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Report on behalf of caller button */}
            <button
              onClick={() => setIsCallerModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-sm"
              title="Intake dispatch call directly into system"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              <span>Caller Intake</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-slate-900" />
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-[#121d36] border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white">Command Notifications</span>
                    <button
                      onClick={() => setNotifications(notifications.map((n) => ({ ...n, read: true })))}
                      className="text-[10px] text-blue-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2 rounded-xl bg-slate-900/60 text-xs space-y-0.5">
                        <div className="flex justify-between font-semibold text-slate-200">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-slate-500">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">{n.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Duty Status */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium">{dutyStatus}</span>
            </div>

            {/* Profile Dropdown & Logout */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
                  U
                </div>
                <div className="hidden lg:block text-left text-xs leading-none">
                  <span className="font-bold text-white block">Ujjwal M.</span>
                  <span className="text-[10px] text-slate-400">Commander</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-[#121d36] border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 space-y-1 text-xs animate-in fade-in">
                  <div className="p-2 border-b border-slate-800">
                    <p className="font-bold text-white">Ujjwal Manocha</p>
                    <p className="text-[10px] text-slate-400">Lead Incident Commander</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/admin');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
                  >
                    Command Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/admin/verification');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-slate-300 flex justify-between items-center transition-colors"
                  >
                    <span>Verification Queue</span>
                    {pendingCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[9px] font-bold">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                  <div className="border-t border-slate-800 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-red-950/60 text-red-400 flex items-center gap-1.5 font-bold transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out (Lock Console)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="xl:hidden flex items-center gap-2 px-4 py-2 bg-[#0c1424] border-t border-slate-800/80 overflow-x-auto scrollbar-none">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
                {Boolean(link.badge) && link.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-red-500 text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Main Outlet for Admin Child Pages */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>

      {/* Caller Intake Modal */}
      <CallerReportModal
        isOpen={isCallerModalOpen}
        onClose={() => setIsCallerModalOpen(false)}
        onIncidentCreated={() => {
          // Trigger any needed updates
        }}
      />
    </div>
  );
}
