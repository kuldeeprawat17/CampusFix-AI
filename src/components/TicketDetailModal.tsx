import React, { useState } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  Activity,
  Shield,
  Sparkles,
  Search,
  Brain,
  MapPin,
  Building,
  User as UserIcon,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { Ticket, TicketStatus } from '../utils/triage.ts';
import { CATEGORY_LABELS, PRIORITY_STYLES, STATUS_STYLES } from '../data/seedData.ts';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onUpdateTicket: (updated: Ticket) => Promise<void>;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  isOpen,
  onClose,
  isAdmin,
  onUpdateTicket,
}) => {
  if (!isOpen || !ticket) return null;

  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [assignedTo, setAssignedTo] = useState(ticket.assignedTo || '');
  const [resolutionNotes, setResolutionNotes] = useState(ticket.resolutionNotes || '');
  const [estimatedFixHours, setEstimatedFixHours] = useState(ticket.estimatedFixHours || 2);
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Search Grounding Diagnosis State
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<{ diagnosis: string; sources: Array<{ title: string; uri: string }> } | null>(null);

  // Thinking Mode Root Cause Analysis State
  const [isAnalyzingRC, setIsAnalyzingRC] = useState(false);
  const [rootCauseResult, setRootCauseResult] = useState<string | null>(null);

  const handleCopyId = () => {
    navigator.clipboard.writeText(ticket.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSaveChanges = async () => {
    setIsUpdating(true);
    try {
      const now = new Date().toISOString();
      const updated: Ticket = {
        ...ticket,
        status,
        assignedTo: assignedTo.trim() || undefined,
        resolutionNotes: resolutionNotes.trim() || undefined,
        estimatedFixHours: Number(estimatedFixHours) || undefined,
        updatedAt: now,
        resolvedAt: status === 'Resolved' ? (ticket.resolvedAt || now) : undefined,
      };

      await onUpdateTicket(updated);
      onClose();
    } catch (err) {
      console.error('Update ticket error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Run Search Grounded Diagnosis
  const handleRunSearchDiagnosis = async () => {
    setIsDiagnosing(true);
    try {
      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipment: `${ticket.category} in ${ticket.building}`,
          issueDescription: `${ticket.title}. Details: ${ticket.description}`,
        }),
      });
      const data = await res.json();
      setDiagnosisResult({
        diagnosis: data.diagnosis || 'Diagnosis completed.',
        sources: data.sources || [],
      });
    } catch (err) {
      console.error('Search diagnosis error:', err);
    } finally {
      setIsDiagnosing(false);
    }
  };

  // Run Thinking Mode Root-Cause Analysis
  const handleRunThinkingRC = async () => {
    setIsAnalyzingRC(true);
    try {
      const res = await fetch('/api/ai/root-cause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          building: ticket.building,
          failureHistory: `Frequent issues reported in ${ticket.roomNumber}. Current complaint: ${ticket.title} - ${ticket.description}`,
          issueDetails: ticket.description,
        }),
      });
      const data = await res.json();
      setRootCauseResult(data.analysis || 'Analysis complete.');
    } catch (err) {
      console.error('Root cause analysis error:', err);
    } finally {
      setIsAnalyzingRC(false);
    }
  };

  const priorityStyle = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.medium;
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.Reported;
  const categoryMeta = CATEGORY_LABELS[ticket.category] || CATEGORY_LABELS.other;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-white my-8 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg font-bold text-emerald-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              {ticket.id}
            </span>
            <button
              onClick={handleCopyId}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition flex items-center gap-1"
              title="Copy ID"
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId ? 'Copied' : 'Copy'}</span>
            </button>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${priorityStyle.badge}`}>
              {priorityStyle.label} Priority
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Title & Description */}
          <div>
            <h3 className="text-xl font-bold text-white mb-2">{ticket.title}</h3>
            <p className="text-sm text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed">
              {ticket.description}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 flex items-center gap-1 mb-1">
                <Building className="w-3.5 h-3.5" /> Building
              </span>
              <span className="font-semibold text-slate-200 block truncate">{ticket.building}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 flex items-center gap-1 mb-1">
                <MapPin className="w-3.5 h-3.5" /> Room / Area
              </span>
              <span className="font-semibold text-slate-200 block truncate">{ticket.roomNumber}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block mb-1">Category</span>
              <span className="font-semibold text-slate-200 block truncate">{categoryMeta.label}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 flex items-center gap-1 mb-1">
                <UserIcon className="w-3.5 h-3.5" /> Reported By
              </span>
              <span className="font-semibold text-slate-200 block truncate" title={ticket.authorEmail}>
                {ticket.authorName}
              </span>
            </div>
          </div>

          {/* AI / Rule-based Triage Note */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold flex items-center gap-1.5">
                {ticket.isRuleBasedTriage ? (
                  <span className="text-amber-400">⚡ Rule-Based Triage Applied</span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Gemini AI Triage Applied
                  </span>
                )}
              </span>
              <span className="text-slate-500 font-mono text-[11px]">
                Filed: {new Date(ticket.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-slate-300">
              {ticket.aiTriageNotes || 'Classified using standard campus maintenance criteria.'}
            </p>
          </div>

          {/* Admin Panel Controls: Status Workflow & Assignment */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">Maintenance Staff Workflow Panel</h4>
              </div>
              <span className="text-xs text-slate-400">
                {isAdmin ? 'Staff Access Granted' : 'Student Read-Only Mode'}
              </span>
            </div>

            {/* Status Workflow Selector: Reported -> In Progress -> Resolved */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Lifecycle Status Workflow
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Reported', 'In Progress', 'Resolved'] as TicketStatus[]).map((st) => {
                  const isCurrent = status === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      disabled={!isAdmin}
                      onClick={() => setStatus(st)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                        isCurrent
                          ? st === 'Reported'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm'
                            : st === 'In Progress'
                            ? 'bg-sky-500/20 text-sky-300 border-sky-500 shadow-sm'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200 disabled:opacity-60 disabled:hover:text-slate-400'
                      }`}
                    >
                      {st === 'Reported' && <Clock className="w-3.5 h-3.5" />}
                      {st === 'In Progress' && <Activity className="w-3.5 h-3.5" />}
                      {st === 'Resolved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>{st}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Assignment & Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Team / Technician</label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="e.g. Electrician Team B, IT Support"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-70"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Repair Time (Hours)</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  disabled={!isAdmin}
                  value={estimatedFixHours}
                  onChange={(e) => setEstimatedFixHours(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-70"
                />
              </div>
            </div>

            {/* Resolution Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Resolution / Inspection Notes
              </label>
              <textarea
                disabled={!isAdmin}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={2}
                placeholder="Details of repair action taken (e.g. Swapped capacitor, replaced 15m HDMI cable, reset router port, etc.)"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 resize-none disabled:opacity-70"
              />
            </div>
          </div>

          {/* AI Technician Diagnostic Tools */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Engineering & Safety Diagnostics</span>
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Google Search Grounding Button */}
              <button
                type="button"
                onClick={handleRunSearchDiagnosis}
                disabled={isDiagnosing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-200 border border-indigo-700/50 text-xs font-medium transition disabled:opacity-50"
              >
                {isDiagnosing ? (
                  <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                ) : (
                  <Search className="w-3 h-3 text-indigo-400" />
                )}
                <span>Search Equipment Specs & Safety Codes</span>
              </button>

              {/* Thinking Mode Button */}
              <button
                type="button"
                onClick={handleRunThinkingRC}
                disabled={isAnalyzingRC}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-900/40 hover:bg-teal-900/60 text-teal-200 border border-teal-700/50 text-xs font-medium transition disabled:opacity-50"
              >
                {isAnalyzingRC ? (
                  <Loader2 className="w-3 h-3 animate-spin text-teal-400" />
                ) : (
                  <Brain className="w-3 h-3 text-teal-400" />
                )}
                <span>High-Thinking Root-Cause Analysis</span>
              </button>
            </div>

            {/* Diagnosis Result View */}
            {diagnosisResult && (
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-100 space-y-2 mt-2">
                <span className="font-bold text-indigo-300 block">Google Search Grounded Diagnostic Guide:</span>
                <p className="whitespace-pre-line text-slate-300 text-[11px] leading-relaxed">
                  {diagnosisResult.diagnosis}
                </p>
                {diagnosisResult.sources.length > 0 && (
                  <div className="pt-2 border-t border-indigo-800/30">
                    <span className="text-[10px] text-slate-400 block mb-1">Sources & Grounding:</span>
                    <div className="flex flex-wrap gap-2">
                      {diagnosisResult.sources.map((s, idx) => (
                        <a
                          key={idx}
                          href={s.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 underline"
                        >
                          <span>{s.title}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Root Cause Result View */}
            {rootCauseResult && (
              <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-800/40 text-xs text-teal-100 space-y-2 mt-2">
                <span className="font-bold text-teal-300 block">Systemic Failure Root-Cause Analysis (Thinking Mode):</span>
                <p className="whitespace-pre-line text-slate-300 text-[11px] leading-relaxed">
                  {rootCauseResult}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/90">
          <span className="text-xs text-slate-400">
            Last updated: {new Date(ticket.updatedAt).toLocaleString()}
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition"
            >
              Close
            </button>
            {isAdmin && (
              <button
                onClick={handleSaveChanges}
                disabled={isUpdating}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition disabled:opacity-50 shadow-md"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Status & Notes</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
