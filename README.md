# AI Social Media Marketing Automation Tool (MVP)

This is a full-stack MVP for generating simple, branded Instagram/Facebook/Twitter creatives (Flyers + Reels) using **local templates** (no expensive AI generation) and publishing them via a simulated API.

## Features (MVP)
- Auth: Signup / Login (MongoDB)
- Dashboard:
  - Prompt input + business type
  - Generate: returns 3 Flyer options + 3 Reel options from local templates
- Branding module: upload logo + company name + quote + primary color
- Flyer editor (text + font + drag logo + live preview)
- Reel editor (quote + logo + preview + export placeholder)
- Preview module: Instagram / Facebook / Twitter tabs (final creative)
- Publish module:
  - `POST /publish` (simulated success for Instagram/Facebook/Twitter)
  - Stores publish history
- Download module: download PNG / MP4 (MP4 placeholder)

## Tech Stack
- Frontend: React + Vite, Bootstrap, React Router, Axios
- Backend: Node.js + Express.js
- Database: MongoDB Atlas
- Deployment: Frontend (Vercel), Backend (Render)

## Prerequisites
- Node.js 18+
- MongoDB Atlas account

## Setup
### 1) Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 2) Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```

Then open the frontend URL shown by Vite.

## Notes about Templates / AI
- The generator uses a simple keyword detector on the prompt to choose from prepackaged local templates.
- No real AI model calls are made.

## Folder Layout
- `backend/templates/` contains flyer template images and reel videos.
- `backend/uploads/` stores uploaded logos.

## Environment Variables
See `backend/.env.example` and `frontend/.env.example`.

