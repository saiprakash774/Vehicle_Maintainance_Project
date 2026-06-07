import { round } from '../utils/formatters';

/**
 * @typedef {Object} MaintenanceTask
 * @property {string} key
 * @property {string} label
 * @property {string} icon
 * @property {Date} lastServicedDate
 * @property {number} lastServicedMileage
 * @property {Date} nextDueDate
 * @property {number} nextDueMileage
 */

/**
 * @typedef {Object} TaskCountdown
 * @augments MaintenanceTask
 * @property {number} milesRemaining   Negative once overdue.
 * @property {number} daysRemaining    Negative once overdue.
 * @property {'safe'|'dueSoon'|'overdue'} urgency
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export const ODOMETER_BASELINE_MILES = 55000;

/** Color/label palette for countdown urgency deliberately mirrors `STATUS_META`. */
export const URGENCY_META = {
  safe: { label: 'Safe', color: '#22c55e', bg: '#dcfce7' },
  dueSoon: { label: 'Due Soon', color: '#f59e0b', bg: '#fef3c7' },
  overdue: { label: 'Overdue Inspect Immediately', color: '#ef4444', bg: '#fee2e2' },
};

/**
 * The odometer is the other half of the "invisible maintenance gap" service
 * intervals are tracked against it, so it has to keep moving in the
 * background just like the sensor readings. It only ever climbs (a car
 * doesn't un-drive itself), with a small randomized step so the dashboard
 * feels alive without the number jumping unrealistically between ticks.
 *
 * @param {number} current
 * @returns {number}
 */
export function tickOdometer(current) {
  return round(current + (0.01 + Math.random() * 0.03), 2);
}

/**
 * Compact seed definitions expressed as offsets from "now" / the current
 * odometer baseline, so the demo always shows a believable, varied spread of
 * urgencies (one safe, one due soon, one overdue) regardless of which day
 * it's actually run on.
 */
const TASK_SEEDS = [
  {
    key: 'coolantCheck',
    label: 'Coolant Level Check',
    icon: '🧊',
    intervalDays: 90,
    intervalMiles: 5000,
    lastServicedDaysAgo: 80,
    lastServicedMilesAgo: 1800,
  },
  {
    key: 'oilChange',
    label: 'Engine Oil Change',
    icon: '🛢️',
    intervalDays: 180,
    intervalMiles: 5000,
    lastServicedDaysAgo: 184,
    lastServicedMilesAgo: 3500,
  },
  {
    key: 'cabinFilter',
    label: 'Cabin Air Filter Replacement',
    icon: '🌀',
    intervalDays: 365,
    intervalMiles: 12000,
    lastServicedDaysAgo: 30,
    lastServicedMilesAgo: 1000,
  },
];

/**
 * Resolve a seed definition into a full task record with concrete
 * last-serviced / next-due dates and mileages, anchored to "now".
 *
 * @param {typeof TASK_SEEDS[number]} seed
 * @returns {MaintenanceTask}
 */
function buildTask(seed) {
  const lastServicedDate = new Date(Date.now() - seed.lastServicedDaysAgo * DAY_MS);
  const lastServicedMileage = ODOMETER_BASELINE_MILES - seed.lastServicedMilesAgo;

  return {
    key: seed.key,
    label: seed.label,
    icon: seed.icon,
    lastServicedDate,
    lastServicedMileage,
    nextDueDate: new Date(lastServicedDate.getTime() + seed.intervalDays * DAY_MS),
    nextDueMileage: lastServicedMileage + seed.intervalMiles,
  };
}

/** @type {MaintenanceTask[]} */
export const MAINTENANCE_TASKS = TASK_SEEDS.map(buildTask);

/**
 * Determine how urgently a task needs attention. Whichever dimension 
 * mileage or calendar time is closer to its limit wins, since either one
 * crossing the line means the service is due.
 *
 * @param {number} milesRemaining
 * @param {number} daysRemaining
 * @returns {'safe'|'dueSoon'|'overdue'}
 */
function classifyUrgency(milesRemaining, daysRemaining) {
  if (milesRemaining <= 0 || daysRemaining <= 0) return 'overdue';
  if (milesRemaining <= 500 || daysRemaining <= 14) return 'dueSoon';
  return 'safe';
}

/**
 * Build a live countdown for a maintenance task against the current odometer
 * reading and system date.
 *
 * @param {MaintenanceTask} task
 * @param {number} odometer  Current simulated odometer reading (miles).
 * @param {Date} [now]
 * @returns {TaskCountdown}
 */
export function getTaskCountdown(task, odometer, now = new Date()) {
  const milesRemaining = Math.round(task.nextDueMileage - odometer);
  const daysRemaining = Math.ceil((task.nextDueDate.getTime() - now.getTime()) / DAY_MS);

  return {
    ...task,
    milesRemaining,
    daysRemaining,
    urgency: classifyUrgency(milesRemaining, daysRemaining),
  };
}
