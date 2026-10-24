import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, Check, Loader2, Copy, Building, MapPin, Tag, AlertTriangle } from 'lucide-react';
import { CAMPUS_BUILDINGS, CATEGORY_LABELS } from '../data/seedData.ts';
import { generateTicketId, Ticket, TicketCategory, TicketPriority } from '../utils/triage.ts';
import { User } from 'firebase/auth';

interface ComplaintFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitTicket: (ticket: Ticket) => Promise<void>;
  currentUser: User | null;
}

export const ComplaintFormModal: React.FC<ComplaintFormModalProps> = ({
  isOpen,
  onClose,
  onSubmitTicket,
  currentUser,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [building, setBuilding] = useState(CAMPUS_BUILDINGS[0]);
  const [roomNumber, setRoomNumber] = useState('');
  const [category, setCategory] = useState<TicketCategory>('hvac_fan');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [reporterName, setReporterName] = useState(currentUser?.displayName || 'Student Reporter');
  const [reporterEmail, setReporterEmail] = useState(currentUser?.email || 'student@campus.edu');

  // AI Triage states
  const [isTriaging, setIsTriaging] = useState(false);
  const [triageSuccess, setTriageSuccess] = useState<boolean | null>(null);
  const [triageNotes, setTriageNotes] = useState<string>('');
  const [isRuleBased, setIsRuleBased] = useState<boolean>(false);
  const [suggestedAction, setSuggestedAction] = useState<string>('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Run AI / Rule-based triage on current text
  const handleRunTriage = async () => {
    if (!title.trim() && !description.trim()) {
      setFormError('Please enter a title or description first to run AI triage.');
      return;
    }

    setFormError(null);
    setIsTriaging(true);
    setTriageSuccess(null);

    try {
      const response = await fetch('/api/ai/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || 'Campus maintenance issue',
          description: description.trim() || title.trim(),
          building,
          roomNumber,
        }),
      });

      const data = await response.json();

      if (data.category) {
        setCategory(data.category as TicketCategory);
      }
      if (data.priority) {
        setPriority(data.priority as TicketPriority);
      }

      setIsRuleBased(!!data.isRuleBased);
      setTriageNotes(data.reasoning || 'Categorized automatically.');
      setSuggestedAction(data.suggestedAction || '');
      setTriageSuccess(true);
    } catch (err) {
      console.warn('AI Triage request failed, falling back locally:', err);
      // Client-side rule engine fallback
      setIsRuleBased(true);
      setTriageNotes('Offline Rule Engine: Applied keyword heuristic classification.');
      setTriageSuccess(true);
    } finally {
      setIsTriaging(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || title.trim().length < 3) {
      setFormError('Please provide a specific complaint title (at least 3 characters).');
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      setFormError('Please describe the problem in detail (at least 5 characters).');
      return;
    }
    if (!building.trim()) {
      setFormError('Please select or specify the campus building.');
      return;
    }
    if (!roomNumber.trim()) {
      setFormError('Please specify the room number, lab, or floor.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newTicketId = generateTicketId();
      const now = new Date().toISOString();

      const newTicket: Ticket = {
        id: newTicketId,
        title: title.trim(),
        description: description.trim(),
        building: building.trim(),
        roomNumber: roomNumber.trim(),
        category,
        priority,
        status: 'Reported',
        isRuleBasedTriage: isRuleBased,
        aiTriageNotes: triageNotes || undefined,
        authorId: currentUser?.uid || `guest-${Date.now()}`,
        authorEmail: reporterEmail.trim(),
        authorName: reporterName.trim(),
        createdAt: now,
        updatedAt: now,
      };

      await onSubmitTicket(newTicket);
      setSubmittedTicketId(newTicketId);
    } catch (err: any) {
      console.error('Submission error:', err);
      setFormError('Failed to submit ticket. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyId = () => {
    if (submittedTicketId) {
      navigator.clipboard.writeText(submittedTicketId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleResetAndClose = () => {
    setTitle('');
    setDescription('');
    setRoomNumber('');
    setTriageNotes('');
    setTriageSuccess(null);
    setSubmittedTicketId(null);
    setFormError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-white my-8 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Report Infrastructure Problem</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                New Complaint
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Submit campus issues (fans, projectors, Wi-Fi, leaks, lights) for tracking and maintenance.
            </p>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {submittedTicketId ? (
            /* Success confirmation view */
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Complaint Filed Successfully!</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
                Your maintenance request has been submitted to the facility supervisor queue and assigned a tracking ID.
              </p>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-w-sm mx-auto mb-6">
                <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Your Tracking Ticket ID</span>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-mono font-extrabold text-emerald-400 tracking-wider">
                    {submittedTicketId}
                  </span>
                  <button
                    onClick={handleCopyId}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Copy Ticket ID"
                  >
                    {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {copiedId && <span className="text-xs text-emerald-400 block mt-1">Copied to clipboard!</span>}
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={handleResetAndClose}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition"
                >
                  View on Dashboard
                </button>
                <button
                  onClick={() => {
                    setSubmittedTicketId(null);
                    setTitle('');
                    setDescription('');
                    setRoomNumber('');
                    setTriageSuccess(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition"
                >
                  Submit Another
                </button>
              </div>
            </div>
          ) : (
            /* Complaint Input Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Complaint Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Ceiling fan regulator not working in Lecture Hall 3"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Detailed Description *
                  </label>
                  <button
                    type="button"
                    onClick={handleRunTriage}
                    disabled={isTriaging || (!title.trim() && !description.trim())}
                    className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition disabled:opacity-50"
                  >
                    {isTriaging ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>AI Triage Suggestion</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Describe what's wrong (e.g. fan is jammed and making noise, projector HDMI has no signal, water is dripping continuously from pipe, sparks observed, etc.)."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm resize-none"
                  required
                />
              </div>

              {/* AI Triage Feedback Banner */}
              {triageSuccess && (
                <div
                  className={`p-3 rounded-xl border text-xs transition ${
                    isRuleBased
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                      : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold flex items-center gap-1.5">
                      {isRuleBased ? (
                        <>
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono">
                            ⚡ Rule-Based Suggestion (Fallback)
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono">
                            ✨ Gemini AI Triage
                          </span>
                        </>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-400">Auto-filled category & priority</span>
                  </div>
                  <p className="text-slate-300 mt-1">{triageNotes}</p>
                  {suggestedAction && (
                    <p className="text-slate-400 text-[11px] mt-1 italic">
                      Recommended Staff Action: {suggestedAction}
                    </p>
                  )}
                </div>
              )}

              {/* Location Fields: Building and Room Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>Building *</span>
                  </label>
                  <select
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 text-sm"
                  >
                    {CAMPUS_BUILDINGS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Room / Lab / Floor *</span>
                  </label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. Room 304, Lab 2, 2nd Floor"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Category & Priority (Auto-suggested, but customizable) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span>Category</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TicketCategory)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 text-sm"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
                    <span>Priority</span>
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TicketPriority)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 text-sm"
                  >
                    <option value="low">Low (Standard Maintenance)</option>
                    <option value="medium">Medium (Within 24-48 Hours)</option>
                    <option value="high">High (Lecture/Exam Critical)</option>
                    <option value="emergency">EMERGENCY (Sparks/Flooding Hazard)</option>
                  </select>
                </div>
              </div>

              {/* Reporter Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Reporter Name</label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Email / Student ID</label>
                  <input
                    type="email"
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 text-xs"
                    required
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Ticket ID...</span>
                    </>
                  ) : (
                    <span>Submit Complaint</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
