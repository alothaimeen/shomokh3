# Shomokh Platform - AI Agent Instructions

## Project Overview
**Shomokh v3** is a Quranic education management platform for Islamic academies, built with Next.js 15 App Router, TypeScript, Prisma ORM, and PostgreSQL (Supabase). The platform manages student enrollment, attendance tracking, grading, and program administration across three roles: ADMIN, TEACHER, and STUDENT.

**Production URL**: https://shomokh.alothaimeen.xyz/  
**Current Status**: Session 10.6 completed - Ready for Session 11 (Grading System)  
**Progress**: 10.5/35 sessions completed (~30%)

## Critical Database Rules (Supabase-Specific)

### Non-Negotiable Configuration
```bash
# ✅ REQUIRED: Use port 6543 with pgbouncer=true
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:6543/postgres?pgbouncer=true"

# ❌ NEVER use these:
# - Port 5432 (causes P1001 errors)
# - prisma db push (hangs with PgBouncer)
# - prisma migrate dev (hangs with PgBouncer)
# - DIRECT_URL (not supported with PgBouncer)
```

### Schema Changes - The ONLY Way
```typescript
// ✅ ONLY way to modify schema with Supabase
await prisma.$executeRawUnsafe(`
  CREATE TABLE IF NOT EXISTS table_name (
    id TEXT PRIMARY KEY,
    field TEXT NOT NULL
  );
`);

// Then run setup script to regenerate client
npm run db:setup  // Runs: prisma generate && prisma db push && node scripts/setup-database.js
```

**Why**: Supabase uses PgBouncer connection pooling which doesn't support DDL operations through standard Prisma migrations. Must use `$executeRawUnsafe` for all schema changes.

### Connection Verification Protocol
```bash
# Before any database operation:
✅ Check DATABASE_URL contains :6543
✅ Check ?pgbouncer=true is at the end
✅ Test connection with: npx prisma studio
✅ Watch console for P1001 errors
✅ Never use prisma db push
```

## Naming Conventions (Strictly Enforced)

### camelCase Everywhere
```typescript
// ✅ Correct - camelCase for all fields
interface User {
  id: string;
  userName: string;      // NOT name or user_name
  userEmail: string;     // NOT email or user_email
  passwordHash: string;  // More descriptive than password
  userRole: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ Correct API response
{
  courseName: "حلقة الفجر",
  courseDescription: "وصف الحلقة",
  maxStudents: 20
}

// ❌ Wrong - inconsistent naming
{
  name: "حلقة الفجر",        // Too generic
  description: "وصف",        // Ambiguous
  max_students: 20           // snake_case
}
```

**Philosophy**: Previous versions failed due to naming inconsistencies. This version uses camelCase universally to prevent field mismatches between database, API, and frontend.

## Architecture Patterns

### 1. Authentication Flow
```typescript
// NextAuth.js with Credentials provider
// Located in: src/lib/auth.ts

// Session structure (from NextAuth callback)
{
  user: {
    id: string;
    name: string;    // maps to userName
    email: string;   // maps to userEmail
    role: UserRole;  // ADMIN | TEACHER | STUDENT
  }
}

// Test credentials (always available as fallback)
// admin@shamokh.edu / admin123
// teacher1@shamokh.edu / teacher123
// student1@shamokh.edu / student123
```

### 2. Middleware & Authorization
Located in `src/middleware.ts` - enforces role-based access:

```typescript
const rolePermissions = {
  ADMIN: ['/*'],  // Full access
  TEACHER: ['/dashboard', '/teacher', '/programs', '/students', '/attendance', ...],
  STUDENT: ['/dashboard', '/enrollment', '/my-attendance', '/my-grades', ...]
};
```

**Pattern**: All protected routes require authentication. API routes return JSON errors (401/403), pages redirect to `/login` or `/dashboard`.

### 3. API Route Structure
```typescript
// Pattern: src/app/api/[resource]/[action]/route.ts

export async function GET(request: NextRequest) {
  // 1. Verify session
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'غير مصادق عليه' }, { status: 401 });
  }

  // 2. Role-based authorization
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  // 3. Execute database query
  const data = await db.model.findMany({...});

  // 4. Return formatted response
  return NextResponse.json({ data });
}
```

**Key Points**:
- Always use `NextRequest` and `NextResponse` types
- Return Arabic error messages matching UI language
- Use `db` alias (from `src/lib/db.ts`) for Prisma client

### 4. Client Components Pattern
```typescript
'use client';  // Required for hooks, state, and interactivity

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Handle loading state
  if (status === "loading") {
    return <LoadingSpinner />;
  }

  // Client-side protection (middleware already protects)
  if (!session) {
    router.push('/login');
    return null;
  }

  // Component logic...
}
```

**Rule**: ALL interactive pages use `'use client'` directive. Server Components are only for static layouts (like `src/app/page.tsx`).

## Database Schema Key Relationships

```prisma
User (teachers) ──< Course >── Program
                      │
                      ├── EnrollmentRequest >── Student
                      ├── Enrollment >── Student
                      └── Attendance >── Student

// Key patterns:
// - Cascade deletes: Program → Course → Enrollments
// - SetNull on teacher deletion (courses don't delete)
// - Unique constraints: [studentId, courseId] for enrollments
// - Date-based uniqueness: [studentId, courseId, date] for attendance
```

### Attendance Status Enum (Updated Nov 10, 2025)
```typescript
enum AttendanceStatus {
  PRESENT       // ح - حاضرة
  EXCUSED       // م - غائبة بعذر (معتذرة)
  ABSENT        // غ - غائبة بدون عذر
  REVIEWED      // ر - راجعت بدون حضور
  LEFT_EARLY    // خ - خروج مبكر
}
```

**Important**: These symbols were updated in Session 10.6 per academy director's request.

