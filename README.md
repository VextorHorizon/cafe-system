# Cafe Management System

ระบบจัดการร้านกาแฟ — Admin Dashboard สำหรับจัดการเมนู ออเดอร์ และดูสรุปยอดขาย

**Tech Stack:** NestJS + Next.js 14 + MongoDB + Tailwind CSS

---

## ทดลองใช้งานได้เลย (Live Demo)

| Service  | URL                                                                 |
| -------- | ------------------------------------------------------------------- |
| Frontend | https://frontend-production-0524.up.railway.app                     |
| Backend  | https://cafe-system-production.up.railway.app                       |

**เปิด browser แล้วไปที่ URL ด้านบนได้เลย** ระบบ deploy อยู่บน Railway ทั้งหมด ไม่ต้องติดตั้งอะไร

### ลองใช้ API โดยตรง

```bash
# ดูเมนูทั้งหมด
curl https://cafe-system-production.up.railway.app/menu

# ดูออเดอร์ทั้งหมด
curl https://cafe-system-production.up.railway.app/orders

# สรุปยอดขาย
curl https://cafe-system-production.up.railway.app/orders/summary
```

---

## สารบัญ

- [ภาพรวมระบบ](#ภาพรวมระบบ)
- [โครงสร้างโปรเจกต์](#โครงสร้างโปรเจกต์)
- [รันในเครื่อง (Local Dev)](#รันในเครื่อง-local-dev)
- [API Endpoints](#api-endpoints)
- [Data Flow](#data-flow)
- [Database Schema](#database-schema)
- [Frontend Pages](#frontend-pages)
- [Design System](#design-system)
- [Deployment บน Railway](#deployment-บน-railway)
- [Roadmap](#roadmap)

---

## ภาพรวมระบบ

```
┌──────────────────────────────────────────────────────────────────┐
│                        ผู้ใช้ (Browser)                           │
│        https://frontend-production-0524.up.railway.app           │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)                         │
│         frontend-production-0524.up.railway.app               │
│                                                                  │
│   ┌──────────┐    ┌──────────┐    ┌───────────┐                 │
│   │ /menu    │    │ /orders  │    │ /dashboard│                 │
│   │ CRUD เมนู│    │ ดูออเดอร์ │    │ สรุปยอด   │                 │
│   └──────────┘    └──────────┘    └───────────┘                 │
│                                                                  │
│   lib/api.ts  ← fetch ทุกอันอยู่ที่นี่ที่เดียว                    │
└─────────────────────────────┬────────────────────────────────────┘
                              │  HTTPS fetch
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Backend (NestJS)                              │
│         cafe-system-production.up.railway.app                    │
│                                                                  │
│   ┌────────────────┐      ┌─────────────────┐                   │
│   │  MenuModule    │      │   OrderModule   │                   │
│   │  CRUD เมนู     │      │  สร้าง/ดูออเดอร์  │                   │
│   │                │      │  คำนวณราคา       │                   │
│   └───────┬────────┘      └───────┬─────────┘                   │
│           └──────────┬────────────┘                             │
│                      ▼  Mongoose ODM                            │
└─────────────────────────────┬────────────────────────────────────┘
                              │  Private Network (TCP)
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                    MongoDB (Railway)                             │
│                    Internal only — port 27017                    │
│           ┌──────────────┐    ┌──────────────┐                  │
│           │  menuitems   │    │    orders    │                  │
│           └──────────────┘    └──────────────┘                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## โครงสร้างโปรเจกต์

```
cafe-system/
├── backend/                    ← NestJS API Server
│   ├── .env.example            ← ตัวอย่าง environment variables
│   └── src/
│       ├── main.ts             ← CORS, ValidationPipe, port 3001
│       ├── app.module.ts       ← MongooseModule, ConfigModule
│       ├── seed.ts             ← Seed เมนูเริ่มต้น 5 รายการ
│       ├── menu/
│       │   ├── menu.schema.ts
│       │   ├── menu.module.ts
│       │   ├── menu.service.ts       ← Business logic เมนู
│       │   ├── menu.controller.ts    ← Routes เมนู
│       │   └── dto/
│       │       ├── create-menu.dto.ts
│       │       └── update-menu.dto.ts
│       └── order/
│           ├── order.schema.ts
│           ├── order.module.ts
│           ├── order.service.ts      ← Business logic ออเดอร์ + คำนวณราคา
│           ├── order.controller.ts   ← Routes ออเดอร์
│           └── dto/
│               ├── create-order.dto.ts
│               └── update-order-status.dto.ts
│
└── frontend/                   ← Next.js 14 App Router
    └── src/
        ├── app/
        │   ├── page.tsx              ← Redirect → /menu
        │   ├── layout.tsx            ← Root layout
        │   ├── globals.css
        │   └── (admin)/             ← Route Group สำหรับ Admin
        │       ├── layout.tsx        ← Sidebar layout
        │       ├── menu/page.tsx     ← หน้าจัดการเมนู
        │       ├── orders/page.tsx   ← หน้าดูออเดอร์
        │       └── dashboard/page.tsx← หน้าสรุปยอดขาย
        ├── components/
        │   ├── admin/
        │   │   ├── Sidebar.tsx
        │   │   ├── MenuTable.tsx
        │   │   ├── MenuFormModal.tsx
        │   │   ├── DeleteConfirmModal.tsx
        │   │   └── OrderTable.tsx
        │   └── ui/
        │       ├── CategoryBadge.tsx
        │       ├── StatCard.tsx
        │       ├── Toast.tsx
        │       ├── TabBar.tsx
        │       └── FilterChips.tsx
        └── lib/
            ├── types.ts              ← TypeScript interfaces ทั้งหมด
            └── api.ts                ← Fetch functions ทั้งหมด
```

---

## รันในเครื่อง (Local Dev)

### สิ่งที่ต้องมี

- **Node.js** v18+
- **npm**
- **MongoDB** — ใช้ [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier) หรือ local

### ขั้นตอน

#### 1. Clone โปรเจกต์

```bash
git clone https://github.com/VextorHorizon/cafe-system.git
cd cafe-system
```

#### 2. ตั้งค่า Backend

```bash
cd backend
npm install
```

สร้างไฟล์ `.env` (ดูตัวอย่างที่ `backend/.env.example`):

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/cafe-db
PORT=3001
FRONTEND_URL=http://localhost:3000
```

Seed เมนูเริ่มต้น **(รันครั้งเดียว)**:

```bash
npm run seed
# สร้างเมนู 5 รายการ: ลาเต้, กาแฟดำ, ชาดำ, มัทฉะลาเต้, โกโก้
```

รัน backend:

```bash
npm run start:dev
# → http://localhost:3001
```

#### 3. ตั้งค่า Frontend

```bash
cd frontend
npm install
```

สร้างไฟล์ `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

รัน frontend:

```bash
npm run dev
# → http://localhost:3000
```

#### 4. เปิดใช้งาน

ไปที่ `http://localhost:3000` — ระบบ redirect ไปหน้า `/menu` อัตโนมัติ

---

## API Endpoints

Base URL (production): `https://cafe-system-production.up.railway.app`

### Menu

| Method   | Endpoint     | คำอธิบาย              | Body                            |
| -------- | ------------ | --------------------- | ------------------------------- |
| `GET`    | `/menu`      | ดูเมนูทั้งหมด (active) | —                               |
| `POST`   | `/menu`      | เพิ่มเมนูใหม่          | `{ name, price, category }`     |
| `PATCH`  | `/menu/:id`  | แก้ไขเมนู             | `{ name?, price?, category? }`  |
| `DELETE` | `/menu/:id`  | ลบเมนู               | —                               |

### Orders

| Method   | Endpoint             | คำอธิบาย           | Body                                     |
| -------- | -------------------- | ------------------ | ---------------------------------------- |
| `POST`   | `/orders`            | สร้างออเดอร์        | `{ items: [{ menuItemId, quantity }] }`  |
| `GET`    | `/orders`            | ดูออเดอร์ทั้งหมด    | —                                        |
| `PATCH`  | `/orders/:id/status` | เปลี่ยนสถานะ        | `{ status: "finished" \| "unfinished" }` |
| `GET`    | `/orders/summary`    | สรุปยอดขาย         | —                                        |

### ตัวอย่าง Request

```bash
# เพิ่มเมนูใหม่
curl -X POST https://cafe-system-production.up.railway.app/menu \
  -H "Content-Type: application/json" \
  -d '{"name": "อเมริกาโน่", "price": 55, "category": "coffee"}'

# สร้างออเดอร์ (ใส่ menuItemId จริงจาก GET /menu)
curl -X POST https://cafe-system-production.up.railway.app/orders \
  -H "Content-Type: application/json" \
  -d '{"items": [{"menuItemId": "<id>", "quantity": 2}]}'
```

### ทดสอบ Order Flow แบบ Step-by-Step

ทำตามลำดับนี้เพื่อทดสอบการสั่งออเดอร์ครบ loop:

**Step 1 — ดูเมนูและเก็บ `_id`**

```bash
curl https://cafe-system-production.up.railway.app/menu
```

ผลลัพธ์จะได้ array ของเมนู — คัดลอก `_id` ของเมนูที่ต้องการสั่ง

**Step 2 — สร้างออเดอร์**

```bash
curl -X POST https://cafe-system-production.up.railway.app/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "menuItemId": "<_id จาก Step 1>", "quantity": 2 },
      { "menuItemId": "<_id อื่น>", "quantity": 1 }
    ]
  }'
```

> ห้ามส่ง `price` — backend คำนวณเอง
> Response จะได้ `Order` object พร้อม `_id` และ `totalPrice`

**Step 3 — ตรวจสอบว่าออเดอร์ถูกสร้าง**

```bash
curl https://cafe-system-production.up.railway.app/orders
```

**Step 4 — เปลี่ยนสถานะออเดอร์**

```bash
curl -X PATCH https://cafe-system-production.up.railway.app/orders/<_id จาก Step 2>/status \
  -H "Content-Type: application/json" \
  -d '{"status": "finished"}'
```

**Step 5 — ดูสรุปยอดขาย**

```bash
curl https://cafe-system-production.up.railway.app/orders/summary
```

ผลลัพธ์: `{ totalOrders, totalRevenue, orders[] }`

---

### Validation Rules

- `category`: ต้องเป็น `coffee`, `tea`, หรือ `other` เท่านั้น
- `quantity`: จำนวนเต็ม 1–20
- `price`: ตัวเลข >= 0
- `name`: ไม่เว้นว่าง

---

## Data Flow

### การสร้างออเดอร์

```
Client                        Backend                       MongoDB
  │                               │                               │
  │  POST /orders                 │                               │
  │  { items: [                   │                               │
  │    { menuItemId, quantity }   │                               │
  │  ]}                           │                               │
  │  *** ไม่ส่ง price ***          │                               │
  │──────────────────────────────>│                               │
  │                               │  วน loop แต่ละ item:           │
  │                               │  ดึง MenuItem จาก DB           │
  │                               │──────────────────────────────>│
  │                               │<──────────────────────────────│
  │                               │  snapshot name + unitPrice     │
  │                               │  คำนวณ totalPrice server-side  │
  │                               │  บันทึก Order                  │
  │                               │──────────────────────────────>│
  │<──────────────────────────────│                               │
  │  Response: Order object       │                               │
```

**หลักการสำคัญ:**
- Client ส่งแค่ `menuItemId` + `quantity` — **ห้ามส่ง price** เพื่อป้องกันการปลอมแปลงราคา
- Order เก็บ **snapshot** ของเมนู (name + unitPrice ณ เวลาสั่ง) ไม่ใช่ reference — แม้เมนูถูกแก้ไขภายหลัง ออเดอร์เดิมยังคงถูกต้อง

---

## Database Schema

### MenuItem Collection

| Field       | Type    | คำอธิบาย                            |
| ----------- | ------- | ----------------------------------- |
| `name`      | String  | ชื่อเมนู                             |
| `price`     | Number  | ราคา (บาท)                          |
| `category`  | String  | `coffee` / `tea` / `other`          |
| `isActive`  | Boolean | แสดงในรายการหรือไม่ (default: `true`) |
| `createdAt` | Date    | auto                                |
| `updatedAt` | Date    | auto                                |

### Order Collection

| Field               | Type     | คำอธิบาย                             |
| ------------------- | -------- | ------------------------------------ |
| `items`             | Array    | รายการสินค้า (embedded snapshot)      |
| `items[].menuItemId`| ObjectId | อ้างอิง MenuItem                     |
| `items[].name`      | String   | ชื่อเมนู ณ เวลาสั่ง                   |
| `items[].quantity`  | Number   | จำนวน                                |
| `items[].unitPrice` | Number   | ราคาต่อชิ้น ณ เวลาสั่ง               |
| `totalPrice`        | Number   | ราคารวม (คำนวณ server-side)           |
| `source`            | String   | `admin` / `user` / `null`            |
| `status`            | String   | `unfinished` / `finished`            |
| `createdAt`         | Date     | auto                                 |

---

## Frontend Pages

### `/menu` — จัดการเมนู
- ดูรายการเมนูทั้งหมดในตาราง
- กรองตาม category (All / Coffee / Tea / Other)
- เพิ่ม / แก้ไข / ลบเมนูผ่าน Modal
- แจ้งเตือนด้วย Toast เมื่อทำรายการสำเร็จ/ล้มเหลว

### `/orders` — ดูออเดอร์
- ดูออเดอร์ทั้งหมด เรียงจากใหม่สุด
- กรองตามช่วงเวลา (ทั้งหมด / วันนี้ / สัปดาห์นี้)
- Toggle สถานะออเดอร์ (finished / unfinished)
- ออเดอร์ที่เสร็จแล้วจะแสดงจางลง

### `/dashboard` — สรุปยอดขาย
- สถิติ: จำนวนออเดอร์ทั้งหมด, ยอดขายรวม, ยอดเฉลี่ยต่อออเดอร์
- ตารางออเดอร์ล่าสุด 10 รายการ

---

## Design System

ธีมสีโทนมืดสไตล์ร้านกาแฟ — ฟอนต์ Georgia (serif)

| ตัวแปร        | สี        | ใช้กับ               |
| ------------- | --------- | -------------------- |
| `main`        | `#0c0c10` | พื้นหลังหลัก           |
| `surface`     | `#0f0f14` | พื้นหลัง card         |
| `elevated`    | `#12121a` | พื้นหลังที่ยกขึ้น       |
| `cafe-border` | `#1e1e2a` | เส้นขอบ              |
| `primary`     | `#e8e6f0` | ตัวหนังสือหลัก         |
| `muted`       | `#5a5870` | ตัวหนังสือรอง          |
| `gold`        | `#c9a96e` | ปุ่ม CTA / accent    |

### Category Badges

| Category | พื้นหลัง    | ตัวหนังสือ |
| -------- | --------- | --------- |
| Coffee   | `#2a1a0e` | `#c9833a` |
| Tea      | `#0e1f1a` | `#4caf8a` |
| Other    | `#16161e` | `#8b7fcf` |

---

## Deployment บน Railway

โปรเจกต์ deploy บน **Railway** แบบ 3 services แยกกัน

### Infrastructure

| Service      | Source                           | URL / Access                                        | Port |
| ------------ | -------------------------------- | --------------------------------------------------- | ---- |
| Frontend     | GitHub `/frontend` (branch: main)| https://frontend-production-0524.up.railway.app     | 8080 |
| Backend      | GitHub `/backend` (branch: main) | https://cafe-system-production.up.railway.app       | 3001 |
| MongoDB      | Docker `mongo:8.0`               | Internal only — Private Network                     | 27017|

### Environment Variables

**Frontend Service:**

| Variable              | ค่า                                                    |
| --------------------- | ------------------------------------------------------ |
| `NEXT_PUBLIC_API_URL` | `https://cafe-system-production.up.railway.app`        |

**Backend Service (cafe-system):**

| Variable       | ค่า                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------- |
| `MONGODB_URI`  | `mongodb://${{MONGOUSER}}:${{MONGOPASSWORD}}@${{MONGOHOST}}:${{MONGOPORT}}/cafe-db`          |
| `FRONTEND_URL` | `https://frontend-production-0524.up.railway.app`                                            |
| `PORT`         | Railway กำหนดให้อัตโนมัติ                                                                    |

**MongoDB Service:**

| Variable                    | คำอธิบาย                                           |
| --------------------------- | -------------------------------------------------- |
| `MONGO_INITDB_ROOT_USERNAME`| root username                                      |
| `MONGO_INITDB_ROOT_PASSWORD`| root password                                      |
| `MONGOUSER`                 | `${{MONGO_INITDB_ROOT_USERNAME}}` (alias)          |
| `MONGOPASSWORD`             | `${{MONGO_INITDB_ROOT_PASSWORD}}` (alias)          |
| `MONGOHOST`                 | `${{RAILWAY_PRIVATE_DOMAIN}}` (private network)    |
| `MONGOPORT`                 | `27017`                                            |

### Build & Start Config

| Service  | Source               | Build Command        | Start Command                                                      | Port |
| -------- | -------------------- | -------------------- | ------------------------------------------------------------------ | ---- |
| Frontend | `/frontend`          | Railpack auto-detect | Railpack auto-detect                                               | 8080 |
| Backend  | `/backend`           | Railpack auto-detect | Railpack auto-detect                                               | 3001 |
| MongoDB  | `docker mongo:8.0`   | —                    | `docker-entrypoint.sh mongod` (private network only)               | 27017|

> **หมายเหตุ:** seed ข้อมูลเริ่มต้นต้องรัน manual ผ่าน Railway CLI:
> ```bash
> railway run --service cafe-system npm run seed
> ```

---

## Architecture Highlights

- **Monorepo** — backend + frontend อยู่ใน repo เดียว deploy แยก service บน Railway
- **DTO Validation** — ทุก request ผ่าน `class-validator` ก่อนเข้า business logic
- **Server-side Price** — ราคาคำนวณที่ backend เสมอ ไม่รับจาก client
- **Embedded Snapshot** — Order เก็บสำเนาข้อมูลเมนู ณ เวลาสั่ง ไม่ใช่ reference
- **Centralized API** — Frontend รวม fetch ทั้งหมดไว้ที่ `lib/api.ts` ไฟล์เดียว
- **Route Groups** — ใช้ Next.js Route Group `(admin)/` แยก layout สำหรับ admin พร้อมรองรับ `(user)/` ในอนาคต

---

## Roadmap

ฟีเจอร์ที่วางแผนพัฒนาต่อ - เรียงตามลำดับความสำคัญ

### 1. หน้าสั่งออเดอร์ฝั่งลูกค้า (POS-style)

Route group `(user)/` แยกจาก `(admin)/` — ลูกค้าสั่งเองผ่าน browser

```
(user)/
└── order/
    ├── page.tsx         ← MenuGrid แสดงเมนูทั้งหมด
    └── components/
        ├── MenuGrid.tsx      ← card เมนู + ปุ่มเพิ่ม/ลด quantity
        ├── CartDrawer.tsx    ← ลิ้นชักตะกร้า slide จากขวา
        └── ConfirmModal.tsx  ← ยืนยันก่อนสั่ง
```

**Behavior:**
- แสดงเมนูที่ `isActive: true` เป็น grid card
- กด card เพื่อเพิ่มลงตะกร้า / กด + − เพื่อปรับจำนวน
- CartDrawer แสดงรายการและราคารวม (คำนวณ client-side เพื่อ preview เท่านั้น)
- กด "ยืนยันออเดอร์" → `POST /orders` → backend คำนวณราคาจริง
- ใช้ React Context สำหรับ cart state — ไม่ต้องแก้ backend เลย

---

### 2. Authentication — Admin Protection

ป้องกัน `/admin` ด้วย JWT-based auth

**Backend (`AuthModule`):**
```
src/auth/
├── auth.module.ts
├── auth.controller.ts   ← POST /auth/login
├── auth.service.ts      ← validate + sign JWT
├── jwt.strategy.ts      ← Passport JWT strategy
├── jwt-auth.guard.ts    ← Guard ใส่บน controller
└── dto/
    └── login.dto.ts     ← { username, password }
```

**Flow:**
```
Admin → POST /auth/login { username, password }
      ← { access_token: "eyJ..." }

Admin → GET /orders  (Authorization: Bearer <token>)
      ← orders[]    ✅

User  → GET /menu    (ไม่ต้องใช้ token — public)
      ← menu[]      ✅

User  → POST /menu   (ไม่มี token)
      ← 401 Unauthorized ✅
```

**Protected endpoints (ต้อง token):**
- `POST /menu`, `PATCH /menu/:id`, `DELETE /menu/:id`
- `PATCH /orders/:id/status`
- `GET /orders/summary`

**Public endpoints (ไม่ต้อง token):**
- `GET /menu` — ลูกค้าต้องดูเมนูได้
- `POST /orders` — ลูกค้าต้องสั่งได้
- `GET /orders` — ขึ้นอยู่กับ policy

**Frontend (`AuthModule`):**
- หน้า `/admin/login` — form username + password
- เก็บ token ใน `httpOnly cookie` หรือ `sessionStorage`
- `middleware.ts` redirect `/admin/*` → `/admin/login` ถ้าไม่มี token
- API calls แนบ `Authorization: Bearer <token>` header อัตโนมัติ

**Stack:** `@nestjs/passport` + `passport-jwt` + `bcrypt` + `@nestjs/jwt`

---

### 3. Auto-clear Orders เกิน 3 วัน

```typescript
// ใน OrderModule หรือ CleanupModule
@Cron('0 0 * * *')  // ทุกคืนเที่ยงคืน
async deleteOldOrders() {
  const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  await this.orderModel.deleteMany({ createdAt: { $lt: cutoff } });
}
```

Stack: `@nestjs/schedule`

---

## สิ่งที่ได้เรียนรู้จากโปรเจ็คนี้(และมีโปรเจ็คอื่นๆที่ใช้ในการเรียนรู้ที่ผ่านมา)

1. เข้าใจเรื่องระบบของหลังบ้านเว็บว่าทำงานยังไง CRUD, POST GET PATCH DELETE ว่า Http Request ทำงานยังไง แล้วใช้กับ Nestjs ที่ใช้อยู่ยังไง

2. Structure ของ Nestjs ช่วงแรกปวดหัวมาก(เพราะว่าไม่เคยแตะ Js, Ts มาก่อนเลย) แต่ว่า Go กับ Ts มีความคล้ายๆกันเล็กน้อย ก็เลยพอๆจับต้นชนปลายถูก เข้าใจคอนเซ็ป OOP บ้าง แต่ว่าตอนนี้เข้าว่า Controller คืออะไร Service คืออะไร เรียกใช้แบบไหน แต่ว่างงกับ Decorator อยู่พอสมควร(แต่ช่วงหลังๆเริ่มเข้าใจบ้างแล้วจำพวก `@Controller()`, `@Get()`, `@Body()` ไม่ได้เป็น syntax พิเศษ มันแค่บอก NestJS ว่า "ไฟล์นี้รับหน้าที่อะไร" เหมือน tag ที่ติดไว้ให้ framework อ่าน)

3. MongoDB อันนี้สุดยอดมากเพราะว่าตอนแรกนึกว่าทุกอย่างต้องเป็น Structure แบบ SQL แต่ว่าหลักการง่ายๆคือเรากำหนด Schema ให้มันแล้วมันเก็บข้อมูลเอง

4. Backend-as-Gatekeeper Mindset เข้าใจว่า Nestjs คือ framework ทื่ gatekeep ให้ validation ให้ก่อนที่ input จาก client จะเข้าตัวของ backend จริง

5. เข้าใจจริงๆว่าในส่วนของ Backend กับ Frontend คุยกันยังไง เรียกใช้หลังบ้านจาก API endpoint ยังไง 

6. Prompt Engineering Skill อันนี้เกิดจากที่เรารู้ว่าหลังบ้านมันหน้าตายังไง data flow ไหลไปทางไหนบ้าง ทำให้เราสั่ง Agents ทำงานได้แบบที่เขาต้องการจริงๆ

7. Testing คือ Documentation อีกรูปแบบ 41 test cases ที่เขียนไปก็คือเอกสารที่อธิบาย behavior ของระบบได้ชัดกว่า README  พออ่าน test ก้สามารถรู้ทันทีว่า quantity > 20 reject, invalid menuItemId return 404 โดยไม่ต้องอ่านโค้ดเลย

8. ไม่เคยตั้ง Branch แล้วทำแยกมาก่อน พึ่งรู้ว่า git เจ๋งขนาดนี้ครับ

## สิ่งที่ต้องพัฒนาในอนาคต

1. ในเรื่องของ Frontend กับ Nextjs ตอนนี้พื้นฐานยังไม่แน่นมาก(ส่วนใหญ่ใช้ AI Automate ทางนี้เลย) เลยทำให้เกิดปัญหาบางทีจาก frontend เราดีบักโค้ดไม่ออกเพราะเราไม่รู้ว่าข้อมูลใน frontend มันไหลยังไง(โดยรวมคร่าวๆพอเก็ตแค่เรื่องของ nextjs frontend for backend)

2. Security อันนี้หนักเลยเพราะว่ายังไม่มีประสบการณ์มากในการที่จะรู้พอว่าอันไหนคือจุดบกพร่องทั้ง Logic กับ Code Security

3. TypeScript Syntax แบบหนักๆ ตอนนี้ยังพึ่ง AI generate type ให้อยู่ สิ่งที่ต้องพัฒนาคือการอ่าน type error แล้วแก้ได้เองโดยไม่ต้องถาม เพราะ TypeScript error message บอกปัญหาครบอยู่แล้ว แค่ยังไม่คุ้นกับภาษา

4. Decorator และ Dependency Injection อย่างลึก เข้าใจ surface level แล้วว่า `@Controller()` `@Injectable()` คืออะไร แต่ยังไม่เข้าใจว่า NestJS จัดการ lifecycle และ inject dependency ยังไงข้างใต้ ตรงนี้สำคัญมากถ้าจะ debug เวลา module ไม่ถูก import หรือ circular dependency เกิด

5. ลดการพึ่งพาการใช้ AI มากเกินไป (อันนี้หนักอยู่ครับ)

6. ตอนนี้เริ่มเล็งๆเรื่องของ Github Action ไว้ครับ

ขอบคุณมากครับพี่ๆ  <img src="https://i.pinimg.com/736x/ef/4f/fc/ef4ffc8e018fb320acccf3b22b769fff.jpg" alt="Description" width="75">  Nestjs ทำให้เข้าใจภาพรวมหลังบ้านเยอะขึ้นมากครับ
