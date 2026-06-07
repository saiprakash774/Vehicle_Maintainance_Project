import { Fragment, useState } from 'react';
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

const sectionHeadingStyle = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 10,
  marginBottom: 14,
};

const FEATURES = [
  {
    icon: '🌡️',
    title: 'Core Telemetry: Engine & Oil Temperature',
    description:
      "These two readings are usually the first hint that something mechanical is starting to struggle, so they get tracked continuously and color-coded the instant either one drifts outside its safe band. That is the early signal that never showed up on the night this project was born, rebuilt as something that actually speaks up.",
  },
  {
    icon: '🧊',
    title: 'Fluid Monitors: Coolant Level & Brake Fluid Moisture',
    description:
      "Coolant keeps an engine from overheating, and brake fluid keeps a braking system responsive and free of corrosion. Both decline slowly and quietly, long before any warning light would consider mentioning them. This dashboard tracks both as trends rather than thresholds, so a level that has been creeping downward for weeks reads as exactly that: a trend worth a look, not a surprise on the highway.",
  },
  {
    icon: '🗓️',
    title: 'Administrative Scheduler: Inspections, Insurance & Oil Changes',
    description:
      "Not every maintenance need lives on a sensor. An oil change runs on a calendar and an odometer; a state inspection and an insurance premium run purely on the calendar. The Scheduler tracks all of it side by side against the live odometer, lets you mark a task complete or reschedule it in a couple of clicks, and keeps a running activity log of everything you have done, so 'when did I last take care of this' is always one glance away.",
  },
  {
    icon: '⛽',
    title: 'Fuel Analytics: Tracing MPG Drops to Their Cause',
    description:
      "Fuel efficiency is not simulated as a number floating on its own; it is computed live from how the rest of the car is doing. Under-inflated tires increase rolling resistance, and a clogged cabin air filter forces the engine to work harder, both realistic, well-understood drags on mileage. When either condition crosses into degraded territory, the Fuel Analytics widget does not just report a lower number. It names the cause in plain language.",
  },
];

const SCENARIOS = [
  {
    icon: '🧊',
    title: 'The Silent Highway Leak',
    cause:
      "A small crack or a worn hose lets coolant escape gradually, often less than half a percent a day, with no single moment dramatic enough to trip a warning light on its own.",
    resolution:
      "The dashboard tracks coolant level as a trend rather than a single threshold. The moment its rate of decline becomes meaningful, it raises a quiet, specific flag days or weeks before the level gets anywhere near dangerous, turning a roadside emergency into a routine garage visit.",
  },
  {
    icon: '🌬️',
    title: 'The Clogged Intake',
    cause:
      "Dust and debris build up in the cabin air filter over months of normal driving, gradually restricting airflow and forcing the engine and HVAC system to work harder than they should have to.",
    resolution:
      "Cabin air filter pressure is monitored continuously and folded directly into the live Fuel Analytics report, so a creeping drop in MPG gets traced straight back to its real mechanical cause instead of being written off as 'just how the car drives now.'",
  },
  {
    icon: '📋',
    title: 'The Forgotten Deadline',
    cause:
      "State inspections, insurance renewals, and routine oil changes all run on calendars and odometers that no dashboard sensor can see, and they are exactly the kind of thing that slips through the cracks between one busy month and the next.",
    resolution:
      "The Administrative Scheduler tracks every one of these against the live odometer and the calendar, shows how much time or distance is left before each comes due, and keeps an audit trail of every reschedule and completion, so nothing gets missed simply because nobody happened to be watching the date.",
  },
];

const COMPARISON_VIEWS = {
  before: {
    label: 'Traditional Reactive Car',
    sublabel: 'Check Engine Light Panic',
    accent: '#ef4444',
    bg: '#fef2f2',
    border: '#fecaca',
    headline: 'One amber light. Zero context.',
    body:
      "It could mean a loose gas cap or an engine about to seize, and there is no way to tell which from the driver's seat. So you wait, or you pay someone to plug in a scanner and tell you what the car already knew weeks ago.",
    valueColor: '#9ca3af',
    readouts: [
      { label: 'Coolant Level', value: 'Unknown' },
      { label: 'Engine Temperature', value: 'Unknown' },
      { label: 'Brake Fluid Condition', value: 'Unknown' },
    ],
  },
  after: {
    label: 'Our Proactive Connected Platform',
    sublabel: 'Specific. Early. Plain Language.',
    accent: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    headline: 'Coolant trending down 0.4% per day. Worth a look this week.',
    body:
      "Nine systems tracked continuously, each one explained in plain language the moment it starts to drift. Not one ambiguous light: a specific reading, a specific trend, and enough lead time to schedule a fix on your own terms instead of the highway's.",
    valueColor: '#111827',
    readouts: [
      { label: 'Coolant Level', value: '91.9% (gently declining)' },
      { label: 'Engine Temperature', value: '86.5°C (within range)' },
      { label: 'Brake Fluid Condition', value: '1.22% moisture (normal)' },
    ],
  },
};

