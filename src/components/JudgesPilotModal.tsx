import React from 'react';
import { X, Sparkles, CheckCircle2, QrCode, Smartphone, Users, BarChart3, Rocket, AlertTriangle } from 'lucide-react';

interface JudgesPilotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JudgesPilotModal: React.FC<JudgesPilotModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-white my-8 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">CampusFix AI — Pitch & Pilot Roadmap</h2>
              <p className="text-xs text-slate-400">Context for Judges & College Facility Evaluators</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs sm:text-sm">
          {/* Problem & Solution Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">The Problem</span>
            <p className="text-slate-300 leading-relaxed">
              In most colleges, infrastructure issues (fans, projectors, Wi-Fi deadzones, tube lights, and water leakage) are reported verbally or scattered across ad-hoc WhatsApp groups. Complaints are repeatedly lost, duplicates overwhelm staff, and students never receive status updates.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Our Solution & MVP</span>
            <p className="text-slate-300 leading-relaxed">
              <strong>CampusFix AI</strong> provides a transparent, centralized system where students file issues in under 30 seconds with automated AI triage, and maintenance staff track, prioritize, and update statuses from <strong>Reported → In Progress → Resolved</strong> in real time.
            </p>
          </div>

          {/* Today's 5 Core MVP Deliverables */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              Verified 5 Core MVP Features
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">1. Complaint Form</strong>
                  <span className="text-slate-400">Title, description, campus building, and room number.</span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">2. Unique Ticket ID</strong>
                  <span className="text-slate-400">CF-2026-XXXX format for tracking and verification.</span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">3. Live Dashboard</strong>
                  <span className="text-slate-400">Total, pending/reported, and resolved complaints counts.</span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">4. Admin Panel</strong>
                  <span className="text-slate-400">Status transitions (Reported → In Progress → Resolved).</span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2 col-span-1 sm:col-span-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">5. AI-Assisted Triage (Gemini + Rule-based Fallback)</strong>
                  <span className="text-slate-400">
                    Auto-categorizes issues and sets urgency; transparently labels whether triage was generated by Gemini AI or the offline rule-based fallback engine.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Next Step / Pilot Strategy */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-500/40 space-y-3">
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-indigo-400" />
              <h4 className="text-sm font-bold text-white">Next Step: Real College Maintenance Staff Pilot</h4>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              The immediate next step is executing a 4-week pilot deployment with real campus maintenance staff (starting with Engineering Block & Central Library):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <QrCode className="w-4 h-4 text-emerald-400 mb-1" />
                <strong className="text-slate-200 block">Classroom QR Stickers</strong>
                <span className="text-[11px] text-slate-400">Scan on desk or podium to auto-fill building and room.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <Smartphone className="w-4 h-4 text-sky-400 mb-1" />
                <strong className="text-slate-200 block">Staff Mobile Dispatch</strong>
                <span className="text-[11px] text-slate-400">Instant SMS / WhatsApp alerts for electricians & plumbers.</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <BarChart3 className="w-4 h-4 text-purple-400 mb-1" />
                <strong className="text-slate-200 block">Preventative Analytics</strong>
                <span className="text-[11px] text-slate-400">Identify recurring equipment failures before exam season.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end bg-slate-900/90">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition"
          >
            Got It, Back to App
          </button>
        </div>
      </div>
    </div>
  );
};
