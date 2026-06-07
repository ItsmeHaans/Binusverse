# BINUSVERSE

Platform belajar gamifikasi untuk mahasiswa BINUS. Ubah aktivitas akademik jadi petualangan RPG — kerjakan quiz harian, tantang sesama mahasiswa di PvP, kumpulkan item, dan naikkan rank di leaderboard.

---

## Fitur

| Fitur | Deskripsi |
|---|---|
| **Daily Quiz** | Quiz harian auto-generate, dapat XP & streak bonus |
| **Battle** | Mode PvP real-time (Socket.io), Raid, dan Solo battle |
| **Leaderboard** | Ranking global berdasarkan XP dan ELO |
| **The Commons** | Forum diskusi antar mahasiswa dengan like & komentar |
| **Grimoire** | Materi & referensi belajar |
| **Items** | Koleksi item dengan rarity (Common → Legendary) |
| **Profile** | Statistik akademik, GPA, attendance, level, streak |

---

## Tech Stack

**Frontend:** Vanilla HTML · CSS · JavaScript (tidak butuh build tool)

**Backend:** Node.js · Express · TypeScript · Prisma ORM · PostgreSQL · Socket.io · JWT Auth

---

## Cara Menjalankan

### Prasyarat

- Node.js 18+
- PostgreSQL (running)
- VS Code dengan ekstensi **Live Server** (untuk frontend)

---

### 1. Clone & Setup Backend

```bash
cd backend
npm install
```

Salin file environment:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/binusverse"
JWT_ACCESS_SECRET="generate-random-string-di-sini"
JWT_REFRESH_SECRET="generate-random-string-lain-di-sini"
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
PORT=3000
NODE_ENV=development
FRONTEND_URL="http://127.0.0.1:5500"
```

Generate JWT secret (jalankan dua kali untuk dua secret berbeda):

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### 2. Setup Database

```bash
# Buat database (sekali saja)
psql -U postgres -c "CREATE DATABASE binusverse;"

# Jalankan migrasi
cd backend
npm run prisma:migrate
# → masukkan nama migrasi, misal: init

# Generate Prisma client
npm run prisma:generate
```

---

### 3. Jalankan Backend

```bash
cd backend
npm run dev
```

Server berjalan di `http://localhost:3000`

Cek health: `http://localhost:3000/health`

---

### 4. Jalankan Frontend

Buka folder root project di VS Code, lalu klik **Go Live** (Live Server) pada `splash.html` atau `index.html`.

Frontend akan berjalan di `http://127.0.0.1:5500`

---

### 5. Setup Admin & Quiz Pertama

Daftarkan akun via app, lalu jadikan admin:

```bash
psql -U postgres -d binusverse -c "UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'email@kamu.com';"
```

Generate daily quiz manual (atau tunggu cron job tengah malam):

```bash
curl -X POST http://localhost:3000/api/quiz/generate \
  -H "Authorization: Bearer <token-admin>"
```

---

## Struktur Proyek

```
Binusverse/
├── index.html          # Lobby utama
├── splash.html         # Login / Register
├── battle.html         # Pilih mode battle
├── battle-play.html    # Sesi battle aktif
├── battle-result.html  # Hasil battle
├── grimoire.html       # Materi belajar
├── the_commons.html    # Forum
├── forum-chat.html     # Thread forum
├── items.html          # Inventori item
├── assets/             # Gambar, video, JS utils
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

Semua route yang dilindungi butuh header: `Authorization: Bearer <accessToken>`

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/auth/register` | Daftar akun baru |
| POST | `/auth/login` | Login, dapat access & refresh token |
| POST | `/auth/refresh` | Perbarui access token |
| GET | `/user/me` | Profil sendiri |
| GET | `/quiz/daily` | Ambil quiz hari ini |
| POST | `/quiz/daily/submit` | Submit jawaban quiz |
| POST | `/battle/create` | Buat sesi PvP |
| GET | `/leaderboard` | Ranking global |
| GET | `/forum/posts` | Daftar post forum |
| GET | `/items` | Semua item tersedia |

---

## WebSocket PvP

Connect ke namespace `/pvp`:

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
npm run dev           # Dev server dengan hot reload
npm run build         # Compile TypeScript
npm run start         # Jalankan hasil build
npm run prisma:studio # GUI database Prisma
npm run prisma:seed   # Seed data awal
```
