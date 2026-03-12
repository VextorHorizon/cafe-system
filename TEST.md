# QA Test Report — Cafe Management System

**Date:** 2026-03-12
**Branch:** `feature/order-status`
**Backend:** NestJS · port 3001
**Frontend:** Next.js 14 · port 3000

---

## Summary

| ประเภท | Tests | ผลลัพธ์ |
|--------|-------|---------|
| Unit (Service) | 16 | ✅ 16/16 PASS |
| API / Integration | 25 | ✅ 25/25 PASS |
| E2E Frontend | — | ⚠️ ไม่มี framework |
| **รวม** | **41** | **✅ 41/41 PASS** |

---

## 1. Unit Tests

> ทดสอบ business logic แบบ isolated — mock Mongoose model ทั้งหมด ไม่ต้องใช้ DB
> Command: `cd backend && npm test`
> Time: 719ms

### MenuService · `src/menu/menu.service.spec.ts`

| # | Test Case | Result |
|---|-----------|--------|
| 1 | findAll › return active items only (isActive: true) | ✅ PASS |
| 2 | findAll › return empty array when no active items | ✅ PASS |
| 3 | create › create and return new menu item | ✅ PASS |
| 4 | update › return updated menu item | ✅ PASS |
| 5 | update › throw NotFoundException when item not found | ✅ PASS |
| 6 | remove › return deleted menu item | ✅ PASS |
| 7 | remove › throw NotFoundException when item not found | ✅ PASS |

**7/7 PASS**

### OrderService · `src/order/order.service.spec.ts`

| # | Test Case | Result |
|---|-----------|--------|
| 1 | create › calculate totalPrice correctly (single item) | ✅ PASS |
| 2 | create › calculate totalPrice for multiple items | ✅ PASS |
| 3 | create › throw NotFoundException for invalid menuItemId | ✅ PASS |
| 4 | findAll › return all orders sorted newest first | ✅ PASS |
| 5 | updateStatus › update status to `finished` | ✅ PASS |
| 6 | updateStatus › update status to `unfinished` | ✅ PASS |
| 7 | updateStatus › throw NotFoundException when order not found | ✅ PASS |
| 8 | getSummary › return correct totalOrders and totalRevenue | ✅ PASS |
| 9 | getSummary › return zeros when no orders exist | ✅ PASS |

**9/9 PASS**

---

## 2. API / Integration Tests

> Supertest ยิงตรงไปยัง `http://localhost:3001` — ทดสอบ HTTP layer + validation + DB จริง
> Command: `cd backend && npm run test:e2e`
> File: `test/api.e2e-spec.ts`
> Time: 2.3s

### Menu Endpoints

| # | Method | Endpoint | Test Case | Result |
|---|--------|----------|-----------|--------|
| 1 | GET | `/menu` | return 200 with array | ✅ PASS |
| 2 | GET | `/menu` | all items have `isActive: true` | ✅ PASS |
| 3 | GET | `/menu` | each item has required fields (_id, name, price, category) | ✅ PASS |
| 4 | POST | `/menu` | create item → 201 + correct fields | ✅ PASS |
| 5 | POST | `/menu` | reject invalid category → 400 | ✅ PASS |
| 6 | POST | `/menu` | reject missing name → 400 | ✅ PASS |
| 7 | POST | `/menu` | reject negative price → 400 | ✅ PASS |
| 8 | PATCH | `/menu/:id` | update item successfully | ✅ PASS |
| 9 | PATCH | `/menu/:id` | non-existent ID → 404 | ✅ PASS |
| 10 | DELETE | `/menu/:id` | delete and return item | ✅ PASS |
| 11 | DELETE | `/menu/:id` | non-existent ID → 404 | ✅ PASS |

**11/11 PASS**

### Order Endpoints

| # | Method | Endpoint | Test Case | Result |
|---|--------|----------|-----------|--------|
| 12 | POST | `/orders` | totalPrice คำนวณ server-side (ไม่รับจาก client) | ✅ PASS |
| 13 | POST | `/orders` | snapshot name + unitPrice จาก DB | ✅ PASS |
| 14 | POST | `/orders` | invalid menuItemId → 404 | ✅ PASS |
| 15 | POST | `/orders` | quantity = 0 → 400 | ✅ PASS |
| 16 | POST | `/orders` | quantity > 20 → 400 | ✅ PASS |
| 17 | POST | `/orders` | empty items array → 400 | ✅ PASS |
| 18 | GET | `/orders` | return 200 with array | ✅ PASS |
| 19 | GET | `/orders` | each order has required fields including `status` | ✅ PASS |
| 20 | PATCH | `/orders/:id/status` | update status → `finished` | ✅ PASS |
| 21 | PATCH | `/orders/:id/status` | toggle status → `unfinished` | ✅ PASS |
| 22 | PATCH | `/orders/:id/status` | invalid status value → 400 | ✅ PASS |
| 23 | PATCH | `/orders/:id/status` | non-existent order → 404 | ✅ PASS |
| 24 | GET | `/orders/summary` | return totalOrders, totalRevenue, orders array | ✅ PASS |
| 25 | GET | `/orders/summary` | totalRevenue = sum ของทุก order | ✅ PASS |

**14/14 PASS**

---

## 3. Code Coverage

> จาก Unit Tests เท่านั้น (Controller covered โดย API tests)
> Command: `cd backend && npm test -- --coverage`

| File | Statements | Functions | Lines | หมายเหตุ |
|------|-----------|-----------|-------|---------|
| `menu.service.ts` | **100%** | **100%** | **100%** | ✅ Full coverage |
| `order.service.ts` | **100%** | **100%** | **100%** | ✅ Full coverage |
| `menu.controller.ts` | 0% | 0% | 0% | Covered by API tests |
| `order.controller.ts` | 0% | 0% | 0% | Covered by API tests |
| Overall | 42% | 41% | 41% | — |

---

## 4. E2E Frontend

> ไม่มี test framework ติดตั้งไว้ใน `frontend/`

| Framework | ประโยชน์ | สถานะ |
|-----------|---------|-------|
| Jest + React Testing Library | Unit test components | ⚠️ ยังไม่ได้ติดตั้ง |
| Playwright หรือ Cypress | E2E browser flow (click, form, navigation) | ⚠️ ยังไม่ได้ติดตั้ง |

---

## 5. How to Run

```bash
# Unit Tests
cd backend && npm test

# Unit Tests + Coverage
cd backend && npm test -- --coverage

# API / Integration Tests (ต้องรัน backend ก่อน)
cd backend && npm run start:dev
cd backend && npm run test:e2e
```
