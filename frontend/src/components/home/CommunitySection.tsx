import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CommunitySection() {
  return (
    <section
      className="community"
      id="community"
      aria-labelledby="community-title"
    >
      <div className="container community__inner">

        {/* Left: Content */}
        <div className="community__content">
          <p className="label" style={{ marginBottom: 'var(--space-2)' }}>
            Community
          </p>
          <h2 className="community__title" id="community-title">
            Built by the
            <br />
            K10 community.
          </h2>
          <p className="community__description">
            K10 Hub will feature a community project ecosystem — where makers, developers and
            educators can share their K10 builds, tutorials and experiments. Every community project
            follows the same quality standards as official projects.
          </p>

          <div className="community__stats" aria-label="Community statistics">
            <div className="community__stat">
              <span className="community__stat-value">—</span>
              <span className="community__stat-label">Projects</span>
            </div>
            <div className="community__stat">
              <span className="community__stat-value">—</span>
              <span className="community__stat-label">Contributors</span>
            </div>
            <div className="community__stat">
              <span className="community__stat-value">—</span>
              <span className="community__stat-label">Flash events</span>
            </div>
          </div>

          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-ink-tertiary)',
            lineHeight: 'var(--leading-relaxed)',
            fontStyle: 'italic',
          }}>
            Community accounts, project submission and social features will open in a future phase.
          </p>

          <Link
            to="/community"
            className="btn btn--secondary"
            style={{ alignSelf: 'flex-start', marginTop: 'var(--space-2)' }}
          >
            Learn about community
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>

        {/* Right: K10 IOs Diagram */}
        <div className="community__visual">
          <p className="label" style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-xs)' }}>
            Hardware Reference
          </p>
          <img
            src="/images/IOs.png"
            alt="UNIHIKER K10 hardware diagram showing all labeled components: Light Sensor, Temperature & Humidity sensor, Microphone, Button, Screen, MicroSD Slot, Accelerometer, RGB Light, Speaker, Edge connector, Camera, Wi-Fi/BT, Battery Interface, I/O ports, and Type-C Interface"
            className="community__image-diagram"
            loading="lazy"
          />
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-ink-tertiary)',
            marginTop: 'var(--space-3)',
            fontFamily: 'var(--font-mono)',
          }}>
            UNIHIKER K10 — component overview
          </p>
        </div>

      </div>
    </section>
  );
}
