# CoachCRM

A lightweight CRM built specifically for business coaches. Manage clients, track sessions, automate check-ins, and share beautiful progress reports.

## Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Supabase (auth, database, RLS)
- **Styling:** Custom Shadcn-style components with Radix UI primitives
- **State:** TanStack Query
- **Routing:** React Router v6

## Features

- 🎯 **Landing page** — Hero, features, pricing ($29/$59/$99), testimonials
- 🔐 **Auth** — Email/password + Google OAuth via Supabase
- 📊 **Dashboard** — Today's sessions, stats, active clients
- 👥 **Clients** — Full CRUD, search/filter, status management
- 📅 **Sessions** — Schedule, notes, wins, blockers, homework
- ✅ **Homework tracker** — Per-session tasks with completion tracking
- 📈 **Progress reports** — Shareable client progress page
- 🔔 **Check-ins** — Client check-in management
- ⚙️ **Settings** — Profile, billing, email templates
- 🌙 **Dark mode** — Toggle in sidebar, persisted to localStorage
- 📱 **Responsive** — Works great on mobile

## Quick Start

### 1. Clone & Install

```bash
cd apps/coachcrm
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/migrations/001_initial.sql`
3. Enable Google OAuth in **Authentication → Providers** (optional)

### 3. Configure Environment

```bash
cp .env.example .env
```

Fill in your Supabase URL and anon key from **Project Settings → API**.

### 4. Run

```bash
npm run dev
```

Visit `http://localhost:5173`

## Deployment (Vercel)

1. Push to GitHub
2. Import repo in Vercel
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy — that's it.

## Database Schema

```
coaches          — Extended user profiles
clients          — Client records (goals, notes, status)
sessions         — Session notes, wins, blockers, homework
check_ins        — Between-session check-ins
progress_snapshots — Weekly progress snapshots
```

All tables use Row Level Security — every query is automatically scoped to the logged-in coach.

## Project Structure

```
src/
├── components/
│   ├── ui/           Shadcn-style components (Button, Card, etc.)
│   ├── layout/       Sidebar, AppLayout, MobileNav
├── hooks/
│   ├── useAuth.ts
│   ├── useClients.ts
│   ├── useSessions.ts
│   └── useTheme.ts
├── lib/
│   ├── supabase.ts
│   └── utils.ts
├── pages/
│   ├── Landing.tsx
│   ├── Login.tsx / Signup.tsx
│   ├── Dashboard.tsx
│   ├── Clients.tsx / ClientDetail.tsx
│   ├── Sessions.tsx / SessionDetail.tsx
│   ├── CheckIns.tsx
│   ├── ProgressReport.tsx
│   └── Settings.tsx
├── types/
│   └── index.ts
└── App.tsx           Router + auth guards
```

## Pricing Tiers (to wire up with Stripe)

| Plan    | Price | Clients |
|---------|-------|---------|
| Free    | $0    | 3       |
| Starter | $29   | 10      |
| Pro     | $59   | 30      |
| Agency  | $99   | ∞       |

## Adding Stripe

1. Create products/prices in Stripe Dashboard
2. Add `VITE_STRIPE_PUBLISHABLE_KEY` to env
3. Create Supabase Edge Function for checkout sessions
4. Wire the "Manage Billing" button in Settings to Stripe Customer Portal

## Adding Resend (Email)

1. Create Supabase Edge Function: `send-recap`
2. Use Resend SDK to send HTML emails
3. Wire the "Send Recap" button in SessionDetail to call the function
