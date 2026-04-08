# AGENTS.md

## App Overview

**Aarogya AI** - Rural telemedicine PWA for Hindi-speaking patients.
- Next.js 14 App Router + TypeScript + Tailwind CSS
- MongoDB (Mongoose), NextAuth.js, JWT tokens
- 3 roles: `patient`, `doctor`, `ashaworker`, `pharmacist`

## Commands

```bash
npm run dev      # Start dev server on localhost:3000
npm run build    # Production build
npm run lint     # ESLint check
npm run seed     # Seed database with test data
```

## Environment Setup

```bash
cp .env.local.example .env.local
# Required: MONGODB_URI, JWT_SECRET, NEXTAUTH_SECRET
```

## Architecture Notes

- **Auth**: JWT tokens stored as `authToken` in localStorage (NOT cookies)
- **Password hashing**: bcryptjs
- **Role protection**: `middleware.ts` with NextAuth, redirects unauthorized users to role-specific login
- **Public paths**: `/`, `/login`, `/doctor/login`, `/asha/login`, `/pharmacist/login`, `/api/auth`

## Key Routes

| Route | Role | Auth Status |
|-------|------|-------------|
| `/home`, `/symptoms`, `/records`, `/triage` | patient | ✅ Implemented |
| `/doctor/dashboard`, `/doctor/consultation` | doctor | ⚠️ Auth needed |
| `/asha/dashboard`, `/asha/log-visit`, `/asha/sos` | ashaworker | ⚠️ Auth needed |
| `/pharmacist/dashboard` | pharmacist | ⚠️ Auth needed |

## Known Issues

- Several pages still have hardcoded data (see `TODO_HARDCODING.md`)
- Patient auth works; Doctor/ASHA/Pharmacist auth patterns exist but not implemented
- Some pages use `localStorage` instead of database

## Style

- UI text is in Hindi (Devanagari script)
- Bilingual labels: Hindi first, English in parentheses
- 48px minimum touch targets required (PWA accessibility)
