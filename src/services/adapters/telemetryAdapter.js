/**
 * @typedef {Record<string, number> & { odometer: number, timestamp: Date|null }} Readings
 */

/**
 * The contract every telemetry source must satisfy. An adapter's only job is
 * to "connect, then push full reading snapshots to a callback over time" 
 * intentionally the same shape a real device-stream consumer would have (a
 * WebSocket `onmessage` handler pushes a parsed snapshot; a simulated one
 * pushes a computed one). `useVehicleTelemetry` depends only on this shape,
 * never on a concrete adapter, which is what lets the data source be swapped
 * by changing a single line.
 *
 * @typedef {Object} TelemetryAdapter
 * @property {(onReading: (reading: Readings) => void) => void} connect
 *   Begin emitting reading snapshots to `onReading`. Called once on mount.
 * @property {() => void} disconnect
 *   Stop emitting and release any underlying resources (timers, sockets).
 *   Called on unmount and whenever the hook needs to tear down the source.
 */

export {};
