import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Calendar, Star, BookOpen, FolderGit2, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ProjectDetail } from '../../config/projectsData';
import {
  getPublicProjects,
  subscribeProjects,
  resolveProjectAuthor,
} from '../../services/projects/projectStorageService';
import { getLocalFlashCount } from '../../services/flasher/flashCountService';
import UserBadge from '../common/UserBadge';

function getLevelLabel(level: number | string | undefined): string {
  const num = Number(level);
  switch (num) {
    case 1:
      return 'Beginner';
    case 2:
      return 'Intermediate';
    case 3:
      return 'Advance';
    case 4:
      return 'Expert';
    default:
      return typeof level === 'string' && level ? level : 'Beginner';
  }
}

function FeaturedCard({ project }: { project: ProjectDetail }) {
  const { user, profile } = useAuth();
  const authorInfo = resolveProjectAuthor(project, user, profile);
  const authorProfileUrl = authorInfo.isCurrentUser
    ? '/profile'
    : `/profile/${encodeURIComponent(authorInfo.authorId || authorInfo.name)}`;
  const isTutorial = project.type?.toLowerCase() === 'tutorial';
  const flashes = Math.max(project.flashCount || 0, getLocalFlashCount(project.id));
  const isFeatured = Boolean(project.featured || project.isFeatured);

  return (
    <Link
      to={`/project/${project.id}`}
      className="project-card"
      aria-label={`${project.title} — ${project.type || 'Project'}`}
      style={{ height: '100%' }}
    >
      {/* Cover Image with Badges */}
      <div className="project-card__image" style={{ position: 'relative' }}>
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt={`${project.title} preview`}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'var(--color-paper-warm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="label">UNIHIKER K10</span>
          </div>
        )}

        {/* Level Tag (Top-Left) */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(4px)',
            color: '#fff',
            fontSize: '9.5px',
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            zIndex: 2,
          }}
        >
          {getLevelLabel(project.level)}
        </div>

        {/* Featured Pill (Bottom-Left) */}
        {isFeatured && (
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              backgroundColor: 'rgba(245, 158, 11, 0.95)',
              backdropFilter: 'blur(4px)',
              color: '#fff',
              fontSize: '9.5px',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: '4px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              zIndex: 2,
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            }}
          >
            <Star size={10} fill="#fff" /> Featured
          </div>
        )}

        {/* Type Ribbon (Top-Right) */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: isTutorial ? 'rgba(202, 138, 4, 0.92)' : 'rgba(29, 78, 216, 0.92)',
            backdropFilter: 'blur(4px)',
            color: '#ffffff',
            fontSize: '9.5px',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            padding: '2px 7px',
            borderRadius: '4px',
            zIndex: 2,
          }}
        >
          {project.type || 'Project'}
        </div>
      </div>

      {/* Body */}
      <div className="project-card__body">
        <h3 className="project-card__title" style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 700 }}>
          {project.title}
        </h3>
        <p
          className="project-card__description"
          style={{
            margin: 0,
            fontSize: 'var(--text-xs)',
            lineHeight: 1.5,
            color: 'var(--color-ink-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {project.description}
        </p>

        {/* Footer */}
        <div
          className="project-card__footer"
          style={{
            marginTop: 'auto',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Author */}
          <Link
            to={authorProfileUrl}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
              color: 'inherit',
            }}
            title={authorInfo.isCurrentUser ? 'View your profile' : `View ${authorInfo.name}'s profile`}
          >
            {authorInfo.avatarUrl ? (
              <img
                src={authorInfo.avatarUrl}
                alt={authorInfo.name}
                style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-ink-primary)',
                  color: 'var(--color-paper)',
                  fontSize: '9px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {authorInfo.name.charAt(0)}
              </div>
            )}
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--color-ink-primary)',
                maxWidth: 95,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {authorInfo.name}
            </span>
            <UserBadge
              role={
                authorInfo.role?.toLowerCase().includes('admin')
                  ? 'admin'
                  : authorInfo.role?.toLowerCase().includes('author') || authorInfo.isCurrentUser
                  ? 'author'
                  : 'user'
              }
              size={12}
            />
          </Link>

          {/* Stats: Flash Count & Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--color-accent)',
              }}
              title={`${flashes} hardware flashes`}
            >
              <Zap size={11} fill="currentColor" />
              <span>{flashes}</span>
            </span>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--color-ink-tertiary)',
              }}
            >
              <Calendar size={11} />
              <span>{project.publishDate || 'Recent'}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedProjects() {
  const [projects, setProjects] = useState<ProjectDetail[]>(() => getPublicProjects());
  const [activeTab, setActiveTab] = useState<'all' | 'projects' | 'tutorials'>('all');

  useEffect(() => {
    setProjects(getPublicProjects());
    const unsubscribe = subscribeProjects((updated) => {
      setProjects(updated.filter((p) => (p.status === 'published' || !p.status) && (p.visibility === 'public' || !p.visibility)));
    });
    return unsubscribe;
  }, []);

  // Filter list: prefer explicitly featured items, fallback to all published
  const { featuredList, projectCount, tutorialCount } = useMemo(() => {
    const hasExplicitFeatured = projects.some((p) => p.featured || p.isFeatured);
    const sourceList = hasExplicitFeatured
      ? projects.filter((p) => p.featured || p.isFeatured)
      : projects;

    const pCount = sourceList.filter((p) => p.type?.toLowerCase() !== 'tutorial').length;
    const tCount = sourceList.filter((p) => p.type?.toLowerCase() === 'tutorial').length;

    let filtered = sourceList;
    if (activeTab === 'projects') {
      filtered = sourceList.filter((p) => p.type?.toLowerCase() !== 'tutorial');
    } else if (activeTab === 'tutorials') {
      filtered = sourceList.filter((p) => p.type?.toLowerCase() === 'tutorial');
    }

    return {
      featuredList: filtered.slice(0, 6),
      projectCount: pCount,
      tutorialCount: tCount,
    };
  }, [projects, activeTab]);

  return (
    <section
      className="projects-section"
      id="featured-showcase"
      aria-labelledby="featured-section-title"
    >
      <div className="container">
        {/* Section Header */}
        <div className="section-header" style={{ marginBottom: 'var(--space-8)' }}>
          <div className="section-header__left">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span className="label label--accent">CURATED HARDWARE &amp; STEP-BY-STEP GUIDES</span>
            </div>
            <h2 className="section-title" id="featured-section-title">
              Featured Projects &amp; Tutorials
            </h2>
            <p className="section-subtitle">
              Explore highlighted builds, standalone firmware editions, and step-by-step guides for UNIHIKER K10.
            </p>
          </div>

          {/* Quick links to full catalogs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Link to="/projects" className="btn btn--secondary btn--sm">
              Explore Projects <ArrowRight size={13} aria-hidden="true" />
            </Link>
            <Link to="/tutorials" className="btn btn--secondary btn--sm">
              View Tutorials <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Filter Navigation Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-6)',
            paddingBottom: 'var(--space-4)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                border: activeTab === 'all' ? '1px solid var(--color-ink-primary)' : '1px solid var(--color-border)',
                backgroundColor: activeTab === 'all' ? 'var(--color-ink-primary)' : 'transparent',
                color: activeTab === 'all' ? 'var(--color-paper)' : 'var(--color-ink-secondary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Star size={12} fill={activeTab === 'all' ? 'currentColor' : 'none'} />
              <span>All Featured</span>
              <span
                style={{
                  fontSize: '10px',
                  padding: '1px 5px',
                  borderRadius: '10px',
                  backgroundColor: activeTab === 'all' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)',
                  color: activeTab === 'all' ? 'var(--color-paper)' : 'var(--color-ink-primary)',
                  fontWeight: 700,
                }}
              >
                {projectCount + tutorialCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('projects')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                border: activeTab === 'projects' ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                backgroundColor: activeTab === 'projects' ? 'var(--color-accent)' : 'transparent',
                color: activeTab === 'projects' ? '#fff' : 'var(--color-ink-secondary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all var(--transition-fast)',
              }}
            >
              <FolderGit2 size={12} />
              <span>Projects</span>
              <span
                style={{
                  fontSize: '10px',
                  padding: '1px 5px',
                  borderRadius: '10px',
                  backgroundColor: activeTab === 'projects' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)',
                  color: activeTab === 'projects' ? '#fff' : 'var(--color-ink-primary)',
                  fontWeight: 700,
                }}
              >
                {projectCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tutorials')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                border: activeTab === 'tutorials' ? '1px solid #ca8a04' : '1px solid var(--color-border)',
                backgroundColor: activeTab === 'tutorials' ? '#ca8a04' : 'transparent',
                color: activeTab === 'tutorials' ? '#fff' : 'var(--color-ink-secondary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all var(--transition-fast)',
              }}
            >
              <BookOpen size={12} />
              <span>Tutorials</span>
              <span
                style={{
                  fontSize: '10px',
                  padding: '1px 5px',
                  borderRadius: '10px',
                  backgroundColor: activeTab === 'tutorials' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)',
                  color: activeTab === 'tutorials' ? '#fff' : 'var(--color-ink-primary)',
                  fontWeight: 700,
                }}
              >
                {tutorialCount}
              </span>
            </button>
          </div>
        </div>

        {/* Content Grid */}
        {featuredList.length > 0 ? (
          <div
            className="projects-grid"
            role="list"
            aria-label="Featured UNIHIKER K10 Projects & Tutorials"
          >
            {featuredList.map((project) => (
              <div key={project.id} role="listitem">
                <FeaturedCard project={project} />
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: 'var(--space-12) var(--space-6)',
              textAlign: 'center',
              backgroundColor: 'var(--color-paper)',
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--color-border)',
            }}
          >
            <FolderGit2 size={36} style={{ color: 'var(--color-ink-tertiary)', margin: '0 auto var(--space-3)', opacity: 0.6 }} />
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-ink-primary)', margin: '0 0 var(--space-1) 0' }}>
              No items in this view yet
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)', maxWidth: 420, margin: '0 auto var(--space-4) auto', lineHeight: 1.5 }}>
              Platform administrators can feature any project or tutorial from the Admin Dashboard or Project page.
            </p>
            <Link to="/project/new" className="btn btn--primary btn--sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Plus size={14} /> Submit a Project or Tutorial
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
