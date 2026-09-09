import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import WebFlasherPanel from '../../components/projects/WebFlasherPanel';
import ProjectDocumentation from '../../components/projects/ProjectDocumentation';
import { ProjectDetail } from '../../config/projectsData';
import { useAuth } from '../../contexts/AuthContext';
import {
  Github,
  ExternalLink,
  Award,
  ChevronRight,
  Share2,
  Flame,
  Cpu,
  Edit3,
  Video,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { subscribeProjectFlashCount } from '../../services/flasher/flashCountService';
import {
  getProjectById as getStoredProjectById,
  subscribeProjects,
  parseVideoEmbedUrl,
  isProjectAuthor,
} from '../../services/projects/projectStorageService';
import UserBadge from '../../components/common/UserBadge';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();

  const [currentProject, setCurrentProject] = useState<ProjectDetail | undefined>(() =>
    id ? getStoredProjectById(id) : undefined
  );

  // Sync with project storage updates
  useEffect(() => {
    if (id) {
      const found = getStoredProjectById(id);
      setCurrentProject(found);
    }
    const unsubStorage = subscribeProjects(() => {
      if (id) {
        const updated = getStoredProjectById(id);
        setCurrentProject(updated);
      }
    });
    return () => unsubStorage();
  }, [id]);

  const [flashCount, setFlashCount] = useState<number>(() => currentProject?.flashCount || 0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Subscribe to real-time Firestore flash count
  useEffect(() => {
    if (!currentProject?.id) return;
    const unsubscribe = subscribeProjectFlashCount(currentProject.id, (count) => {
      if (typeof count === 'number') {
        setFlashCount(count);
      }
    });
    return () => unsubscribe();
  }, [currentProject?.id]);

  if (!currentProject) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-paper)' }}>
        <Header />
        <main style={{ flex: 1, paddingTop: 'calc(var(--nav-height) + var(--space-12))', paddingBottom: 'var(--space-16)' }}>
          <div className="container" style={{ maxWidth: 600, textAlign: 'center' }}>
            <Cpu size={48} style={{ color: 'var(--color-ink-tertiary)', margin: '0 auto var(--space-4)' }} />
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-ink-primary)', marginBottom: 'var(--space-2)' }}>
              Project Not Found
            </h1>
            <p style={{ color: 'var(--color-ink-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
              The project or tutorial you are looking for does not exist or may have been deleted.
            </p>
            <Link to="/projects" className="btn btn--primary">
              Browse Projects Gallery
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const project = currentProject;
  const isAuthor = isProjectAuthor(project, user, profile);
  const parsedVideo = parseVideoEmbedUrl(project.videoLink);

  const handleFlashSuccess = () => {
    setFlashCount((prev) => prev + 1);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 1500);
      });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-paper)' }}>
      <Header />

      {/* Main container with nav-height padding-top to prevent top cutoff under fixed navbar */}
      <main style={{ flex: 1, paddingTop: 'calc(var(--nav-height) + var(--space-6))', paddingBottom: 'var(--space-16)' }}>
        <div className="container">
          
          {/* Breadcrumbs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-ink-tertiary)',
              marginBottom: 'var(--space-5)',
            }}
          >
            <Link to="/" style={{ color: 'var(--color-ink-secondary)', textDecoration: 'none' }}>
              Home
            </Link>
            <ChevronRight size={13} />
            <Link to="/projects" style={{ color: 'var(--color-ink-secondary)', textDecoration: 'none' }}>
              Projects
            </Link>
            <ChevronRight size={13} />
            <span style={{ color: 'var(--color-ink-primary)', fontWeight: 600 }}>{project.title}</span>
          </div>

          {/* Moderation Status Banner for Non-Published Projects */}
          {project.status && project.status !== 'published' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 'var(--space-3)',
                padding: '12px 18px',
                borderRadius: '12px',
                marginBottom: 'var(--space-6)',
                backgroundColor:
                  project.status === 'pending_approval'
                    ? 'rgba(234, 179, 8, 0.1)'
                    : project.status === 'rejected'
                    ? 'rgba(239, 68, 68, 0.1)'
                    : 'rgba(100, 116, 139, 0.1)',
                border:
                  project.status === 'pending_approval'
                    ? '1px solid rgba(234, 179, 8, 0.3)'
                    : project.status === 'rejected'
                    ? '1px solid rgba(239, 68, 68, 0.3)'
                    : '1px solid rgba(100, 116, 139, 0.3)',
                color:
                  project.status === 'pending_approval'
                    ? '#ca8a04'
                    : project.status === 'rejected'
                    ? 'rgb(220, 38, 38)'
                    : 'var(--color-ink-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                {project.status === 'pending_approval' ? (
                  <AlertCircle size={18} />
                ) : project.status === 'rejected' ? (
                  <AlertCircle size={18} />
                ) : (
                  <Clock size={18} />
                )}
                <div>
                  <span style={{ fontWeight: 700, fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {project.status === 'pending_approval'
                      ? 'Pending Admin Verification'
                      : project.status === 'rejected'
                      ? 'Verification Rejected'
                      : 'Draft Preview'}
                  </span>
                  <span style={{ fontSize: '12px', marginLeft: '8px', opacity: 0.9 }}>
                    {project.status === 'pending_approval'
                      ? 'This project is under administrator review before publication to the catalog.'
                      : project.status === 'rejected'
                      ? 'This project was not approved by administrators. Please review and update details.'
                      : 'This project is saved as a private draft. Only you and administrators can view it.'}
                  </span>
                </div>
              </div>

              {isAuthor && (
                <Link
                  to={`/project/${project.id}/edit`}
                  className="btn btn--secondary btn--sm"
                  style={{ fontSize: '11px', padding: '4px 12px' }}
                >
                  Edit Details
                </Link>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* HERO SECTION                                                       */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* Project Hero Header Card */}
          <section
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '16px',
              padding: 'clamp(var(--space-6), 3vw, var(--space-8))',
              boxShadow: '0 4px 20px -4px rgba(0, 0, 0, 0.05)',
              marginBottom: 'var(--space-8)',
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(180deg, var(--color-surface) 0%, #FAFAF8 100%)',
            }}
          >
            <div className="project-hero-grid">
              {/* Hero Left: Aligned to Top and Bottom Extremes */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  minWidth: 0,
                }}
              >
                {/* Top Extreme Block: Badges, Title, Description */}
                <div>
                  {/* Badges Row (Refined Gentle Rounded Styles) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
                    {/* Type Badge */}
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--color-paper)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-ink-primary)',
                      }}
                    >
                      <Cpu size={13} style={{ color: 'var(--color-accent)' }} />
                      <span>{project.type || 'Project'}</span>
                    </span>

                    {/* Level Badge */}
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '3px 10px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(37, 99, 235, 0.08)',
                        border: '1px solid rgba(37, 99, 235, 0.2)',
                        color: 'rgb(37, 99, 235)',
                      }}
                    >
                      <Award size={13} />
                      <span>Level {project.level} · Advanced</span>
                    </span>

                    {/* Flash Count Badge */}
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--color-accent-muted)',
                        border: '1px solid var(--color-accent-light)',
                        color: 'var(--color-accent)',
                      }}
                    >
                      <Flame size={13} />
                      <span>{flashCount} Flashes</span>
                    </span>
                  </div>

                  {/* Main Title */}
                  <h1
                    style={{
                      fontSize: 'clamp(var(--text-2xl), 3vw, var(--text-4xl))',
                      fontWeight: 800,
                      letterSpacing: '-0.025em',
                      lineHeight: 1.2,
                      color: 'var(--color-ink-primary)',
                      margin: '0 0 var(--space-3) 0',
                    }}
                  >
                    {project.title}
                  </h1>

                  {/* Quick Description */}
                  <p
                    style={{
                      fontSize: 'var(--text-base)',
                      lineHeight: 1.65,
                      color: 'var(--color-ink-secondary)',
                      margin: 0,
                      maxWidth: 620,
                    }}
                  >
                    {project.description}
                  </p>
                </div>

                {/* Bottom Extreme Block: Author Profile Card & Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
                  {/* Author Row (Clickable Profile Link) */}
                  {(() => {
                    const isMine =
                      (project.authorEmail && (project.authorEmail.toLowerCase() === (profile?.email || user?.email || '').toLowerCase())) ||
                      (project.authorId && (String(project.authorId).toLowerCase() === String(profile?.id || user?.id || '').toLowerCase())) ||
                      (project.author && (project.author.toLowerCase() === (profile?.name || user?.user_metadata?.name || '').toLowerCase()));

                    const authorProfileUrl = isMine
                      ? '/profile'
                      : `/profile/${encodeURIComponent(project.authorId || project.author)}`;

                    return (
                      <Link
                        to={authorProfileUrl}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '12px',
                          textDecoration: 'none',
                          color: 'inherit',
                          width: 'fit-content',
                          padding: '6px 12px 6px 6px',
                          borderRadius: 'var(--radius-lg)',
                          backgroundColor: 'var(--color-paper)',
                          border: '1px solid var(--color-border)',
                          transition: 'all 0.15s ease',
                        }}
                        title={isMine ? 'View your profile' : `View ${project.author}'s profile`}
                      >
                        {/* Author Avatar with Cyan-Blue Gradient Ring */}
                        <div
                          style={{
                            position: 'relative',
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            padding: '2px',
                            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 0 10px rgba(56, 189, 248, 0.3)',
                          }}
                        >
                          {project.authorAvatar ? (
                            <img
                              src={project.authorAvatar}
                              alt={project.author}
                              style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                display: 'block',
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                backgroundColor: 'var(--color-surface)',
                                color: 'var(--color-accent)',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                              }}
                            >
                              {project.author.charAt(0)}
                            </div>
                          )}
                        </div>

                        {/* Author Name with Blue Verified Badge + Published Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: '15px',
                                color: 'var(--color-ink-primary)',
                                lineHeight: 1.2,
                              }}
                            >
                              {project.author}
                            </span>
                            <UserBadge
                              role={
                                project.authorRole?.toLowerCase().includes('admin')
                                  ? 'admin'
                                  : project.authorRole?.toLowerCase().includes('author') || project.author === 'Mukesh Sankhla'
                                  ? 'author'
                                  : 'user'
                              }
                              size={17}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: '12px',
                              color: 'var(--color-ink-tertiary)',
                              lineHeight: 1.3,
                            }}
                          >
                            Published {project.publishDate} © {project.license || 'MIT'}
                          </span>
                        </div>
                      </Link>
                    );
                  })()}

                  {/* Action Buttons Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                    {project.githubLink && (
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn--secondary btn--sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px' }}
                      >
                        <Github size={14} />
                        <span>GitHub Source</span>
                      </a>
                    )}

                    {project.docLink && (
                      <a
                        href={project.docLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn--secondary btn--sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px' }}
                      >
                        <ExternalLink size={14} />
                        <span>Project Guide</span>
                      </a>
                    )}

                    {isAuthor && (
                      <Link
                        to={`/project/${project.id}/edit`}
                        className="btn btn--secondary btn--sm"
                        title="Edit Project / Tutorial"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px', textDecoration: 'none' }}
                      >
                        <Edit3 size={14} />
                        <span>Edit {project.type || 'Project'}</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleShare}
                      className="btn btn--secondary btn--sm"
                      title="Copy Share Link"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: '8px' }}
                    >
                      <Share2 size={14} />
                      <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Hero Right: Cover Image (4:3 Ratio, height 100% matching Left Extreme) */}
              <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'center', height: '100%' }}>
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    minHeight: 340,
                    aspectRatio: '4 / 3',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.12)',
                    backgroundColor: '#000',
                  }}
                >
                  <img
                    src={project.coverImage}
                    alt={project.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* BODY: 3 COLUMNS (2 for Markdown Document, 1 for Firmware Flashing) */}
          {/* ══════════════════════════════════════════════════════════════════ */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)',
              gap: 'var(--space-8)',
              alignItems: 'start',
            }}
          >
            {/* 2 COLUMNS: Video Embed & Markdown Document */}
            <div style={{ minWidth: 0 }}>
              {/* Video Integration Player Embed */}
              {parsedVideo && (
                <div
                  style={{
                    marginBottom: 'var(--space-6)',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: '16px',
                    border: '1px solid var(--color-border)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 16px',
                      backgroundColor: 'var(--color-paper)',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Video size={16} color="var(--color-accent)" />
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-ink-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Video Demonstration & Guide
                      </span>
                    </div>
                    {project.videoLink && (
                      <a
                        href={project.videoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '11px', color: 'var(--color-ink-tertiary)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                      >
                        External Link <ExternalLink size={11} />
                      </a>
                    )}
                  </div>

                  <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', backgroundColor: '#000' }}>
                    {parsedVideo.type === 'youtube' || parsedVideo.type === 'vimeo' ? (
                      <iframe
                        src={parsedVideo.embedUrl}
                        title={`${project.title} Video Player`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                      />
                    ) : (
                      <video
                        src={parsedVideo.embedUrl}
                        controls
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    )}
                  </div>
                </div>
              )}

              <ProjectDocumentation project={project} />
            </div>

            {/* 1 COLUMN: Firmware Flashing Station */}
            <div id="flasher-station" style={{ minWidth: 0 }}>
              <WebFlasherPanel project={project} onFlashSuccess={handleFlashSuccess} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
