# BINUSVERSE Backend — Setup Guide

## 1. Install dependencies

```bash
cd backend
npm install
```

## 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your actual values:
- `DATABASE_URL` — your local PostgreSQL connection string
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — generate with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- `GEMINI_API_KEY` — get from https://aistudio.google.com/app/apikey
- `FRONTEND_URL` — where your frontend runs (e.g. `http://localhost:5500` for VS Code Live Server)

## 3. Set up the database

Make sure PostgreSQL is running and the database exists:

```bash
# Create the database (run once)
psql -U postgres -c "CREATE DATABASE binusverse;"

# Run Prisma migrations
npm run prisma:migrate
# → enter a migration name like "init"

# Generate Prisma client
npm run prisma:generate
```

## 4. Run the dev server

```bash
npm run dev
```

Server starts at `http://localhost:3000`

## 5. Generate today's quiz (first time)

After the server is running, call this endpoint as admin to generate the daily quiz manually:

```bash
# First register an admin user via the API, then update role in DB:
psql -U postgres -d binusverse -c "UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'your@email.com';"

# Then call the generate endpoint:
curl -X POST http://localhost:3000/api/quiz/generate \
  -H "Authorization: Bearer <your-admin-token>"
```

Or the cron job will auto-generate at midnight every day.

## Socket.io (PvP)

Connect to the `/pvp` namespace:

```javascript
const socket = io('http://localhost:3000/pvp');

// Join a session after creating it via HTTP
socket.emit('join', { sessionId: 'uuid', userId: 'uuid' });

// Listen for events
socket.on('joined', (data) => { ... });
socket.on('started', ({ questions, challenger, opponent }) => { ... });
socket.on('opponent_answered', ({ questionId, correct }) => { ... });
socket.on('result', ({ winnerId, challenger, opponent }) => { ... });

// Submit answer in real-time
socket.emit('answer', { sessionId, userId, questionId, answer: 'A', timeTaken: 3.5 });
```

## API Base URL

All REST endpoints: `http://localhost:3000/api`

All protected routes require: `Authorization: Bearer <accessToken>`
