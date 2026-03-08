# CvToAI - AI-Powered Career Assistant

## Overview
A full-stack web application that uses Google Gemini AI to help users optimize their CVs, generate cover letters, prepare for interviews, and find job opportunities.

## Architecture
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4
- **Backend**: Express.js (TypeScript via tsx)
- **Database**: SQLite (local dev via better-sqlite3) or PostgreSQL (production via DATABASE_URL env var)
- **AI**: Google Gemini API (@google/genai)
- **Sessions**: express-session (with connect-pg-simple for PostgreSQL)

## Project Structure
- `server.ts` - Express server (API routes + Vite middleware for dev)
- `src/App.tsx` - Main React application
- `src/services/gemini.ts` - Gemini AI service functions
- `src/components/` - React components (LandingPage, PromoAnimation, PrivacyPolicy, TermsOfService)
- `src/types.ts` - TypeScript type definitions
- `vite.config.ts` - Vite configuration

## Key Configuration
- Server runs on port 5000 (or PORT env var)
- In development, Vite is used as Express middleware (middlewareMode)
- Vite configured with `allowedHosts: true` for Replit proxy compatibility
- Database: auto-detects PostgreSQL via DATABASE_URL env var, falls back to SQLite

## Environment Variables
- `GEMINI_API_KEY` - Google Gemini API key (required for AI features)
- `DATABASE_URL` - PostgreSQL connection string (optional, uses SQLite if absent)
- `SESSION_SECRET` - Session secret (defaults to hardcoded value)
- `PORT` - Server port (defaults to 5000)

## Running the App
- Development: `npm run dev` (runs `tsx server.ts`)
- Build: `npm run build` (Vite build to dist/)
- Production: `npm run start` (NODE_ENV=production tsx server.ts)
