# Cafe Management System — Developer Onboarding

> Fullstack cafe management system for order handling and admin operations. Used by cafe staff (admin) and customers (POS order page).

**Repo:** https://github.com/VextorHorizon/cafe-system  
**Stack:** NestJS + Next.js 14 + MongoDB Atlas

---

## What is this?

A monorepo cafe management system with two user-facing surfaces:
- **Admin side** (`/admin`) — manage menu items, view orders, see revenue dashboard
- **Customer side** (`/order`) — POS-style page for placing orders

Orders are auto-deleted after 3 days via a scheduled cron job.

---

## Quick Start

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| npm | 9+ | comes with Node |
| MongoDB Atlas | — | [mongodb.com/atlas](https://mongodb.com/atlas) (free tier works) |

### Setup

```bash
git clone https://github.com/VextorHorizon/cafe-system
cd cafe-system
```

**Backend:**
```bash
cd backend
npm install
cp .env.example .env        # fill in MONGODB_URI
npm run start:dev           # port 3001, hot reload
npm run seed                # seed 5 default menu items (run once)
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env.local  # set NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev                 # port 3000
```

### Verify it works

- [ ] `http://localhost:3000` loads and redirects to `/admin/menu`
- [ ] Menu items appear (after seeding)
- [ ] `http://localhost:3000/order` shows POS order page
- [ ] `http://localhost:3001/menu` returns JSON

---

## Architecture

```
Browser
  ├── /admin/*   → Next.js (admin layout + sidebar)
  └── /order     → Next.js (customer POS page)
        |
        v (fetch)
  NestJS REST API (port 3001)
        |
        v
  MongoDB Atlas
```

### Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Backend | NestJS 11 + TypeScript | Structured modules, DI |
| Database | MongoDB + Mongoose | Flexible schema for menu/orders |
| Validation | class-validator + class-transformer | DTO-level validation |
| Scheduler | @nestjs/schedule | Cron job for auto-cleanup |
| Frontend | Next.js 14 App Router | File-based routing |
| Styling | Tailwind CSS | Utility-first, dark theme |
| State | useState + useEffect + React Context | No Redux/Zustand needed |

---

## Key Files

### Backend

| Path | Purpose |
|------|---------|
| `backend/src/main.ts` | Entry point — CORS, ValidationPipe, port |
| `backend/src/app.module.ts` | Root module — ConfigModule, MongooseModule |
| `backend/src/menu/` | Menu CRUD module |
| `backend/src/order/` | Order module + auto-cleanup cron |
| `backend/src/seed.ts` | Seeds 5 default menu items |

### Frontend

| Path | Purpose |
|------|---------|
| `frontend/src/lib/api.ts` | **All** fetch functions live here — never inline |
| `frontend/src/lib/types.ts` | **All** TypeScript interfaces live here |
| `frontend/src/app/(admin)/` | Admin route group — menu, orders, dashboard |
| `frontend/src/app/(user)/` | Customer route group — order page |
| `frontend/src/context/CartContext.tsx` | Cart state for customer order flow |

---

## API Endpoints

```
GET    /menu                → Active menu items
POST   /menu                → Create menu item
PATCH  /menu/:id            → Update menu item
DELETE /menu/:id            → Delete menu item

POST   /orders              → Create order { items: [{ menuItemId, quantity }] }
GET    /orders              → All orders (newest first)
PATCH  /orders/:id/status   → Toggle status { status: 'finished' | 'unfinished' }
GET    /orders/summary      → { totalOrders, totalRevenue, orders[] }
```

**Important:** Never send `price` or `totalPrice` from client — server always calculates this from DB.

---

## Environment Variables

### Backend (`.env`)
```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/cafe
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Common Developer Tasks

### Add a new menu category

1. Update `category` enum in `backend/src/menu/menu.schema.ts`
2. Update `CreateMenuDto` and `UpdateMenuDto` in `backend/src/menu/dto/`
3. Update `Category` type in `frontend/src/lib/types.ts`
4. Update `CategoryBadge.tsx` colors

### Add a new API endpoint

```bash
# Backend
# 1. Add method to service (business logic)
# 2. Add route to controller (thin — just call service)
# 3. Add DTO if request body needed

# Frontend
# 1. Add fetch function to frontend/src/lib/api.ts
# 2. Add type to frontend/src/lib/types.ts if needed
```

### Add a new frontend page

```bash
# Admin page
touch frontend/src/app/(admin)/my-page/page.tsx
# Add link in frontend/src/components/admin/Sidebar.tsx

# User page
touch frontend/src/app/(user)/my-page/page.tsx
```

---

## Architecture Rules (MUST FOLLOW)

### Backend
1. Controller = thin — only receives request, calls service, returns response
2. Service = all business logic
3. Every request body must use DTO + class-validator
4. Never accept `price` or `totalPrice` from client — always fetch from DB
5. Never hardcode `MONGODB_URI` — use `process.env`

### Frontend
1. `lib/api.ts` is the only place with `fetch` calls — no inline fetching in components
2. Every fetch must have try/catch
3. Never hardcode URLs — use `process.env.NEXT_PUBLIC_API_URL`
4. Never send `price`/`totalPrice` in `POST /orders`
5. `"use client"` only on files that use `useState` or event handlers
6. No `any` in TypeScript

---

## Design System

```
bg-main:      #0c0c10   (page background)
bg-surface:   #0f0f14   (cards)
bg-elevated:  #12121a   (modals, dropdowns)
border:       #1e1e2a
text-primary: #e8e6f0
text-muted:   #5a5870
gold:         #c9a96e   (primary CTA)
font:         Georgia (serif)
labels:       uppercase tracking-widest text-xs muted

Categories:
  coffee → bg #2a1a0e  text #c9833a
  tea    → bg #0e1f1a  text #4caf8a
  other  → bg #16161e  text #8b7fcf
```

---

## Debugging Guide

### Common Errors

| Error | Likely Cause | Fix |
|-------|-------------|-----|
| `MONGODB_URI is not defined` | Missing `.env` | Copy `.env.example` and fill in |
| `Cannot GET /menu` | Backend not running | `cd backend && npm run start:dev` |
| `CORS error` | `FRONTEND_URL` mismatch | Check `FRONTEND_URL` in backend `.env` |
| Menu items empty | DB not seeded | `cd backend && npm run seed` |
| `any` TypeScript error | Type missing | Add interface to `lib/types.ts` |

### Running Tests

```bash
cd backend
npm test              # unit tests
npm run test:cov      # with coverage
```

---

## Contribution Guidelines

### Branch Strategy
- `main` — production-ready
- `feat/<feature>` — new features
- `fix/<issue>` — bug fixes

### Commit Convention
```
feat: add auth middleware
fix: correct totalPrice calculation
update: improve order table UI
```

### PR Requirements
- No `any` in TypeScript
- No hardcoded URLs or credentials
- `totalPrice` must never come from client
- Follow existing module structure

---

## Audience Notes

### Junior Developers
- Start by reading `lib/api.ts` and `lib/types.ts` to understand the data model
- Follow the DTO pattern in `backend/src/menu/dto/` before adding new endpoints
- Use `CategoryBadge.tsx` as a reference for building small UI components

### Senior Engineers
- No auth layer yet — admin routes are fully open
- No WebSocket/real-time — orders require manual refresh
- `order.schema.ts` uses embedded item snapshots (not references) by design

### Contractors
- Stay within `(admin)/` or `(user)/` route group depending on scope
- All API calls go through `lib/api.ts` — do not add inline fetch
- Do not modify `totalPrice` calculation logic in `order.service.ts`
