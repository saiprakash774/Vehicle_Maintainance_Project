/**
 * @typedef {Object} SensorConfig
 * @property {string} key            Unique identifier; also the readings/state key.
 * @property {string} label          Human-readable display name.
 * @property {string} icon           Emoji icon shown on the sensor card.
 * @property {string} unit           Display unit (e.g. '°C', 'PSI', '%').
 * @property {'powertrain'|'chassis'|'cabin'} domain  Which domain section owns this sensor.
 * @property {number} min            Absolute lower bound the simulated value may reach.
 * @property {number} max            Absolute upper bound the simulated value may reach.
 * @property {number} baseline       Steady-state value the simulation drifts toward.
 * @property {number} fluctuation    Magnitude of per-tick random walk noise.
 * @property {number} [decimals=1]   Decimal places to round simulated readings to.
 * @property {[number, number]} normalRange       Inclusive range considered "normal".
 * @property {[number, number][]} warningBands    Inclusive ranges considered "warning";
 *                                                  anything else within [min, max] is "critical".
 * @property {number} [leakRate]     Powertrain only: per-tick coolant micro-leak magnitude.
 * @property {number} [driftRate]    Chassis only: per-tick hygroscopic moisture accumulation.
 * @property {number} [clogRate]     Cabin only: per-tick filter clogging accumulation.
 */

/**
 * Each sensor declares its own normal range and warning bands.
 * Anything inside `normalRange` is "normal"; inside a `warningBands` tuple is
 * "warning"; anything else within [min, max] is "critical". This single shape
 * drives simulation, status evaluation, gauges, and cards generically.
 *
 * @type {SensorConfig[]}
 */
export const SENSORS = [
  // ---- Powertrain --------------------------------------------------------
  {
    key: 'engineTemp',
    label: 'Engine Temperature',
    icon: '🌡️',
    unit: '°C',
    domain: 'powertrain',
    min: 0,
    max: 150,
    baseline: 85,
    fluctuation: 8,
    normalRange: [70, 100],
    warningBands: [[60, 70], [100, 110]],
  },
  {
    key: 'oilTemp',
    label: 'Oil Temperature',
    icon: '🛢️',
    unit: '°C',
    domain: 'powertrain',
    min: 0,
    max: 160,
    baseline: 95,
    fluctuation: 6,
    normalRange: [80, 110],
    warningBands: [[70, 80], [110, 125]],
  },
  {
    key: 'transmissionFluidTemp',
    label: 'Transmission Fluid Temp',
    icon: '⚙️',
    unit: '°C',
    domain: 'powertrain',
    min: 0,
    max: 150,
    baseline: 80,
    fluctuation: 4,
    normalRange: [60, 95],
    warningBands: [[50, 60], [95, 110]],
  },
  {
    key: 'batteryVoltage',
    label: 'Battery Voltage',
    icon: '🔋',
    unit: 'V',
    domain: 'powertrain',
    min: 9,
    max: 16,
    baseline: 12.6,
    fluctuation: 0.25,
    decimals: 2,
    normalRange: [12.4, 14.4],
    warningBands: [[11.8, 12.4], [14.4, 14.8]],
  },
  {
    key: 'emissions',
    label: 'Emissions (CO)',
    icon: '🌫️',
    unit: 'ppm',
    domain: 'powertrain',
    min: 0,
    max: 1000,
    baseline: 180,
    fluctuation: 35,
    normalRange: [0, 300],
    warningBands: [[300, 500]],
  },
  {
    key: 'vibration',
    label: 'Vibration Frequency',
    icon: '📳',
    unit: 'Hz',
    domain: 'powertrain',
    min: 0,
    max: 100,
    baseline: 25,
    fluctuation: 6,
    normalRange: [10, 40],
    warningBands: [[0, 10], [40, 60]],
  },
  {
    key: 'coolantLevel',
    label: 'Coolant Fluid Level',
    icon: '🧊',
    unit: '%',
    domain: 'powertrain',
    min: 0,
    max: 100,
    baseline: 92,
    fluctuation: 0.4,
    leakRate: 0.02,
    normalRange: [70, 100],
    warningBands: [[50, 70]],
  },
  {
    key: 'coolantThermalEfficiency',
    label: 'Coolant Thermal Efficiency',
    icon: '♨️',
    unit: '%',
    domain: 'powertrain',
    min: 0,
    max: 100,
    baseline: 90,
    fluctuation: 1,
    normalRange: [80, 100],
    warningBands: [[65, 80]],
  },

  // ---- Chassis ------------------------------------------------------------
  {
    key: 'tirePressure',
    label: 'Tire Pressure',
    icon: '🛞',
    unit: 'PSI',
    domain: 'chassis',
    min: 10,
    max: 50,
    baseline: 33,
    fluctuation: 3,
    normalRange: [30, 36],
    warningBands: [[26, 30], [36, 38]],
  },
  {
    key: 'brakePadWear',
    label: 'Brake Pad Wear',
    icon: '🛑',
    unit: '%',
    domain: 'chassis',
    min: 0,
    max: 100,
    baseline: 35,
    fluctuation: 1.5,
    normalRange: [0, 50],
    warningBands: [[50, 80]],
  },
  {
    key: 'brakeFluidPressure',
    label: 'Brake Fluid Pressure',
    icon: '🧯',
    unit: 'PSI',
    domain: 'chassis',
    min: 400,
    max: 1600,
    baseline: 1050,
    fluctuation: 40,
    normalRange: [950, 1150],
    warningBands: [[850, 950], [1150, 1250]],
  },
  {
    key: 'brakeFluidMoisture',
    label: 'Brake Fluid Moisture',
    icon: '💧',
    unit: '%',
    domain: 'chassis',
    min: 0,
    max: 6,
    baseline: 1.2,
    fluctuation: 0.04,
    decimals: 2,
    driftRate: 0.01,
    normalRange: [0, 2],
    warningBands: [[2, 3]],
  },

  // ---- Cabin --------------------------------------------------------------
  {
    key: 'cabinAirFilterPressure',
    label: 'Cabin Air Filter Pressure',
    icon: '🌀',
    unit: 'kPa',
    domain: 'cabin',
    min: 0,
    max: 4,
    baseline: 0.6,
    fluctuation: 0.04,
    decimals: 2,
    clogRate: 0.012,
    normalRange: [0, 1.4],
    warningBands: [[1.4, 2.6]],
  },
];

export const SENSOR_MAP = Object.fromEntries(SENSORS.map((s) => [s.key, s]));

/**
 * @typedef {Object} DomainMeta
 * @property {string} key          Domain identifier, matches `SensorConfig.domain`.
 * @property {string} label        Display name for the section header.
 * @property {string} description  Short subtitle explaining what the domain covers.
 * @property {string} icon         Emoji icon shown next to the section header.
 */

/** @type {DomainMeta[]} */
export const DOMAINS = [
  {
    key: 'powertrain',
    label: 'Powertrain',
    description: 'Engine, drivetrain, electrical & emissions systems',
    icon: '🔧',
  },
  {
    key: 'chassis',
    label: 'Chassis',
    description: 'Wheels, brakes & suspension systems',
    icon: '🚗',
  },
  {
    key: 'cabin',
    label: 'Cabin',
    description: 'HVAC & interior comfort systems',
    icon: '🪑',
  },
];

export const DOMAIN_MAP = Object.fromEntries(DOMAINS.map((d) => [d.key, d]));
