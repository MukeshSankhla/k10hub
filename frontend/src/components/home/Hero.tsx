import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowDown } from 'lucide-react';
import HeroBackground from './HeroBackground';

// Lazy load the 3D model to avoid blocking initial page load
const K10Model = lazy(() => import('./K10Model'));

// Check if GLB model exists at build time via environment or just try to load it
const GLB_URL = '/models/k10.glb';

function ModelLoadingPlaceholder() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      borderRadius: 'var(--radius-lg)',
    }}>
      <div className="model-loading">
        <div className="model-loading__spinner" />
        <span className="model-loading__text">Initializing viewer...</span>
      </div>
    </div>
  );
}

export default function Hero() {
  const handleScrollToContent = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('learning-path')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" aria-labelledby="hero-headline">
      {/* Precision Technical Engineering Square Grid */}
      <HeroBackground />

      <div className="container hero__inner">

        {/* ── Left: Content ──────────────────────────────────────────────── */}
        <div className="hero__content">
          {/* Eyebrow */}
          <div className="hero__eyebrow" aria-hidden="true">
            <span className="hero__eyebrow-line" />
            <span className="hero__eyebrow-tag">UNIHIKER K10 PLATFORM</span>
          </div>

          {/* Headline */}
          <h1 className="hero__headline" id="hero-headline">
            Learn. Build. <em>Flash.</em>
          </h1>

          {/* Supporting Text */}
          <p className="hero__description">
            The easy project platform for UNIHIKER K10. Learn through beginner-friendly projects,
            share firmware, and flash your K10 without an IDE, library management, or compiling.
          </p>

          {/* Prominent Feature Row */}
          <div className="hero__feature-strip" aria-label="Platform Highlights">
            <span className="hero__feature-strip-item">NO IDE</span>
            <span className="hero__feature-strip-dot" aria-hidden="true">·</span>
            <span className="hero__feature-strip-item">NO LIBRARIES</span>
            <span className="hero__feature-strip-dot" aria-hidden="true">·</span>
            <span className="hero__feature-strip-item">NO COMPILING</span>
            <span className="hero__feature-strip-dot" aria-hidden="true">·</span>
            <span className="hero__feature-strip-item hero__feature-strip-item--highlight">JUST CONNECT &amp; FLASH</span>
          </div>

          {/* Platform Disciplines */}
          <div className="hero__disciplines" aria-label="Supported technical domains">
            <span className="hero__disciplines-label">EXPLORE:</span>
            <div className="hero__discipline-tags">
              <span className="hero__discipline-tag">Electronics</span>
              <span className="hero__discipline-tag">IoT &amp; Cloud</span>
              <span className="hero__discipline-tag">AI &amp; Edge Vision</span>
              <span className="hero__discipline-tag">Robotics</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="hero__actions">
            <Link to="/projects" className="btn btn--primary btn--lg" id="hero-cta-primary">
              Explore Projects
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link to="/learn" className="btn btn--secondary btn--lg" id="hero-cta-secondary">
              Start Learning
            </Link>
          </div>
        </div>

        {/* ── Right: K10 3D Model Stage ────────────────────────────────────── */}
        <div className="hero__model-container" aria-label="UNIHIKER K10 hardware visualization">
          <Suspense fallback={<ModelLoadingPlaceholder />}>
            <K10Model glbUrl={GLB_URL} />
          </Suspense>
        </div>

      </div>

      {/* Down arrow scroll indicator to navigate down to the content */}
      <a
        href="#learning-path"
        onClick={handleScrollToContent}
        className="hero__scroll-indicator"
        aria-label="Scroll down to content"
        title="Scroll down for more content"
      >
        <span className="hero__scroll-indicator-text">SCROLL</span>
        <ArrowDown size={14} className="hero__scroll-indicator-icon" aria-hidden="true" />
      </a>
    </section>
  );
}
