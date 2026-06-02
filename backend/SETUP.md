# BINUSVERSE Backend — Setup

Full project run guide (frontend + backend) is in the root [`README.md`](../README.md). This file covers the backend only.

## 1. Install

```bash
cd backend
npm install
```

## 2. Configure `.env`

`.env` already has generated JWT secrets. Edit the database password:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/binusverse"
FRONTEND_URL="http://127.0.0.1:5500"   # must match where the frontend is served
```

Regenerate JWT secrets if needed:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 3. Database

```bash
psql -U postgres -c "CREATE DATABASE binusverse;"   # once
npx prisma migrate dev --name init                  # build tables
npx prisma db seed                                  # load question bank + today's daily quiz
```

## 4. Run

```bash
npm run dev          # http://localhost:3000
curl http://localhost:3000/health   # -> {"status":"ok"}
```

## Architecture

Layered: **Route → Controller → Service → Repository → Prisma**. Services hold no Prisma imports; repositories hold all DB queries.

## API base: `http://localhost:3000/api`

| Group | Routes |
|---|---|
| `/auth` | register, login, refresh, logout |
| `/user` | profile, bio, **state** (GET/PUT — full game-state blob), search |
| `/quiz` | daily, daily/submit, questions (admin) |
| `/battle` | raid/questions, raid/submit, pvp/*, history |
| `/forum` | channels, posts (GET/POST), likes, comments |
| `/items` | catalog, inventory, use |

Protected routes need `Authorization: Bearer <accessToken>`. The frontend `BV` client (`assets/js/api.js`) sets this and auto-refreshes on 401.

## PvP (Socket.io `/pvp` namespace)

```javascript
const socket = io('http://localhost:3000/pvp');
socket.emit('join', { sessionId, userId });
socket.on('started', ({ questions, challenger, opponent }) => { ... });
socket.on('opponent_answered', ({ questionId, correct }) => { ... });
socket.on('result', ({ winnerId, challenger, opponent }) => { ... });
socket.emit('answer', { sessionId, userId, questionId, answer: 'A', timeTaken: 3.5 });
```

## Notes

- Progression (XP/rank/skills/items) is computed client-side and persisted via `PUT /api/user/state`. No Elo/division, no academic/missions/news/leaderboard (removed — frontend never used them).
- Quiz questions for the rich battle UI come from the frontend `questions.json`, not the API.
