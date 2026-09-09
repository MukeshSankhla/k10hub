import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ProfilePage from './pages/auth/ProfilePage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ProjectsGalleryPage from './pages/projects/ProjectsGalleryPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import ProjectEditorPage from './pages/projects/ProjectEditorPage';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* User Account / Profile & Public Creator Profiles */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:identifier" element={<ProfilePage />} />
          <Route path="/user/:identifier" element={<ProfilePage />} />

          {/* Admin User Management & Author Verification */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Hardware Projects, Tutorials & Web Flashing */}
          <Route path="/projects" element={<ProjectsGalleryPage />} />
          <Route path="/tutorials" element={<ProjectsGalleryPage />} />
          <Route path="/project/new" element={<ProjectEditorPage />} />
          <Route path="/projects/new" element={<ProjectEditorPage />} />
          <Route path="/project/:id/edit" element={<ProjectEditorPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/project/:id" element={<ProjectDetailPage />} />
          <Route path="/tutorial/:id" element={<ProjectDetailPage />} />
          <Route path="/tutorials/:id" element={<ProjectDetailPage />} />

          {/* Informational Routes */}
          <Route path="/learn" element={<ComingSoon title="Learn" />} />
          <Route path="/community" element={<ComingSoon title="Community" />} />
          <Route path="/about" element={<ComingSoon title="About" />} />
          <Route path="*" element={<ComingSoon title="Page Not Found" />} />
        </Routes>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      fontFamily: 'var(--font-sans)',
      backgroundColor: 'var(--color-paper)',
    }}>
      <p style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-ink-tertiary)', fontWeight: 600 }}>
        K10 Hub
      </p>
      <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-ink-primary)', letterSpacing: '-0.02em' }}>
        {title}
      </h1>
      <p style={{ color: 'var(--color-ink-secondary)', fontSize: 'var(--text-base)' }}>
        This section is coming in a future phase.
      </p>
      <a href="/" style={{
        marginTop: '1rem',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-accent)',
        textDecoration: 'none',
        borderBottom: '1px solid currentColor',
        paddingBottom: '1px',
      }}>
        Back to homepage
      </a>
    </div>
  );
}
