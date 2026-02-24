# Push-Up Tracker — App Requirements

## Project Overview

Build a **Progressive Web App (PWA)** for tracking daily push-up workouts. Mobile-first, offline-capable, installable to home screen. Simple and fast — the user opens it, logs reps and sets, and sees their progress.

**Tech stack:** React + TypeScript, Tailwind CSS, IndexedDB for persistence, Vite for bundling, PWA with service worker.

---

## Core Features

### 1. Log a Workout (Main Screen)

Simple form to log a session:

- **Date** — defaults to today, allow picking a past date
- **Exercise type** — push-ups (default), squats, plank (user can add more later)
- **Reps** — number input (how many reps this set)
- **"Add Set" button** — tap to log one set, it appears in a list below
- **Set list** — shows sets logged for today (e.g., "Set 1: 12 reps, Set 2: 10 reps, Set 3: 8 reps")
- **Edit/delete** — swipe or tap to remove a set if entered wrong
- **Daily total** — auto-calculated and shown at the top

**Flow:** Open app → enter reps → tap "Add Set" → repeat → done. No extra steps.

### 2. History

Simple list of past workout days:

- **Day-by-day list** — each row shows: date, total push-ups, total squats, number of sets
- **Tap to expand** — see individual sets for that day
- **Streak counter** — current consecutive workout days
- **Weekly totals** — grouped by week

### 3. Progress

Basic charts to visualize improvement:

- **Line chart** — total daily push-ups over time (last 30 days)
- **Bar chart** — weekly totals
- **Personal best** — highlight max reps in a single set and max daily total
- Use Recharts (lightweight)

### 4. Settings

- **Dark/light mode** — follow system default, allow toggle
- **Export data** — download as CSV
- **Clear data** — reset everything

---

## Data Model

```typescript
interface WorkoutSet {
  id: string;              // UUID
  date: string;            // "2025-02-24"
  exercise: string;        // "pushups" | "squats" | "plank"
  reps: number;            // Reps for this set (or seconds for plank)
  createdAt: string;       // ISO timestamp
}
```

Each "Add Set" tap creates one `WorkoutSet` record. Daily totals are calculated by grouping sets by date.

---

## UI/UX Guidelines

- **Mobile-first** — 360–430px width
- **Bottom navigation** — 3 tabs: Log | History | Progress
- **Large buttons** — minimum 48px tap targets
- **Number input** — big number field with +/- stepper buttons for quick entry
- **Minimal friction** — open → type number → tap Add Set → done
- **Color palette** — dark theme default, orange/green accents

---

## PWA Requirements

- **Installable** — manifest.json, app name "PushUp Tracker"
- **Offline-first** — all data in IndexedDB, works without internet
- **Service worker** — cache app shell
- **Icons** — 192px and 512px

---

## File Structure

```
pushup-tracker/
├── public/
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── components/
│   │   ├── LogWorkout.tsx
│   │   ├── History.tsx
│   │   ├── Progress.tsx
│   │   └── Navigation.tsx
│   ├── hooks/
│   │   └── useWorkouts.ts       # CRUD for IndexedDB
│   ├── types.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── vite.config.ts
```

---

## Build Priority

1. **First:** Log screen (enter reps + add set) + IndexedDB storage
2. **Then:** History list view
3. **Then:** Progress charts
4. **Last:** PWA setup, dark mode, export, polish