const PIPELINE_STAGES = [
  {
    icon: '🔌',
    label: 'CAN Bus / OBD-II Adapter',
    caption:
      "A small adapter plugged into the car's diagnostic port reads sensor values straight off its internal network, the same wiring the engine and transmission already use to talk to each other.",
  },
  {
    icon: '📡',
    label: 'WebSocket Stream',
    caption:
      'The adapter republishes those readings as a live JSON stream, the same lightweight, real-time channel this app is already built to plug into.',
  },
  {
    icon: '🖥️',
    label: 'UI Dashboard',
    caption:
      'Gauges, alerts, the scheduler, and the fuel analytics all render the exact same Readings shape, whether it came from a real car or this in-browser simulation.',
  },
];

function FeatureCard({ icon, title, description }) {
  return (
    <div style={{ background: '#f9fafb', borderRadius: 14, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: '1.3rem' }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>{title}</h3>
      </div>
      <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.65, color: '#4b5563' }}>{description}</p>
    </div>
  );
}

function ScenarioCard({ icon, title, cause, resolution }) {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #f3f4f6',
        borderRadius: 14,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: '1.4rem' }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#111827' }}>{title}</h3>
      </div>
      <div>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#dc2626' }}>
          Mechanical Cause
        </span>
        <p style={{ margin: '4px 0 0', fontSize: '0.83rem', lineHeight: 1.6, color: '#4b5563' }}>{cause}</p>
      </div>
      <div>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#16a34a' }}>
          Proactive Resolution
        </span>
        <p style={{ margin: '4px 0 0', fontSize: '0.83rem', lineHeight: 1.6, color: '#4b5563' }}>{resolution}</p>
      </div>
    </div>
  );
}

/**
 * An interactive "Before vs After" card: a segmented toggle swaps the panel
 * below between how a traditional dashboard presents a developing problem
 * (one ambiguous light, no specifics) and how this platform presents the
 * exact same moment (named readings, named trends, plain language). Local
 * `view` state is the only thing that changes; `COMPARISON_VIEWS` supplies
 * every visual and textual difference so the two sides stay easy to compare
 * and easy to extend.
 */
