# CoachCRM ⚡

> The CRM Built for Coaches

CoachCRM is a focused, modern CRM designed specifically for coaching professionals. Manage your clients, schedule sessions, send check-ins, and track your practice — all in one beautiful app.

---

## Features

- **Client Management** — Track clients with status, package, contact info, goals, and notes
- **Session Scheduling** — Schedule, manage, and recap coaching sessions
- **Calendar Week View** — Visual weekly calendar for sessions with day/time cards
- **Check-ins** — Send and track client check-ins between sessions
- **Progress Reports** — Generate client progress reports
- **CSV Import/Export** — Bulk import clients from CSV; export your client list anytime
- **Email Templates** — Customize Welcome, Session Recap, and Check-in Reminder emails
- **Global Search (Cmd+K)** — Instantly find clients and sessions from anywhere in the app
- **Dashboard** — At-a-glance stats: active clients, upcoming sessions, pending check-ins
- **Dark/Light Mode** — Full theme support

---

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions)
- **State:** TanStack Query
- **Routing:** React Router v6
- **Notifications:** Sonner (toasts)
- **Icons:** Lucide React
- **CSV Parsing:** Papa Parse

---

## Prerequisites

- Node 18+
- A [Supabase](https://supabase.com) account (free tier works)

---

## Setup

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd coachcrm
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these in your Supabase project: **Settings → API**.

### 4. Run the database migration

In your Supabase project's **SQL Editor**, run the migration from:

```
supabase/migrations/
```

This creates the required tables: `coaches`, `clients`, `sessions`, `check_ins`.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to see the app.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key |

---

## Deployment

### Vercel (Recommended)

1. Push your repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add your environment variables in the Vercel dashboard
4. Deploy — Vercel auto-detects Vite

### Other platforms

Build the app with:

```bash
npm run build
```

The output is in the `dist/` folder — serve it as a static site on any platform (Netlify, Cloudflare Pages, etc.).

---

## License

MIT
