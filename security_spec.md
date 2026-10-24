# Security Spec: CampusFix AI

## 1. Data Invariants
- A ticket cannot be created without a valid string ID, title, description, building, roomNumber, category, priority, status ('Reported'), and matching authorId (which must strictly match `request.auth.uid`).
- Non-admin students can only read all tickets (for campus transparency, duplicates prevention, and status checking) or read their own tickets.
- Only the original reporter or an administrator can edit an open ticket.
- Status changes (Reported -> In Progress -> Resolved) and assignment can only be performed by administrators/campus staff or with explicit transition rules.
- When resolved, tickets cannot be arbitrarily altered without admin authorization.
- Admin role is bootstrapped for `kdeepsingh.rawat@gmail.com` and users documented in the `/admins` collection.

## 2. The Dirty Dozen Payloads
1. **Unauthenticated ticket creation**: Attempting to post ticket without auth token. Expected: PERMISSION_DENIED.
2. **Author UID spoofing**: Authenticated user 'alice' submits `authorId: 'bob'`. Expected: PERMISSION_DENIED.
3. **Ghost fields injection**: User injects hidden field `isSuperAdmin: true` or `bypassed: 1`. Expected: PERMISSION_DENIED.
4. **ID poisoning**: Document ID greater than 128 chars or containing path traversal characters like `../../admin`. Expected: PERMISSION_DENIED.
5. **Direct Status Manipulation to Resolved on Create**: Creating a new ticket already set to `status: 'Resolved'`. Expected: PERMISSION_DENIED.
6. **Student self-escalation to Admin**: Writing a doc directly into `/admins/{myUid}`. Expected: PERMISSION_DENIED.
7. **Title/Description payload bomb**: Submitting 5MB string in description to exhaust resources. Expected: PERMISSION_DENIED.
8. **Invalid category injection**: Submitting `category: 'hacked_category'`. Expected: PERMISSION_DENIED.
9. **Invalid priority injection**: Submitting `priority: 'ultra_critical_bypass'`. Expected: PERMISSION_DENIED.
10. **Terminal State Lock breaking**: Non-admin attempting to change resolution details of an already closed ticket. Expected: PERMISSION_DENIED.
11. **Timestamp spoofing**: Setting `createdAt` to arbitrary future dates.
12. **Modifying immutable authorId**: User updates existing ticket and swaps `authorId` to another user. Expected: PERMISSION_DENIED.
