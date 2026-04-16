# Security Audit Report — Cafe Management System
**Date:** 2026-04-17
**Auditor:** Senior Security Engineer (automated white-box review)
**Scope:** Backend (NestJS/MongoDB, port 3001) + Frontend (Next.js 14, port 3000)
**Methodology:** STRIDE threat modeling + OWASP Top 10 white-box code review

---

## Executive Summary

The application has **no authentication or authorization layer** on any endpoint. Every destructive admin operation (create/update/delete menu, view all orders, trigger cleanup) is publicly accessible to anyone who can reach the server. This alone constitutes a Critical risk that must be remediated before the system is deployed to any non-localhost environment. Several additional medium-severity issues exist in CORS configuration, HTTP security headers, rate limiting, and input validation.

| Severity | Count |
|----------|-------|
| Critical | 2 |
| High | 1 |
| Medium | 3 |
| Low | 2 |

---

## Findings

---

### FINDING-01 — No Authentication on Any Endpoint

| Field | Value |
|-------|-------|
| Severity | **Critical** |
| Category | Broken Authentication / Broken Access Control (OWASP A01, A07) |
| Files | `backend/src/menu/menu.controller.ts` (all routes), `backend/src/order/order.controller.ts` (all routes) |
| Lines | `menu.controller.ts` lines 20-39, `order.controller.ts` lines 24-54 |

**Description:**
All API endpoints including menu creation, menu deletion, order viewing, and manual cleanup are publicly accessible to anyone who can reach the server on port 3001. There is no JWT guard, API key check, session cookie, or any other identity verification.

STRIDE categories violated: **Spoofing** (impersonate admin), **Elevation of Privilege** (anyone becomes admin).

**Exploit scenario:**
```bash
# Delete every menu item — no auth required
curl -X DELETE http://your-server:3001/menu/<any_id>

# View all orders including customer data
curl http://your-server:3001/orders

# Trigger mass deletion of all recent orders
curl -X DELETE http://your-server:3001/orders/cleanup
```

**Fix — Add JWT Guard to all admin routes:**
```typescript
// backend/src/auth/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// Apply to every admin controller import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('menu')
@UseGuards(JwtAuthGuard)  // protects all routes in this controller
export class MenuController { ... }

// For the order endpoints used by customers (POST /orders), keep them public
// but protect all read/management routes with a role-based guard.
```

---

### FINDING-02 — Unauthenticated Bulk Destructive Endpoint (DELETE /orders/cleanup)

| Field | Value |
|-------|-------|
| Severity | **Critical** |
| Category | Broken Access Control (OWASP A01) |
| File | `backend/src/order/order.controller.ts` |
| Lines | 49-54 |

**Description:**
The manual cleanup endpoint `DELETE /orders/cleanup` is publicly accessible and permanently deletes all orders older than 3 days. An attacker can call this endpoint repeatedly to destroy business records. Even after authentication is added globally (FINDING-01), this endpoint deserves extra attention because of its destructive nature.

**Exploit scenario:**
```bash
# Destroy all historical orders in a single request
curl -X DELETE http://your-server:3001/orders/cleanup
# Response: { "deletedCount": 9999 }
```

**Fix:**
1. Protect with JwtAuthGuard plus an admin role guard (see FINDING-01).
2. Consider removing this endpoint from production builds entirely. The cron job is sufficient for automated cleanup, and this endpoint only needs to exist in development/staging environments.

```typescript
// Restrict to admin role
@Delete('cleanup')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
async cleanup() { ... }
```

---

### FINDING-03 — Admin UI Has No Authentication Gate

| Field | Value |
|-------|-------|
| Severity | **High** |
| Category | Broken Access Control — Frontend (OWASP A01) |
| File | `frontend/src/app/(admin)/layout.tsx` |
| Lines | 1-10 |

**Description:**
The `(admin)` route group layout contains no authentication check, redirect, or session validation. Any user who navigates to `/menu`, `/orders`, or `/dashboard` can access the full admin interface in their browser without logging in. The admin link is also directly visible in the customer-facing header (`frontend/src/app/(user)/layout.tsx` line 17).

**Fix — Add a middleware-level auth check for the admin group:**
```typescript
// frontend/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/menu') ||
    request.nextUrl.pathname.startsWith('/orders') ||
    request.nextUrl.pathname.startsWith('/dashboard');
  const token = request.cookies.get('auth_token');
  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/menu/:path*', '/orders/:path*', '/dashboard/:path*'],
};
```

---

### FINDING-04 — CORS Allows All Origins When FRONTEND_URL Is Unset

| Field | Value |
|-------|-------|
| Severity | **Medium** |
| Category | Security Misconfiguration (OWASP A05) |
| File | `backend/src/main.ts` |
| Lines | 9-13 |

**Description:**
The CORS origin fallback is `http://localhost:3000`. If the `FRONTEND_URL` environment variable is not set in production, the backend silently accepts cross-origin requests from localhost:3000 while potentially being deployed on a public IP. If authentication cookies are added later, credentials are not enabled in the CORS config, which will silently break cross-origin authenticated requests.

**Current code:**
```typescript
// main.ts line 9-12
app.enableCors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
});
```

