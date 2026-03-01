# CvToAI Deployment Guide

This project is a React SPA served by an Express backend. It is ready to be deployed to platforms like Render, Koyeb, or Vercel.

## Deployment to Render (Recommended)

This project includes a `render.yaml` file for easy deployment using Render Blueprints.

1.  **Push to GitHub**: Push your code to a GitHub repository.
2.  **Go to Render**: Log in to your Render dashboard.
3.  **New Blueprint Instance**: Click **New** > **Blueprint**.
4.  **Connect Repo**: Connect your GitHub repository.
5.  **Configure Environment Variables**:
    *   `GEMINI_API_KEY`: Your Google Gemini API key.
    *   `DATABASE_URL`: (Optional) A PostgreSQL connection string (e.g., from Neon). If not provided, the app will use local SQLite (note: SQLite data is lost on Render restarts unless you use a persistent disk).
6.  **Deploy**: Click **Deploy**.

## Manual Deployment Steps

If you prefer to deploy manually:

1.  **Build Command**: `npm run build`
2.  **Start Command**: `npm start`
3.  **Environment Variables**:
    *   `NODE_ENV`: `production`
    *   `GEMINI_API_KEY`: Your Gemini API key.
    *   `SESSION_SECRET`: A random string for session security.
    *   `DATABASE_URL`: (Optional) PostgreSQL connection string.

## Local Development

1.  `npm install`
2.  `npm run dev`

## Project Structure

*   `server.ts`: Express server that serves the frontend and handles routing.
*   `src/`: React frontend application.
*   `vite.config.ts`: Vite configuration with Gemini API key injection.
