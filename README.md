# Investment Followup

Premium investment tracking dashboard. Dark futuristic UI with secure Google Sheets backend.

## Architecture

```
Browser (client)        Server (Next.js)            Google Sheets
─────────────────       ────────────────────        ──────────────
Login form        →     Supabase Auth
Dashboard UI      ←     Fetch + filter rows    ←    Service Account
(Recharts)              (by user email)             (read-only)
```

- **Auth**: Supabase email/password. Users created in Supabase dashboard.
- **Data**: Google Sheets read via `googleapis` with a service account. Server-side only.
- **Security**: Sheet ID, service account credentials, and raw data never reach the browser.
- **Charts**: Recharts with gradient fills, glow effects, glass tooltips.

## Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy your **Project URL** and **anon public key** from Settings → API
3. Create users: Authentication → Users → Add User (email + password)

### 2. Create Google Sheet

Create a Google Sheet with these columns in Row 1:

| user_id | channel_name | date | event_label | invested_amount | portfolio_value | note | marker_title | point_description | color | channel_type |
|---------|-------------|------|-------------|-----------------|-----------------|------|--------------|-------------------|-------|--------------|

- `user_id`: The user's **email address** (must match their Supabase login email)
- `channel_name`: e.g., "S&P 500", "Bitcoin", "Real Estate Fund"
- `date`: Any parseable format (ISO preferred: `2024-01-15`)
- `event_label`: e.g., "Initial deposit", "Market correction"
- `invested_amount`: Cumulative amount invested as of this date
- `portfolio_value`: Portfolio value on this date
- `note`: Optional note shown in tooltip
- `marker_title`: If set, this point gets a visual marker on the chart
- `point_description`: Description shown in marker tooltip
- `color`: Hex color override for this channel (e.g., `#00f0ff`)
- `channel_type`: Category label (e.g., "stocks", "crypto")

### 3. Set Up Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project (or use existing)
3. Enable **Google Sheets API**
4. Create a Service Account: IAM → Service Accounts → Create
5. Create a key: Keys tab → Add Key → JSON
6. Open the JSON file — you need `client_email` and `private_key`
7. Share your Google Sheet with the service account email (read-only viewer)

### 4. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

GOOGLE_SERVICE_ACCOUNT_EMAIL=name@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms
GOOGLE_SHEET_TAB=Sheet1
```

### 5. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push to GitHub
2. Import repo in [Vercel](https://vercel.com)
3. Add all env vars from `.env.local` into Vercel → Settings → Environment Variables
4. Deploy

**Important**: For `GOOGLE_PRIVATE_KEY` in Vercel, paste the full key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`, with literal `\n` for newlines.

## Security Model

| What | Where | Exposed to browser? |
|------|-------|-------------------|
| Google Sheet ID | `GOOGLE_SHEET_ID` env var | No |
| Service account email | `GOOGLE_SERVICE_ACCOUNT_EMAIL` env var | No |
| Service account private key | `GOOGLE_PRIVATE_KEY` env var | No |
| Raw sheet data | Server action only | No — filtered by user email |
| Supabase URL | `NEXT_PUBLIC_SUPABASE_URL` | Yes (public by design) |
| Supabase anon key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (public by design) |
| User session | HTTP-only cookie | Managed by Supabase |

The `google-sheets.ts` file uses `import "server-only"` which causes a build error if any client component tries to import it.

## File Tree

```
src/
├── app/
│   ├── globals.css              # Tailwind + glassmorphism + glow styles
│   ├── layout.tsx               # Root layout with fonts
│   ├── page.tsx                 # Redirect to /login or /dashboard
│   ├── login/
│   │   └── page.tsx             # Login page with glass card
│   └── (dashboard)/
│       ├── layout.tsx           # Auth-protected layout with header
│       └── dashboard/
│           ├── page.tsx         # Server: fetch data → client components
│           └── loading.tsx      # Skeleton loading state
├── components/
│   ├── auth/
│   │   ├── login-form.tsx       # Email + password form
│   │   └── logout-button.tsx    # Sign out button
│   ├── charts/
│   │   ├── portfolio-chart.tsx  # Aggregated area chart with markers
│   │   └── channel-chart.tsx    # Per-channel area chart
│   ├── dashboard/
│   │   ├── dashboard-client.tsx # Client wrapper with filtering
│   │   ├── summary-cards.tsx    # 6 metric cards
│   │   ├── filters.tsx          # Date range + channel filter
│   │   └── channel-card.tsx     # Channel card with stats + chart
│   └── ui/
│       └── glass-card.tsx       # Reusable glass panel
├── lib/
│   ├── types.ts                 # All TypeScript types
│   ├── data-transform.ts        # Normalize rows → chart data
│   ├── google-sheets.ts         # Server-only Google Sheets fetcher
│   └── supabase/
│       ├── client.ts            # Browser Supabase client
│       └── server.ts            # Server Supabase client
└── middleware.ts                # Auth route protection
```
