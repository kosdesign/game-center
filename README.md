# Game Center

Full-stack application สำหรับจัดการข้อมูลเกม ประกอบด้วย Admin Panel (React TypeScript) และ API Server (Node.js/Express) พร้อม MongoDB database

## Project Structure

```
game-center/
├── admin/              # React TypeScript admin panel
├── api/                # Node.js Express API server
├── shared/             # Shared TypeScript types
└── .kiro/specs/        # Project specifications
```

## Prerequisites

- Node.js 18+
- MongoDB 6+
- npm or yarn

## Installation

```bash
npm install
```

## Development

### 1. Start MongoDB
```bash
mongod
```

### 2. Configure API Environment
```bash
cd api
cp .env.example .env
```

Edit `.env` with your MongoDB URI and JWT secret.

### 3. Seed Database with Mock Data
```bash
cd api
npm run seed
```

This creates:
- Admin user (username: `admin`, password: `admin123`)
- 5 sample games with different types (PROD, TEST, UAT)
- Multiple versions for Battle Royale Arena

### 4. Run Development Servers

**Both services:**
```bash
npm run dev
```

**Admin panel only (port 3000):**
```bash
npm run dev:admin
```

**API server only (port 5000):**
```bash
npm run dev:api
```

## API Endpoints

### Public
- `GET /api/health` - Health check
- `GET /api/games/:id` - Get game by ID
- `GET /api/games?type=PROD` - Get all games (optional type filter)

### Admin (requires authentication)
- `POST /api/auth/login` - Admin login
- `POST /api/games` - Create game
- `PUT /api/games/:id?version=1.0` - Update game
- `DELETE /api/games/:id` - Delete game

## Data Schema

### GameParent
- game_id (unique identifier)
- game_name
- is_active

### GameDetails
- game_id (reference to parent)
- game_version
- description
- port, api_url
- type (PROD/TEST/UAT)
- match_making_url
- server_game_ip
- server_game_type (UDP/TCP)
- is_active

## Building for Production

```bash
npm run build
```

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Material-UI (MUI)
- React Router
- Axios
- Vite

**Backend:**
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT authentication
- Zod validation
- bcrypt

**Shared:**
- TypeScript types
- Zod validation schemas

## Mock Data & Credentials

Run seed script to create mock data:

```bash
cd api
npm run seed
```

**Admin Login:**
- Username: `admin`
- Password: `admin123`

**Sample Games Created:**
- Battle Royale Arena v1.0 (PROD) + v2.0 (TEST)
- Racing Champions v2.1 (TEST)
- Space Warriors v1.5 (UAT)
- Fantasy Quest Online v3.0 (PROD)
- Zombie Survival v1.2 (PROD)

## License

MIT
