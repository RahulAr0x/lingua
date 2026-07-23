# Lingua

An AI-powered language learning app that helps you improve English writing, grammar, pronunciation, reading, and vocabulary. Each module provides real-time AI feedback to help you learn faster and more effectively.

## Features

- **Writing & Spelling** — timed writing sessions with AI analysis of errors, word choice, and style
- **Grammar Lessons** — structured lessons with AI-powered feedback on your answers
- **Pronunciation** — record your voice and get AI feedback on pronunciation accuracy
- **Reading** — reading comprehension sessions with vocabulary lookups
- **Varieties** — compare US and UK English differences
- **Vocabulary** — track words you've learned, with mastery tracking over time
- **Progress Dashboard** — session history, scores, and stats

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| AI | OpenRouter API |
| Database | Turso (libSQL) |
| Transcription | Groq API |
| Deploy | Vercel |

## Getting Started

### Prerequisites

- Node.js 20+
- A Turso database
- OpenRouter API key
- Groq API key

### Setup

```bash
git clone https://github.com/RahulAr0x/lingua.git
cd lingua
npm install
```

Create a `.env.local` file:

```env
OPENROUTER_API_KEY=your-openrouter-api-key
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
GROQ_API_KEY=your-groq-api-key
```

Run the database setup:

```bash
# Initialize the database tables
curl http://localhost:3000/api/init
```

Then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

```bash
npx vercel --prod
```

Set all required environment variables (`OPENROUTER_API_KEY`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `GROQ_API_KEY`) in your Vercel project settings.

## License

MIT
