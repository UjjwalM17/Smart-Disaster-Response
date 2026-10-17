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
  Clock 
} from 'lucide-react';

export default function TopHeader({
  currentRole,
  onToggleRole,
  searchTerm,
  setSearchTerm,
  alerts = [],
  onNavigateToAlerts,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
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

  const dropdownRef = useRef(null);

  // Sync with backend alerts if available
  useEffect(() => {
    if (alerts && alerts.length > 0) {
      const backendNotifs = alerts.map((a, idx) => ({
        id: `alert-${a.alertId || idx}`,
        title: `Emergency ${a.alertType || 'SMS'} Alert - Mission #${a.missionId || ''}`,
        message: a.message || 'Mission operation in progress.',
        time: a.createdTime ? new Date(a.createdTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
        severity: a.severity || 'HIGH',
        read: false,
      }));
      setNotifications(backendNotifs);
    }
  }, [alerts]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
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

        {/* Interactive Notifications Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
              showDropdown
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
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#121b2f] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
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

              {/* Notification List */}
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
                      {/* Icon */}
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

                      {/* Content */}
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

              {/* Footer */}
              {onNavigateToAlerts && (
                <div className="p-2.5 bg-[#0e1627] border-t border-slate-800 text-center">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
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

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800/80">
          <div className="w-8 h-8 rounded-full bg-blue-600/80 border border-blue-400/40 flex items-center justify-center font-bold text-white text-xs shadow-sm">
            U
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-white leading-tight">Admin</p>
            <p className="text-[10px] text-slate-400">Response Team</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
        </div>
      </div>
    </header>
  );
}
