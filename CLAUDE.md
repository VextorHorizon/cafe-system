# Cafe Management System — Claude Code Context

## Project Overview
Fullstack Cafe Management System — Admin Dashboard
NestJS backend + Next.js frontend + MongoDB

## Monorepo Structure
```
cafe-system/
├── backend/    ← NestJS, port 3001
└── frontend/   ← Next.js, port 3000 (in progress)
```

---

## Backend (DONE)

### Stack
- NestJS + TypeScript
- MongoDB via Mongoose (`@nestjs/mongoose`)
- Validation: `class-validator` + `class-transformer`
- Config: `@nestjs/config`

### Modules
```
src/
├── main.ts              ← CORS, ValidationPipe, port
├── app.module.ts        ← ConfigModule, MongooseModule
├── menu/                ← CRUD เมนู
│   ├── menu.schema.ts   ← name, price, category, isActive, timestamps
│   ├── menu.module.ts
│   ├── menu.service.ts
│   ├── menu.controller.ts
│   └── dto/
│       ├── create-menu.dto.ts
│       └── update-menu.dto.ts
├── order/               ← ออเดอร์ + คำนวณราคา
│   ├── order.schema.ts  ← embedded items snapshot, totalPrice, source, status
│   ├── order.module.ts
│   ├── order.service.ts
│   ├── order.controller.ts
│   └── dto/
│       └── create-order.dto.ts
└── seed.ts              ← 5 default menu items, run once
```

### API Endpoints
```
GET    /menu              → รายการเมนูที่ isActive: true
POST   /menu              → เพิ่มเมนู { name, price, category }
PATCH  /menu/:id          → แก้ไขเมนู (partial)
DELETE /menu/:id          → ลบเมนู

POST   /orders            → สร้างออเดอร์ { items: [{ menuItemId, quantity }] }
GET    /orders            → รายการออเดอร์ทั้งหมด (newest first)
PATCH  /orders/:id/status → อัปเดตสถานะออเดอร์ { status: 'finished' | 'unfinished' }
GET    /orders/summary    → { totalOrders, totalRevenue, orders[] }
```

### Architecture Rules — ห้ามละเมิด
1. Controller = thin — รับ req, เรียก service, return res เท่านั้น ห้ามมี logic
2. Service = ทุก business logic อยู่ที่นี่
3. ทุก request body ต้องผ่าน DTO + class-validator
4. ห้ามรับ price หรือ totalPrice จาก client — ดึงจาก DB เองเสมอ
5. totalPrice คำนวณ server-side เสมอ
6. ห้าม hardcode MONGODB_URI — ใช้ process.env เสมอ

### Validation Rules
- `category`: enum `coffee | tea | other` เท่านั้น
- `quantity`: integer, min 1, max 20
- `price`: number, min 0
- `name`: string, not empty

### Order Schema Design
- items[] เป็น embedded snapshot (ไม่ใช่ reference) — เก็บ name + unitPrice ณ เวลาสั่ง
- `source` field: nullable string เผื่อ future `admin | user` role

### Environment
```env
MONGODB_URI=mongodb+srv://...
PORT=3001
FRONTEND_URL=http://localhost:3000
```

---

## Frontend (DONE)

### Stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS (utility only)
- native fetch (no axios)
- useState + useEffect (no Redux/Zustand)

### Actual Structure
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  ← redirect → /order
│   ├── (admin)/
│   │   ├── layout.tsx            ← Sidebar
│   │   ├── menu/page.tsx         ← Menu CRUD
│   │   ├── orders/page.tsx       ← Order list
│   │   └── dashboard/page.tsx    ← Stats + revenue
│   └── (user)/
│       ├── layout.tsx            ← CartProvider + header
│       └── order/page.tsx        ← POS-style customer order page
├── components/
│   ├── ui/
│   │   ├── CategoryBadge.tsx
│   │   ├── StatCard.tsx
│   │   ├── Toast.tsx
│   │   ├── FilterChips.tsx
│   │   └── TabBar.tsx
│   ├── admin/
│   │   ├── Sidebar.tsx
│   │   ├── MenuTable.tsx
│   │   ├── MenuFormModal.tsx
│   │   ├── DeleteConfirmModal.tsx
│   │   └── OrderTable.tsx
│   └── user/
│       ├── MenuGrid.tsx
│       ├── CartDrawer.tsx
│       └── OrderConfirmModal.tsx
├── context/
│   └── CartContext.tsx           ← cart state (React Context)
└── lib/
    ├── types.ts                  ← ALL interfaces here
    └── api.ts                    ← ALL fetch functions here
