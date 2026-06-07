# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A production-ready, lightweight vehicle predictive maintenance application built with React + Vite. Simulates real-time vehicle telemetry across nine parameters and alerts users when readings drift into warning or critical territory.

## Commands

```bash
# Install dependencies
npm install

# Start development server (Vite, default port 5173)
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview

# Lint
npm run lint
```

## Architecture

The app is organized into four layers:

- **`src/components/`** Reusable UI primitives (`Gauge`, `StatusBadge`, `SensorCard`, `AlertBanner`, `Header`). Stateless; receive data via props.
- **`src/pages/`** Route-level views that compose components. `Dashboard.jsx` owns the live readings state and drives the simulation lifecycle.
- **`src/services/`** `telemetryService.js`: the simulation engine (and the place to swap in a real API/WebSocket later).
- **`src/utils/`** Pure helpers: sensor config (`thresholds.js`), status evaluation (`getStatus.js`), formatting (`formatters.js`).

### Data flow

```
services/telemetryService.js  →  emits { ...readings, timestamp } every tick
       ↓
pages/Dashboard.jsx           →  holds readings in state, derives a status per sensor,
                                  builds the alert list
       ↓
components/SensorCard.jsx     →  Gauge + StatusBadge per sensor
components/AlertBanner.jsx    →  scrollable list of active warning/critical alerts
```

### Sensor config is the single source of truth

`src/utils/thresholds.js` exports `SENSORS`, an array of nine sensor descriptors (`engineTemp`, `oilTemp`, `brakePadWear`, `vibration`, `brakeFluidPressure`, `tirePressure`, `batteryVoltage`, `transmissionFluidTemp`, `emissions`). Each descriptor carries everything needed to simulate, evaluate, and render that sensor `label`, `icon`, `unit`, `min`/`max`, `baseline`, `fluctuation`, `normalRange`, and `warningBands`. `SENSOR_MAP` provides O(1) lookup by key.

Adding a tenth sensor means adding one object to `SENSORS` the simulation loop, status evaluator, dashboard grid, and alert builder all iterate over this array generically and require no changes.

### Status evaluation

`src/utils/getStatus.js` exports a single generic `getStatus(sensorKey, value)`:
- inside `normalRange` → `"normal"`
- inside any `warningBands` tuple → `"warning"`
- otherwise (but within `[min, max]`) → `"critical"`

`STATUS_META` maps each status to its label/color/background used by badges, gauges, and alert styling.

### Simulation

`telemetryService.js` exposes `startSimulation(onReading, intervalMs = 1000)` / `stopSimulation()`. On each tick it advances every sensor's value with a random walk that's gently pulled back toward its `baseline` (`fluctuate`), and has a small (~2%) chance per sensor per tick of injecting a larger spike (`maybeSpike`) so warning/critical states surface during a normal demo session. `Dashboard.jsx` starts/stops the interval from a `useEffect` keyed on the pause/resume toggle and always cleans up on unmount.
