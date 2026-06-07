/**
 * @typedef {Object} MaintenanceAlert
 * @property {'warning'|'critical'} status
 * @property {string} icon
 * @property {string} title
 * @property {string} message
 */

/**
 * Build the list of active maintenance alerts for a given subset of sensors,
 * anything not in the "normal" status. Used both for a full-dashboard alert
 * feed and for per-domain scoped feeds (see `DomainSection`), so it accepts an
 * arbitrary sensor list rather than assuming the global `SENSORS` array.
 *
 * @param {import('./thresholds').SensorConfig[]} sensors  Sensors to check.
 * @param {Record<string, number>} readings                Latest reading per sensor key.
 * @param {Record<string, 'normal'|'warning'|'critical'>} statuses  Latest status per sensor key.
 * @returns {MaintenanceAlert[]}
 */
export function buildAlerts(sensors, readings, statuses) {
  const alerts = [];

  for (const sensor of sensors) {
    const status = statuses[sensor.key];
    if (status === 'normal') continue;

    alerts.push({
      status,
      icon: status === 'critical' ? '🚨' : '⚠️',
      title: `${sensor.label}: ${status === 'critical' ? 'Critical' : 'Warning'}`,
      message:
        status === 'critical'
          ? `Reading is ${readings[sensor.key]} ${sensor.unit}; schedule maintenance immediately.`
          : `Reading is ${readings[sensor.key]} ${sensor.unit}, outside the optimal range.`,
    });
  }

  return alerts;
}
