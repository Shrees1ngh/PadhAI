# 🎓 PadhAI (LearnAI) — AI-Powered Personal Learning Platform

PadhAI is a full-stack learning platform designed to scaffold complex learning paths, generate customized curriculum outlines, provide interactive lessons with docked 24/7 AI tutoring, administer adaptive quizzes, generate printable cheatsheets & 3D flashcards, and analyze uploaded study materials.

---

## ✨ Key Features

- **Personalized Course Scaffolding**: Enter what you want to learn, and Gemini creates structured multi-module syllabi tailored to your goal and timeline.
- **Interactive Lesson Studio**: Rich markdown rendering, KaTeX math formula rendering, and syntax-highlighted code blocks.
- **Docked 24/7 AI Tutor**: Context-aware chat companion embedded directly beside your lesson for real-time clarification and code reviews.
- **Dynamic Quizzes**: Real-time timed assessment engine with instant validation and detailed explanations.
- **Study Material Analyzer**: Drag & drop multi-format ingestion (PDF, PPT/PPTX, TXT) with automatic extraction and synthesis.
- **AI Cheatsheets**: Printable exam revision guides with syntax, complexity tables, and common pitfall warnings.
- **Spaced Repetition Flashcards**: Interactive 3D flip card decks with Anki/Leitner rating controls (*Again*, *Hard*, *Good*, *Easy*).
- **30-Day AI Study Planner**: Milestone-based timeline tracker.
- **Progress Analytics**: Circular progress gauges, streak counters, and mastery health indexing.
- **Complete Authentication**: JWT authentication with bcrypt password hashing + Google OAuth 2.0 social sign-in.
- **MongoDB Atlas Persistence**: Cloud persistence for courses, lessons, quizzes, cheatsheets, and flashcards.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Axios.
- **Backend**: Node.js, Express, Multer, PDF-Parse, OfficeParser.
- **Database**: MongoDB Atlas via Mongoose.
- **AI Engine**: Google Gemini API (`@google/genai` / `@google/generative-ai`) with defensive Zod validation.
- **Authentication**: JSON Web Tokens (JWT) + Google OAuth 2.0.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API Key

### 2. Installation

Clone the repository:
```bash
git clone https://github.com/<your-username>/PadhAI.git
cd PadhAI
```

Install root, server, and client dependencies:
```bash
npm install
npm --prefix server install
npm --prefix client install
```

### 3. Environment Configuration

Create `server/.env` based on `server/.env.example`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Connection String
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/padhai

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# JWT Secret for Session & Auth
JWT_SECRET=your_jwt_secret_key_here

# Google OAuth 2.0 (Optional for Social Login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### 4. Running the Application

Run server and client concurrently:
```bash
# Start backend server (port 5000)
npm --prefix server run dev

# Start frontend client (port 5173)
npm --prefix client run dev
```

---

## 🔒 Security
- All sensitive credentials (`GEMINI_API_KEY`, `MONGO_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_SECRET`) reside exclusively on the server.
- Passwords hashed using bcrypt (10 rounds).
- Defense against malformed LLM outputs using schema parsing.
