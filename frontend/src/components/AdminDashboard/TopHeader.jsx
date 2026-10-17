import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  Shield, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Radio, 
  X, 
  CheckCheck, 
  Clock, 
  Settings, 
  LogOut, 
  BarChart2, 
  RefreshCw, 
  UserCheck, 
  Activity, 
  ShieldCheck 
} from 'lucide-react';

export default function TopHeader({
  currentRole,
  onToggleRole,
  searchTerm,
  setSearchTerm,
  alerts = [],
  onNavigateToAlerts,
  onNavigateToSettings,
  onNavigateToReports,
  onSyncData,
}) {
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [dutyStatus, setDutyStatus] = useState('ACTIVE'); // 'ACTIVE' | 'STANDBY' | 'FIELD'

  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Critical Flood Alert - Downtown Zone 4',
      message: 'Water levels rising rapidly. 50+ residents awaiting evacuation.',
      time: '2m ago',
      severity: 'CRITICAL',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Mission #1 Dispatched',
      message: 'NDRF Quick Response Alpha deployed with Inflatable Rescue Boat Pack.',
      time: '12m ago',
      severity: 'HIGH',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'Resource Allocation Warning',
      message: 'Ambulance Units in Sector 14 are running at 80% deployment capacity.',
      time: '25m ago',
      severity: 'MEDIUM',
      read: false,
    },
  ]);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Sync with backend alerts if available
  useEffect(() => {
    if (alerts && alerts.length > 0) {
      const backendNotifs = alerts.map((a, idx) => ({
        id: `alert-${a.alertId || idx}`,
        title: `Emergency ${a.alertType || 'SMS'} Alert - Mission #${a.missionId || ''}`,
        message: a.message || 'Mission operation in progress.',
        time: a.createdTime
          ? new Date(a.createdTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Recent',
        severity: a.severity || 'HIGH',
        read: false,
      }));
      setNotifications(backendNotifs);
    }
  }, [alerts]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotificationDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkItemRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0d1527]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-950/50 ring-1 ring-red-400/40">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-wider text-white">RESQ</span>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
            AI-Powered Disaster Response
          </p>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search incidents, reports or ID..."
            className="w-full bg-[#131d33] text-xs text-white placeholder-slate-400 pl-10 pr-4 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Right Controls: Role Switcher, Notifications, Admin Profile */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Role Switcher Pill */}
        <div className="flex items-center p-1 bg-[#131d33] rounded-xl border border-slate-800">
          <button
            onClick={() => onToggleRole('admin')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentRole === 'admin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </button>
          <button
            onClick={() => onToggleRole('citizen')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentRole === 'citizen'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Citizen Portal</span>
          </button>
        </div>

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotificationDropdown(!showNotificationDropdown);
              setShowProfileDropdown(false);
            }}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
              showNotificationDropdown
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-[#131d33] border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
            title="Emergency Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-[#0d1527] animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotificationDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#121b2f] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3.5 bg-[#0e1627] border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-white">Emergency Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-950 text-red-400 border border-red-800/60">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                    >
                      <CheckCheck className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAll}
                      className="text-slate-500 hover:text-slate-300"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    <CheckCircle2 className="w-6 h-6 text-slate-600 mx-auto mb-1.5" />
                    No active emergency alerts
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleMarkItemRead(item.id)}
                      className={`p-3 text-xs transition-colors cursor-pointer hover:bg-[#152037] flex items-start gap-2.5 ${
                        item.read ? 'opacity-60 bg-transparent' : 'bg-[#141f36]/70'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {item.severity === 'CRITICAL' ? (
                          <div className="w-6 h-6 rounded-lg bg-red-950/90 border border-red-800/80 flex items-center justify-center text-red-400">
                            <Flame className="w-3 h-3" />
                          </div>
                        ) : item.severity === 'HIGH' ? (
                          <div className="w-6 h-6 rounded-lg bg-amber-950/90 border border-amber-800/80 flex items-center justify-center text-amber-400">
                            <AlertTriangle className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-blue-950/90 border border-blue-800/80 flex items-center justify-center text-blue-400">
                            <Radio className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white leading-tight">
                            {item.title}
                          </p>
                          {!item.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug">
                          {item.message}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 pt-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{item.time}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {onNavigateToAlerts && (
                <div className="p-2.5 bg-[#0e1627] border-t border-slate-800 text-center">
                  <button
                    onClick={() => {
                      setShowNotificationDropdown(false);
                      onNavigateToAlerts();
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold w-full"
                  >
                    View All Broadcast Alerts in Alert Hub →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Interactive Admin Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setShowNotificationDropdown(false);
            }}
            className="flex items-center gap-2.5 pl-2 border-l border-slate-800/80 text-left hover:opacity-90 transition-opacity focus:outline-none"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-blue-600/90 border border-blue-400/40 flex items-center justify-center font-bold text-white text-xs shadow-md">
                U
              </div>
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-[#0d1527] ${
                  dutyStatus === 'ACTIVE'
                    ? 'bg-emerald-500'
                    : dutyStatus === 'STANDBY'
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
              />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-white leading-tight">Admin</p>
              <p className="text-[10px] text-slate-400">Response Team</p>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden sm:block ${
                showProfileDropdown ? 'rotate-180 text-white' : ''
              }`}
            />
          </button>

          {/* Admin Profile Dropdown Menu */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-[#121b2f] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Profile Identity Card */}
              <div className="p-4 bg-[#0e1627] border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-blue-600 border-2 border-blue-400/60 flex items-center justify-center font-extrabold text-white text-sm shadow-md">
                    U
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white">Ujjwal Manocha</h4>
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <p className="text-[10px] text-slate-400">ujjwalmanocha1756@gmail.com</p>
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-blue-950 text-blue-300 border border-blue-800/60 mt-1">
                      Lead Incident Commander
                    </span>
                  </div>
                </div>

                {/* Duty Status Selector */}
                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 font-medium">
                    <span>Operational Duty Status:</span>
                    <span className="font-bold text-white">
                      {dutyStatus === 'ACTIVE'
                        ? '🟢 Active On-Duty'
                        : dutyStatus === 'STANDBY'
                        ? '🟡 Standby / Ready'
                        : '🔴 In Field Ops'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[9px] font-bold">
                    <button
                      onClick={() => setDutyStatus('ACTIVE')}
                      className={`py-1 rounded-lg border text-center transition-all ${
                        dutyStatus === 'ACTIVE'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                          : 'bg-[#131d33] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setDutyStatus('STANDBY')}
                      className={`py-1 rounded-lg border text-center transition-all ${
                        dutyStatus === 'STANDBY'
                          ? 'bg-amber-950 text-amber-300 border-amber-600'
                          : 'bg-[#131d33] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Standby
                    </button>
                    <button
                      onClick={() => setDutyStatus('FIELD')}
                      className={`py-1 rounded-lg border text-center transition-all ${
                        dutyStatus === 'FIELD'
                          ? 'bg-red-950 text-red-300 border-red-600'
                          : 'bg-[#131d33] text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Field Ops
                    </button>
                  </div>
                </div>
              </div>

              {/* Menu Links */}
              <div className="p-2 space-y-1 text-xs">
                {/* Switch to Citizen Portal */}
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    onToggleRole('citizen');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#152037] transition-colors text-left"
                >
                  <Users className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="font-semibold text-white">Switch to Citizen Portal</p>
                    <p className="text-[10px] text-slate-400">Public emergency request view</p>
                  </div>
                </button>

                {/* System Settings */}
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    if (onNavigateToSettings) onNavigateToSettings();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#152037] transition-colors text-left"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="font-semibold text-white">System & Microservices</p>
                    <p className="text-[10px] text-slate-400">Gateway 8086 & PostgreSQL state</p>
                  </div>
                </button>

                {/* Command Reports */}
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    if (onNavigateToReports) onNavigateToReports();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#152037] transition-colors text-left"
                >
                  <BarChart2 className="w-4 h-4 text-blue-400" />
                  <div>
                    <p className="font-semibold text-white">Missions & Analytics Hub</p>
                    <p className="text-[10px] text-slate-400">Live rescue coordination statistics</p>
                  </div>
                </button>

                {/* Re-sync data */}
                {onSyncData && (
                  <button
                    onClick={() => {
                      onSyncData();
                      setShowProfileDropdown(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#152037] transition-colors text-left"
                  >
                    <RefreshCw className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="font-semibold text-white">Sync Backend Services</p>
                      <p className="text-[10px] text-slate-400">Refresh live microservice data</p>
                    </div>
                  </button>
                )}
              </div>

              {/* Sign Out / Operator Reset */}
              <div className="p-2 border-t border-slate-800 bg-[#0e1627]/60">
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    alert('Session active for Administrator Ujjwal Manocha.');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/40 text-xs font-semibold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out / Change Operator
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
