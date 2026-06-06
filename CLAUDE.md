# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A production-ready, lightweight vehicle predictive maintenance application built with React. Simulates real-time vehicle telemetry (engine temperature, tire pressure) and alerts users when values exceed safe thresholds.

## Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run a single test file
npm test -- --testPathPattern="ComponentName"
```

## Architecture

The app is organized into four layers:

- **`src/components/`** — Reusable UI primitives (gauges, status badges, alert banners). Stateless; receive data via props.
- **`src/pages/`** — Route-level views that compose components. Own no data-fetching logic themselves.
- **`src/services/`** — Simulation engine and any future API/WebSocket integrations. The telemetry service runs a `setInterval` loop to emit fluctuating readings for engine temperature and tire pressure, comparing values against threshold constants.
- **`src/utils/`** — Pure helper functions: threshold evaluation, unit conversion, formatting.

### Data Flow

```
services/telemetryService.js  →  (callback / state update)
       ↓
pages/Dashboard.jsx           →  holds live readings in React state
       ↓
components/SensorCard.jsx     →  renders gauge + status indicator
components/AlertBanner.jsx    →  conditionally renders when threshold breached
```

### Threshold constants

Defined in `src/utils/thresholds.js`:

| Parameter         | Safe range              |
|-------------------|-------------------------|
| Engine temperature | 70 °C – 110 °C         |
| Tire pressure      | 30 PSI – 36 PSI        |

Status levels: `"normal"` | `"warning"` | `"critical"` — derived in `src/utils/getStatus.js`.

### Simulation

`src/services/telemetryService.js` exposes `startSimulation(callback, intervalMs)` and `stopSimulation()`. The interval fires every second by default, generating random fluctuations around a baseline for each sensor. Clean up the interval in `useEffect` return to avoid memory leaks.
