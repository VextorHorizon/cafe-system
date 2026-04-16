# QA Report — Cafe Management System
**Date:** 2026-04-16  
**Scope:** Backend business logic — OrderService, MenuService, OrderCleanupService, DTOs  
**Method:** Static analysis + spec review against CLAUDE.md requirements

---

## Executive Summary

| Category | Count |
|----------|-------|
| BUG (breaking) | 2 |
| Edge Case (medium risk) | 4 |
| Missing Test Coverage | 3 |
| Verified Correct | 14 |

---

## BUGS (Breaking)

### BUG-01 — isActive cannot be toggled via PATCH /menu/:id

**File:** backend/src/menu/dto/update-menu.dto.ts

UpdateMenuDto extends PartialType(CreateMenuDto). CreateMenuDto only has { name, price, category } — isActive is NOT included. Since ValidationPipe runs with whitelist: true, any isActive field sent from the client is silently stripped before reaching the service.

The frontend type UpdateMenuPayload includes isActive? (per CLAUDE.md), so the frontend sends it — but the backend ignores it. Menu items can never be deactivated or reactivated through the API.

**Impact:** Admin cannot deactivate menu items. isActive is permanently true once created.

**Fix:**
```typescript
// update-menu.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateMenuDto } from './create-menu.dto';

export class UpdateMenuDto extends PartialType(CreateMenuDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
```

---

### BUG-02 — Inactive menu items can be ordered

**File:** backend/src/order/order.service.ts line 24

create() calls findById(item.menuItemId) — this fetches ANY menu item including those with isActive: false. A deactivated item (hidden from customer menu page) can still be ordered if the client sends the menuItemId directly.

**Fix:**
```typescript
// Replace findById with findOne + isActive filter
const menuItem = await this.menuItemModel
  .findOne({ _id: item.menuItemId, isActive: true })
  .exec();

if (!menuItem) {
  throw new NotFoundException(
    `Menu item "${item.menuItemId}" not found or unavailable`,
  );
}
```

---

## Edge Cases (Medium Risk)

### EDGE-01 — Duplicate menuItemId creates fragmented line items

**File:** backend/src/order/order.service.ts line 22-42

If client sends [{ menuItemId: "A", quantity: 1 }, { menuItemId: "A", quantity: 2 }], the service creates two separate line items instead of merging. totalPrice is correct but admin view shows duplicate rows.

**Risk:** Medium — no data corruption, but confusing in admin UI.

---

### EDGE-02 — Whitespace-only name passes validation

**File:** backend/src/menu/dto/create-menu.dto.ts line 4

@IsNotEmpty() does NOT trim whitespace by default. name: "   " passes validation and saves a blank-looking menu item to DB.

**Fix:**
```typescript
import { Transform } from 'class-transformer';

@IsString()
@IsNotEmpty()
@Transform(({ value }) => value?.trim())
name: string;
```

---

### EDGE-03 — Cron cleanup deletes unfinished orders too

**File:** backend/src/order/order-cleanup.service.ts line 29

Cleanup deletes ALL orders older than 3 days including status: unfinished. An unfinished/disputed order from 3 days ago gets permanently deleted.

**Current:**
```typescript
await this.orderModel.deleteMany({ createdAt: { $lt: threeDaysAgo } });
```

**Safer alternative (finished only):**
```typescript
await this.orderModel.deleteMany({
  createdAt: { $lt: threeDaysAgo },
  status: 'finished',
});
```

---

### EDGE-04 — Empty PATCH {} is accepted silently

**File:** backend/src/menu/menu.service.ts line 25

PATCH /menu/:id with empty body {} passes validation (all fields optional), calls findByIdAndUpdate with {}, and silently returns unchanged document. Low risk but can mask client bugs.

---

## Missing Test Coverage

### TEST-GAP-01 — No test for ordering inactive menu item
After BUG-02 fix, add test that inactive item throws NotFoundException.

### TEST-GAP-02 — No test for duplicate menuItemId in same order
Should verify totalPrice is still calculated correctly (qty1 + qty2) * price.

### TEST-GAP-03 — OrderCleanupService has zero test coverage
Critical cron logic with no tests at all. Needs: deletes old, keeps recent, returns count.

---

## Verified Correct

| Check | Status | Notes |
|-------|--------|-------|
| totalPrice never accepted from client | OK | Calculated server-side |
| Price snapshotted from DB at order time | OK | unitPrice = menuItem.price |
| quantity validated: int, min 1, max 20 | OK | DTO with @IsInt @Min(1) @Max(20) |
| price validated: number, min 0 | OK | Allows free items correctly |
| category validated: enum coffee/tea/other | OK | Both DTO and schema enforce |
| MONGODB_URI uses env var | OK | No hardcoded URIs found |
| CORS restricted to FRONTEND_URL | OK | main.ts uses env var |
| ValidationPipe with whitelist: true | OK | Prevents extra fields |
| Controller is thin — no business logic | OK | All logic in service layer |
| Cron schedule correct | OK | EVERY_DAY_AT_MIDNIGHT |
| 3-day cutoff calculation correct | OK | setDate(getDate() - 3) |
| updateStatus uses { new: true } | OK | Returns updated document |
| findAll filters isActive: true | OK | Inactive items hidden |
| getSummary revenue calculation | OK | Handles empty array (returns 0) |

---

## Priority Fix Order

1. BUG-01 — Add isActive to UpdateMenuDto (1-line fix, high impact)
2. BUG-02 — Filter inactive items in OrderService.create()
3. EDGE-02 — Add @Transform trim to name field
4. EDGE-01 — Decide: merge duplicate items or allow fragmented
5. EDGE-03 — Decide: delete finished-only or all orders after 3 days
6. TEST-GAP-03 — Add OrderCleanupService unit tests
