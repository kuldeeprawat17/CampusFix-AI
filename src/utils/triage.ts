/**
 * Core utility functions for CampusFix AI:
 * - Ticket ID generator
 * - Rule-based triage fallback engine
 * - State machine validation
 * - Dashboard stats calculation
 * - Filtering and search logic
 */

export type TicketCategory =
  | 'electrical'
  | 'hvac_fan'
  | 'av_projector'
  | 'plumbing'
  | 'internet_wifi'
  | 'furniture'
  | 'civil_structural'
  | 'other';

export type TicketPriority = 'low' | 'medium' | 'high' | 'emergency';

export type TicketStatus = 'Reported' | 'In Progress' | 'Resolved';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  building: string;
  roomNumber: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  isRuleBasedTriage?: boolean;
  aiTriageNotes?: string;
  authorId: string;
  authorEmail: string;
  authorName: string;
  assignedTo?: string;
  resolutionNotes?: string;
  estimatedFixHours?: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface TriageResult {
  category: TicketCategory;
  priority: TicketPriority;
  isRuleBased: boolean;
  reasoning: string;
  suggestedAction?: string;
}

/**
 * Generate a unique readable ticket ID: CF-2026-XXXX
 */
export function generateTicketId(randomSeed?: number): string {
  const year = 2026;
  const num = randomSeed !== undefined 
    ? String(randomSeed).padStart(4, '0')
    : String(Math.floor(1000 + Math.random() * 9000));
  return `CF-${year}-${num}`;
}

/**
 * Intelligent Rule-Based Triage Engine (Fallback for when AI API is unavailable)
 * Identifies category, priority, and hazard assessment based on campus infrastructure patterns.
 */
export function ruleBasedTriage(title: string, description: string): TriageResult {
  const combined = `${title} ${description}`.toLowerCase();

  // 1. Check for Emergency hazards first (Electrical shock, open flames, heavy flooding, chemical smell)
  const emergencyKeywords = [
    'spark', 'shock', 'short circuit', 'current', 'wire hanging', 'open wire', 
    'smoke', 'fire', 'burning', 'heavy leak', 'burst pipe', 'flooding', 'ceiling collapse', 'gas smell'
  ];
  const isEmergency = emergencyKeywords.some(kw => combined.includes(kw));

  // 2. Category matching rules
  let category: TicketCategory = 'other';
  let reasoning = 'Categorized using standard campus facility heuristics.';

  if (
    combined.includes('fan') || 
    combined.includes('ceiling fan') || 
    combined.includes('ac') || 
    combined.includes('air conditioner') || 
    combined.includes('hvac') || 
    combined.includes('heater') || 
    combined.includes('cooler') || 
    combined.includes('ventilation')
  ) {
    category = 'hvac_fan';
    reasoning = 'Detected fan, cooling, or climate control issue keywords.';
  } else if (
    combined.includes('projector') || 
    combined.includes('hdmi') || 
    combined.includes('screen') || 
    combined.includes('audio') || 
    combined.includes('mic') || 
    combined.includes('speaker') || 
    combined.includes('display') || 
    combined.includes('podium')
  ) {
    category = 'av_projector';
    reasoning = 'Detected classroom audiovisual / projector keywords.';
  } else if (
    combined.includes('wifi') || 
    combined.includes('wi-fi') || 
    combined.includes('internet') || 
    combined.includes('ethernet') || 
    combined.includes('lan') || 
    combined.includes('router') || 
    combined.includes('no connection') ||
    combined.includes('slow speed')
  ) {
    category = 'internet_wifi';
    reasoning = 'Detected campus network / Wi-Fi connectivity keywords.';
  } else if (
    combined.includes('leak') || 
    combined.includes('water') || 
    combined.includes('tap') || 
    combined.includes('pipe') || 
    combined.includes('washroom') || 
    combined.includes('toilet') || 
    combined.includes('drain') || 
    combined.includes('flush') || 
    combined.includes('sink')
  ) {
    category = 'plumbing';
    reasoning = 'Detected plumbing, water fixture, or sanitary facility keywords.';
  } else if (
    combined.includes('light') || 
    combined.includes('bulb') || 
    combined.includes('tube light') || 
    combined.includes('switch') || 
    combined.includes('socket') || 
    combined.includes('plug') || 
    combined.includes('power cut') || 
    combined.includes('mcb') || 
    combined.includes('fuse')
  ) {
    category = 'electrical';
    reasoning = 'Detected electrical wiring, switch, or lighting fixture keywords.';
  } else if (
    combined.includes('desk') || 
    combined.includes('bench') || 
    combined.includes('chair') || 
    combined.includes('table') || 
    combined.includes('podium') || 
    combined.includes('blackboard') || 
    combined.includes('whiteboard') || 
    combined.includes('door') || 
    combined.includes('lock') || 
    combined.includes('window')
  ) {
    category = 'furniture';
    reasoning = 'Detected classroom furniture, seating, or doorway keywords.';
  } else if (
    combined.includes('crack') || 
    combined.includes('wall') || 
    combined.includes('tile') || 
    combined.includes('stairs') || 
    combined.includes('roof') || 
    combined.includes('railing') || 
    combined.includes('plaster')
  ) {
    category = 'civil_structural';
    reasoning = 'Detected civil or structural infrastructure damage keywords.';
  }

  // 3. Priority Assignment
  let priority: TicketPriority = 'medium';

  if (isEmergency) {
    priority = 'emergency';
    reasoning += ' Flagged as EMERGENCY due to potential safety/electrical/flood hazard.';
  } else if (
    combined.includes('exam') || 
    combined.includes('urgent') || 
    combined.includes('lecture') || 
    combined.includes('lab exam') || 
    combined.includes('presentation') || 
    combined.includes('auditorium') || 
    combined.includes('blocking') ||
    combined.includes('library')
  ) {
    priority = 'high';
    reasoning += ' High priority assigned because academic session/classroom impact is immediate.';
  } else if (
    combined.includes('creaking') || 
    combined.includes('scratched') || 
    combined.includes('loose screw') || 
    combined.includes('minor') || 
    combined.includes('paint')
  ) {
    priority = 'low';
    reasoning += ' Low priority assigned: cosmetic or non-critical item.';
  }

  return {
    category,
    priority,
    isRuleBased: true,
    reasoning,
    suggestedAction: isEmergency 
      ? 'Alert facility security and disconnect localized circuit breaker.'
      : 'Queue for campus technician duty roster.'
  };
}

