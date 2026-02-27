# WhooshMD

AI-powered healthcare provider search that actually calls offices for you.

**Live at [whooshmd.com](https://whooshmd.com)**

---

WhooshMD helps you find healthcare providers and verify insurance + appointment availability in real time. The key feature: an AI voice agent (powered by Omnidim) that simultaneously calls up to 6 provider offices on your behalf, asks about your insurance, and reports back with structured results.

Provider data comes from the official NPI Registry — 50,000+ verified US providers.

## How it works

1. Search for providers by specialty, location, or name (NPI Registry)
2. Select up to 6 providers
3. The AI voice agent calls all of them in parallel
4. Results stream back: who accepts your insurance, who has availability, estimated wait times

## Architecture

```
app/api/
├── npi-search/      → NPI Registry proxy
├── make-calls/      → Dispatches parallel voice calls via Omnidim
├── call-results/    → Polls call status
└── webhook/         → Omnidim callback handlers

services/
├── omnidim.ts       → Voice AI integration (call orchestration)
├── community.ts     → Ratings, reviews, availability, insurance info
├── favorites.ts     → Saved providers
└── storage.ts       → Supabase data persistence
```

## Data model

All data lives in Supabase (PostgreSQL) with Row-Level Security on every table:

| Table | What it stores |
|-------|----------------|
| `call_results` | Voice call outcomes per provider |
| `favorites` | User's saved providers |
| `provider_ratings` | Community ratings |
| `provider_reviews` | Community reviews |
| `provider_availability` | Reported availability |
| `provider_insurance` | Insurance acceptance data |
| `provider_summary` | Aggregate view across all provider data |

## Privacy

HIPAA-aware by design. The app only collects first name, insurance type, and appointment preferences. No symptoms, diagnoses, or medical history — no PHI is stored.

## Tech

- Next.js 14 (App Router)
- TypeScript, Tailwind CSS 3
- Supabase (PostgreSQL + Auth + RLS)
- Omnidim (voice AI platform)
- NPI Registry API

## Development

```bash
npm install
npm run dev
```

Set `NEXT_PUBLIC_CALL_DISPATCH_MOCK=true` to run in mock mode without making real API calls.

See `scripts/sql/` for database migrations.

## License

MIT
