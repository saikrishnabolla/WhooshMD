# Whoosh MD - Provider Search & Voice Agent Platform

A modern healthcare provider search platform with integrated voice agent capabilities for checking appointment availability.

## Features

- **Provider Search**: Search healthcare providers using the NPI Registry API
- **Voice Agent Integration**: AI-powered voice calls to check provider availability (placeholder for Vapi integration)
- **Local Storage**: Favorites and call history stored in browser local storage
- **Authentication**: Supabase authentication for user management
- **Responsive Design**: Mobile-first design with Tailwind CSS

## Architecture

This application has been simplified to use:
- **Frontend**: Next.js 14 with TypeScript
- **Authentication**: Supabase (client-side only)
- **Data Storage**: Browser local storage for favorites and call history
- **Voice Agent**: Placeholder implementation ready for Vapi integration
- **Styling**: Tailwind CSS with custom components

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd whoosh-md
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Voice Agent Integration

The application includes a placeholder voice agent system that can be easily replaced with Vapi:

- **Current**: Mock voice agent calls for demonstration
- **Future**: Replace with Vapi integration in `/src/app/api/voice-agent/route.ts`
- **Local Storage**: Call history is stored locally in the browser

To integrate with Vapi:
1. Update the `VOICE_AGENT_CONFIG` in the API route
2. Replace mock implementation with actual Vapi API calls
3. Configure Vapi credentials in environment variables

## Local Storage

The application stores data locally in the browser:
- **Favorites**: User's favorite providers
- **Call History**: Voice agent call records and status
- **Search History**: Recent provider searches

Data persists until the user clears browser storage.

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Storage**: Browser Local Storage
- **Voice Agent**: Placeholder (ready for Vapi)
- **Icons**: Lucide React
- **Build**: Turbopack (dev) / Webpack (prod)