/**
 * Validate ticket status transition
 */
export function canTransitionStatus(
  currentStatus: TicketStatus,
  nextStatus: TicketStatus,
  isAdminUser: boolean
): boolean {
  if (currentStatus === nextStatus) return true;
  if (!isAdminUser) return false;

  const validTransitions: Record<TicketStatus, TicketStatus[]> = {
    'Reported': ['In Progress', 'Resolved'],
    'In Progress': ['Resolved', 'Reported'],
    'Resolved': ['In Progress', 'Reported'] // Admins can reopen if needed
  };

  return validTransitions[currentStatus]?.includes(nextStatus) ?? false;
}

/**
 * Calculate aggregate statistics for dashboard
 */
export interface DashboardStats {
  total: number;
  reported: number;
  inProgress: number;
  resolved: number;
  emergency: number;
  resolutionRate: number;
  categoryCounts: Record<TicketCategory, number>;
}

export function calculateDashboardStats(tickets: Ticket[]): DashboardStats {
  const total = tickets.length;
  let reported = 0;
  let inProgress = 0;
  let resolved = 0;
  let emergency = 0;

  const categoryCounts: Record<TicketCategory, number> = {
    electrical: 0,
    hvac_fan: 0,
    av_projector: 0,
    plumbing: 0,
    internet_wifi: 0,
    furniture: 0,
    civil_structural: 0,
    other: 0,
  };

  for (const t of tickets) {
    if (t.status === 'Reported') reported++;
    else if (t.status === 'In Progress') inProgress++;
    else if (t.status === 'Resolved') resolved++;

    if (t.priority === 'emergency') emergency++;
    if (categoryCounts[t.category] !== undefined) {
      categoryCounts[t.category]++;
    } else {
      categoryCounts.other++;
    }
  }

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return {
    total,
    reported,
    inProgress,
    resolved,
    emergency,
    resolutionRate,
    categoryCounts
  };
}

/**
 * Search and Filter helper
 */
export interface TicketFilterOptions {
  searchQuery?: string;
  status?: TicketStatus | 'All';
  category?: TicketCategory | 'All';
  priority?: TicketPriority | 'All';
  building?: string | 'All';
  onlyMyTickets?: boolean;
  currentUserId?: string;
}

export function filterTickets(tickets: Ticket[], options: TicketFilterOptions): Ticket[] {
  return tickets.filter(ticket => {
    // Search query
    if (options.searchQuery && options.searchQuery.trim() !== '') {
      const q = options.searchQuery.toLowerCase().trim();
      const matchId = ticket.id.toLowerCase().includes(q);
      const matchTitle = ticket.title.toLowerCase().includes(q);
      const matchDesc = ticket.description.toLowerCase().includes(q);
      const matchBuilding = ticket.building.toLowerCase().includes(q);
      const matchRoom = ticket.roomNumber.toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchDesc && !matchBuilding && !matchRoom) {
        return false;
      }
    }

    // Status filter
    if (options.status && options.status !== 'All' && ticket.status !== options.status) {
      return false;
    }

    // Category filter
    if (options.category && options.category !== 'All' && ticket.category !== options.category) {
      return false;
    }

    // Priority filter
    if (options.priority && options.priority !== 'All' && ticket.priority !== options.priority) {
      return false;
    }

    // Building filter
    if (options.building && options.building !== 'All' && ticket.building !== options.building) {
      return false;
    }

    // My tickets filter
    if (options.onlyMyTickets && options.currentUserId && ticket.authorId !== options.currentUserId) {
      return false;
    }

    return true;
  });
}
