# PadhAI

> **An AI-powered personal learning workspace for learning concepts, practising actively, and tracking progress.**

PadhAI turns a learning goal or study material into a structured, interactive study experience. Instead of making a learner search across multiple tools for a roadmap, explanations, quizzes, revision notes, flashcards, videos, and progress tracking, PadhAI brings those workflows together in one application.

## Table of contents

- [The problem](#the-problem)
- [The idea and solution](#the-idea-and-solution)
- [What PadhAI can do](#what-padhai-can-do)
- [AI models and provider strategy](#ai-models-and-provider-strategy)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Running the project](#running-the-project)
- [API overview](#api-overview)
- [Deployment](#deployment)
- [Security and privacy](#security-and-privacy)
- [Current limitations](#current-limitations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

## The problem

Learning a technical subject is often fragmented:

- A learner has to find a roadmap before they can decide what to study next.
- Explanations, practice questions, revision notes, flashcards, and videos live in separate tools.
- Generic AI chat does not always remember the lesson context or adapt to the learner's level.
- Uploaded PDFs and presentations are difficult to convert into useful revision material.
- Learners lack a simple view of their progress, weak areas, and study streak.

This creates a gap between **consuming content** and **actually building understanding through practice and recall**.

## The idea and solution

PadhAI is designed as a guided learning loop:

1. **Plan** - enter a topic, goal, current level, and available time.
2. **Learn** - follow an AI-generated course outline and interactive lessons.
3. **Ask** - use the context-aware AI Tutor while studying.
4. **Practise** - take quizzes and use visualisations for data-structure concepts.
5. **Recall** - revise with generated cheatsheets and spaced-repetition flashcards.
6. **Review** - inspect progress, mastery signals, and a 30-day study plan.

The goal is not to replace teachers or primary sources. It is to provide a personalised layer that helps learners organise, understand, practise, and revisit what they are learning.

## What PadhAI can do

### Personalised learning

- Generate a structured course roadmap from a learning goal.
- Adjust the outline for the learner's current level and target duration.
- Generate lessons with Markdown, code blocks, and mathematical notation.
- Modify an existing outline as the learner's goals change.

### Active learning

- Run timed quizzes with validation and explanations.
- Generate revision-focused cheatsheets.
- Create interactive 3D flashcard decks with Again, Hard, Good, and Easy ratings.
- Track course and lesson progress.
- Provide a milestone-based 30-day study planner.

### AI-assisted study

- Open a docked AI Tutor alongside the current lesson.
- Ask contextual questions and request explanations or code reviews.
- Analyse uploaded PDF, PPT/PPTX, and TXT study material.
- Generate summaries and learning resources from extracted material.
- Curate recommended educational YouTube videos when a YouTube API key is configured.

### Interactive visual learning

The frontend includes visualisers for:

- Arrays
- Linked lists
- Stacks and queues
- Binary trees and BSTs
- Graphs
- Sorting algorithms

### User accounts and persistence

- Email/password registration and login.
- JWT-based authentication.
- Optional Google OAuth 2.0 sign-in.
- MongoDB persistence for users, courses, lessons, quizzes, progress, cheatsheets, and flashcards.

## AI models and provider strategy

PadhAI supports both a local model and a hosted model. The backend exposes one internal `callAI()` flow so feature services do not need to know which provider is active.

| Mode | Provider | Default model | Use case |
| --- | --- | --- | --- |
| `ollama` (default) | Local Ollama | `qwen2.5:7b` | Free, private development and offline-friendly local inference |
| `gemini` | Google Gemini API | `gemini-3.6-flash` | Hosted deployment or environments without Ollama |
| `auto` | Ollama, then Gemini fallback | Configured values | Same routing behavior as the default Ollama mode |

### How fallback works

- With `AI_PROVIDER=ollama`, PadhAI first calls the local Ollama server.
- If Ollama is unavailable or the configured model is not installed, the backend uses Gemini when `GEMINI_API_KEY` is available.
- If neither provider is available, the API returns an explicit configuration/service error.
- Invalid structured model output is parsed and validated with JSON repair and Zod schemas where applicable.
- `AI_PROVIDER=gemini` skips Ollama and uses Gemini directly.

### Local Ollama setup

Install Ollama, start its service, and pull the configured model:

```bash
ollama serve
ollama pull qwen2.5:7b
```

The default Ollama endpoint is `http://localhost:11434`. You can use another model by changing `OLLAMA_MODEL` in the backend environment.

> A local 7B model needs suitable RAM and may respond more slowly on CPU-only machines. For hosted environments, use Gemini mode instead of trying to run Ollama inside the web service.

## Tech stack

### Frontend

- React 19
- Vite
- React Router
- Tailwind CSS 4
- Framer Motion and GSAP for motion
- Axios for API requests
- Recharts for analytics
- React Markdown, remark-gfm, remark-math, rehype-katex, and KaTeX
- React Syntax Highlighter
- Mermaid
- Lucide React and Hugeicons
- Oxlint

### Backend

- Node.js with ES modules
- Express
- Mongoose
- MongoDB / MongoDB Atlas
- `@google/genai` for Gemini
- Ollama HTTP API for local inference
- Zod for request and AI-output validation
- `jsonrepair` for defensive JSON parsing
- Multer for file uploads
- `pdf-parse` and `officeparser` for study-material extraction
- JWT and bcryptjs for authentication
- Helmet, CORS, `express-mongo-sanitize`, and rate limiting for API protection
- Morgan for request logging

### Deployment and infrastructure

- Vercel-compatible frontend build
- Render-compatible Node.js backend configuration in `render.yaml`
- MongoDB Atlas for production persistence
- Optional Google OAuth 2.0 and YouTube Data API v3 integrations

## Architecture

```text
┌────────────────────┐       HTTP/JSON        ┌─────────────────────┐
│ React + Vite       │ ────────────────────▶  │ Express API         │
│ frontend/          │                        │ backend/             │
└────────────────────┘                        └──────────┬──────────┘
                                                         │
                         ┌───────────────────────────────┼───────────────────────────────┐
                         │                               │                               │
                 ┌───────▼────────┐              ┌───────▼────────┐              ┌───────▼────────┐
                 │ MongoDB        │              │ AI Router      │              │ File/Video     │
                 │ Mongoose       │              │ Ollama          │              │ extraction     │
                 │                 │              │ → Gemini        │              │ YouTube API    │
                 └────────────────┘              └────────────────┘              └────────────────┘
```

The backend is organised by feature modules. Controllers handle requests, routes define the public API, validators protect inputs and generated structures, models define persistence, and shared services contain AI and extraction logic.

## Project structure

```text
PadhAI/
├── backend/
│   ├── src/
│   │   ├── config/                 # Environment and database configuration
│   │   ├── lib/                    # AI, extraction, and domain services
│   │   ├── modules/                # Feature routes, controllers, models, validators
│   │   └── server.js               # Express app and server entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/             # Shared UI
│   │   ├── features/               # Auth, courses, lessons, quizzes, and more
│   │   ├── services/               # API client
│   │   └── App.jsx
│   ├── .env.example
│   └── package.json
├── render.yaml                     # Render backend deployment definition
├── package.json                    # Root scripts for both applications
└── README.md
```

## Getting started

### Prerequisites

- Node.js 18 or newer
- npm
- MongoDB (local) or a MongoDB Atlas database
- Ollama and `qwen2.5:7b` for the default local AI mode
- A Google Gemini API key if you want Gemini mode or fallback
- A Google OAuth application for optional Google sign-in
- A YouTube Data API v3 key for video recommendations

### Clone and install

```bash
git clone https://github.com/Shrees1ngh/PadhAI.git
cd PadhAI
npm run install:all
```

The root `install:all` script installs dependencies for the root, frontend, and backend packages.

## Environment variables

### Backend

Copy `backend/.env.example` to `backend/.env` and set the values you need:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Atlas or local MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/padhai

# AI: ollama (default), gemini, or auto
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b
GEMINI_API_KEY=your_gemini_api_key_here

# Optional integrations
YOUTUBE_API_KEY=your_youtube_api_key_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Authentication and deployment
JWT_SECRET=replace_with_a_long_random_secret
TRUST_PROXY=false
DAILY_USER_AI_QUOTA=50
```

Important:

- Keep `backend/.env` private. Never commit API keys, database credentials, OAuth secrets, or JWT secrets.
- For production, set a strong `JWT_SECRET`; the backend intentionally refuses to start in production without one.
- `GEMINI_API_KEY` is optional when Ollama is running, but required for Gemini mode and Ollama fallback.
- The backend accepts a user-provided Gemini key for supported custom-key flows; server-side keys should still be preferred for deployment.

### Frontend

Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

If `VITE_API_URL` is omitted, the frontend uses its configured same-origin/proxy behavior. In a deployed frontend, set it to the public backend URL, for example `https://your-backend-service.onrender.com`.

## Running the project

### Run frontend and backend together

```bash
npm run dev
```

### Run them separately

```bash
# Backend: http://localhost:5000
npm run dev:backend

# Frontend: Vite's local development URL, normally http://localhost:5173
npm run dev:frontend
```

### Build the frontend

```bash
npm --prefix frontend run build
```

### Check the backend

```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/health/ai
```

The health endpoints report database status, configured AI mode, Ollama availability, and whether Gemini is configured. They do not expose secret values.

## API overview

All application endpoints are served below `/api`.

| Module | Base path | Responsibility |
| --- | --- | --- |
| Health | `/api/health` | Service, database, and AI status |
| Auth | `/api/auth` | Registration, login, JWT session, and Google OAuth |
| Courses | `/api/courses` | Generate, modify, save, and retrieve courses |
| Lessons | `/api/lessons` | Lesson content and lesson progress |
| Topics | `/api/topics` | Topic exploration and generation |
| Quizzes | `/api/quizzes` | Quiz generation, delivery, and results |
| Progress | `/api/progress` | Learning progress and mastery tracking |
| AI Tutor | `/api/ai-tutor` | Context-aware `/chat` and `/ask` requests |
| Study materials | `/api/study-materials` | Upload, extract, and analyse documents |
| Cheatsheets | `/api/cheatsheets` | Generate and retrieve revision sheets |
| Flashcards | `/api/flashcards` | Generate and practise flashcard decks |
| YouTube | `/api/youtube` | Educational video search and recommendations |

Protected routes require the authenticated JWT unless the specific AI generation flow supports a configured custom key. AI endpoints are rate-limited.

## Deployment

### Backend on Render

The included `render.yaml` describes a Node web service:

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Health check: `/api/health`
- Production AI mode: `gemini`

Configure `MONGO_URI`, `CLIENT_URL`, `GEMINI_API_KEY` (if using Gemini), and any OAuth or YouTube variables in Render's environment settings. Render can generate `JWT_SECRET` through the blueprint configuration, but verify the value is present before using the service.

### Frontend on Vercel

Deploy `frontend/` as a Vite project and set:

```env
VITE_API_URL=https://your-backend-service.onrender.com
```

The backend's CORS allowlist must include the deployed frontend URL through `CLIENT_URL`.

## Security and privacy

- Secrets are read from environment variables and are not part of the frontend bundle.
- Passwords are hashed with bcryptjs.
- JWT authentication isolates user-owned course and progress data.
- Helmet and additional security headers are enabled.
- CORS is restricted to configured/deployed client origins.
- Mongo query operators are sanitised.
- Authentication and AI routes use rate limiting.
- Uploaded content is processed by the backend and should be treated as sensitive user data.
- AI output is parsed defensively and validated before it is used by feature services.

PadhAI sends prompts to whichever AI provider is enabled. With Ollama, inference can remain on the local machine. With Gemini, the relevant prompt and context are sent to Google's API, so deployment teams should review their data-handling requirements before enabling hosted inference.

## Current limitations

- AI-generated content can be incorrect or incomplete; learners should verify important information.
- Local Ollama performance depends on the user's hardware, available memory, and model quality.
- Gemini fallback requires a valid API key and network access.
- MongoDB is required for persistent accounts and learning data.
- YouTube recommendations require a YouTube API key and are subject to Google's quota and API availability.
- Document extraction quality varies with scanned PDFs, complex layouts, tables, and unsupported file features.
- The project currently has limited automated test coverage; manual checks of the health endpoints and key user flows are recommended before deployment.

## Roadmap

- Add stronger automated unit, integration, and end-to-end test coverage.
- Add richer mastery recommendations based on quiz and flashcard performance.
- Improve support for scanned documents with OCR.
- Add configurable model selection and per-feature model policies.
- Add streaming AI Tutor responses.
- Add collaborative classrooms, teacher dashboards, and shared study plans.
- Add observability for AI latency, provider failures, quota usage, and generation quality.
- Improve accessibility and mobile-first interaction patterns.

## Contributing

1. Create a feature branch.
2. Keep secrets in local environment files only.
3. Make focused changes that preserve the existing module boundaries.
4. Run the frontend build and manually verify the relevant backend health/API flow.
5. Open a pull request describing the user problem, implementation, and validation performed.

## License

No license file is currently included in the repository. Add a license before distributing or reusing PadhAI publicly.
