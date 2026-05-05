# EPIC TECH AI • ULTIMATE

The most powerful AI assistant on the web. Multiple expert personas, real-time tools, media generation, and the best Groq models.

**Live Demo:** Deployed on Vercel

## Features

- **4 Expert Personas** — Epic Tech AI, Code Master, Deep Researcher, Creative Genius
- **Real Groq Intelligence** — Llama 3.3 70B, Mixtral, Gemma 2 (fastest inference)
- **Powerful Tools** — Web search, secure code execution, file operations
- **Media Generation** — Flux-powered image generation (ready for Replicate)
- **Voice Mode** — Text-to-speech output
- **Conversation Memory** — Full context across messages
- **Save & Load** — Export/import your sessions
- **Beautiful Cyberpunk UI** — Built for the future

## Quick Start (Local)

```bash
npm install
npm run dev
```

Add your Groq API key to `.env.local`:

```env
GROQ_API_KEY=sk-...
```

## Deploy to Vercel (Recommended)

1. Push this repo to GitHub
2. Go to [Vercel](https://vercel.com) → New Project → Import this repo
3. Add Environment Variable:
   - `GROQ_API_KEY` = your Groq key
4. Deploy

The app is fully serverless and works perfectly on Vercel's free tier.

## Most Powerful Models Used

- `llama-3.3-70b-versatile` (default — currently one of the best open models)
- `mixtral-8x7b-32768`
- `gemma2-9b-it`

## Tech Stack

- Next.js 14 (App Router)
- Groq SDK
- Tailwind CSS + Framer Motion
- TypeScript
- Sonner (toasts)

Built for the future. Ready for production.
