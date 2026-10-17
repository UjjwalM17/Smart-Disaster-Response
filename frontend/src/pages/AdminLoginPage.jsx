import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, User, Key, AlertCircle, ArrowRight } from 'lucide-react';

/* 
 * NOTE FOR PRODUCTION:
 * In a production architecture, this authentication flow would be delegated
 * to Spring Security with OAuth2/OIDC or JWT Bearer tokens issuing secure HttpOnly cookies,
 * validated against gateway-service.
 * For this hackathon/demonstration deployment, credentials are authenticated
 * client-side against VITE_ADMIN_USER and VITE_ADMIN_PASS, with session stored in sessionStorage.
 */

export const ADMIN_SESSION_KEY = 'resq_admin_session';

export function getAdminSession() {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAdminSession(userData) {
  sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(userData));
}

export function clearAdminSession() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Configured credentials from .env with secure defaults
  const expectedUser = import.meta.env.VITE_ADMIN_USER || 'admin';
  const expectedPass = import.meta.env.VITE_ADMIN_PASS || 'resq2026';

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (username.trim() === expectedUser && password.trim() === expectedPass) {
        setAdminSession({
          username: expectedUser,
          role: 'Lead Incident Commander',
          token: 'demo-jwt-token-hackathon-2026',
          authenticatedAt: new Date().toISOString(),
        });
        navigate('/admin');
      } else {
        setError('Invalid commander credentials. Check your username and password.');
        setLoading(false);
      }
    }, 400);
  };

  const handleQuickDemoFill = () => {
    setUsername(expectedUser);
    setPassword(expectedPass);
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-md bg-[#10182b] border border-blue-900/60 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-600/30">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-wide">RESQ COMMAND</h1>
            <p className="text-xs text-slate-400">
              National Incident Command & AI Triage Center
            </p>
          </div>
        </div>

        {/* Demo Hint Banner */}
        <div className="p-3 bg-blue-950/50 border border-blue-800/50 rounded-2xl text-[11px] text-blue-300 flex items-center justify-between">
          <span>Demo Credentials: <strong>admin</strong> / <strong>{expectedPass}</strong></span>
          <button
            type="button"
            onClick={handleQuickDemoFill}
            className="px-2 py-0.5 rounded-lg bg-blue-600/60 hover:bg-blue-500 text-white font-bold text-[10px] transition-colors"
          >
            Auto-fill
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-950/80 border border-red-700/60 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" /> Commander Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              required
              className="w-full bg-[#0d1629] text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-400" /> Access Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#0d1629] text-white px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Command Center'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800">
          <Link
            to="/"
            className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
          >
            &larr; Back to Citizen Disaster Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
