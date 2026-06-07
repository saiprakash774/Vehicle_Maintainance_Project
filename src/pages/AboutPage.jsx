const sectionStyle = (accent) => ({
  background: '#fff',
  borderRadius: 16,
  padding: '28px 32px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  borderTop: `4px solid ${accent}`,
  marginTop: 24,
});

const proseStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  fontSize: '0.9rem',
  lineHeight: 1.7,
  color: '#374151',
  maxWidth: 880,
};

/**
 * The immersive storytelling page: the project's "why," told as a story
 * rather than a feature list, plus a concrete walkthrough of how the same
 * architecture would consume telemetry from a real vehicle. Absorbs and
 * substantially expands what `OverviewPanel` used to hold (now retired, since
 * this narrative belongs to a dedicated page rather than a dashboard card).
 */
export default function AboutPage() {
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <header>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>
          📖 About: Why This Dashboard Exists
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
          The story behind the project, and how it scales from a browser simulation to a real car.
        </p>
      </header>

      <section style={sectionStyle('#0ea5e9')}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: '1.5rem' }}>🛣️</span>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
            The Invisible Maintenance Gap
          </h2>
        </div>
        <div style={proseStyle}>
          <p style={{ margin: 0 }}>
            It's a Tuesday evening, three lanes of highway traffic doing sixty-five, and the only
            thing on your mind is getting home. Then the temperature needle (the one gauge you
            never actually look at) swings hard into the red. No ramp-up, no gradual climb you
            could've caught in your peripheral vision. Just suddenly <em>there</em>, in the zone
            that means "stop the car, right now, before something breaks permanently."
          </p>
          <p style={{ margin: 0 }}>
            You ease onto the shoulder as traffic streams past at sixty-five, hazards ticking,
            heart pounding harder than the moment seems to call for. Except it actually does call
            for it, because you're a stationary object on the side of a highway and every passing
            truck rocks the car as it goes by. Steam curls out from under the hood. The tow truck
            is "forty-five minutes out." You have nothing to do but sit there and replay the last
            few weeks, trying to remember if there'd been any warning at all.
          </p>
          <p style={{ margin: 0 }}>
            There had been. It just hadn't looked like one. A faint sweet smell near the engine bay
            a few times. A coolant reservoir that seemed to need topping up more often than it used
            to. Small, deniable things: the kind that are easy to notice individually and just as
            easy to forget by the next morning's commute. By the time the dashboard had something
            unambiguous to say, the engine was already overheating on the shoulder of a highway.
          </p>
        </div>
      </section>

      <section style={sectionStyle('#f59e0b')}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
            The Systemic Danger of "Just a Warning Light"
          </h2>
        </div>
        <div style={proseStyle}>
          <p style={{ margin: 0 }}>
            Modern cars are full of sensors, and yet the way most of them communicate with a driver
            hasn't fundamentally changed in decades: a single amber icon that means anywhere from
            "you should probably mention this at your next oil change" to "pull over before
            something seizes." The Check Engine light is the most familiar example, and also
            something of a masterclass in how <em>not</em> to surface a slowly developing problem.
            It stays dark through weeks of gradual decline, then turns on with no sense of urgency
            attached, indistinguishable from a hundred more trivial faults that share the same lamp.
          </p>
          <p style={{ margin: 0 }}>
            That's the systemic problem: reactive warnings compress a slow-moving story into a
            single binary moment (fine, then suddenly not fine) and strip out exactly the
            information a driver would need to act early. A coolant level that's been quietly
            dropping by half a percent a day for two months crosses the same indifferent threshold
            as a sensor glitch that will resolve itself by tomorrow. Nothing about the warning
            distinguishes "this has been building for weeks" from "this just happened," even though
            that distinction is the entire difference between a scheduled repair and a tow truck.
          </p>
          <p style={{ margin: 0, fontWeight: 600, color: '#92400e' }}>
            This project exists to replace that single late, ambiguous signal with something that
            tells the story as it unfolds: gentle, specific, and early enough to act on, so a slow
            leak reads as a trend on a dashboard at home, not an emergency on the highway.
          </p>
        </div>
      </section>

      <section style={sectionStyle('#22c55e')}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: '1.5rem' }}>🔌</span>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
            From Simulation to the Real Road
          </h2>
        </div>
        <div style={proseStyle}>
          <p style={{ margin: 0 }}>
            Everything on the Dashboard right now is generated in the browser: nine sensors
            random-walking around realistic baselines, occasionally spiking into warning or
            critical territory the way real components do as they age. That's deliberate: it lets
            the whole experience (gauges, alerts, scheduling, fuel analytics, even the scripted
            emergency sequence) be explored instantly, with no hardware required.
          </p>
          <p style={{ margin: 0 }}>
            But the simulation isn't a toy model that would need to be thrown away to go further.
            It's standing in for a very real, very common piece of hardware. Almost every car built
            since the mid-1990s exposes a diagnostic port wired into its <strong>CAN bus</strong>,
            the internal network its engine, transmission, and body modules use to talk to each
            other. A small <strong>OBD-II adapter</strong> plugged into that port can read the exact
            kinds of values this dashboard simulates (engine and oil temperature, battery voltage,
            emissions readings, and more) directly off the car's own internal wiring.
          </p>
          <p style={{ margin: 0 }}>
            From there, the adapter typically republishes those readings as live JSON: streamed to
            nearby devices over a <strong>WebSocket</strong> connection (<code>ws://</code>), or
            published to subscribers through an <strong>MQTT broker</strong>. Both are lightweight,
            well-established ways to move a steady stream of small telemetry packets from a vehicle
            to whatever's listening, whether that's a phone, a dashboard like this one, or a fleet
            backend.
          </p>
          <p style={{ margin: 0 }}>
            That "whatever's listening" is exactly where this app's <strong>adapter pattern</strong>{' '}
            pays for itself. Every layer above the data source (the domain services, the scheduler,
            the fuel analytics, every component on every page) consumes telemetry through one
            shape, a plain <code>Readings</code> snapshot, regardless of where it came from. The
            browser simulation produces that shape today via <code>simulationAdapter.js</code>; a
            real vehicle bridge would produce the very same shape via{' '}
            <code>obdWebSocketAdapter.js</code>, a complete, working WebSocket client already
            included in this codebase, parsing exactly the kind of JSON an OBD-II/CAN-bus bridge
            would publish. Pointing <code>useVehicleTelemetry</code> at one or the other is a
            one-line change in a single file. Nothing else, not one component, not one page, would
            need to know the difference.
          </p>
        </div>
      </section>
    </main>
  );
}
