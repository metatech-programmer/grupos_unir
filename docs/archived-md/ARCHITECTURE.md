# System Architecture

## Overview

```
┌─────────────────┐
│   Frontend      │  Next.js + React + Tailwind
│   (Next.js)     │  User Interface
└────────┬────────┘
         │
         │ API Routes
         │
┌─────────────────┐     ┌──────────────────────┐
│  API Routes     │────▶│  Supabase Backend    │
│  (Matching)     │     │  (PostgreSQL)        │
└────────┬────────┘     └──────────────────────┘
         │                         │
         │                         │
         └─────────────┬───────────┘
                       │
                       ▼
              ┌────────────────────┐
              │  Real-time Updates │
              │  WebSocket         │
              └────────────────────┘
```

## Database Schema

### Table: `users`
```sql
id (UUID)           -- Unique identifier
auth_id (UUID)      -- Supabase Auth ID
name (TEXT)         -- User's full name
email (TEXT)        -- Unique email address
country (TEXT)      -- Country code (e.g., es, co, pe)
timezone (TEXT)     -- IANA timezone (e.g., America/Bogota)
group_id (UUID)     -- Current group (foreign key)
created_at (DATE)   -- Registration date
```

### Table: `groups`
```sql
id (UUID)                 -- Unique identifier
name (TEXT)               -- Group name
subject (TEXT)            -- Subject area (Programming, Mathematics, etc.)
members (TEXT[])          -- Array of user IDs
member_count (INT)        -- Quick member count
max_size (INT)            -- Maximum allowed size (3-5)
timezone_coverage (TEXT[])-- Time zones represented in group
pros (TEXT[])             -- Group advantages
cons (TEXT[])             -- Group disadvantages
created_at (DATE)         -- Creation date
```

### Table: `group_members`
```sql
user_id (UUID)     -- User reference
group_id (UUID)    -- Group reference
joined_at (DATE)   -- Join date
```

## Matching Algorithm

### Compatibility Score Formula

The matching algorithm evaluates groups on multiple criteria with a maximum score of 100:

```
Timezone Compatibility (25 points max)
  - Compatible timezone (≤8 hour difference): 25 points
  - Incompatible timezone (>8 hours): 6 points

Schedule Overlap (25 points max)
  - 4+ overlapping hours: 25 points
  - 2-3 overlapping hours: 16 points
  - 1 overlapping hour: 8 points
  - Less than 1 hour: 0 points

Daily Hours Availability (20 points max)
  - Exact match: 20 points
  - ±1 hour difference: 15 points
  - ±2 hour difference: 8 points
  - >2 hours difference: 0 points

Work Style Compatibility (15 points max)
  - Matching work style or flexible: 15 points
  - Different work style: 6 points

Shared Activities (15 points max)
  - 2+ shared activities: 15 points
  - 1 shared activity: 9 points
  - No shared activities: 0 points

Group Size Adjustment (5 points bonus)
  - 2-3 members (ideal): +5 points
  - 4 members: +3 points
  - 5+ members: +1 point

Available Spaces Adjustment (5 points bonus)
  - 2+ open slots: +5 points
  - 1 open slot: +2 points
  - Group full: 0 points

Total Score: 0-100 points
```

### Implementation

The matching algorithm is implemented in `src/lib/ai-matching.ts` and:
- Evaluates all available groups for the current user
- Calculates compatibility score for each group
- Returns sorted recommendations (highest to lowest)
- Allows users to override recommendations

## Security

### Row Level Security (RLS) Policies

```sql
-- Users view only their own data
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = auth_id);

-- Public group visibility
CREATE POLICY "Anyone can view groups"
  ON groups FOR SELECT
  USING (true);

-- Only creators can edit their groups
CREATE POLICY "Only group creator can edit"
  ON groups FOR UPDATE
  USING (creator_id = auth.uid());
```

### Environment Variables

```env
# Public (safe to share)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...

# Private (never share)
# Service role key only used server-side (if needed)
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 15 | React framework |
| UI Framework | React 18 | Component library |
| Styling | Tailwind CSS | Utility-first CSS |
| Authentication | Supabase Auth | User management |
| Database | Supabase PostgreSQL | Data persistence |
| Type Safety | TypeScript | Static typing |
| Deployment | Vercel | Hosting |
| Real-time | Supabase Realtime | WebSocket updates |

## API Routes

### Available Endpoints

- `POST /api/account/delete` - Delete user account
- `POST /api/push/subscribe` - Subscribe to notifications
- `POST /api/push/unsubscribe` - Unsubscribe from notifications
- `POST /api/push/new-message` - Send push notification

This architecture is scalable, secure, and documented for seamless Vercel deployment with Supabase integration.
