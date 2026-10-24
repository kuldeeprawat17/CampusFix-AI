import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateTicketId,
  ruleBasedTriage,
  canTransitionStatus,
  calculateDashboardStats,
  filterTickets,
  Ticket
} from './triage';

test('generateTicketId produces formatted CF-2026-XXXX string', () => {
  const id1 = generateTicketId(1234);
  assert.equal(id1, 'CF-2026-1234');

  const randomId = generateTicketId();
  assert.match(randomId, /^CF-2026-\d{4}$/);
});

test('ruleBasedTriage detects electrical emergency hazards', () => {
  const result = ruleBasedTriage('Switch board sparking in Lab 3', 'There was a loud pop and sparks coming out of the socket.');
  assert.equal(result.category, 'electrical');
  assert.equal(result.priority, 'emergency');
  assert.equal(result.isRuleBased, true);
  assert.match(result.reasoning, /emergency/i);
});

test('ruleBasedTriage detects projector AV issues with high urgency for lecture', () => {
  const result = ruleBasedTriage('Projector HDMI not displaying', 'During morning lecture in Hall A the projector screen remains blue.');
  assert.equal(result.category, 'av_projector');
  assert.equal(result.priority, 'high');
});

test('ruleBasedTriage detects plumbing water leakage', () => {
  const result = ruleBasedTriage('Water tap leaking continuously', 'Washroom 2nd floor tap has loose valve.');
  assert.equal(result.category, 'plumbing');
  assert.equal(result.priority, 'medium');
});

test('ruleBasedTriage categorizes Wi-Fi network drop', () => {
  const result = ruleBasedTriage('Hostel 3 Wi-Fi router down', 'No internet connection since 2 hours.');
  assert.equal(result.category, 'internet_wifi');
});

test('canTransitionStatus validates permissions and legal steps', () => {
  // Non-admin cannot transition
  assert.equal(canTransitionStatus('Reported', 'In Progress', false), false);

  // Admin transitions
  assert.equal(canTransitionStatus('Reported', 'In Progress', true), true);
  assert.equal(canTransitionStatus('In Progress', 'Resolved', true), true);
  assert.equal(canTransitionStatus('Resolved', 'In Progress', true), true);
});

test('calculateDashboardStats aggregates metrics accurately', () => {
  const sampleTickets: Ticket[] = [
    {
      id: 'CF-2026-0001',
      title: 'Ceiling fan making clicking sound',
      description: 'Slow speed and squeaking',
      building: 'Main Academic Block',
      roomNumber: 'Room 101',
      category: 'hvac_fan',
      priority: 'low',
      status: 'Reported',
      authorId: 'user-1',
      authorEmail: 's1@college.edu',
      authorName: 'Aman',
      createdAt: '2026-10-20T10:00:00Z',
      updatedAt: '2026-10-20T10:00:00Z',
    },
    {
      id: 'CF-2026-0002',
      title: 'Water pipe leaking under sink',
      description: 'Slow drip',
      building: 'Science Wing',
      roomNumber: 'Chemistry Lab',
      category: 'plumbing',
      priority: 'medium',
      status: 'In Progress',
      authorId: 'user-2',
      authorEmail: 's2@college.edu',
      authorName: 'Riya',
      createdAt: '2026-10-21T11:00:00Z',
      updatedAt: '2026-10-21T11:30:00Z',
    },
    {
      id: 'CF-2026-0003',
      title: 'Wi-Fi access point offline',
      description: 'Restored after reset',
      building: 'Library',
      roomNumber: 'Floor 2',
      category: 'internet_wifi',
      priority: 'high',
      status: 'Resolved',
      authorId: 'user-1',
      authorEmail: 's1@college.edu',
      authorName: 'Aman',
      createdAt: '2026-10-19T09:00:00Z',
      updatedAt: '2026-10-19T14:00:00Z',
    },
    {
      id: 'CF-2026-0004',
      title: 'Sparking wire near door',
      description: 'Live wire exposed',
      building: 'Hostel 3',
      roomNumber: 'Corridor',
      category: 'electrical',
      priority: 'emergency',
      status: 'Reported',
      authorId: 'user-3',
      authorEmail: 's3@college.edu',
      authorName: 'Karan',
      createdAt: '2026-10-22T08:00:00Z',
      updatedAt: '2026-10-22T08:00:00Z',
    }
  ];

  const stats = calculateDashboardStats(sampleTickets);
  assert.equal(stats.total, 4);
  assert.equal(stats.reported, 2);
  assert.equal(stats.inProgress, 1);
  assert.equal(stats.resolved, 1);
  assert.equal(stats.emergency, 1);
  assert.equal(stats.resolutionRate, 25); // 1 / 4 = 25%
  assert.equal(stats.categoryCounts.hvac_fan, 1);
  assert.equal(stats.categoryCounts.plumbing, 1);
  assert.equal(stats.categoryCounts.internet_wifi, 1);
  assert.equal(stats.categoryCounts.electrical, 1);
});

test('filterTickets correctly filters by query, status, and user', () => {
  const sampleTickets: Ticket[] = [
    {
      id: 'CF-2026-1001',
      title: 'Projector remote missing',
      description: 'Cannot turn on in Hall B',
      building: 'Auditorium',
      roomNumber: 'Hall B',
      category: 'av_projector',
      priority: 'medium',
      status: 'Reported',
      authorId: 'user-abc',
      authorEmail: 'a@c.edu',
      authorName: 'Alok',
      createdAt: '2026-10-20T10:00:00Z',
      updatedAt: '2026-10-20T10:00:00Z',
    },
    {
      id: 'CF-2026-1002',
      title: 'Desk cracked in room 201',
      description: 'Sharp edge on wooden bench',
      building: 'Main Block',
      roomNumber: '201',
      category: 'furniture',
      priority: 'low',
      status: 'In Progress',
      authorId: 'user-xyz',
      authorEmail: 'x@c.edu',
      authorName: 'Xavier',
      createdAt: '2026-10-21T10:00:00Z',
      updatedAt: '2026-10-21T10:00:00Z',
    }
  ];

  const filteredQuery = filterTickets(sampleTickets, { searchQuery: 'projector' });
  assert.equal(filteredQuery.length, 1);
  assert.equal(filteredQuery[0].id, 'CF-2026-1001');

  const filteredMyTickets = filterTickets(sampleTickets, { onlyMyTickets: true, currentUserId: 'user-xyz' });
  assert.equal(filteredMyTickets.length, 1);
  assert.equal(filteredMyTickets[0].id, 'CF-2026-1002');
});
