import React from 'react';
import {
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus
} from '../utils/triage.ts';
import {
  CATEGORY_LABELS,
  PRIORITY_STYLES,
  STATUS_STYLES,
  CAMPUS_BUILDINGS
} from '../data/seedData.ts';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Sparkles,
  Copy,
  Check,
  ChevronRight,
  Shield,
  Activity,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface TicketListProps {
  tickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
  isAdmin: boolean;
  onQuickStatusChange: (ticket: Ticket, nextStatus: TicketStatus) => void;
  // Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: TicketCategory | 'All';
  setSelectedCategory: (c: TicketCategory | 'All') => void;
  selectedPriority: TicketPriority | 'All';
  setSelectedPriority: (p: TicketPriority | 'All') => void;
  selectedBuilding: string | 'All';
  setSelectedBuilding: (b: string | 'All') => void;
  onlyMyTickets: boolean;
  setOnlyMyTickets: (val: boolean) => void;
  currentUserId?: string;
}

export const TicketList: React.FC<TicketListProps> = ({
  tickets,
  onSelectTicket,
  isAdmin,
  onQuickStatusChange,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedPriority,
  setSelectedPriority,
  selectedBuilding,
  setSelectedBuilding,
  onlyMyTickets,
  setOnlyMyTickets,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search bar */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Ticket ID (e.g. CF-2026-1041), title, room..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Building filter */}
          <div className="md:col-span-3">
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Campus Buildings</option>
              {CAMPUS_BUILDINGS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div className="md:col-span-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as TicketCategory | 'All')}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority filter */}
          <div className="md:col-span-2">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as TicketPriority | 'All')}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Priorities</option>
              <option value="emergency">Emergency Only</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Pill Buttons */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider mr-1">
              Quick Filter:
            </span>
            <button
              onClick={() => {
                setSelectedPriority('emergency');
              }}
              className={`px-2.5 py-1 rounded-lg border font-semibold transition flex items-center gap-1 ${
                selectedPriority === 'emergency'
                  ? 'bg-red-500/20 text-red-300 border-red-500'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span>Emergency ({tickets.filter(t => t.priority === 'emergency').length})</span>
            </button>
            <button
              onClick={() => setSelectedCategory('hvac_fan')}
              className={`px-2.5 py-1 rounded-lg border font-semibold transition ${
                selectedCategory === 'hvac_fan'
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300'
              }`}
            >
              Fans ({tickets.filter(t => t.category === 'hvac_fan').length})
            </button>
            <button
              onClick={() => setSelectedCategory('av_projector')}
              className={`px-2.5 py-1 rounded-lg border font-semibold transition ${
                selectedCategory === 'av_projector'
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300'
              }`}
            >
              Projectors ({tickets.filter(t => t.category === 'av_projector').length})
            </button>
            <button
              onClick={() => setSelectedCategory('internet_wifi')}
              className={`px-2.5 py-1 rounded-lg border font-semibold transition ${
                selectedCategory === 'internet_wifi'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300'
              }`}
            >
              Wi-Fi ({tickets.filter(t => t.category === 'internet_wifi').length})
            </button>
            <button
              onClick={() => setSelectedCategory('plumbing')}
              className={`px-2.5 py-1 rounded-lg border font-semibold transition ${
                selectedCategory === 'plumbing'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-300'
              }`}
            >
              Water Leaks ({tickets.filter(t => t.category === 'plumbing').length})
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedPriority('All');
              setSelectedBuilding('All');
              setSearchQuery('');
            }}
            className="text-slate-400 hover:text-slate-200 transition text-[11px] underline"
          >
            Reset All Filters
          </button>
        </div>
      </div>

      {/* Ticket Cards Grid / Feed */}
      {tickets.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <Clock className="w-10 h-10 mx-auto text-slate-600 mb-3" />
          <h4 className="text-base font-bold text-slate-200 mb-1">No matching maintenance tickets found</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Try resetting your search query or building/category filter.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedPriority('All');
              setSelectedBuilding('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            Show All Tickets
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const priorityMeta = PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.medium;
            const statusMeta = STATUS_STYLES[ticket.status] || STATUS_STYLES.Reported;
            const categoryMeta = CATEGORY_LABELS[ticket.category] || CATEGORY_LABELS.other;

            return (
              <div
                key={ticket.id}
                onClick={() => onSelectTicket(ticket)}
                className="group cursor-pointer bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
                  {/* Left: ID & Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs sm:text-sm font-bold text-emerald-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                      {ticket.id}
                    </span>
                    <button
                      onClick={(e) => handleCopy(e, ticket.id)}
                      className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition text-xs flex items-center gap-1"
                      title="Copy Ticket ID"
                    >
                      {copiedId === ticket.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Priority Badge */}
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${priorityMeta.badge}`}>
                      {priorityMeta.label}
                    </span>

                    {/* Category Pill */}
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${categoryMeta.color}`}>
                      {categoryMeta.label}
                    </span>

                    {/* AI / Rule Indicator */}
                    {ticket.isRuleBasedTriage ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                        ⚡ Rule-Based
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-mono">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-400" /> AI Triaged
                      </span>
                    )}
                  </div>

                  {/* Right: Status Badge & Admin Fast Transition */}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-lg font-bold border ${statusMeta.badge}`}>
                      {statusMeta.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition transform group-hover:translate-x-0.5" />
                  </div>
                </div>

                {/* Title & Description */}
                <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition mb-1">
                  {ticket.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                  {ticket.description}
                </p>

                {/* Footer Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-800/80 text-xs text-slate-400">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1 text-slate-300 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {ticket.building} • <strong className="text-white">{ticket.roomNumber}</strong>
                    </span>
                    {ticket.assignedTo && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Shield className="w-3 h-3 text-sky-400" />
                        Staff: <strong className="text-slate-300">{ticket.assignedTo}</strong>
                      </span>
                    )}
                  </div>

                  {/* Admin Fast Workflow Buttons */}
                  {isAdmin && (
                    <div
                      className="flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-[11px] text-slate-500 mr-1">Admin Action:</span>
                      {ticket.status !== 'In Progress' && ticket.status !== 'Resolved' && (
                        <button
                          onClick={() => onQuickStatusChange(ticket, 'In Progress')}
                          className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 transition flex items-center gap-1"
                        >
                          <Activity className="w-2.5 h-2.5" /> Start Progress
                        </button>
                      )}
                      {ticket.status !== 'Resolved' && (
                        <button
                          onClick={() => onQuickStatusChange(ticket, 'Resolved')}
                          className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" /> Mark Resolved
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
