import HighwaySimulationWidget from '../components/HighwaySimulationWidget';

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
 * The storytelling page: a first-person account of the night that started
 * this project, what's actually wrong with how cars talk to drivers today,
 * and why this dashboard exists, followed by a hands-on demo that lets a
 * visitor watch the same kind of slow-building crisis play out on live
 * readouts instead of just reading about it.
 */
export default function AboutPage() {
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <header>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>
          📖 About: Why This Dashboard Exists
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
          A true story about a bad night on the highway, the dashboard I wish I'd had, and a demo
          you can run yourself.
        </p>
      </header>

      <section style={sectionStyle('#ef4444')}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: '1.5rem' }}>🌙</span>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
            The Day My Car Left Me Stranded
          </h2>
        </div>
        <div style={proseStyle}>
          <p style={{ margin: 0 }}>
            It happened on a Friday evening, the kind of drive I had made a hundred times before:
            same exit, same stretch of traffic, same half-listened-to playlist. Then the
            temperature gauge did something I had genuinely never watched it do: it climbed. Not
            the gentle morning warm-up I was used to, but a fast, deliberate slide toward the red
            line. Within a minute, steam was curling out from under the hood.
          </p>
          <p style={{ margin: 0 }}>
            I eased onto the shoulder, hazards blinking, while traffic streamed past close enough
            to rock the car with every pass. The tow truck was, predictably, forty-five minutes
            out. Sitting there with nothing to do but wait, I found myself replaying the last few
            weeks, looking for some sign I had missed.
          </p>
          <p style={{ margin: 0 }}>
            And there had been signs: a coolant top-up that came due sooner than it should have, a
            faint sweet smell near the engine on a couple of mornings. Nothing dramatic enough to
            act on by itself, and certainly nothing my dashboard had ever flagged. By the time it
            had something to say, I was already stranded on the shoulder of a highway, watching
            steam rise into the dark.
          </p>
        </div>
      </section>

      <section style={sectionStyle('#f59e0b')}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: '1.5rem' }}>🔍</span>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
            The Problem with Modern Dashboards
          </h2>
        </div>
        <div style={proseStyle}>
          <p style={{ margin: 0 }}>
            Here's the part that still bothers me: my car had been sensing all of this the whole
            time. Modern vehicles are packed with sensors, more than most drivers realize,
            constantly measuring things like coolant level, oil temperature, and battery health.
            The problem was never the sensing. It was the silence.
          </p>
          <p style={{ margin: 0 }}>
            Most dashboards are built around a single amber "check engine" light that, on its own,
            means almost nothing. It could mean "your gas cap is loose" or "pull over before
            something seizes," and from the driver's seat there is no way to tell which. That one
            light compresses weeks of slow, measurable decline into a single binary moment: fine,
            then suddenly not fine. It strips out exactly the information that would have let me
            act early instead of standing on a shoulder watching steam rise.
          </p>
          <p style={{ margin: 0, fontWeight: 600, color: '#92400e' }}>
            A coolant level that has been quietly dropping for two months trips the same
            indifferent warning as a sensor glitch that resolves itself by morning, even though
            the gap between them is the entire difference between a scheduled oil change and a
            tow truck.
          </p>
        </div>
      </section>

      <section style={sectionStyle('#22c55e')}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: '1.5rem' }}>💡</span>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
            Why I Built This Platform
          </h2>
        </div>
        <div style={proseStyle}>
          <p style={{ margin: 0 }}>
            After that night, I started paying a lot more attention to how little useful
            information cars actually hand to the people driving them, and how much of that gap
            comes down to presentation rather than hardware. The sensors were already there. What
            was missing was something willing to narrate a slow problem while there was still time
            to do something about it.
          </p>
          <p style={{ margin: 0 }}>
            So I built the dashboard I wish I had been looking at that evening: one that treats a
            slowly dropping coolant level as a trend worth mentioning today, not a crisis to
            announce on the highway. It watches nine vehicle systems side by side, layers in the
            maintenance reminders that live outside of what any sensor can measure (an overdue oil
            change, an upcoming inspection, a premium that's about to renew), and explains all of
            it in plain language instead of one cryptic light.
          </p>
          <p style={{ margin: 0 }}>
            It is also built to grow up. Everything here runs on a realistic in-browser simulation
            today, sent through the exact same interface a real vehicle bridge would use. Point
            that interface at a live feed from a car's onboard diagnostics port instead, and
            nothing else in this app would need to change: not the gauges, not the alerts, not the
            scheduler. The simulation isn't a placeholder for the real thing. It's a working
            rehearsal of it.
          </p>
        </div>
      </section>

      <HighwaySimulationWidget />
    </main>
  );
}
