# CvToAI Deployment Guide

This project is a React SPA served by an Express backend. It is ready to be deployed to platforms like Render, Koyeb, or Vercel.

## Deployment Steps (Render/Koyeb)

1.  **Connect your Repository**: Connect your GitHub/GitLab repository to your hosting provider.
2.  **Environment Variables**:
    *   Set `GEMINI_API_KEY` to your Google Gemini API key.
3.  **Build Settings**:
    *   **Build Command**: `npm run build`
    *   **Start Command**: `npm start`
4.  **Port**: The application runs on port `3000`.

## Local Development

1.  `npm install`
2.  `npm run dev`

## Project Structure

*   `server.ts`: Express server that serves the frontend and handles routing.
*   `src/`: React frontend application.
*   `vite.config.ts`: Vite configuration with Gemini API key injection.
