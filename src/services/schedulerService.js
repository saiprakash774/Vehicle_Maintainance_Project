import { round } from '../utils/formatters';

/**
 * @typedef {Object} MaintenanceTask
 * @property {string} key
 * @property {string} label
 * @property {string} icon
 * @property {'mileage'|'dateOnly'} trackingMode  Whether this reminder tracks
 *   both mileage and calendar time, or calendar time alone (regulatory and
 *   billing reminders like inspections or premiums have no mileage component).
 * @property {number} intervalDays
 * @property {number|null} intervalMiles  `null` for `dateOnly` reminders.
 * @property {Date} lastServicedDate
 * @property {number|null} lastServicedMileage  `null` for `dateOnly` reminders.
 * @property {Date} nextDueDate
 * @property {number|null} nextDueMileage  `null` for `dateOnly` reminders.
 */

/**
 * @typedef {Object} ServiceHistoryEntry
 * @property {string} id
 * @property {string} taskKey
 * @property {string} taskName
 * @property {string} icon
 * @property {'Completed'|'Rescheduled'} action
 * @property {Date} timestamp
 * @property {number} mileage  Odometer reading at the moment of the action.
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
  safe: { label: 'Safe', color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
  dueSoon: { label: 'Due Soon', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
  overdue: { label: 'Overdue Inspect Immediately', color: 'var(--color-critical)', bg: 'var(--color-critical-bg)' },
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
    trackingMode: 'mileage',
    intervalDays: 90,
    intervalMiles: 5000,
    lastServicedDaysAgo: 80,
    lastServicedMilesAgo: 1800,
  },
  {
    key: 'oilChange',
    label: 'Engine Oil Change',
    icon: '🛢️',
    trackingMode: 'mileage',
    intervalDays: 180,
    intervalMiles: 5000,
    lastServicedDaysAgo: 184,
    lastServicedMilesAgo: 3500,
  },
  {
    key: 'cabinFilter',
    label: 'Cabin Air Filter Replacement',
    icon: '🌀',
    trackingMode: 'mileage',
    intervalDays: 365,
    intervalMiles: 12000,
    lastServicedDaysAgo: 30,
    lastServicedMilesAgo: 1000,
  },
  {
    key: 'vehicleInspection',
    label: 'Annual State Vehicle Inspection',
    icon: '🔍',
    trackingMode: 'dateOnly',
    intervalDays: 365,
    lastServicedDaysAgo: 280,
  },
  {
    key: 'insurancePremium',
    label: 'Insurance Premium Payment',
    icon: '🛡️',
    trackingMode: 'dateOnly',
    intervalDays: 182,
    lastServicedDaysAgo: 170,
  },
];

/**
 * Resolve a seed definition into a full task record with concrete
 * last-serviced / next-due dates (and, for mileage-tracked reminders,
 * mileages), anchored to "now". `dateOnly` reminders carry `null` in every
 * mileage field rather than a fabricated number: an inspection or a premium
 * genuinely has no odometer relationship, and a generic countdown/urgency
 * pipeline that branches on `null` is simpler than maintaining a parallel
 * model just for calendar-only reminders.
 *
 * @param {typeof TASK_SEEDS[number]} seed
 * @returns {MaintenanceTask}
 */
function buildTask(seed) {
  const lastServicedDate = new Date(Date.now() - seed.lastServicedDaysAgo * DAY_MS);
  const tracksMileage = seed.trackingMode === 'mileage';
  const lastServicedMileage = tracksMileage
    ? ODOMETER_BASELINE_MILES - seed.lastServicedMilesAgo
    : null;

  return {
    key: seed.key,
    label: seed.label,
    icon: seed.icon,
    trackingMode: seed.trackingMode,
    intervalDays: seed.intervalDays,
    intervalMiles: seed.intervalMiles ?? null,
    lastServicedDate,
    lastServicedMileage,
    nextDueDate: new Date(lastServicedDate.getTime() + seed.intervalDays * DAY_MS),
    nextDueMileage: tracksMileage ? lastServicedMileage + seed.intervalMiles : null,
  };
}

/** @type {MaintenanceTask[]} */
export const MAINTENANCE_TASKS = TASK_SEEDS.map(buildTask);

/**
 * Determine how urgently a task needs attention. Whichever dimension,
 * mileage or calendar time, is closer to its limit wins, since either one
 * crossing the line means the service is due. `milesRemaining` is `null` for
 * `dateOnly` reminders, so urgency for those rests on calendar time alone.
 *
 * @param {number|null} milesRemaining
 * @param {number} daysRemaining
 * @returns {'safe'|'dueSoon'|'overdue'}
 */
function classifyUrgency(milesRemaining, daysRemaining) {
  if (daysRemaining <= 0 || (milesRemaining !== null && milesRemaining <= 0)) return 'overdue';
  if (daysRemaining <= 14 || (milesRemaining !== null && milesRemaining <= 500)) return 'dueSoon';
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
  const milesRemaining = task.trackingMode === 'mileage'
    ? Math.round(task.nextDueMileage - odometer)
    : null;
  const daysRemaining = Math.ceil((task.nextDueDate.getTime() - now.getTime()) / DAY_MS);

  return {
    ...task,
    milesRemaining,
    daysRemaining,
    urgency: classifyUrgency(milesRemaining, daysRemaining),
  };
}

/**
 * Push a reminder's target due date forward: the user telling the scheduler
 * "I'll get to this later than planned," without touching its service record
 * (last serviced stays as it was; only the target moves).
 *
 * @param {MaintenanceTask} task
 * @param {Date|string|number} newDate
 * @returns {MaintenanceTask}
 */
export function rescheduleTask(task, newDate) {
  return { ...task, nextDueDate: new Date(newDate) };
}

/**
 * Record a manual "I just took care of this" confirmation: the service
 * record resets to right now (and to the current odometer, for mileage-
 * tracked reminders), and the next targets are recomputed the standard
 * interval forward from that fresh baseline, exactly as if the work had
 * gone through the normal service flow.
 *
 * @param {MaintenanceTask} task
 * @param {number} odometer
 * @param {Date} [now]
 * @returns {MaintenanceTask}
 */
export function completeTask(task, odometer, now = new Date()) {
  const tracksMileage = task.trackingMode === 'mileage';
  const lastServicedMileage = tracksMileage ? Math.round(odometer) : null;

  return {
    ...task,
    lastServicedDate: now,
    lastServicedMileage,
    nextDueDate: new Date(now.getTime() + task.intervalDays * DAY_MS),
    nextDueMileage: tracksMileage ? lastServicedMileage + task.intervalMiles : null,
  };
}

/**
 * Build one audit-log record for a reminder action: everything the "Recent
 * Activity" log needs to render a clean, self-contained line item without
 * looking the task back up later. Takes the task's state *after* the action
 * was applied, so `taskName`/`icon` reflect what the user just acted on.
 *
 * @param {MaintenanceTask} task
 * @param {'Completed'|'Rescheduled'} action
 * @param {number} odometer
 * @param {Date} [timestamp]
 * @returns {ServiceHistoryEntry}
 */
export function createHistoryEntry(task, action, odometer, timestamp = new Date()) {
  return {
    id: `${task.key}-${timestamp.getTime()}`,
    taskKey: task.key,
    taskName: task.label,
    icon: task.icon,
    action,
    timestamp,
    mileage: Math.round(odometer),
  };
}
