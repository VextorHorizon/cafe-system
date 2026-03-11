# Cafe Management System - Backend

โปรเจค Backend สำหรับระบบจัดการร้านคาเฟ่ พัฒนาด้วย NestJS และ MongoDB (Mongoose) เน้นความ Clean, Secure, และ Scalable เป็นหลัก

## โครงสร้างโปรเจค

```
backend/
├── src/
│   ├── main.ts              # จุดเริ่มต้นโปรเจค (CORS, ValidationPipe, Port)
│   ├── app.module.ts        # Module หลัก (Config, Mongoose, Menu, Order)
│   ├── menu/                # จัดการข้อมูลเมนู
│   │   ├── menu.schema.ts   
│   │   ├── menu.module.ts   
│   │   ├── menu.service.ts  
│   │   ├── menu.controller.ts
│   │   └── dto/
│   ├── order/               # จัดการข้อมูลออเดอร์
│   │   ├── order.schema.ts  
│   │   ├── order.module.ts  
│   │   ├── order.service.ts 
│   │   ├── order.controller.ts
│   │   └── dto/
│   └── seed.ts              # สคริปต์สำหรับเพิ่มข้อมูลเริ่มต้น
```

## สถาปัตยกรรมและข้อกำหนด (Architecture Rules)

โปรเจคนี้ถูกออกแบบตามข้อกำหนดอย่างเคร่งครัดดังนี้:
1. **Thin Controller**: Controller จะทำหน้าที่รับ Request ส่งต่อให้ Service และคืน Response เท่านั้น จะไม่มี Logic ใดๆ ในชั้นนี้
2. **Service Layer**: Business Logic ทั้งหมดถูกประมวลผลที่นี่ เช่น การอ้างอิงราคาจากฐานข้อมูล, การคำนวณราคารวม 
3. **Data Validation (DTO)**: ทุก Request Body ต้องผ่าน ValidationPipe (class-validator) ถ้าข้อมูลไม่ตรงตามกำหนดจะถูกตีตก (400 Bad Request) ทันที
4. **Server-side Price Calculation (Security)**: `totalPrice` ของออเดอร์จะต้องถูกคำนวณที่ฝั่ง Server เท่านั้น โดยดึงราคาจากฐานข้อมูล เพื่อป้องกันไม่ให้ผู้ใช้ส่งราคาปลอมแปลงมาได้
5. **Price Snapshot**: เมื่อสร้างออเดอร์ ระบบจะทำการ snapshot ชื่อเมนูและราคา ณ เวลานั้นเก็บไว้ในออเดอร์ เพื่อโครงสร้างข้อมูลที่ถูกต้องแม้ว่าจะมีการปรับราคาเมนูในอนาคต

## API Endpoints

### Menu (เมนู)
- `GET /menu` - แสดงรายการเมนูทั้งหมดที่เปิดขาย (isActive)
- `POST /menu` - สร้างเมนูใหม่
- `PATCH /menu/:id` - แก้ไขข้อมูลเมนู (เช่น ปิดการขาย)
- `DELETE /menu/:id` - ลบเมนู

### Order (ออเดอร์)
- `POST /orders` - สร้างออเดอร์ใหม่ (รวมการคำนวณราคาสุทธิ)
- `GET /orders` - แสดงรายการออเดอร์ทั้งหมดเรียงตามวันที่ลดหลั่นกัน
- `GET /orders/summary` - ดึงข้อมูลสรุป (จำนวนออเดอร์ทั้งหมด, รายได้รวมทั้งหมด)

## การติดตั้งและรันโปรเจค

### ความต้องการของระบบ
- Node.js (แนะนำ v18 ขึ้นไป)
- MongoDB (Local หรือ Atlas)

### วิธีการติดตั้ง

1. ติดตั้ง Packages ทั้งหมด
```bash
npm install
```

2. ตั้งค่าไฟล์ตัวแปรแวดล้อม (Environment Variables)
คัดลอกไฟล์ `.env.example` มาเป็น `.env` และกำหนดค่า `MONGODB_URI` ของคุณ
```bash
cp .env.example .env
```

*ตัวอย่างไฟล์ `.env`:*
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/cafe-db
PORT=3001
FRONTEND_URL=http://localhost:3000
```

3. เพิ่มข้อมูลตัวอย่าง (Seed Data)
ให้รันคำสั่งด้านล่างนี้เพื่อสร้างเมนูตั้งต้น 5 รายการลงในฐานข้อมูล
```bash
npm run seed
```

4. เริ่มสั่งรัน Server สำหรับทำ Development
```bash
npm run start:dev
```
Server จะเริ่มทำงานที่พอร์ต 3001 (หรือตามที่ระบุในไฟล์ `.env`)
