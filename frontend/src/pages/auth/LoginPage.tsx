import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { Mail, Lock, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { signInWithEmail, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    const res = await signInWithEmail(email, password);
    setSubmitting(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-paper)' }}>
      <Header />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'calc(var(--nav-height) + var(--space-8)) var(--space-4) var(--space-12)' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-8)',
            boxShadow: 'var(--shadow-lg)',
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-ink-primary)',
                color: 'var(--color-paper)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--space-3)',
              }}>
                <Sparkles size={22} />
              </div>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-ink-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                Welcome to K10 Hub
              </h1>
              <p style={{ color: 'var(--color-ink-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
                Sign in with your account to access projects, firmware flashing, and creator tools.
              </p>
            </div>

            {/* Unconfigured Alert */}
            {!isConfigured && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                backgroundColor: 'rgba(234, 179, 8, 0.1)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                color: 'rgb(161, 98, 7)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-xs)',
                lineHeight: 1.5,
                marginBottom: 'var(--space-4)',
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <strong>Supabase setup needed:</strong> Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to <code>frontend/.env</code> to connect your live database.
                </div>
              </div>
            )}

            {/* Error banner */}
            {errorMessage && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: 'rgb(220, 38, 38)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                marginBottom: 'var(--space-4)',
              }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-ink-secondary)', marginBottom: 'var(--space-1)' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-tertiary)' }} />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-ink-secondary)' }}>
                    Password
                  </label>
                  <Link to="/forgot-password" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-accent)', textDecoration: 'none' }}>
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-tertiary)' }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <button
                type="submit"
                disabled={submitting}
                className="btn btn--primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-2)' }}
              >
                {submitting ? 'Signing in...' : 'Sign In'}
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Footer link */}
            <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)' }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}>
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
