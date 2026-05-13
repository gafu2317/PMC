# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server (http://localhost:5173)
npm run build      # TypeScript compile + Vite build (output: dist/)
npm run lint       # Run ESLint
npm run preview    # Preview the production build locally
npm run deploy     # Build and deploy to GitHub Pages (gh-pages)
```

No test suite is configured in this project.

## Environment Variables

Copy `.env` (gitignored) with these keys:
- `VITE_FIREBASE_*` — Firebase project config
- `VITE_LIFF_ID_MAIN`, `VITE_LIFF_ID_MEIKOU`, `VITE_LIFF_ID_KINJYOU` — LINE LIFF IDs per page
- `VITE_LINE_ACCESS_TOKEN` — LINE Messaging API token (used in Vercel serverless functions)

## Architecture

### Overview
A LINE LIFF (LINE Front-end Framework) app for a music club to manage practice room reservations at two campuses: **Meikou** (名工大) and **Kinjyou** (金城).

### Routing (`src/App.tsx`)
Three routes, each with its own LIFF app ID:
- `/` → `Main` — LIFF initialization landing page with links to the two campus pages
- `/Meikou` → `Meikou` — Meikou campus reservation calendar
- `/Kinjyou` → `Kinjyou` — Kinjyou campus reservation calendar

### LIFF Authentication Flow (`src/liff/liffService.ts`)
Each page calls `initLiff(page)` on mount to initialize the correct LIFF ID and obtain the user's LINE ID (`userId`). If not logged in, LIFF redirects to LINE login. The LINE ID is stored globally via `LineIdContext`.

### State Management (`src/context/`)
- **`LineIdContext`** — Stores the authenticated LINE user ID. Provided at app root.
- **`BookingContext`** — Syncs the "2-week booking enabled" flag from Firestore (`setting/twoWeekBookingFlag`) in real time.
- **`PriorityContext`** — Syncs the "priority reservation" flag from Firestore (`setting/priorityFlag`) in real time. Scoped to each campus page.

### Firebase / Firestore (`src/firebase/`)
- `firebase.ts` — Initializes Firebase app and exports `db` (Firestore instance).
- `userService.ts` — All Firestore operations: users, reservations, bands, presets, fees, settings, ban periods.

**Firestore collections:**
| Collection | Description |
|---|---|
| `users` | Members (keyed by LINE ID), including fees and presets |
| `reservations` | Meikou campus bookings |
| `reservationsKinjyou` | Kinjyou campus bookings |
| `bands` | Band definitions with member LINE IDs |
| `setting` | Singleton docs: `password`, `priorityFlag`, `twoWeekBookingFlag`, `reservationBanPeriod` |

Pages use `onSnapshot` for real-time updates on `users`, `reservations`/`reservationsKinjyou`, and `bands`.

### Time Slots (`src/utils/utils.ts`)
- **Meikou**: hourly slots 9:00–21:30 (12 slots). `getTimeIndex()` maps hour to index.
- **Kinjyou**: class-period slots (1限–夜, 7 slots). `getTimeIndexKinjyou()` maps hour to index.
- `useWeekDays()` — custom hook returning the current 8-day window (Mon–Mon). Navigation between weeks uses `setBaseDate()` + an `EventEmitter`.

### Component Structure
```
src/components/
  Calendar/        — Week grid display + reservation display panel
  Forms/           — Member list form
  HamburgerMenu/   — Admin features (reservation CRUD, fee management, settings)
  Layout/          — Header, HamburgerMenu toggle, action Buttons
  Popup/           — Registration, reservation, edit, preset, band popups
```

The main campus pages (`Meikou.tsx`, `Kinjyou.tsx`) are nearly identical in structure, differing only in the LIFF ID used and which Firestore collection is targeted. Components use an `isKinjyou: boolean` prop to switch between campus-specific time slots and collections.

### Serverless API (`api/`)
Deployed as Vercel serverless functions:
- `api/send-message.js` — Sends a LINE push message via the Messaging API
- `api/message-status.js` — Returns message status

The frontend calls these at `https://pmc-lilac.vercel.app/api/...` (hardcoded in `liffService.ts`).

### Deployment
- **Frontend**: Vercel (`pmc-lilac.vercel.app`), with `vercel.json` rewriting all routes to `index.html` for SPA routing. Also deployable to GitHub Pages via `npm run deploy`.
- **Serverless API**: Vercel (`api/` directory is auto-detected).
