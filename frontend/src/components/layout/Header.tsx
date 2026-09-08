import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Github, User, Shield, LogOut, ChevronDown, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const NAV_LINKS = [
  { label: 'Learn', href: '/learn' },
  { label: 'Projects', href: '/projects' },
  { label: 'Community', href: '/community' },
  { label: 'About', href: '/about' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setUserDropdownOpen(false);
    await signOut();
    navigate('/');
  };

  const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Maker';
  const avatarUrl = profile?.avatarUrl || user?.user_metadata?.avatar_url;

  return (
    <>
      <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`} role="banner">
        <div className="container nav__inner">
          {/* Logo / Wordmark */}
          <Link to="/" className="nav__wordmark" aria-label="K10 Hub home">
            <div className="nav__logo-mark" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="6" height="6" rx="1" fill="#F8F6F1"/>
                <rect x="10" y="2" width="6" height="6" rx="1" fill="#F8F6F1" opacity="0.5"/>
                <rect x="2" y="10" width="6" height="6" rx="1" fill="#F8F6F1" opacity="0.5"/>
                <rect x="10" y="10" width="6" height="6" rx="1" fill="#F8F6F1"/>
              </svg>
            </div>
            <div>
              <div className="nav__wordmark-text">K10 Hub</div>
              <div className="nav__wordmark-sub">UNIHIKER K10 Platform</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav__links" aria-label="Primary navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className="nav__link"
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="nav__actions" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <a
              href="https://github.com/mukeshsankhla"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--ghost btn--sm"
              aria-label="GitHub"
              title="View on GitHub"
            >
              <Github size={16} aria-hidden="true" />
            </a>

            {/* Auth section */}
            {user ? (
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'none',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-full)',
                    padding: '4px 10px 4px 4px',
                    cursor: 'pointer',
                    color: 'var(--color-ink-primary)',
                  }}
                  aria-expanded={userDropdownOpen}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-ink-primary)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}>
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayName}
                  </span>

                  {/* Role micro-badge */}
                  {role === 'admin' && (
                    <span style={{ fontSize: '9px', fontWeight: 800, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'rgb(220, 38, 38)', padding: '1px 4px', borderRadius: 4 }}>
                      ADMIN
                    </span>
                  )}
                  {role === 'author' && (
                    <span style={{ fontSize: '9px', fontWeight: 800, backgroundColor: 'rgba(37, 99, 235, 0.15)', color: 'rgb(37, 99, 235)', padding: '1px 4px', borderRadius: 4 }}>
                      AUTHOR
                    </span>
                  )}

                  <ChevronDown size={14} style={{ color: 'var(--color-ink-tertiary)' }} />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: 220,
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: 'var(--space-2)',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}>
                    <div style={{ padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-1)' }}>
                      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-ink-primary)' }}>{displayName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-ink-tertiary)', textOverflow: 'ellipsis', overflow: 'hidden' }}>{profile?.email || user.email}</div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: 'var(--space-2) var(--space-3)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 500,
                        color: 'var(--color-ink-primary)',
                        textDecoration: 'none',
                        borderRadius: 'var(--radius-md)',
                      }}
                      className="nav__dropdown-item"
                    >
                      <User size={14} /> My Profile
                    </Link>

                    {role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: 'var(--space-2) var(--space-3)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 500,
                          color: 'rgb(220, 38, 38)',
                          textDecoration: 'none',
                          borderRadius: 'var(--radius-md)',
                        }}
                        className="nav__dropdown-item"
                      >
                        <Shield size={14} /> Admin Dashboard
                      </Link>
                    )}

                    {role === 'user' && (
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: 'var(--space-2) var(--space-3)',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 500,
                          color: 'var(--color-accent)',
                          textDecoration: 'none',
                          borderRadius: 'var(--radius-md)',
                        }}
                        className="nav__dropdown-item"
                      >
                        <Sparkles size={14} /> Apply for Author
                      </Link>
                    )}

                    <div style={{ height: 1, backgroundColor: 'var(--color-border)', margin: '4px 0' }} />

                    <button
                      type="button"
                      onClick={handleSignOut}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: 'var(--space-2) var(--space-3)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 500,
                        color: 'var(--color-ink-secondary)',
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-md)',
                      }}
                      className="nav__dropdown-item"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <Link to="/login" className="btn btn--ghost btn--sm">
                  Sign In
                </Link>
                <Link to="/signup" className="btn btn--primary btn--sm">
                  Sign Up
                </Link>
              </div>
            )}

            <button
              className="nav__mobile-toggle btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            top: 'var(--nav-height)',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'var(--color-paper)',
            zIndex: 99,
            padding: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            borderTop: '1px solid var(--color-border)',
          }}
          role="dialog"
          aria-label="Mobile navigation"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'block',
                padding: 'var(--space-3) var(--space-4)',
                fontSize: 'var(--text-lg)',
                fontWeight: 500,
                color: 'var(--color-ink-primary)',
                textDecoration: 'none',
                borderRadius: 'var(--radius-md)',
              }}
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'block',
                  padding: 'var(--space-3) var(--space-4)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 600,
                  color: 'var(--color-ink-primary)',
                  textDecoration: 'none',
                }}
              >
                Profile ({displayName})
              </Link>
              {role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'block',
                    padding: 'var(--space-3) var(--space-4)',
                    fontSize: 'var(--text-base)',
                    fontWeight: 600,
                    color: 'rgb(220, 38, 38)',
                    textDecoration: 'none',
                  }}
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  handleSignOut();
                }}
                className="btn btn--secondary"
                style={{ width: '100%', marginTop: 'var(--space-3)', justifyContent: 'center' }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ marginTop: 'auto', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <Link
                to="/login"
                className="btn btn--secondary"
                onClick={() => setMobileOpen(false)}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="btn btn--primary"
                onClick={() => setMobileOpen(false)}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
