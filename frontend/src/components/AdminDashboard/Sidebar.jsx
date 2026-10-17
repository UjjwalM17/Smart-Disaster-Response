import React from 'react';
import { 
  Home, 
  Image, 
  Sparkles, 
  CheckCircle, 
  List, 
  Users, 
  BarChart2, 
  Settings 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'new-incident', label: 'New Incident', icon: Image },
    { id: 'ai-assessment', label: 'AI Assessment', icon: Sparkles },
    { id: 'verification-queue', label: 'Verification Queue', icon: CheckCircle },
    { id: 'incident-list', label: 'Incident List', icon: List },
    { id: 'resource-management', label: 'Resource Management', icon: Users },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-56 shrink-0 bg-[#0d1527] border-r border-slate-800/80 p-3 space-y-1 hidden lg:block min-h-[calc(100vh-61px)]">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              isActive
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-bold'
                : 'text-slate-400 hover:text-slate-100 hover:bg-[#131d33]'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </aside>
  );
}
