# WhooshMD

**AI-Powered Healthcare Provider Search & Appointment Booking Platform**

WhooshMD tackles one of healthcare's biggest frustrations: finding a doctor who actually takes your insurance and has availability. Our AI voice agent calls provider offices on your behalf, verifying insurance acceptance and real-time appointment slots so you can book with confidence.

## The Problem We Solve

Finding a healthcare provider shouldn't require:
- Hours of phone calls to verify insurance acceptance
- Outdated availability information on booking sites
- Surprise bills from out-of-network providers
- Endless hold times just to check if a doctor is taking new patients

WhooshMD automates this entire process with AI voice agents that handle the tedious calls for you.

## Key Features

### AI Voice Agent
- Calls up to 6 provider offices simultaneously
- Verifies real-time appointment availability
- Confirms insurance acceptance before you book
- Extracts detailed appointment information (types, timeframes, requirements)

### Provider Search
- Powered by the official NPI Registry (50K+ verified providers)
- Filter by specialty, location, and insurance type
- Save favorites for quick access
- Track your search and call history

### Smart Appointment Matching
- Collects your preferences (urgency, appointment type, insurance)
- Returns only relevant, available slots
- HIPAA-compliant data handling (first name only, no medical details)

### User Experience
- Clean, mobile-first design
- Supabase authentication for secure access
- Persistent favorites and call history
- Real-time call status updates

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS |
| Authentication | Supabase Auth |
| Database | Supabase (PostgreSQL) with RLS |
| Voice AI | Omnidim API |
| Provider Data | NPI Registry API |
| Icons | Lucide React |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  Next.js 14 App Router + React + TypeScript + Tailwind      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Routes                              │
│  /api/npi-search    - Provider search proxy                 │
│  /api/make-calls    - Voice call dispatch                   │
│  /api/call-results  - Call status & results                 │
│  /api/webhook/*     - Omnidim callback handlers             │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
│   Supabase       │ │  Omnidim     │ │   NPI Registry   │
│   PostgreSQL     │ │  Voice AI    │ │   Public API     │
│   + Auth         │ │  Platform    │ │                  │
└──────────────────┘ └──────────────┘ └──────────────────┘
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)
- Omnidim API access (optional, mock mode available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/whoosh-md.git
   cd whoosh-md
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your credentials:
   ```env
   # Supabase (Required)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Omnidim Voice AI (Optional - mock mode available)
   OMNIDIM_API_KEY=your_omnidim_api_key

   # Enable mock mode for development
   NEXT_PUBLIC_CALL_DISPATCH_MOCK=true
   ```

4. **Set up the database**

   In your Supabase dashboard:
   1. Go to **SQL Editor**
   2. Copy the contents of `scripts/sql/setup.sql`
   3. Paste and click **Run**

   This creates all tables, indexes, RLS policies, triggers, and functions:
   - `call_results` - AI call verification data
   - `favorites` - User saved providers
   - `provider_ratings` - Community ratings
   - `provider_reviews` - Community reviews
   - `provider_availability` - Availability updates
   - `provider_insurance` - Insurance info
   - `provider_summary` - Aggregated view

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run build:prod   # Full production build with checks
npm run analyze      # Analyze bundle size
```

## How It Works

1. **Search Providers** - Enter your ZIP code and specialty to find nearby healthcare providers from the NPI Registry

2. **Select & Favorite** - Browse results, view provider details, and favorite up to 6 providers you'd like to call

3. **Enter Preferences** - Provide appointment details (type, urgency, insurance, preferred timeframe)

4. **AI Calls Providers** - Our voice agent simultaneously calls all selected providers to check availability

5. **Review Results** - See real-time results with available slots, insurance confirmation, and next steps

## Database Schema

The app uses 7 tables + 1 view. Run `scripts/sql/setup.sql` to create everything.

**Core Tables:**

| Table | Purpose |
|-------|---------|
| `call_results` | AI call verification outcomes with extracted data |
| `favorites` | User's saved healthcare providers |

**Community Tables:**

| Table | Purpose |
|-------|---------|
| `provider_ratings` | 1-5 star ratings (overall, wait time, communication, facility) |
| `provider_reviews` | Text reviews with recommendations |
| `provider_availability` | Community-reported availability updates |
| `provider_insurance` | Insurance acceptance info |
| `review_votes` | Helpful votes on reviews |
| `provider_summary` | View aggregating all community data |

**Security:**
- Row-Level Security on all tables
- Users only access their own data (except community data which is public-read)
- Service role has full access for webhook updates
- All tables have auto-updating timestamps via triggers

## Project Structure

```
whoosh-md/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── search/            # Search page
│   ├── dashboard/         # User dashboard
│   └── ...
├── components/            # React components
│   ├── SearchForm.tsx
│   ├── ProviderCard.tsx
│   ├── VoiceCallModal.tsx
│   └── ...
├── services/              # Business logic
│   ├── omnidim.ts        # Voice AI service
│   ├── api.ts            # Provider search
│   └── storage.ts        # Data persistence
├── lib/                   # Utilities
├── types/                 # TypeScript types
├── scripts/sql/           # Database migrations
└── public/               # Static assets
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (for webhooks) |
| `OMNIDIM_API_KEY` | No | Omnidim API key (mock mode if not set) |
| `OMNIDIM_API_URL` | No | Omnidim API URL (defaults to production) |
| `OMNIDIM_AGENT_ID` | No | Voice agent ID |
| `NEXT_PUBLIC_CALL_DISPATCH_MOCK` | No | Enable mock mode (`true`/`false`) |

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing Notes

This project was tested with ~50 healthcare providers across 2 locations during initial development. Mock mode is available for development without making real API calls.

## Privacy & Compliance

- **HIPAA-Aware Design**: Only collects first name, insurance type, and appointment preferences
- **No PHI Storage**: Does not store symptoms, diagnoses, or medical history
- **Row-Level Security**: Users only access their own data
- **Verified Providers**: All data sourced from official NPI Registry

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [NPI Registry](https://npiregistry.cms.hhs.gov/) for provider data
- [Supabase](https://supabase.com/) for authentication and database
- [Omnidim](https://omnidim.com/) for voice AI capabilities
- [Next.js](https://nextjs.org/) for the amazing framework

---

Built with care for patients who deserve better healthcare access.
