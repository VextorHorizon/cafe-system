# ระบบจัดการร้านกาแฟ — Admin Dashboard (Frontend)

โปรเจกต์นี้คือ Frontend สำหรับระบบจัดการร้านกาแฟ พัฒนาด้วย [Next.js 14](https://nextjs.org) App Router + TypeScript + Tailwind CSS

---

## เทคโนโลยีที่ใช้

- **Next.js 14** — App Router
- **TypeScript**
- **Tailwind CSS** — Design system สีเข้ม (Dark theme)
- **Native fetch** — ไม่ใช้ axios
- **MongoDB** ผ่าน Backend (NestJS, port 3001)

---

## โครงสร้างโปรเจกต์

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  ← redirect → /menu
│   └── (admin)/
│       ├── layout.tsx            ← Sidebar + layout
│       ├── menu/page.tsx         ← จัดการเมนู (CRUD)
│       ├── orders/page.tsx       ← รายการออเดอร์
│       └── dashboard/page.tsx    ← สถิติและรายได้
├── components/
│   ├── ui/
│   │   ├── CategoryBadge.tsx
│   │   ├── StatCard.tsx
│   │   ├── TabBar.tsx
│   │   └── Toast.tsx
│   └── admin/
│       ├── Sidebar.tsx
│       ├── MenuTable.tsx
│       ├── MenuFormModal.tsx
│       ├── DeleteConfirmModal.tsx
│       └── OrderTable.tsx
└── lib/
    ├── types.ts                  ← TypeScript interfaces ทั้งหมด
    └── api.ts                    ← fetch functions ทั้งหมด
```

---

## วิธีรันโปรเจกต์

### 1. ติดตั้ง dependencies

```bash
npm install
```

### 2. สร้างไฟล์ `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. รัน development server

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

> **หมายเหตุ:** ต้องรัน Backend (NestJS) ที่ port 3001 ก่อน ไม่เช่นนั้น API calls จะ fail

---

## หน้าที่มีในระบบ

| หน้า | URL | คำอธิบาย |
|------|-----|-----------|
| เมนู | `/menu` | เพิ่ม / แก้ไข / ลบเมนู |
| ออเดอร์ | `/orders` | ดูประวัติออเดอร์ทั้งหมด |
| แดชบอร์ด | `/dashboard` | สถิติรายได้และออเดอร์ล่าสุด |

---

## คำสั่งที่ใช้บ่อย

```bash
npm run dev        # รัน development server (port 3000)
npm run build      # build สำหรับ production
npm run lint       # ตรวจสอบ code style
```
