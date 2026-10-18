import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Standard React Error Boundary
 * Catches rendering exceptions gracefully without crashing the whole application tree
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught exception:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-6 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-red-300">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span>Component Rendering Exception Handled</span>
          </div>
          <p className="text-slate-300 font-mono text-[11px]">
            {this.state.error?.message || 'An unexpected rendering error occurred'}
          </p>
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
            {this.props.onClose && (
              <button
                onClick={this.props.onClose}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
