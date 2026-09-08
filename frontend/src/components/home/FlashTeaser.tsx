import { Zap } from 'lucide-react';

const FLASH_STEPS = [
  {
    number: '01',
    label: 'Connect',
    text: (<><strong>Connect your K10</strong> to your computer with a USB-C cable.</>),
  },
  {
    number: '02',
    label: 'Select',
    text: (<><strong>Pick a project</strong> from K10 Hub — any project with browser flashing enabled.</>),
  },
  {
    number: '03',
    label: 'Flash',
    text: (<><strong>Click Flash.</strong> K10 Hub compiles and flashes the firmware directly — no IDE required.</>),
  },
];

export default function FlashTeaser() {
  return (
    <section
      className="flash-teaser"
      id="flash"
      aria-labelledby="flash-teaser-title"
    >
      <div className="container flash-teaser__inner">

        {/* Content */}
        <div className="flash-teaser__content">
          <p className="label" style={{ marginBottom: 'var(--space-2)' }}>
            Coming Soon
          </p>
          <h2 className="flash-teaser__headline" id="flash-teaser-title">
            Learn it. Try it.
            <br />
            Flash it.
          </h2>
          <p className="flash-teaser__description">
            K10 Hub will support browser-based firmware flashing — so you can go from reading
            a project page to running code on your K10 in three steps, with no IDE installation,
            no library management and no compilation errors.
          </p>

          <div className="flash-teaser__steps" aria-label="Flash process steps">
            {FLASH_STEPS.map((step) => (
              <div key={step.number} className="flash-step">
                <span className="flash-step__number" aria-label={`Step ${step.number}`}>
                  {step.number}
                </span>
                <p className="flash-step__text">{step.text}</p>
              </div>
            ))}
          </div>

          <div className="flash-teaser__coming-soon" role="status">
            <Zap size={12} aria-hidden="true" />
            Browser flashing is in development. Connect your K10 and flash firmware directly
            from K10 Hub — no IDE required.
          </div>
        </div>

        {/* Terminal Visual */}
        <div className="flash-teaser__visual" aria-hidden="true">
          <div className="flash-teaser__terminal" role="img" aria-label="Terminal showing K10 flash output">
            <div className="flash-teaser__terminal-bar">
              <span className="terminal-dot terminal-dot--red" />
              <span className="terminal-dot terminal-dot--yellow" />
              <span className="terminal-dot terminal-dot--green" />
              <span className="flash-teaser__terminal-title">k10hub — flash terminal</span>
            </div>
            <div className="flash-teaser__terminal-body">
              <div className="terminal-line">
                <span className="terminal-prompt">$</span>
                <span className="terminal-cmd">k10hub flash led-blink</span>
              </div>
              <div style={{ height: 'var(--space-3)' }} />
              <div className="terminal-comment">  # Resolving dependencies...</div>
              <div className="terminal-output">  Fetching firmware: led-blink@1.0.0</div>
              <div className="terminal-output">  Verifying SHA256 checksum...</div>
              <div className="terminal-output">  K10 detected on /dev/ttyUSB0</div>
              <div style={{ height: 'var(--space-2)' }} />
              <div className="terminal-comment">  # Flashing firmware...</div>
              <div className="terminal-output">  Erasing flash: ████████░░ 80%</div>
              <div className="terminal-output">  Writing:        ████████░░ 80%</div>
              <div style={{ height: 'var(--space-2)' }} />
              <div className="terminal-success">  Flash complete. Resetting K10...</div>
              <div className="terminal-success">  LED Blink is running.</div>
              <div style={{ height: 'var(--space-3)' }} />
              <div className="terminal-line">
                <span className="terminal-prompt">$</span>
                <span className="terminal-cursor" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