function ComparisonToggleCard() {
  const [view, setView] = useState('before');
  const active = COMPARISON_VIEWS[view];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 700 }}>
      <div style={{ display: 'inline-flex', borderRadius: 999, background: '#f3f4f6', padding: 4, gap: 4, alignSelf: 'flex-start' }}>
        {Object.entries(COMPARISON_VIEWS).map(([key, meta]) => (
          <button
            key={key}
            type="button"
            onClick={() => setView(key)}
            style={{
              padding: '9px 18px',
              borderRadius: 999,
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: view === key ? '#fff' : 'transparent',
              color: view === key ? meta.accent : '#6b7280',
              boxShadow: view === key ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
              transition: 'background-color 0.2s ease, color 0.2s ease',
            }}
          >
            {meta.label}
          </button>
        ))}
      </div>

      <div
        style={{
          borderRadius: 14,
          padding: '22px 26px',
          backgroundColor: active.bg,
          border: `1px solid ${active.border}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          transition: 'background-color 0.25s ease, border-color 0.25s ease',
        }}
      >
        <div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: active.accent }}>
            {active.sublabel}
          </span>
          <h4 style={{ margin: '4px 0 0', fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>{active.headline}</h4>
        </div>
        <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.65, color: '#374151' }}>{active.body}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
          {active.readouts.map((readout) => (
            <div key={readout.label} style={{ background: '#fff', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{readout.label}</div>
              <div style={{ marginTop: 2, fontSize: '0.83rem', fontWeight: 700, color: active.valueColor }}>{readout.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * A static three-stage flow diagram (CAN Bus / OBD-II -> WebSocket -> UI)
 * illustrating the real-world path this app's adapter pattern is already
 * built to consume, narrated in `PIPELINE_STAGES`.
 */
function DataPipelineDiagram() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', gap: 14 }}>
      {PIPELINE_STAGES.map((stage, index) => (
        <Fragment key={stage.label}>
          <div
            style={{
              flex: '1 1 220px',
              background: '#f9fafb',
              borderRadius: 12,
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <span style={{ fontSize: '1.7rem' }}>{stage.icon}</span>
            <strong style={{ fontSize: '0.88rem', color: '#111827' }}>{stage.label}</strong>
            <span style={{ fontSize: '0.8rem', lineHeight: 1.55, color: '#6b7280' }}>{stage.caption}</span>
          </div>
          {index < PIPELINE_STAGES.length - 1 && (
            <div
              aria-hidden="true"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', color: '#bae6fd', minWidth: 28 }}
            >
              →
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
}

/**
 * The storytelling case study: the night that started this project, a
 * feature-by-feature account of what got built because of it, the recurring
 * mechanical scenarios it is designed to catch early, and a pair of visual
 * "show, don't tell" cards (a reactive-vs-proactive toggle and a real-world
 * data-pipeline diagram) that make the architecture concrete. The interactive
 * highway-leak demo sits directly beside the origin story it dramatizes.
 */
export default function AboutPage() {
  return (
    <main style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 20px', fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      <header>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>
          📖 About: Why This Dashboard Exists
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: '0.875rem', color: '#6b7280', maxWidth: 720 }}>
          A story-driven case study: the night that started this project, the feature ecosystem it
          grew into, the real-world scenarios it is built to catch early, and a couple of visuals
          that make the architecture concrete.
        </p>
      </header>

      <section style={sectionStyle('#ef4444')}>
        <div style={sectionHeadingStyle}>
          <span style={{ fontSize: '1.5rem' }}>🌙</span>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
            The Catalyst (Highway Nightmare)
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
            to rock the car with every pass. Sitting there waiting on a tow truck that was,
            predictably, forty-five minutes out, I replayed the last few weeks looking for some
            sign I had missed. There had been one: a coolant top-up that came due sooner than it
            should have, and a faint sweet smell near the engine on a couple of mornings. Nothing
            dramatic enough to act on, and certainly nothing my dashboard had ever flagged.
          </p>
          <p style={{ margin: 0, fontWeight: 600, color: '#991b1b' }}>
            The simulation beside this story is a compressed, ten-second replay of exactly that
            night. Press the button and watch the same silent leak unfold the way it would have
            looked on a dashboard that was actually paying attention: early enough to pull into a
            garage, instead of onto a shoulder.
          </p>
        </div>
      </section>

      <HighwaySimulationWidget />

      <section style={sectionStyle('#8b5cf6')}>
        <div style={sectionHeadingStyle}>
          <span style={{ fontSize: '1.5rem' }}>🛠️</span>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
            Turning Trauma into Code (Feature Breakdown)
          </h2>
        </div>
        <p style={{ margin: '0 0 18px', fontSize: '0.9rem', lineHeight: 1.7, color: '#374151', maxWidth: 880 }}>
          Every feature in this app traces back to some version of that night: a specific gap in
          what a standard dashboard tells you, rebuilt as something that actually would have
          helped. Here is what got built, and why each piece exists.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section style={sectionStyle('#f59e0b')}>
        <div style={sectionHeadingStyle}>
          <span style={{ fontSize: '1.5rem' }}>🛣️</span>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
            Real-World Road Scenarios
          </h2>
        </div>
        <p style={{ margin: '0 0 18px', fontSize: '0.9rem', lineHeight: 1.7, color: '#374151', maxWidth: 880 }}>
          Three mechanical stories show up again and again in driveways and repair shops: a slow
          leak nobody caught in time, a part that quietly chokes performance, and a deadline that
          slipped through the cracks. Here is the mechanical reality behind each one, and how this
          platform changes the ending.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {SCENARIOS.map((scenario) => (
            <ScenarioCard key={scenario.title} {...scenario} />
          ))}
        </div>
      </section>

      <section style={sectionStyle('#22c55e')}>
        <div style={sectionHeadingStyle}>
          <span style={{ fontSize: '1.5rem' }}>🔄</span>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
            From Reactive to Proactive: See the Difference
          </h2>
        </div>
        <p style={{ margin: '0 0 18px', fontSize: '0.9rem', lineHeight: 1.7, color: '#374151', maxWidth: 880 }}>
          Same car, same sensors, two completely different driving experiences. Toggle between the
          dashboard most cars ship with today and the one this project builds toward.
        </p>
        <ComparisonToggleCard />
      </section>

      <section style={sectionStyle('#0ea5e9')}>
        <div style={sectionHeadingStyle}>
          <span style={{ fontSize: '1.5rem' }}>📡</span>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
            From Engine to Screen: How the Data Travels
          </h2>
        </div>
        <p style={{ margin: '0 0 18px', fontSize: '0.9rem', lineHeight: 1.7, color: '#374151', maxWidth: 880 }}>
          None of this requires exotic hardware. Here is the same three-stage path real telemetry
          would travel, from the car's internal network to the screen in front of you, the exact
          path this app's adapter pattern is already built to support.
        </p>
        <DataPipelineDiagram />
      </section>
    </main>
  );
}
