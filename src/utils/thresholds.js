export const THRESHOLDS = {
  engineTemp: {
    unit: '°C',
    min: 0,
    max: 150,
    normal: { min: 70, max: 100 },
    warning: { min: 100, max: 110 },
    critical: { min: 110, max: 150 },
    baseline: 85,
    fluctuation: 8,
  },
  tirePressure: {
    unit: 'PSI',
    min: 10,
    max: 50,
    normal: { min: 30, max: 36 },
    warning: { min: 26, max: 30 },  // also covers 36-38
    warningHigh: { min: 36, max: 38 },
    critical: { min: 10, max: 26 }, // also covers >38
    baseline: 33,
    fluctuation: 3,
  },
};
