# Copilot instructions for hemora dashboard

## Big picture
- **Type:** Next.js App Router (React 19) medical analysis platform: clinicians upload lab PDFs → AI extracts biomarkers → generates personalized reports.
- **Structure:** All UI under `src/app`; core dashboard in `src/app/(dashboard)` with shared layout (sidebar/mobile nav). Auth flows (login, signup, onboarding) separate.
- **Provider stack:** Root layout wraps QueryProvider → AuthProvider → ThemeProvider → Sonner toast. Most dashboard pages are client components (`"use client"`).
- **Domains:** Upload, Analysis (AI processing), Results/Reports (export PDF). Multi-role (admin/clinician/patient) with organization-scoped data.

## Data + API patterns
- **Central API:** `src/lib/api.ts` exports `apiRequest(method, path, body?)` for JSON and `apiUpload(path, FormData)` for file uploads.
- **Authorization:** Tokens in cookies (`auth_token`, `refresh_token` via js-cookie); 401 auto-refreshes using refresh_token.
- **API base:** `NEXT_PUBLIC_API_URL` env (defaults `http://localhost:8000`); FastAPI backend.
- **Query strategy:** ALWAYS use React Query hooks from `src/lib/hooks.ts`—never call `api.*` directly in components.
  - Query keys defined once at module level; mutations invalidate related keys after success.
  - Defaults: staleTime=5min, gcTime=10min, query retry=3, mutation retry=1.
  - Example: `usePatients()` → `useQuery(queryKey, queryFn)` with auto-dedup.
- **Types:** `src/types/index.ts` defines all responses: `PatientResponse`, `LabTestResponse`, `AnalysisStatusResponse`, `ReportDetailResponse`, `AnalysisContextCreate` (demographics: weight, height, smoker, sport, etc.).

## Auth + access control
- **AuthProvider** (`src/lib/auth-context.tsx`): provides `useAuth()` hook returning `{user, isAuthenticated, isLoading, hasRole()}` and methods `login/logout/refreshUser`.
- **Token flow:** Login → tokens in cookies → AuthProvider loads user on mount → `hasRole()` checks `user.role` (admin/clinician/patient).
- **Redirects:** No token → /login; token expired → auto-refresh attempt; no organization (non-admin) → /onboarding.
- **Role gating:** Use `RequireRole` wrapper or `useRequireRole` hook (`src/lib/rbac.tsx`). Example: `hasRole(['admin'])` for checks.
- **Admin section:** `src/app/(dashboard)/admin/*` protected by layout enforcing admin role; visible in nav only to admins (System Analytics, User Management, Audit Logs, Org Settings).

## UI + styling conventions
- **Components:** Shadcn UI in `src/components/ui`; Radix + Tailwind; styled with `cn()` from `src/lib/utils.ts`.
- **Icons:** lucide-react throughout.
- **Toasts:** Use `showToast.success(title, msg)` / `showToast.error(title, msg)` / `showToast.apiError(error, fallback)` from `src/lib/toast.ts`.
- **Glass variants:** All Shadcn components support `variant="glass"` (Card, Button, Input, etc.). Auto-adapts blur (8px/16px/24px) and colors to light/dark via CSS vars in `src/app/globals.css`.
- **Design specs:** See [GLASSMORPHISM_DESIGN_SYSTEM.md](.github/GLASSMORPHISM_DESIGN_SYSTEM.md) (full) and [GLASS_QUICK_REFERENCE.md](.github/GLASS_QUICK_REFERENCE.md) (quick).
- **Performance:** Never animate blur; animate opacity instead. GPU-optimized blur values.

## Responsive design
- **Constraints:** `container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8` — keeps content centered and readable.
- **Spacing:** `p-4 sm:p-6 lg:p-8` for padding; `gap-4 sm:gap-6` for gaps.
- **Grids:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (mobile-first: 1 → 2 → 3+ columns).
- **Navigation:** MobileNav (`lg:hidden`) = hamburger + Sheet wrapping Sidebar; Sidebar (`hidden lg:flex w-64`) always-on desktop.
- **Tables:** Table component has built-in horizontal scroll; don't card-stack on mobile.
- **Breakpoints:** sm=640px, md=768px, lg=1024px.

## Patterns to mirror
1. **Upload flow** (`src/app/(dashboard)/upload/page.tsx`):
   - Get presigned URL → RegisterAnalysis (backend processes PDF) → Poll useAnalysisStatus → Update extracted markers → Set context (demographics) → Trigger analysis → Navigate results.
2. **Results view** (`src/app/(dashboard)/results/[id]/page.tsx`):
   - `useAnalysis` hook fetches details; display clinician/patient views; PDF download via api helper.
3. **Dashboard** (`src/app/(dashboard)/page.tsx`):
   - Stats grid with glass cards (color borders for metrics), analytics charts in glass containers, recent reports glass card.
4. **Patient list** (`src/app/(dashboard)/patients/page.tsx`):
   - `usePatients(pagination)`; create-patient-dialog; edit inline or navigate [id].

## Developer workflows
- `npm run dev` — dev server http://localhost:3000 (hot-reload).
- `npm run build && npm run start` — production build & start.
- `npm run lint` — ESLint check.
- Requires backend: set `NEXT_PUBLIC_API_URL` before running.

## Key files reference
- `src/lib/api.ts` — API client, token mgmt, queryClient config.
- `src/lib/hooks.ts` — All queries & mutations; add new data ops here.
- `src/lib/auth-context.tsx` — Auth state, user loading, role checks.
- `src/lib/rbac.tsx` — RequireRole, useRequireRole for protected routes/components.
- `src/components/ui/` — Shadcn components (reuse, don't recreate).
- `src/app/layout.tsx` — Root: wraps providers globally.
- `src/app/(dashboard)/layout.tsx` — Injects sidebar + mobile nav; inherited by all dashboard pages.
- `src/types/index.ts` — All TS interfaces; single source of truth.

## Aliases
- Use `@/*` relative to src/ (tsconfig.json, components.json).
- Examples: `@/components/ui/button`, `@/lib/hooks`, `@/types`.
