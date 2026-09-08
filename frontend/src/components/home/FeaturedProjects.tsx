import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { api, type ProjectSummary } from '../../services/api';

// ─── Static fallback data (shown when API is unavailable) ─────────────────────
const FALLBACK_PROJECTS: ProjectSummary[] = [
  {
    id: 1,
    slug: 'led-blink',
    title: 'LED Blink',
    shortDescription: 'Your first K10 project — blink the onboard RGB LED and learn the basics of the Arduino sketch structure.',
    difficulty: 'beginner',
    estimatedMinutes: 10,
    coverImageUrl: '/images/Hero.png',
    isFeatured: true,
    isCommunity: false,
    isOfficial: true,
    viewCount: 0,
    likeCount: 0,
    flashCount: 0,
    publishedAt: null,
    category: { slug: 'fundamentals', name: 'Fundamentals', iconName: 'cpu', color: '#1D4ED8' },
    author: { slug: 'k10-hub-team', name: 'K10 Hub Team', avatarUrl: null },
  },
  {
    id: 2,
    slug: 'push-button',
    title: 'Push Button Interaction',
    shortDescription: 'Use the K10 physical button to trigger display output and LED feedback.',
    difficulty: 'beginner',
    estimatedMinutes: 15,
    coverImageUrl: '/images/IOs.png',
    isFeatured: true,
    isCommunity: false,
    isOfficial: true,
    viewCount: 0,
    likeCount: 0,
    flashCount: 0,
    publishedAt: null,
    category: { slug: 'fundamentals', name: 'Fundamentals', iconName: 'cpu', color: '#1D4ED8' },
    author: { slug: 'k10-hub-team', name: 'K10 Hub Team', avatarUrl: null },
  },
  {
    id: 3,
    slug: 'face-detection',
    title: 'Face Detection',
    shortDescription: 'Detect human faces in real time using the K10 camera and onboard AI — no cloud, no IDE required.',
    difficulty: 'advanced',
    estimatedMinutes: 45,
    coverImageUrl: '/images/Example.png',
    isFeatured: true,
    isCommunity: false,
    isOfficial: true,
    viewCount: 0,
    likeCount: 0,
    flashCount: 0,
    publishedAt: null,
    category: { slug: 'ai-vision', name: 'AI & Vision', iconName: 'eye', color: '#6D28D9' },
    author: { slug: 'k10-hub-team', name: 'K10 Hub Team', avatarUrl: null },
  },
];

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return (
    <span className={`badge badge--${difficulty}`} aria-label={`Difficulty: ${difficulty}`}>
      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
    </span>
  );
}

function CategoryBadge({ category }: { category: ProjectSummary['category'] }) {
  if (!category) return null;
  const slug = category.slug.replace('-', '').replace('sensors-io', 'sensors').replace('ai-vision', 'ai');
  return (
    <span className={`badge badge--${slug}`}>
      {category.name}
    </span>
  );
}

function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="project-card"
      aria-label={`${project.title} — ${project.difficulty} level project`}
    >
      {/* Image */}
      <div className="project-card__image">
        {project.coverImageUrl ? (
          <img
            src={project.coverImageUrl}
            alt={`${project.title} project preview`}
            loading="lazy"
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'var(--color-paper-warm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span className="label">No preview</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="project-card__body">
        <div className="project-card__meta">
          <CategoryBadge category={project.category} />
          <DifficultyBadge difficulty={project.difficulty} />
        </div>
        <h3 className="project-card__title">{project.title}</h3>
        <p className="project-card__description">{project.shortDescription}</p>
        <div className="project-card__footer">
          {project.estimatedMinutes && (
            <span className="project-card__time" aria-label={`${project.estimatedMinutes} minutes`}>
              <Clock size={11} aria-hidden="true" />
              {project.estimatedMinutes} min
            </span>
          )}
          <span className="project-card__arrow" aria-hidden="true">
            <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedProjects() {
  const [projects, setProjects] = useState<ProjectSummary[]>(FALLBACK_PROJECTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.projects.featured()
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setProjects(res.data);
        }
      })
      .catch(() => {
        // Silently fall back to static data — API may not be running in dev
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section
      className="projects-section"
      id="projects"
      aria-labelledby="projects-section-title"
    >
      <div className="container">
        <div className="section-header">
          <div className="section-header__left">
            <p className="label" style={{ marginBottom: 'var(--space-2)' }}>Featured Projects</p>
            <h2 className="section-title" id="projects-section-title">
              Start building today.
            </h2>
            <p className="section-subtitle">
              A curated selection of K10 projects — from first circuits to computer vision.
              Each project includes step-by-step instructions and example code.
            </p>
          </div>
          <Link to="/projects" className="btn btn--secondary">
            View all projects
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>

        <div
          className="projects-grid"
          role="list"
          aria-label="Featured K10 projects"
          aria-busy={loading}
        >
          {projects.map((project) => (
            <div key={project.slug} role="listitem">
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
