# BINUSVERSE

A gamified learning platform for BINUS University students. Turn academic activities into an RPG adventure — complete daily quizzes, challenge fellow students in real-time PvP, collect items, and climb the leaderboard.

---

## Features

| Feature | Description |
|---|---|
| **Daily Quiz** | Auto-generated daily quiz with XP & streak bonuses |
| **Battle** | Real-time PvP (Socket.io), Raid, and Solo battle modes |
| **Leaderboard** | Global ranking based on XP and ELO points |
| **The Commons** | Student discussion forum with likes & comments |
| **Grimoire** | Study materials and learning references |
| **Items** | Collectible items with rarity tiers (Common → Legendary) |
| **Profile** | Academic stats, GPA, attendance, level, and streak |

---

## Tech Stack

**Frontend:** Vanilla HTML · CSS · JavaScript (no build tool required)

**Backend:** Node.js · Express · TypeScript · Prisma ORM · PostgreSQL · Socket.io · JWT Auth

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (running locally)
- VS Code with the **Live Server** extension (for frontend)

---

### 1. Clone & Install Backend

```bash
cd backend
npm install
```

Copy the environment file:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/binusverse"
JWT_ACCESS_SECRET="your-access-secret-here"
JWT_REFRESH_SECRET="your-refresh-secret-here"
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
PORT=3000
NODE_ENV=development
FRONTEND_URL="http://127.0.0.1:5500"
```

Generate JWT secrets (run twice for two different secrets):

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### 2. Set Up the Database

```bash
# Create the database (once only)
psql -U postgres -c "CREATE DATABASE binusverse;"

# Run migrations
cd backend
npm run prisma:migrate
# → enter a migration name, e.g.: init

# Generate Prisma client
npm run prisma:generate
```

---

### 3. Run the Backend

```bash
cd backend
npm run dev
```

Server runs at `http://localhost:3000`

Health check: `http://localhost:3000/health`

---

### 4. Run the Frontend

Open the project root in VS Code, then click **Go Live** (Live Server) on `splash.html` or `index.html`.

Frontend runs at `http://127.0.0.1:5500`

---

### 5. Set Up Admin & First Daily Quiz

Register an account via the app, then grant admin role:

```bash
psql -U postgres -d binusverse -c "UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'your@email.com';"
```

Generate the daily quiz manually (or wait for the midnight cron job):

```bash
curl -X POST http://localhost:3000/api/quiz/generate \
  -H "Authorization: Bearer <admin-token>"
```

---

## Project Structure

```
Binusverse/
├── index.html          # Main lobby
├── splash.html         # Login / Register
├── battle.html         # Battle mode selection
├── battle-play.html    # Active battle session
├── battle-result.html  # Battle results
├── grimoire.html       # Study materials
├── the_commons.html    # Forum
├── forum-chat.html     # Forum thread view
├── items.html          # Item inventory
├── assets/             # Images, videos, JS utilities
└── backend/
    ├── src/
    │   ├── controllers/    # Request handlers
    │   ├── services/       # Business logic
    │   ├── repositories/   # Database queries
    │   ├── routes/         # Express routes
    │   ├── middlewares/    # Auth, error handler
    │   ├── websocket/      # Socket.io PvP
    │   └── utils/          # XP, rank, streak logic
    ├── prisma/
    │   └── migrations/     # SQL migrations
    └── .env.example
```

---

## API Endpoints

Base URL: `http://localhost:3000/api`

All protected routes require: `Authorization: Bearer <accessToken>`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create a new account |
| POST | `/auth/login` | Login, returns access & refresh tokens |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/user/me` | Get own profile |
| GET | `/quiz/daily` | Get today's quiz |
| POST | `/quiz/daily/submit` | Submit quiz answers |
| POST | `/battle/create` | Create a PvP session |
| GET | `/leaderboard` | Global rankings |
| GET | `/forum/posts` | List forum posts |
| GET | `/items` | All available items |

---

## WebSocket PvP

Connect to the `/pvp` namespace:

```javascript
const socket = io('http://localhost:3000/pvp');

socket.emit('join', { sessionId: 'uuid', userId: 'uuid' });

socket.on('started', ({ questions, challenger, opponent }) => { ... });
socket.on('opponent_answered', ({ questionId, correct }) => { ... });
socket.on('result', ({ winnerId }) => { ... });

socket.emit('answer', { sessionId, userId, questionId, answer: 'A', timeTaken: 3.5 });
```

---

## NPM Scripts (Backend)

```bash
npm run dev           # Dev server with hot reload
npm run build         # Compile TypeScript
npm run start         # Run compiled build
npm run prisma:studio # Prisma database GUI
npm run prisma:seed   # Seed initial data
```
