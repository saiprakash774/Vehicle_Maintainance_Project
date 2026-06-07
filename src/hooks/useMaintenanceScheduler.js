import { useState } from 'react';
import {
  MAINTENANCE_TASKS,
  rescheduleTask,
  completeTask,
  createHistoryEntry,
} from '../services/schedulerService';

/**
 * @typedef {Object} MaintenanceSchedulerController
 * @property {import('../services/schedulerService').MaintenanceTask[]} tasks
 * @property {import('../services/schedulerService').ServiceHistoryEntry[]} historyLog  Newest first.
 * @property {Date} lastUpdated
 * @property {(key: string, newDate: Date|string|number) => void} reschedule
 * @property {(key: string) => void} confirmManualCheck
 */

/**
 * Owns the interactive half of the scheduler: the live reminder records
 * (seeded from `MAINTENANCE_TASKS`, then updated immutably as the user
 * completes or reschedules them), a running audit log of those actions, and
 * a `lastUpdated` timestamp that advances on every change. Pages read it
 * once and thread the pieces down to whichever panels need them, the same
 * "hook owns state, components stay presentational" split as `useVehicleTelemetry`.
 *
 * @param {number} odometer  Current simulated odometer reading, used to stamp
 *   completions with the mileage at the moment of service and to record the
 *   mileage context on every audit-log entry.
 * @returns {MaintenanceSchedulerController}
 */
export function useMaintenanceScheduler(odometer) {
  const [tasks, setTasks] = useState(MAINTENANCE_TASKS);
  const [historyLog, setHistoryLog] = useState(/** @type {import('../services/schedulerService').ServiceHistoryEntry[]} */ ([]));
  const [lastUpdated, setLastUpdated] = useState(() => new Date());

  /**
   * Shared spine for both actions: look up the current record, run it
   * through a pure transform, log the result, and commit all three pieces
   * of state together. Reads `tasks` from the render-time closure rather
   * than a functional updater, since these are one-shot click handlers
   * (not concurrent updates) and the lookup result feeds the log entry too.
   *
   * @param {string} key
   * @param {(task: import('../services/schedulerService').MaintenanceTask) => import('../services/schedulerService').MaintenanceTask} transform
   * @param {'Completed'|'Rescheduled'} action
   */
  function applyUpdate(key, transform, action) {
    const target = tasks.find((task) => task.key === key);
    if (!target) return;

    const updated = transform(target);
    const entry = createHistoryEntry(updated, action, odometer);

    setTasks((prev) => prev.map((task) => (task.key === key ? updated : task)));
    setHistoryLog((prev) => [entry, ...prev]);
    setLastUpdated(new Date());
  }

  /** @param {string} key @param {Date|string|number} newDate */
  function reschedule(key, newDate) {
    applyUpdate(key, (task) => rescheduleTask(task, newDate), 'Rescheduled');
  }

  /** @param {string} key */
  function confirmManualCheck(key) {
    applyUpdate(key, (task) => completeTask(task, odometer), 'Completed');
  }

  return { tasks, historyLog, lastUpdated, reschedule, confirmManualCheck };
}