**Fix:**
```typescript
const allowedOrigin = process.env.FRONTEND_URL;
if (!allowedOrigin && process.env.NODE_ENV === 'production') {
  throw new Error('FRONTEND_URL environment variable is required in production');
}
app.enableCors({
  origin: allowedOrigin || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true, // required when auth cookies are used
});
```

---

### FINDING-05 — No HTTP Security Headers

| Field | Value |
|-------|-------|
| Severity | **Medium** |
| Category | Security Misconfiguration (OWASP A05) |
| File | `backend/src/main.ts` |
| Lines | 1-27 (bootstrap function — headers never configured) |

**Description:**
The NestJS backend does not configure any HTTP security headers. Missing headers that browsers rely on for protection:

| Missing Header | Risk |
|----------------|------|
| `Content-Security-Policy` | XSS and data injection |
| `X-Frame-Options: DENY` | Clickjacking |
| `X-Content-Type-Options: nosniff` | MIME sniffing attacks |
| `Strict-Transport-Security` | SSL stripping (when HTTPS is added) |
| `Referrer-Policy` | Information leakage via Referer header |

**Fix — Install and configure Helmet:**
```bash
npm install helmet
```
```typescript
// main.ts
import helmet from 'helmet';

app.use(helmet());  // sets all recommended headers with secure defaults
```

---

### FINDING-06 — No Rate Limiting on Any Endpoint

| Field | Value |
|-------|-------|
| Severity | **Medium** |
| Category | Security Misconfiguration / DoS (OWASP A05) |
| Files | All controllers |

**Description:**
All endpoints have no rate limiting. This allows:
- Brute force attacks (relevant once auth is added)
- Mass data enumeration of orders and menu items
- Repeated calls to the destructive `DELETE /orders/cleanup` endpoint

**Fix — Use `@nestjs/throttler`:**
```bash
npm install @nestjs/throttler
```
```typescript
// app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]), // 100 req/min
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
```

---

### FINDING-07 — Route Parameter IDs Not Validated as MongoId

| Field | Value |
|-------|-------|
| Severity | **Low** |
| Category | Input Validation (OWASP A03) |
| Files | `menu.controller.ts` lines 32, 36; `order.controller.ts` lines 35, 40 |

**Description:**
`@Param('id')` values are passed directly to Mongoose without validating they are valid MongoDB ObjectIds. When an invalid format is passed (e.g., `/menu/../../etc`), Mongoose throws a `CastError` with an internal error message that may expose stack traces or schema details in development mode.

**Fix — Add a custom ParseMongoIdPipe:**
```typescript
// common/pipes/parse-mongo-id.pipe.ts
import { PipeTransform, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

export class ParseMongoIdPipe implements PipeTransform {
  transform(value: string) {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`Invalid ID format: ${value}`);
    }
    return value;
  }
}

// Usage in controller:
@Delete(':id')
remove(@Param('id', ParseMongoIdPipe) id: string) { ... }
```

---

### FINDING-08 — Name Field Has No Maximum Length

| Field | Value |
|-------|-------|
| Severity | **Low** |
| Category | Input Validation (OWASP A03) |
| File | `backend/src/menu/dto/create-menu.dto.ts` line 4 |

**Description:**
The `name` field on `CreateMenuDto` has no `@MaxLength()` validator. A client can send a `name` string of arbitrary length (e.g., 10MB), which MongoDB will store and the frontend will attempt to render. This can cause UI layout issues and wastes database storage.

**Fix:**
```typescript
@IsString()
@IsNotEmpty()
@MaxLength(100)
@Transform(({ value }) => value?.trim())
name: string;
```

---

## STRIDE Threat Model Summary

| Threat | Element | Status |
|--------|---------|--------|
| Spoofing (impersonate admin) | All API endpoints | CRITICAL — no auth |
| Tampering (modify menu/orders) | POST/PATCH/DELETE endpoints | CRITICAL — no auth |
| Repudiation (deny making changes) | All write operations | HIGH — no audit log |
| Information Disclosure (order data) | GET /orders, GET /orders/summary | CRITICAL — no auth |
| Denial of Service (bulk delete) | DELETE /orders/cleanup | CRITICAL — no auth |
| Elevation of Privilege (customer → admin) | Admin UI routes | HIGH — no frontend auth |

---

## Remediation Priority

| Priority | Finding | Effort |
|----------|---------|--------|
| 1 | FINDING-01 — Add JWT auth to backend | High (requires AuthModule) |
| 2 | FINDING-02 — Protect/remove cleanup endpoint | Low (1 decorator) |
| 3 | FINDING-03 — Add auth middleware to Next.js | Medium |
| 4 | FINDING-05 — Add Helmet security headers | Low (1 line) |
| 5 | FINDING-06 — Add rate limiting | Low (ThrottlerModule) |
| 6 | FINDING-04 — Harden CORS config | Low |
| 7 | FINDING-07 — ParseMongoIdPipe | Low |
| 8 | FINDING-08 — MaxLength on name | Low (1 decorator) |

**Quick wins (< 30 min total):** FINDING-02, FINDING-04, FINDING-05, FINDING-06, FINDING-08 — all require only 1-5 lines of code each.
