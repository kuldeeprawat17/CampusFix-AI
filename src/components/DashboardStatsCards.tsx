import React from 'react';
import { DashboardStats, TicketStatus } from '../utils/triage.ts';
import { Layers, Clock, Activity, CheckCircle, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface DashboardStatsCardsProps {
  stats: DashboardStats;
  selectedStatus: TicketStatus | 'All';
  onSelectStatus: (status: TicketStatus | 'All') => void;
}

export const DashboardStatsCards: React.FC<DashboardStatsCardsProps> = ({
  stats,
  selectedStatus,
  onSelectStatus,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* 1. Total Complaints */}
      <div
        onClick={() => onSelectStatus('All')}
        className={`cursor-pointer p-4 rounded-xl border transition-all shadow-sm ${
          selectedStatus === 'All'
            ? 'bg-slate-900 border-slate-700 ring-2 ring-emerald-500/50'
            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Complaints</span>
          <Layers className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-extrabold text-white">{stats.total}</span>
          <span className="text-xs text-slate-400 flex items-center gap-0.5">
            Campus-wide <ArrowUpRight className="w-3 h-3 text-slate-500" />
          </span>
        </div>
      </div>

      {/* 2. Reported (Pending) */}
      <div
        onClick={() => onSelectStatus('Reported')}
        className={`cursor-pointer p-4 rounded-xl border transition-all shadow-sm ${
          selectedStatus === 'Reported'
            ? 'bg-amber-950/40 border-amber-500/60 ring-2 ring-amber-500/50'
            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-amber-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Reported (Pending)</span>
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-300">{stats.reported}</span>
          <span className="text-xs px-2 py-0.5 rounded font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Awaiting Staff
          </span>
        </div>
      </div>

      {/* 3. In Progress */}
      <div
        onClick={() => onSelectStatus('In Progress')}
        className={`cursor-pointer p-4 rounded-xl border transition-all shadow-sm ${
          selectedStatus === 'In Progress'
            ? 'bg-sky-950/40 border-sky-500/60 ring-2 ring-sky-500/50'
            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-sky-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
          <Activity className="w-4 h-4 text-sky-400 animate-spin" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-extrabold text-sky-300">{stats.inProgress}</span>
          <span className="text-xs px-2 py-0.5 rounded font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
            Assigned
          </span>
        </div>
      </div>

      {/* 4. Resolved */}
      <div
        onClick={() => onSelectStatus('Resolved')}
        className={`cursor-pointer p-4 rounded-xl border transition-all shadow-sm ${
          selectedStatus === 'Resolved'
            ? 'bg-emerald-950/40 border-emerald-500/60 ring-2 ring-emerald-500/50'
            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-emerald-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
          <CheckCircle className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-300">{stats.resolved}</span>
          <span className="text-xs px-2 py-0.5 rounded font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {stats.resolutionRate}% Rate
          </span>
        </div>
      </div>

      {/* Emergency Alert Banner if any emergency tickets exist */}
      {stats.emergency > 0 && (
        <div className="col-span-2 md:col-span-4 bg-red-950/40 border border-red-500/40 rounded-xl p-3 flex items-center justify-between text-red-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 animate-bounce" />
            <span className="text-xs sm:text-sm font-medium">
              <strong>{stats.emergency} Emergency issue(s)</strong> flagged by AI/Staff requiring immediate physical response (sparks/flooding/shock hazard).
            </span>
          </div>
          <button
            onClick={() => onSelectStatus('All')}
            className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 px-2.5 py-1 rounded font-semibold transition"
          >
            Review Urgent
          </button>
        </div>
      )}
    </div>
  );
};