```

### Architecture Rules
1. `lib/api.ts` คือที่เดียวที่มี fetch — ห้าม inline fetch ใน component
2. ทุก fetch ต้องมี try/catch
3. ห้าม hardcode URL — ใช้ `process.env.NEXT_PUBLIC_API_URL`
4. ห้าม send price/totalPrice ใน POST /orders
5. `"use client"` เฉพาะไฟล์ที่มี useState หรือ event handler
6. ห้าม `any` ใน TypeScript

### Route Groups
```
(admin)/   ← done
(user)/    ← done — /order POS page with CartContext
```

### Design System
```
bg-main:     #0c0c10
bg-surface:  #0f0f14
bg-elevated: #12121a
border:      #1e1e2a
text-primary: #e8e6f0
text-muted:  #5a5870
gold:        #c9a96e   ← primary CTA

category coffee: bg #2a1a0e  text #c9833a
category tea:    bg #0e1f1a  text #4caf8a
category other:  bg #16161e  text #8b7fcf

font: Georgia (serif)
labels: uppercase tracking-widest text-xs muted
```

### Key Types (lib/types.ts)
```typescript
type Category = 'coffee' | 'tea' | 'other'

interface MenuItem { _id, name, price, category, isActive, createdAt }
interface Order { _id, items: OrderItem[], totalPrice, source, createdAt }
interface OrderItem { menuItemId, name, quantity, unitPrice }
interface OrderSummary { totalOrders, totalRevenue, orders }
interface CreateMenuPayload { name, price, category }
interface UpdateMenuPayload { name?, price?, category?, isActive? }
interface CreateOrderPayload { items: { menuItemId, quantity }[] }
```

### env
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Dev Commands
```bash
# Backend
cd backend && npm run start:dev   ← port 3001, hot reload
cd backend && npm run seed        ← seed 5 default menus (run once)

# Frontend
cd frontend && npm run dev        ← port 3000
```

## Current Status

### Backend
- [x] MenuModule CRUD
- [x] OrderModule + validation + price calculation (blocks inactive items)
- [x] seed script (5 default menus)
- [x] Order status toggle (finished / unfinished)
- [x] Auto-clear orders older than 3 days (`order-cleanup.service.ts`)
- [x] `isActive` in UpdateMenuDto — inactive items blocked at order creation

### Frontend
- [x] setup + lib/types.ts + lib/api.ts
- [x] Sidebar + admin layout
- [x] /admin/menu page (CRUD)
- [x] /admin/orders page (list + status toggle)
- [x] /admin/dashboard page (stats + revenue)
- [x] /order page — POS-style customer menu (MenuGrid + CartDrawer + OrderConfirmModal)
- [x] CartContext — cart state management
- [x] API linked end-to-end (customer → POST /orders)

---

## Roadmap

### UI Redesign (next)
- ออกแบบ design system ใหม่
- อัปเดต Tailwind config + components ทั้งหมด

---

## UI Mockup Reference

**File:** `mockup.html` (root of repo) — open directly in any browser, no server needed.

### What the mockup covers
Single HTML file, React 18 via Babel CDN, zero dependencies. Implements the full proposed redesign:

| View | Description |
|------|-------------|
| Dashboard | Stat cards (revenue, orders, status) + full orders table with totals |
| จัดการเมนู | CRUD table, category filter, add/edit modal, delete confirm modal, toggle active |
| รายการออเดอร์ | Filter by status, stat cards, status toggle, amber row tint on pending |
| สั่งเมนู (POS) | Menu grid, cart drawer, qty steppers, order confirm modal |

### Design tokens used in mockup
```
--bg:         #0c0c10   (main background)
--surface:    #0f0f14   (card background)
--surface-2:  #12121a   (elevated / inputs)
--border:     #1e1e2a
--text:       #e8e6f0
--text-2:     #b8b5c8
--muted:      #5a5870
--sidebar-bg: #080810
--gold:       #c9a96e   (primary CTA)
--green:      #4caf8a
--amber:      #c9833a
--red:        #e05252
```

### Template source
Layout structure and component patterns adapted from the **Thai BBQ Staff Dashboard Style Template** (sidebar shell, StatCard, Badge, Btn, Modal, Data Table patterns). Colors remapped to the cafe system's dark palette.

### How to use for redesign
1. Open `mockup.html` in browser — all 4 views are fully interactive with live state
2. Use the token table above when migrating to Tailwind — replace current Tailwind arbitrary values with CSS variables
3. Component names in mockup (`StatCard`, `Badge`, `Btn`, `Dot`, `FL`) map 1:1 to planned `src/components/ui/` files
4. Inter font for all numbers, Sarabun for Thai labels — replaces current Georgia serif
