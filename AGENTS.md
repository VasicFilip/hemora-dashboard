# Hemora Dashboard

A Next.js 16 frontend dashboard for clinical blood test analysis (hemora.ch). This is a **frontend-only** repository; all data comes from an external backend API.

## Cursor Cloud specific instructions

### Services

| Service | Command | Port | Notes |
|---------|---------|------|-------|
| Next.js dev server | `npm run dev` | 3000 | The only service in this repo |

The backend API (default `http://localhost:8000`) is **not** included in this repo. Without it, the app loads and renders but all API calls return "Failed to fetch". Set `NEXT_PUBLIC_API_URL` in `.env.local` to point to an external backend if available.

### Key commands

- **Dev server:** `npm run dev` (port 3000)
- **Lint:** `npm run lint` (ESLint; has pre-existing warnings/errors)
- **Build:** `npm run build` (has a pre-existing build error: missing `useActivatePatient` and `useDeactivatePatient` exports in `src/lib/hooks.ts`, imported by `src/app/(dashboard)/patients/page.tsx`)
- **No test suite:** There are no automated tests in this repository.

### Gotchas

- The app UI is in **German** by default (locale `de`). The login page says "Anmelden" (Login), "E-Mail", "Passwort", etc.
- `npm run build` fails due to missing hook exports (`useActivatePatient`, `useDeactivatePatient`). The dev server still works for all pages except `/patients`.
- Node.js v22+ is required (matches `engines` implied by Next.js 16).
- Package manager is **npm** (lockfile: `package-lock.json`).
