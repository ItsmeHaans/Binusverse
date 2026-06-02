# BINUSVERSE

Pixel-art gamified learning platform for BINUS students. Pixel RPG frontend (static HTML/CSS/JS) backed by a TypeScript + Express + Prisma + PostgreSQL API.

The frontend talks to the backend through `assets/js/api.js` (the global `BV` client). Your progress (XP, rank, skills, items, streak) is computed in the browser and **persisted on the server** in `User.gameState`, so your account works across browsers/devices. `localStorage` is only a local cache + offline fallback. The forum is real and multi-user. Quiz questions are static in `questions.json`.

---

## Prerequisites

Install these first:

| Tool | Version | Notes |
|---|---|---|
| **Node.js** | 18+ (tested on 22) | https://nodejs.org |
| **PostgreSQL** | 14+ | https://www.postgresql.org/download |
| **VS Code + Live Server extension** | any | to serve the frontend (or any static server) |

Check they work:

```bash
node -v
npm -v
psql --version
```

---

## 1. Backend setup

```bash
cd backend
npm install
```

### 1a. Create the database

Make sure PostgreSQL is running, then create the DB once:

```bash
psql -U postgres -c "CREATE DATABASE binusverse;"
```
(it will ask for your Postgres password)

### 1b. Configure `.env`

A `backend/.env` already exists with generated JWT secrets. **You only need to fix the database password.** Open `backend/.env` and edit the `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/binusverse"
```

Replace `YOUR_PASSWORD` with your real Postgres password. If your Postgres user/port differs, adjust those too. Format:
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

> If `backend/.env` is missing (e.g. fresh clone), copy `.env.example` to `.env` and generate secrets:
> ```bash
> cp .env.example .env
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"   # run twice, paste into JWT_ACCESS_SECRET and JWT_REFRESH_SECRET
> ```

### 1c. Migrate + seed the database

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

`migrate` builds all the tables. `seed` loads the quiz question bank + today's daily quiz.

### 1d. Run the server

```bash
npm run dev
```

Backend runs at **http://localhost:3000**. Verify:

```bash
# should return {"status":"ok",...}
curl http://localhost:3000/health
```

Leave this terminal running.

---

## 2. Frontend setup

The frontend is plain static files — no build step. You just need to serve the project root over HTTP (opening the `.html` files directly with `file://` will break CORS and the API calls).

**Easiest (VS Code Live Server):**
1. Open the project folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click `splash.html` → **Open with Live Server**.

This serves at `http://127.0.0.1:5500`.

> ⚠️ **CORS must match exactly.** The backend only allows the origin in `backend/.env` → `FRONTEND_URL` (default `http://127.0.0.1:5500`).
> - If Live Server opens `http://localhost:5500` instead of `127.0.0.1`, either change the URL in your browser to `127.0.0.1`, **or** edit `FRONTEND_URL` in `backend/.env` to match and restart `npm run dev`.

**Alternative static server (no VS Code):**
```bash
# from the project ROOT (not backend/)
npx serve -l 5500
# then open http://127.0.0.1:5500/splash.html  (and set FRONTEND_URL to match the port/host)
```

---

## 3. Using the app

1. Open `http://127.0.0.1:5500/splash.html` → click start → you're sent to **auth.html**.
2. **Register** an account. Email **must** end in `@binus.ac.id` (e.g. `john@binus.ac.id`). Password min 8 chars.
3. You land on the dashboard. Play daily/raid battles, earn XP/items, chat in the forum.
4. Your progress is saved server-side — log in from another browser and it follows you.

---

## Project layout

```
Binusverse/
├── *.html, *.js, *.css      # frontend pages + scripts (served statically)
├── auth.html/css/js         # login + register entry point
├── assets/js/api.js         # BV client — all backend calls go through here
├── user-data.js             # BVUser — game state engine + server sync
├── questions.json           # static quiz question bank
└── backend/
    ├── prisma/schema.prisma # DB models
    ├── prisma/seed.ts       # question/daily-quiz seed
    └── src/                  # Express app (routes → controllers → services → repos → Prisma)
```

API base: `http://localhost:3000/api` — protected routes need `Authorization: Bearer <accessToken>` (the `BV` client handles this automatically).

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Authentication failed against database server` | Wrong password in `DATABASE_URL`. Fix `backend/.env`, re-run migrate. |
| Page redirects to `auth.html` forever / login does nothing | Backend not running, or CORS origin mismatch. Confirm `npm run dev` is up and `FRONTEND_URL` matches the URL in your browser (`127.0.0.1` vs `localhost`). |
| `Database binusverse does not exist` | Run the `CREATE DATABASE` step (1a). |
| Registration says "Must be a BINUS email" | Use an `@binus.ac.id` email. |
| Opened HTML by double-click, nothing loads from server | Serve over HTTP (Live Server), not `file://`. |
| Progress not saving across devices | Make sure you're **logged in** (not just playing as guest cache) and the backend is reachable. |

---

## Reset everything (dev)

```bash
cd backend
npx prisma migrate reset      # drops + recreates DB, re-runs seed
```
Then clear the browser's localStorage (DevTools → Application → Local Storage → clear) to drop the local cache.
