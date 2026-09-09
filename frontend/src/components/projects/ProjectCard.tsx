import { Link } from 'react-router-dom';
import { Calendar, Zap, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ProjectDetail } from '../../config/projectsData';
import { resolveProjectAuthor } from '../../services/projects/projectStorageService';
import { getLocalFlashCount } from '../../services/flasher/flashCountService';
import UserBadge from '../common/UserBadge';

export function getLevelLabel(level: number | string | undefined): string {
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

export interface ProjectCardProps {
  project: ProjectDetail;
  isCurrentAuthor?: (name: string, id?: string) => boolean;
}

/**
 * Standard UNIHIKER K10 Project/Tutorial Card
 * Shared across Homepage, Projects Gallery, and Tutorials Gallery.
 */
export default function ProjectCard({ project, isCurrentAuthor }: ProjectCardProps) {
  const { user, profile } = useAuth();
  const authorInfo = resolveProjectAuthor(project, user, profile);
  const isMine =
    authorInfo.isCurrentUser ||
    (isCurrentAuthor ? isCurrentAuthor(project.author, project.authorId) : false);
  const authorProfileUrl = isMine
    ? '/profile'
    : `/profile/${encodeURIComponent(authorInfo.authorId || authorInfo.name)}`;

  const isTutorial = project.type?.toLowerCase() === 'tutorial';
  const isFeatured = Boolean(project.featured || project.isFeatured);
  const flashes = Math.max(project.flashCount || 0, getLocalFlashCount(project.id));

  return (
    <div
      className="k10-project-card"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '14px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        height: '100%',
      }}
    >
      {/* Cover Preview Image (4:3 Ratio) */}
      <Link
        to={`/project/${project.id}`}
        style={{ textDecoration: 'none', display: 'block' }}
        aria-label={`${project.title} — ${project.type || 'Project'}`}
      >
        <div
          style={{
            width: '100%',
            aspectRatio: '4 / 3',
            backgroundColor: '#0a0d14',
            backgroundImage: project.coverImage ? `url(${project.coverImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {!project.coverImage && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.4)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              UNIHIKER K10
            </span>
          )}

          {/* Top-Left Level Badge */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(4px)',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '6px',
              textTransform: 'uppercase',
              zIndex: 2,
            }}
          >
            {getLevelLabel(project.level)}
          </div>

          {/* Featured Pill if marked as featured */}
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

          {/* Diagonal Top-Right Corner Ribbon Indicator */}
          <div
            style={{
              position: 'absolute',
              top: 18,
              right: -34,
              width: 130,
              transform: 'rotate(45deg)',
              backgroundColor: isTutorial ? '#EAB308' : '#F59E0B',
              color: isTutorial ? '#ffffff' : '#000000',
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textAlign: 'center',
              padding: '4px 0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              pointerEvents: 'none',
              zIndex: 3,
            }}
          >
            {project.type || 'Project'}
          </div>
        </div>
      </Link>

      {/* Card Content */}
      <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Link
          to={`/project/${project.id}`}
          style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <h3
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 700,
              color: 'var(--color-ink-primary)',
              margin: '0 0 var(--space-2) 0',
              lineHeight: 1.3,
            }}
          >
            {project.title}
          </h3>

          <p
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-ink-secondary)',
              lineHeight: 1.5,
              margin: '0 0 var(--space-5) 0',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              flex: 1,
            }}
          >
            {project.description}
          </p>
        </Link>

        {/* Card Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--color-border)',
            marginTop: 'auto',
          }}
        >
          {/* Clickable Author Profile Link */}
          <Link
            to={authorProfileUrl}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              color: 'inherit',
            }}
            title={isMine ? 'View your profile' : `View ${authorInfo.name}'s profile`}
          >
            {authorInfo.avatarUrl ? (
              <img
                src={authorInfo.avatarUrl}
                alt={authorInfo.name}
                style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-ink-primary)',
                  color: 'var(--color-paper)',
                  fontSize: '10px',
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
                maxWidth: 120,
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
              size={13}
            />
          </Link>

          {/* Date & Flash Count */}
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
              <Calendar size={12} style={{ color: 'var(--color-ink-tertiary)' }} />
              <span>{project.publishDate || 'Recent'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
