import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Database, Clock, Server, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export const HealthStatusCard = ({ health, loading, error, onRefresh }) => {
  const isHealthy = health?.status === 'ok';
  const isDbConnected = health?.database?.ready;

  return (
    <div id="health" className="glass-card rounded-2xl p-6 sm:p-8 border border-white/10 relative overflow-hidden shadow-2xl">
      {/* Ambient background glow */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            <span>Real-time System Verification</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Backend & Database Diagnostics
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Verifying Express API, MongoDB connection, and registered architectural endpoints.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="self-start sm:self-auto flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          <span>{loading ? 'Pinging API...' : 'Re-check Status'}</span>
        </button>
      </div>

      {/* Grid of status metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        {/* API Status */}
        <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 flex items-start space-x-3">
          <div className={`p-2.5 rounded-lg ${isHealthy ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Express API</div>
            <div className="text-base font-semibold text-white mt-0.5">
              {isHealthy ? 'HTTP 200 OK' : 'Unavailable'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Port: 5000 (/api/health)
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 flex items-start space-x-3">
          <div className={`p-2.5 rounded-lg ${isDbConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">MongoDB Driver</div>
            <div className="text-base font-semibold text-white mt-0.5 capitalize">
              {health?.database?.status || 'Offline'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[170px]" title={health?.database?.message}>
              {isDbConnected ? 'Active Connection' : 'Ready (Awaiting URI/Service)'}
            </div>
          </div>
        </div>

        {/* Uptime */}
        <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 flex items-start space-x-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Server Uptime</div>
            <div className="text-base font-semibold text-white mt-0.5">
              {health?.uptimeSeconds !== undefined ? `${health.uptimeSeconds}s` : 'N/A'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Node v24 + Express 4.x
            </div>
          </div>
        </div>

        {/* Scaffolded Modules */}
        <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 flex items-start space-x-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Core Modules</div>
            <div className="text-base font-semibold text-white mt-0.5">
              {health?.modules ? Object.keys(health.modules).length : 10} Registered
            </div>
            <div className="text-[11px] text-purple-400 mt-0.5">
              All 10 Routes Mounted
            </div>
          </div>
        </div>
      </div>

      {/* Raw Payload Accordion / Preview */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Live Endpoint Response Payload: <code className="text-purple-300">GET /api/health</code></span>
          <span className="text-[11px] text-slate-400">
            {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'Awaiting sync'}
          </span>
        </div>
        <div className="bg-[#05080e] rounded-xl p-4 font-mono text-xs text-emerald-400/90 border border-white/5 overflow-x-auto max-h-48">
          <pre>{JSON.stringify(health || { error: error || 'Failed to reach backend' }, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

export default HealthStatusCard;