## Common Tasks

### Adding a New Feature
```bash
# 1. Verify database connection
npm run db:generate

# 2. If schema changes needed
# Edit prisma/schema.prisma, then:
node scripts/setup-database.js  # Uses $executeRawUnsafe

# 3. Create API route
# src/app/api/[feature]/route.ts

# 4. Create page component
# src/app/[feature]/page.tsx (with 'use client')

# 5. Test locally
npm run dev  # Opens on localhost:3000
```

### Running Scripts
```bash
npm run dev         # Development server
npm run build       # Production build
npm run db:setup    # Initialize database with test data
npm run db:seed     # Seed test users and courses
```

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `P1001: Can't reach database` | Using port 5432 or wrong URL | Check `.env` has `:6543` and `?pgbouncer=true` |
| `prisma db push` hangs | PgBouncer incompatibility | Use `$executeRawUnsafe` instead |
| `Module not found` | Missing dependency | `npm install [package]` |
| `'use client' directive missing` | Hook in Server Component | Add `'use client'` at file top |
| Hydration mismatch | Server/client content differs | Use `useEffect` for dynamic content |

### Emergency Protocols

**If a feature breaks:**
```bash
1. ❌ DO NOT continue to next feature
2. ✅ Test in clean environment
3. ✅ Find simplest solution (hardcode if needed)
4. ✅ Ask for help if stuck > 30 minutes
5. ✅ Consider simplifying the goal
```

**If context window runs low:**
```bash
1. ✅ Save all progress immediately
2. ✅ Commit current working state
3. ✅ Document last working state in detail
4. ✅ Identify goal for next session
5. ✅ Update project_status.md before ending
```

## File Structure Key Points

```
src/
├── app/
│   ├── api/              # Backend routes (Server Components)
│   │   ├── attendance/   # 5 endpoints: mark, bulk-mark, course-attendance, etc.
│   │   ├── enrollment/   # 4 endpoints: request, manage, available-courses, etc.
│   │   ├── grades/       # Grade management endpoints
│   │   └── users/        # User CRUD operations
│   ├── [role-pages]/     # Frontend pages (ALL use 'use client')
│   ├── layout.tsx        # Root layout (Server Component)
│   └── page.tsx          # Landing page (Server Component)
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Prisma client singleton
│   └── course-ownership.ts  # Authorization helpers
└── middleware.ts         # Route protection logic

prisma/
└── schema.prisma         # Database schema (175 lines)

scripts/
├── setup-database.js     # Initialize DB with test data
└── update-attendance-status.js  # Utility scripts
```

## Development Workflow

### Session Protocol (Critical)

#### Before Starting ANY Session:
```bash
1. ✅ Read project_status.md - Know what was completed
2. ✅ Read الخطة.md - Know the next session requirements
3. ✅ Read SIMPLE_CONTEXT_BACKPACK.md - Follow safety rules
4. ✅ Run npm run dev - Ensure everything works
5. ✅ Ask for clarification if anything is unclear
```

#### After Completing ANY Session:
```bash
1. ✅ Test all new features thoroughly
2. ✅ Run npm run build - Ensure no errors
3. ✅ Update project_status.md with:
   - Session completion date
   - Success criteria achieved
   - Files added/modified
   - Any problems and solutions
4. ✅ Commit changes with clear message
5. ✅ Identify next session clearly
```

### Working Principles
1. **One Feature at a Time**: Complete and test each feature before moving to next
2. **Test Immediately**: Use test credentials to verify each change
3. **Check Console**: Monitor browser console and terminal for errors
4. **Incremental Changes**: Small, testable commits over large refactors
5. **Arabic-First**: All UI text, error messages, and labels in Arabic
6. **Never Skip Sessions**: Follow الخطة.md sequence strictly

## Documentation Sources (Must Read Before Each Session)

### Critical Files
- **الخطة.md** - Complete 35-session plan with detailed requirements (1695 lines)
- **project_status.md** - Current status, completed sessions, next session details (588 lines)
- **SIMPLE_CONTEXT_BACKPACK.md** - Safety rules, conventions, and standards (1278 lines)
- **مواصفات منصة شموخ.md** - Complete functional specification (798 lines)
- **schema.prisma** - Single source of truth for data models (175 lines)

### Reading Order
1. **project_status.md** - Understand where we are
2. **الخطة.md** - Know what to do next
3. **SIMPLE_CONTEXT_BACKPACK.md** - Follow the rules
4. **مواصفات منصة شموخ.md** - Understand the business logic

## Key Success Factors

1. **Never modify naming convention** - camelCase is enforced everywhere
2. **Always verify Supabase connection** before database operations
3. **Use session consistently** - NextAuth session is the authentication source
4. **Follow role permissions strictly** - middleware enforces, APIs double-check
5. **Test with real data** - use `npm run db:seed` for realistic testing
6. **Respect PgBouncer limitations** - no DDL through Prisma migrations
7. **Read documentation first** - Always start with الخطة.md and project_status.md
8. **Update documentation last** - Always update project_status.md after completion

## Multi-Tenant Architecture

This is an **open-source project** designed for multiple Islamic academies:

```yaml
Model: Multi-Tenant Deployments
Strategy: Each academy has independent Supabase database
Benefits:
  - Complete data isolation between academies
  - Each academy controls their own deployment
  - Free to use for all Islamic educational organizations
  - Customizable per academy (name, logo, theme)
```

### Deployment Structure
```
deployment/
├── .env.example          # Template for academies
├── docker-compose.yml    # Easy Docker deployment
├── setup-guide.md        # Deployment instructions
└── scripts/              # Setup automation
```

When in doubt, reference existing implementations in `src/app/api/enrollment/` or `src/app/dashboard/` as canonical patterns.
