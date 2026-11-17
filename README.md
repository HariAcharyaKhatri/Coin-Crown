# Crown & Coin — The Rise of a Medieval Dynasty

A browser-based medieval idle-clicker + kingdom tycoon + economic simulation game built with React 18, TypeScript 5, Vite 5, PixiJS 8, Zustand, and Dexie.js (IndexedDB).

## Features

- **65 Unique Buildings**: Spread across Residential, Agriculture, Industrial, Mining, Commercial, and Military categories.
- **55 Tradeable & Producible Items**: Raw resources, processed intermediate goods, luxury wares, and construction materials.
- **36 Quests across 10 Chapters**: Deep medieval narrative with branching decisions, culminating in a linear endgame dynasty chapter.
- **60 Achievements**: 42 lifetime, 10 story milestones, 5 daily streaks, and 3 weekly challenges.
- **10 Explorable Regions**: From the pastoral plains of Greenvale to the frozen wastes of Frostmere and the volcanic heights of Ashpeak.
- **Dynamic Economy & Tick Engine**: 1000ms deterministic engine coordinating production, population dynamics, satisfaction, unrest, taxation, supply/demand market pricing, and seasonal cycles.
- **Prestige & Dynasty Rebirth**: 60-rank Legacy Tree granting permanent buffs across 6 branches using earned Dynasty Seals.
- **Offline Accrual & Data Safety**: Closed-form offline calculations capped at 24 hours (86,400s), clock-rollback protection, SHA-256 integrity checksums, and a 3-backup automatic rotation recovery system.
- **Accessible & Responsive**: Full WCAG 2.1 AA compliance, minimum 44x44px tap targets, high contrast tokens (>14:1), screen reader accessible labels, and support for Mobile (375x667), Tablet (768x1024), and Desktop (1440x900).
- **Zero Monetization**: 100% free-to-play offline-first progressive web app (PWA) with zero ads, zero in-app purchases, zero energy bars, and zero tracking.

---

## Tech Stack

- **UI Framework:** React 18.3 + TypeScript 5.4
- **Build Tool:** Vite 5.2
- **Graphics Engine:** PixiJS 8.0 (Estate & Region visualizers)
- **State Management:** Zustand 4.5
- **Persistence:** Dexie.js 4.0 (IndexedDB v4 with active slot + 3 backup rotation)
- **Styling:** CSS Modules with design tokens
- **Testing:** Vitest 1.6 + Playwright 1.44 + axe-core

---

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/HariAcharyaKhatri/Coin-Crown.git
cd Coin-Crown

# Install dependencies
npm install
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
```

Production assets are built to `/dist` (< 215 KB gzip initial bundle).

### Running Tests

```bash
# Run unit and integration tests (195 test cases)
npm test

# Run catalog and validation scripts
npm run verify:ids
npm run verify:references
npm run verify:assets
npm run verify:literals
```

---

## Test Suite Overview

Crown & Coin features a comprehensive 195-test verification suite covering:
1. **Unit Formulas (35 tests):** Building production curves, seasonal multipliers, worker skill scaling, upgrade costs, tax satisfaction, mining deposit equilibrium, offline closed-form formulas, prestige seals, and XP curves.
2. **Engine Integration (20 tests):** All state mutating actions (BUILD, UPGRADE, DEMOLISH, SELL, BUY, HIRE, TAX, ROUTE, QUEST, PRESTIGE, etc.).
3. **Economy Simulations (7 tests):** 10-minute gate test (`T-SIM-10MIN`), 1-hour gate test (`T-SIM-1HR`), 24-hour simulation, 1-week simulation, mid-game and late-game progression.
4. **Database & Migrations (10 tests):** Schema migrations v1 -> v2 -> v3 -> v4, future version refusal, checksum validation, and backup slot fallback.
5. **Quest & Progression (7 tests):** 36 unique quests, prerequisite acyclicity, Chapter 10 linearity, and tier gating.
6. **Production Chains (7 tests):** Complete resource reachability from raw extraction to end products (Bread, Tools, Furniture, Wine, Fine Clothes, Gold Bars).
7. **Prestige & Rebirth (7 tests):** Tier 8 requirement, seal formulas, reset scope, legacy node caps, and first-time-build XP retention.
8. **Offline Accrual (8 tests):** 1h, 24h, 48h cap adherence, clock rollback zeroing, vault/treasury limits, and seasonal transitions.
9. **Save Recovery & Corruption (6 tests):** Corrupted active slot fallback to backup1/2/3, JSON export/import validation, and corrupt error handling.
10. **Responsive Layouts (69 tests):** All 23 screens validated on Mobile (375x667), Tablet (768x1024), and Desktop (1440x900).
11. **Accessibility (7 tests):** axe-core WCAG AA checks, 44x44 tap targets, minimum 14px text, 4.5:1 contrast, keyboard focus, and reduced motion.
12. **Performance & Timing (6 tests):** Tick execution < 8ms, rerender < 16ms, save < 50ms, load < 2s, memory < 150MB, offline accrual < 100ms.
13. **Regression Suite (6 tests):** Peasant house tax base 0.30, exactly 36 quests, 86,400 offline calculation, market mean reversion per-minute, mining deposit stability, prestige XP rules.

---

## License

MIT License. Designed and built as an open offline-first medieval dynasty simulation.
