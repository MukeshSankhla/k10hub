import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import {
  User,
  Shield,
  Cpu,
  CheckCircle2,
  Clock,
  AlertCircle,
  LogOut,
  Sparkles,
  ExternalLink,
  Github,
  Award,
  Layers,
  FileCode2,
  Edit3,
  Globe,
  Instagram,
  Youtube,
  Linkedin,
  FolderGit2,
  Eye,
  Heart,
  Zap,
  Plus,
} from 'lucide-react';

export default function ProfilePage() {
  const {
    user,
    profile,
    application,
    contributedProjects,
    role,
    signOut,
    applyAuthor,
    updateProfile,
    refreshProfile,
  } = useAuth();

  // Author Application Modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [appBio, setAppBio] = useState('');
  const [appGithubUrl, setAppGithubUrl] = useState('');
  const [hardwareExperience, setHardwareExperience] = useState('');
  const [sampleProjectIdeas, setSampleProjectIdeas] = useState('');
  const [appSubmitError, setAppSubmitError] = useState('');
  const [appSubmitting, setAppSubmitting] = useState(false);

  // Profile Edit Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editGithubUrl, setEditGithubUrl] = useState('');
  const [editSocialPlatform, setEditSocialPlatform] = useState('');
  const [editSocialUrl, setEditSocialUrl] = useState('');
  const [editInstagramUrl, setEditInstagramUrl] = useState('');
  const [editYoutubeUrl, setEditYoutubeUrl] = useState('');
  const [editLinkedinUrl, setEditLinkedinUrl] = useState('');
  const [editWebsiteUrl, setEditWebsiteUrl] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  // Pre-populate Edit Modal from active profile
  useEffect(() => {
    if (profile) {
      setEditName(profile.name || user?.user_metadata?.name || '');
      setEditAvatarUrl(profile.avatarUrl || user?.user_metadata?.avatar_url || '');
      setEditBio(profile.bio || profile.author?.bio || '');
      setEditGithubUrl(profile.githubUrl || profile.author?.githubUrl || '');
      setEditSocialPlatform(profile.socialPlatform || profile.author?.socialPlatform || 'Instagram');
      setEditSocialUrl(profile.socialUrl || profile.author?.socialUrl || '');
      setEditInstagramUrl(profile.instagramUrl || profile.author?.instagramUrl || '');
      setEditYoutubeUrl(profile.youtubeUrl || profile.author?.youtubeUrl || '');
      setEditLinkedinUrl(profile.linkedinUrl || profile.author?.linkedinUrl || '');
      setEditWebsiteUrl(profile.websiteUrl || profile.author?.websiteUrl || '');
    }
  }, [profile, user]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppSubmitError('');
    setAppSubmitting(true);

    const res = await applyAuthor({
      bio: appBio,
      githubUrl: appGithubUrl || undefined,
      hardwareExperience,
      sampleProjectIdeas,
    });

    setAppSubmitting(false);

    if (!res.success) {
      setAppSubmitError(res.error || 'Failed to submit application');
    } else {
      setShowApplyModal(false);
      await refreshProfile();
    }
  };

  const handleEditProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setEditSuccessMsg('');
    setEditSubmitting(true);

    const res = await updateProfile({
      name: editName.trim() || undefined,
      avatarUrl: editAvatarUrl.trim() || undefined,
      bio: editBio.trim() || undefined,
      githubUrl: editGithubUrl.trim() || undefined,
      socialPlatform: editSocialPlatform || undefined,
      socialUrl: editSocialUrl.trim() || undefined,
      instagramUrl: editInstagramUrl.trim() || undefined,
      youtubeUrl: editYoutubeUrl.trim() || undefined,
      linkedinUrl: editLinkedinUrl.trim() || undefined,
      websiteUrl: editWebsiteUrl.trim() || undefined,
    });

    setEditSubmitting(false);

    if (!res.success) {
      setEditError(res.error || 'Failed to save profile changes');
    } else {
      setEditSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        setEditSuccessMsg('');
        setShowEditModal(false);
      }, 1000);
    }
  };

  const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Maker';
  const displayEmail = profile?.email || user?.email || '';
  const avatarUrl = profile?.avatarUrl || user?.user_metadata?.avatar_url;
  const bio = profile?.bio || profile?.author?.bio || '';
  const githubUrl = profile?.githubUrl || profile?.author?.githubUrl || '';
  const socialPlatform = profile?.socialPlatform || profile?.author?.socialPlatform || '';
  const socialUrl = profile?.socialUrl || profile?.author?.socialUrl || '';
  const instagramUrl = profile?.instagramUrl || profile?.author?.instagramUrl || '';
  const youtubeUrl = profile?.youtubeUrl || profile?.author?.youtubeUrl || '';
  const linkedinUrl = profile?.linkedinUrl || profile?.author?.linkedinUrl || '';
  const websiteUrl = profile?.websiteUrl || profile?.author?.websiteUrl || '';

  // Consolidate social links list for display
  const socialLinks: { label: string; url: string; icon: React.ReactNode; color: string }[] = [];

  if (githubUrl) {
    socialLinks.push({
      label: 'GitHub',
      url: githubUrl.startsWith('http') ? githubUrl : `https://${githubUrl}`,
      icon: <Github size={14} />,
      color: 'var(--color-ink-primary)',
    });
  }

  if (instagramUrl) {
    socialLinks.push({
      label: 'Instagram',
      url: instagramUrl.startsWith('http') ? instagramUrl : `https://${instagramUrl}`,
      icon: <Instagram size={14} />,
      color: '#E4405F',
    });
  }

  if (youtubeUrl) {
    socialLinks.push({
      label: 'YouTube',
      url: youtubeUrl.startsWith('http') ? youtubeUrl : `https://${youtubeUrl}`,
      icon: <Youtube size={14} />,
      color: '#FF0000',
    });
  }

  if (linkedinUrl) {
    socialLinks.push({
      label: 'LinkedIn',
      url: linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`,
      icon: <Linkedin size={14} />,
      color: '#0A66C2',
    });
  }

  if (websiteUrl) {
    socialLinks.push({
      label: 'Website',
      url: websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`,
      icon: <Globe size={14} />,
      color: 'var(--color-accent)',
    });
  }

  // If user specified a custom social platform & url not already added
  if (socialUrl && !socialLinks.some((l) => l.url.includes(socialUrl))) {
    const platLower = (socialPlatform || 'Social').toLowerCase();
    let icon = <Globe size={14} />;
    let color = 'var(--color-accent)';
    if (platLower.includes('insta')) {
      icon = <Instagram size={14} />;
      color = '#E4405F';
    } else if (platLower.includes('youtu')) {
      icon = <Youtube size={14} />;
      color = '#FF0000';
    } else if (platLower.includes('linked')) {
      icon = <Linkedin size={14} />;
      color = '#0A66C2';
    }

    socialLinks.push({
      label: socialPlatform || 'Social',
      url: socialUrl.startsWith('http') ? socialUrl : `https://${socialUrl}`,
      icon,
      color,
    });
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-paper)' }}>
      <Header />

      {/* Main container with nav-height padding-top to prevent top cutoff under fixed navbar */}
      <main style={{ flex: 1, paddingTop: 'calc(var(--nav-height) + var(--space-8))', paddingBottom: 'var(--space-16)' }}>
        <div className="container" style={{ maxWidth: 920 }}>
          
          {/* Main User Card */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-8)',
              boxShadow: 'var(--shadow-md)',
              marginBottom: 'var(--space-8)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-6)' }}>
              
              {/* Left Column: Avatar + Identity Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', flex: '1 1 340px' }}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    style={{
                      width: 84,
                      height: 84,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid var(--color-surface)',
                      boxShadow: '0 0 0 2px var(--color-border)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 84,
                      height: 84,
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-ink-primary)',
                      color: 'var(--color-paper)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'var(--text-3xl)',
                      fontWeight: 700,
                      boxShadow: '0 0 0 2px var(--color-border)',
                    }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-ink-primary)', margin: 0 }}>
                      {displayName}
                    </h1>

                    {/* Role Tag Badges */}
                    {role === 'admin' && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 700,
                          backgroundColor: 'rgba(239, 68, 68, 0.12)',
                          color: 'rgb(220, 38, 38)',
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                        }}
                      >
                        <Shield size={13} /> PLATFORM ADMIN
                      </span>
                    )}
                    {role === 'author' && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 700,
                          backgroundColor: 'rgba(37, 99, 235, 0.12)',
                          color: 'rgb(37, 99, 235)',
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          border: '1px solid rgba(37, 99, 235, 0.25)',
                        }}
                      >
                        <Cpu size={13} /> VERIFIED AUTHOR
                      </span>
                    )}
                    {role === 'user' && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 700,
                          backgroundColor: 'rgba(22, 163, 74, 0.12)',
                          color: 'rgb(22, 163, 74)',
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          border: '1px solid rgba(22, 163, 74, 0.25)',
                        }}
                      >
                        <User size={13} /> MAKER
                      </span>
                    )}
                  </div>

                  <p style={{ color: 'var(--color-ink-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)', margin: 0 }}>
                    {displayEmail}
                  </p>
                </div>
              </div>

              {/* Right Column: Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="btn btn--secondary btn--sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Edit3 size={14} /> Edit Profile
                </button>

                {role === 'admin' && (
                  <Link to="/admin" className="btn btn--primary btn--sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Shield size={14} /> Admin Dashboard
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="btn btn--ghost btn--sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-ink-secondary)' }}
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>

            {/* About / Bio Section */}
            <div
              style={{
                marginTop: 'var(--space-6)',
                paddingTop: 'var(--space-6)',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              <h2 style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-tertiary)', marginBottom: 'var(--space-2)' }}>
                About
              </h2>

              {bio ? (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-primary)', lineHeight: 1.6, margin: 0 }}>
                  {bio}
                </p>
              ) : (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-tertiary)', fontStyle: 'italic', margin: 0 }}>
                  No bio added yet. Click &quot;Edit Profile&quot; to introduce yourself to the UNIHIKER K10 community.
                </p>
              )}
            </div>

            {/* Social & Connect Row */}
            <div style={{ marginTop: 'var(--space-5)' }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-tertiary)', marginBottom: 'var(--space-2)' }}>
                Connect & Links
              </div>

              {socialLinks.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  {socialLinks.map((s, idx) => (
                    <a
                      key={idx}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 600,
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--color-paper)',
                        border: '1px solid var(--color-border)',
                        color: s.color,
                        textDecoration: 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {s.icon}
                      <span>{s.label}</span>
                      <ExternalLink size={11} style={{ opacity: 0.6 }} />
                    </a>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(true)}
                    className="btn btn--ghost btn--sm"
                    style={{ fontSize: 'var(--text-xs)', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <Plus size={13} /> Add GitHub & Social Media Links
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section: Contributed Projects */}
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-8)',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: 'var(--space-8)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-5)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <FolderGit2 size={20} color="var(--color-accent)" />
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-ink-primary)', margin: 0 }}>
                  Contributed Projects
                </h2>
                <span
                  style={{
                    backgroundColor: 'var(--color-paper)',
                    border: '1px solid var(--color-border)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    color: 'var(--color-ink-secondary)',
                  }}
                >
                  {contributedProjects ? contributedProjects.length : 0}
                </span>
              </div>

              <Link to="/projects" className="btn btn--ghost btn--sm" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                Browse All Projects <ExternalLink size={13} />
              </Link>
            </div>

            {contributedProjects && contributedProjects.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: 'var(--space-4)',
                }}
              >
                {contributedProjects.map((project) => (
                  <div
                    key={project.id}
                    style={{
                      backgroundColor: 'var(--color-paper)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                  >
                    {/* Project thumbnail */}
                    <div
                      style={{
                        height: 140,
                        backgroundColor: 'var(--color-surface)',
                        backgroundImage: project.coverImageUrl ? `url(${project.coverImageUrl})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {!project.coverImageUrl && (
                        <Cpu size={36} style={{ color: 'var(--color-ink-tertiary)', opacity: 0.4 }} />
                      )}
                      
                      {project.difficulty && (
                        <span
                          style={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            fontSize: '10px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            color: '#fff',
                            backdropFilter: 'blur(4px)',
                          }}
                        >
                          {project.difficulty}
                        </span>
                      )}

                      {project.category && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: 10,
                            left: 10,
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            color: project.category.color || '#fff',
                            backdropFilter: 'blur(4px)',
                          }}
                        >
                          {project.category.name}
                        </span>
                      )}
                    </div>

                    {/* Project Body */}
                    <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-ink-primary)', margin: '0 0 var(--space-1) 0' }}>
                        {project.title}
                      </h3>
                      <p
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-ink-secondary)',
                          lineHeight: 1.5,
                          margin: '0 0 var(--space-4) 0',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          flex: 1,
                        }}
                      >
                        {project.shortDescription}
                      </p>

                      {/* Stats footer */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: 'var(--space-3)',
                          borderTop: '1px solid var(--color-border)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-ink-tertiary)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Eye size={12} /> {project.viewCount || 0}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Heart size={12} /> {project.likeCount || 0}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Zap size={12} /> {project.flashCount || 0}
                          </span>
                        </div>

                        <Link
                          to={`/projects`}
                          style={{
                            color: 'var(--color-accent)',
                            fontWeight: 600,
                            textDecoration: 'none',
                            fontSize: 'var(--text-xs)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                          }}
                        >
                          View <ExternalLink size={11} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: 'var(--space-8) var(--space-4)',
                  textAlign: 'center',
                  backgroundColor: 'var(--color-paper)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px dashed var(--color-border)',
                }}
              >
                <Cpu size={32} style={{ color: 'var(--color-ink-tertiary)', margin: '0 auto var(--space-3)' }} />
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-ink-primary)', margin: '0 0 var(--space-1) 0' }}>
                  No Published Projects Yet
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)', maxWidth: 440, margin: '0 auto var(--space-4)', lineHeight: 1.5 }}>
                  {role === 'author' || role === 'admin'
                    ? 'As a verified platform contributor, projects you publish will automatically appear in your portfolio showcase.'
                    : 'Apply for the Author Creator Program to build and publish interactive UNIHIKER K10 hardware guides and firmware.'}
                </p>
                {role === 'user' && !application && (
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(true)}
                    className="btn btn--primary btn--sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Sparkles size={14} /> Apply for Creator Status
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Section: Role Specific Portals */}

          {/* User: Apply to become an Author */}
          {role === 'user' && (
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-8)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {application && application.status === 'pending' ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'rgb(202, 138, 4)', marginBottom: 'var(--space-3)' }}>
                    <Clock size={24} />
                    <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, margin: 0, color: 'var(--color-ink-primary)' }}>
                      Author Application Under Review
                    </h2>
                  </div>
                  <p style={{ color: 'var(--color-ink-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
                    Thank you for applying to become a verified UNIHIKER K10 Creator! Our platform administrators are reviewing your submission. You will be automatically granted the <strong>Author</strong> role upon approval.
                  </p>
                  <div
                    style={{
                      backgroundColor: 'var(--color-paper)',
                      padding: 'var(--space-4)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-ink-tertiary)', marginBottom: 'var(--space-1)' }}>
                      Submitted Bio
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-primary)', margin: 0 }}>
                      {application.bio}
                    </p>
                    {application.sampleProjectIdeas && (
                      <>
                        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-ink-tertiary)', marginTop: 'var(--space-3)', marginBottom: 'var(--space-1)' }}>
                          Planned K10 Projects
                        </div>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-primary)', margin: 0 }}>
                          {application.sampleProjectIdeas}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ) : application && application.status === 'rejected' ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'rgb(220, 38, 38)', marginBottom: 'var(--space-3)' }}>
                    <AlertCircle size={24} />
                    <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, margin: 0, color: 'var(--color-ink-primary)' }}>
                      Application Not Approved
                    </h2>
                  </div>
                  <p style={{ color: 'var(--color-ink-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
                    Your recent author request was not approved at this time.
                    {application.adminNotes && (
                      <span style={{ display: 'block', marginTop: 'var(--space-2)', fontStyle: 'italic' }}>
                        Admin feedback: &quot;{application.adminNotes}&quot;
                      </span>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(true)}
                    className="btn btn--primary btn--sm"
                    style={{ marginTop: 'var(--space-4)' }}
                  >
                    Re-apply for Author Status
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-accent)', marginBottom: 'var(--space-2)' }}>
                        <Award size={20} />
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Creator Program
                        </span>
                      </div>
                      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-ink-primary)', margin: 0 }}>
                        Become a Verified UNIHIKER K10 Author
                      </h2>
                      <p style={{ color: 'var(--color-ink-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)', maxWidth: 540 }}>
                        Authors can publish hardware projects, write interactive step-by-step tutorials, distribute compiled firmware builds, and share open-source libraries.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowApplyModal(true)}
                      className="btn btn--primary"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Sparkles size={16} /> Apply for Author Role
                    </button>
                  </div>

                  {/* Creator perks grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
                    <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-paper)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                      <FileCode2 size={20} color="var(--color-accent)" style={{ marginBottom: 'var(--space-2)' }} />
                      <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, margin: '0 0 var(--space-1) 0' }}>Publish Projects</h3>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)', margin: 0, lineHeight: 1.5 }}>
                        Create interactive projects with PlatformIO configurations, wiring schematics, and code snippets.
                      </p>
                    </div>
                    <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-paper)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                      <Cpu size={20} color="var(--color-accent)" style={{ marginBottom: 'var(--space-2)' }} />
                      <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, margin: '0 0 var(--space-1) 0' }}>1-Click Firmware</h3>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)', margin: 0, lineHeight: 1.5 }}>
                        Upload pre-compiled ESP32-S3 binaries that users can flash straight from their web browser.
                      </p>
                    </div>
                    <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-paper)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
                      <Layers size={20} color="var(--color-accent)" style={{ marginBottom: 'var(--space-2)' }} />
                      <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, margin: '0 0 var(--space-1) 0' }}>Author Portfolio</h3>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)', margin: 0, lineHeight: 1.5 }}>
                        Get a dedicated creator badge, public profile, and showcase your hardware designs to the world.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Author: Creator Studio Welcome */}
          {role === 'author' && (
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-8)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'rgb(37, 99, 235)', marginBottom: 'var(--space-1)' }}>
                    <Cpu size={18} />
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Creator Studio
                    </span>
                  </div>
                  <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-ink-primary)', margin: 0 }}>
                    Author Creator Center
                  </h2>
                  <p style={{ color: 'var(--color-ink-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
                    You have verified Author access. Share UNIHIKER K10 tutorials, firmware, and open-source schematics.
                  </p>
                </div>

                <Link to="/projects" className="btn btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  Explore Current Projects <ExternalLink size={14} />
                </Link>
              </div>

              <div
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--color-paper)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                }}
              >
                <CheckCircle2 size={20} color="rgb(34, 197, 94)" />
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-primary)' }}>
                  Your author credentials are fully active. Your verified creator badge is visible across the community.
                </span>
              </div>
            </div>
          )}

          {/* Admin: System Overview */}
          {role === 'admin' && (
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-8)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'rgb(220, 38, 38)', marginBottom: 'var(--space-1)' }}>
                    <Shield size={18} />
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Administrator Privileges
                    </span>
                  </div>
                  <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-ink-primary)', margin: 0 }}>
                    Platform Administration Hub
                  </h2>
                  <p style={{ color: 'var(--color-ink-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
                    Manage platform users, review creator author applications, and configure system permissions.
                  </p>
                </div>

                <Link to="/admin" className="btn btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Shield size={16} /> Open Admin Panel
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-4)',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: 620,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 'var(--space-8)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
              <div>
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-ink-primary)', margin: 0 }}>
                  Edit Profile
                </h2>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)', marginTop: 'var(--space-1)', margin: 0 }}>
                  Update your public name, bio, GitHub, and social media handles.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="btn btn--ghost btn--sm"
                style={{ fontSize: 'var(--text-lg)' }}
              >
                ✕
              </button>
            </div>

            {editError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: 'rgb(220, 38, 38)',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  marginBottom: 'var(--space-4)',
                }}
              >
                <AlertCircle size={18} />
                <span>{editError}</span>
              </div>
            )}

            {editSuccessMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  color: 'rgb(34, 197, 94)',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  marginBottom: 'var(--space-4)',
                }}
              >
                <CheckCircle2 size={18} />
                <span>{editSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleEditProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              
              {/* Display Name */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-ink-secondary)', marginBottom: 'var(--space-1)' }}>
                  Display Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your Name or Maker Handle"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--color-paper)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-ink-primary)',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Avatar URL */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-ink-secondary)', marginBottom: 'var(--space-1)' }}>
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--color-paper)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-ink-primary)',
                    outline: 'none',
                  }}
                />
              </div>

              {/* About / Bio */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-ink-secondary)', marginBottom: 'var(--space-1)' }}>
                  About / Bio
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Share a short bio, your embedded hardware focus, or what you build with UNIHIKER K10..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--color-paper)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-ink-primary)',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* GitHub Link */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-ink-secondary)', marginBottom: 'var(--space-1)' }}>
                  GitHub Profile URL
                </label>
                <div style={{ position: 'relative' }}>
                  <Github size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-tertiary)' }} />
                  <input
                    type="url"
                    value={editGithubUrl}
                    onChange={(e) => setEditGithubUrl(e.target.value)}
                    placeholder="https://github.com/yourusername"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      backgroundColor: 'var(--color-paper)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-ink-primary)',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Social Media Links Section */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-ink-primary)', marginBottom: 'var(--space-3)' }}>
                  Social Media Links
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
                  
                  {/* Instagram */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)', marginBottom: '4px' }}>
                      <Instagram size={13} color="#E4405F" /> Instagram
                    </label>
                    <input
                      type="url"
                      value={editInstagramUrl}
                      onChange={(e) => setEditInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/handle"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        backgroundColor: 'var(--color-paper)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-ink-primary)',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* YouTube */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)', marginBottom: '4px' }}>
                      <Youtube size={13} color="#FF0000" /> YouTube
                    </label>
                    <input
                      type="url"
                      value={editYoutubeUrl}
                      onChange={(e) => setEditYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/@channel"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        backgroundColor: 'var(--color-paper)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-ink-primary)',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* LinkedIn */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)', marginBottom: '4px' }}>
                      <Linkedin size={13} color="#0A66C2" /> LinkedIn
                    </label>
                    <input
                      type="url"
                      value={editLinkedinUrl}
                      onChange={(e) => setEditLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        backgroundColor: 'var(--color-paper)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-ink-primary)',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Personal Website */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)', marginBottom: '4px' }}>
                      <Globe size={13} color="var(--color-accent)" /> Website / Portfolio
                    </label>
                    <input
                      type="url"
                      value={editWebsiteUrl}
                      onChange={(e) => setEditWebsiteUrl(e.target.value)}
                      placeholder="https://yourportfolio.dev"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        backgroundColor: 'var(--color-paper)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-ink-primary)',
                        outline: 'none',
                      }}
                    />
                  </div>

                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn--secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="btn btn--primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {editSubmitting ? 'Saving Changes...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Author Application Modal */}
      {showApplyModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-4)',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: 560,
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 'var(--space-8)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <div>
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-ink-primary)', margin: 0 }}>
                  Apply to Become a K10 Author
                </h2>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)', marginTop: 'var(--space-1)', margin: 0 }}>
                  Tell us about your embedded experience and the UNIHIKER K10 hardware you build with.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowApplyModal(false)}
                className="btn btn--ghost btn--sm"
                style={{ fontSize: 'var(--text-lg)' }}
              >
                ✕
              </button>
            </div>

            {appSubmitError && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: 'rgb(220, 38, 38)',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  marginBottom: 'var(--space-4)',
                }}
              >
                <AlertCircle size={18} />
                <span>{appSubmitError}</span>
              </div>
            )}

            <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-ink-secondary)', marginBottom: 'var(--space-1)' }}>
                  Creator Bio *
                </label>
                <textarea
                  required
                  rows={3}
                  value={appBio}
                  onChange={(e) => setAppBio(e.target.value)}
                  placeholder="e.g. IoT hardware engineer specializing in ESP32, environmental monitoring, and edge ML..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--color-paper)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-ink-primary)',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-ink-secondary)', marginBottom: 'var(--space-1)' }}>
                  GitHub or Portfolio URL
                </label>
                <div style={{ position: 'relative' }}>
                  <Github size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-tertiary)' }} />
                  <input
                    type="url"
                    placeholder="https://github.com/yourhandle"
                    value={appGithubUrl}
                    onChange={(e) => setAppGithubUrl(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      backgroundColor: 'var(--color-paper)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-ink-primary)',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-ink-secondary)', marginBottom: 'var(--space-1)' }}>
                  Embedded & Hardware Experience *
                </label>
                <textarea
                  required
                  rows={3}
                  value={hardwareExperience}
                  onChange={(e) => setHardwareExperience(e.target.value)}
                  placeholder="e.g. 4+ years of Arduino/ESP-IDF, I2C/SPI sensors, PlatformIO development, UNIHIKER K10 RGB and screen programming..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--color-paper)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-ink-primary)',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-ink-secondary)', marginBottom: 'var(--space-1)' }}>
                  Planned UNIHIKER K10 Projects & Code *
                </label>
                <textarea
                  required
                  rows={3}
                  value={sampleProjectIdeas}
                  onChange={(e) => setSampleProjectIdeas(e.target.value)}
                  placeholder="e.g. A smart desk weather station using the onboard sensors and screen, with 1-click web flashing..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--color-paper)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-ink-primary)',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="btn btn--secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={appSubmitting}
                  className="btn btn--primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {appSubmitting ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
