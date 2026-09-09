import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, BookOpen, FolderGit2, Plus } from 'lucide-react';
import { ProjectDetail } from '../../config/projectsData';
import {
  getPublicProjects,
  subscribeProjects,
} from '../../services/projects/projectStorageService';
import ProjectCard from '../projects/ProjectCard';

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

  // If there are no published projects or tutorials yet, cleanly hide the section
  if (projects.length === 0) {
    return null;
  }

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

        {/* Content Grid using the identical shared ProjectCard */}
        {featuredList.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 'var(--space-6)',
            }}
            role="list"
            aria-label="Featured UNIHIKER K10 Projects & Tutorials"
          >
            {featuredList.map((project) => (
              <div key={project.id} role="listitem" style={{ height: '100%' }}>
                <ProjectCard project={project} />
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
