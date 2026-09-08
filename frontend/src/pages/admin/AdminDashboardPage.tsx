import { useState, useEffect, useCallback } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { api, UserProfile, AuthorApplication, AdminStats, UserRole, UserStatus } from '../../services/api';
import {
  Users,
  Shield,
  Cpu,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  ExternalLink,
  RefreshCw,
  Award,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'applications'>('users');
  const [stats, setStats] = useState<AdminStats | null>(null);

  // Users state
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Applications state
  const [applications, setApplications] = useState<AuthorApplication[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appStatusFilter, setAppStatusFilter] = useState('all');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Rejection modal
  const [rejectModalAppId, setRejectModalAppId] = useState<number | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');

  // Load Admin Stats
  const loadStats = useCallback(async () => {
    try {
      const data = await api.admin.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  // Load Users List
  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await api.admin.getUsers({
        page,
        pageSize: 15,
        search: searchQuery,
        role: roleFilter,
        status: statusFilter,
      });
      setUsersList(res.data);
      if (res.meta?.totalPages) {
        setTotalPages(res.meta.totalPages);
      }
    } catch (err: any) {
      console.error('Failed to load users:', err);
    } finally {
      setUsersLoading(false);
    }
  }, [page, searchQuery, roleFilter, statusFilter]);

  // Load Applications
  const loadApplications = useCallback(async () => {
    setAppsLoading(true);
    try {
      const res = await api.admin.getAuthorApplications(appStatusFilter);
      setApplications(res.data);
    } catch (err: any) {
      console.error('Failed to load applications:', err);
    } finally {
      setAppsLoading(false);
    }
  }, [appStatusFilter]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else {
      loadApplications();
    }
  }, [activeTab, loadUsers, loadApplications]);

  // Role update handler
  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    try {
      const res = await api.admin.updateUserRole(userId, newRole);
      setActionMessage({ type: 'success', text: res.message });
      loadUsers();
      loadStats();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to update user role' });
    }
  };

  // Status toggle handler
  const handleStatusChange = async (userId: number, newStatus: UserStatus) => {
    try {
      const res = await api.admin.updateUserStatus(userId, newStatus);
      setActionMessage({ type: 'success', text: res.message });
      loadUsers();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to update user status' });
    }
  };

  // Approve author application
  const handleApproveApp = async (appId: number) => {
    try {
      const res = await api.admin.approveAuthorApplication(appId);
      setActionMessage({ type: 'success', text: res.message });
      loadApplications();
      loadStats();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to approve application' });
    }
  };

  // Reject author application
  const handleRejectApp = async () => {
    if (!rejectModalAppId) return;
    try {
      const res = await api.admin.rejectAuthorApplication(rejectModalAppId, rejectNotes);
      setActionMessage({ type: 'success', text: res.message });
      setRejectModalAppId(null);
      setRejectNotes('');
      loadApplications();
      loadStats();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to reject application' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-paper)' }}>
      <Header />

      <main style={{ flex: 1, paddingTop: 'calc(var(--nav-height) + var(--space-8))', paddingBottom: 'var(--space-12)' }}>
        <div className="container" style={{ maxWidth: 1100 }}>
          {/* Page Title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'rgb(220, 38, 38)', marginBottom: 'var(--space-1)' }}>
                <Shield size={20} />
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Platform Control
                </span>
              </div>
              <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-ink-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                Admin & User Management
              </h1>
            </div>

            <button
              onClick={() => {
                loadStats();
                if (activeTab === 'users') loadUsers();
                else loadApplications();
              }}
              className="btn btn--secondary btn--sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RefreshCw size={14} /> Refresh Data
            </button>
          </div>

          {/* Feedback message */}
          {actionMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-6)',
              backgroundColor: actionMessage.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${actionMessage.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              color: actionMessage.type === 'success' ? 'rgb(22, 163, 74)' : 'rgb(220, 38, 38)',
              fontSize: 'var(--text-sm)',
            }}>
              <span>{actionMessage.text}</span>
              <button
                onClick={() => setActionMessage(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Metrics Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-8)',
          }}>
            <div style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4) var(--space-5)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-ink-tertiary)' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase' }}>Total Users</span>
                <Users size={18} />
              </div>
              <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-ink-primary)', marginTop: 'var(--space-2)' }}>
                {stats?.totalUsers ?? '—'}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)', marginTop: 'var(--space-1)' }}>
                Registered maker accounts
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4) var(--space-5)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'rgb(37, 99, 235)' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase' }}>Verified Authors</span>
                <Cpu size={18} />
              </div>
              <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-ink-primary)', marginTop: 'var(--space-2)' }}>
                {stats?.usersByRole.author ?? '—'}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)', marginTop: 'var(--space-1)' }}>
                Approved content publishers
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4) var(--space-5)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'rgb(220, 38, 38)' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase' }}>Administrators</span>
                <Shield size={18} />
              </div>
              <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-ink-primary)', marginTop: 'var(--space-2)' }}>
                {stats?.usersByRole.admin ?? '—'}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)', marginTop: 'var(--space-1)' }}>
                Full system control
              </div>
            </div>

            <div style={{
              backgroundColor: (stats?.pendingApplications || 0) > 0 ? 'rgba(234, 179, 8, 0.08)' : 'var(--color-surface)',
              border: `1px solid ${(stats?.pendingApplications || 0) > 0 ? 'rgba(234, 179, 8, 0.4)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4) var(--space-5)',
              cursor: 'pointer',
            }}
            onClick={() => setActiveTab('applications')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'rgb(202, 138, 4)' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase' }}>Pending Applications</span>
                <Clock size={18} />
              </div>
              <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: (stats?.pendingApplications || 0) > 0 ? 'rgb(161, 98, 7)' : 'var(--color-ink-primary)', marginTop: 'var(--space-2)' }}>
                {stats?.pendingApplications ?? '—'}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)', marginTop: 'var(--space-1)' }}>
                Awaiting your approval
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-2)',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: 'var(--space-6)',
          }}>
            <button
              onClick={() => setActiveTab('users')}
              style={{
                padding: 'var(--space-3) var(--space-5)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: activeTab === 'users' ? 'var(--color-ink-primary)' : 'var(--color-ink-tertiary)',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'users' ? '2px solid var(--color-ink-primary)' : '2px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Users size={16} /> User Management
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              style={{
                padding: 'var(--space-3) var(--space-5)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: activeTab === 'applications' ? 'var(--color-ink-primary)' : 'var(--color-ink-tertiary)',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'applications' ? '2px solid var(--color-ink-primary)' : '2px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Award size={16} /> Author Applications
              {(stats?.pendingApplications || 0) > 0 && (
                <span style={{
                  backgroundColor: 'rgb(234, 179, 8)',
                  color: '#fff',
                  borderRadius: 'var(--radius-full)',
                  padding: '1px 6px',
                  fontSize: '11px',
                  fontWeight: 700,
                }}>
                  {stats?.pendingApplications}
                </span>
              )}
            </button>
          </div>

          {/* Tab 1: User Management */}
          {activeTab === 'users' && (
            <div style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-sm)',
            }}>
              {/* Filters Bar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
                  <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-tertiary)' }} />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 36px',
                      backgroundColor: 'var(--color-paper)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-sm)',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Role filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--color-paper)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    outline: 'none',
                    color: 'var(--color-ink-primary)',
                  }}
                >
                  <option value="all">All Roles</option>
                  <option value="user">Users</option>
                  <option value="author">Authors</option>
                  <option value="admin">Admins</option>
                </select>

                {/* Status filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--color-paper)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    outline: 'none',
                    color: 'var(--color-ink-primary)',
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Users Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--text-sm)' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-ink-tertiary)', fontSize: 'var(--text-xs)', textTransform: 'uppercase' }}>
                      <th style={{ padding: 'var(--space-3)' }}>User</th>
                      <th style={{ padding: 'var(--space-3)' }}>Role</th>
                      <th style={{ padding: 'var(--space-3)' }}>Status</th>
                      <th style={{ padding: 'var(--space-3)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersLoading ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-ink-secondary)' }}>
                          Loading users...
                        </td>
                      </tr>
                    ) : usersList.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-ink-secondary)' }}>
                          No users found matching current filters.
                        </td>
                      </tr>
                    ) : (
                      usersList.map((u) => (
                        <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          {/* User info */}
                          <td style={{ padding: 'var(--space-3)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                              {u.avatarUrl ? (
                                <img src={u.avatarUrl} alt={u.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--color-ink-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div style={{ fontWeight: 600, color: 'var(--color-ink-primary)' }}>{u.name}</div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)' }}>{u.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td style={{ padding: 'var(--space-3)' }}>
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: 'var(--radius-md)',
                                fontSize: 'var(--text-xs)',
                                fontWeight: 600,
                                outline: 'none',
                                cursor: 'pointer',
                                backgroundColor:
                                  u.role === 'admin'
                                    ? 'rgba(239, 68, 68, 0.1)'
                                    : u.role === 'author'
                                    ? 'rgba(37, 99, 235, 0.1)'
                                    : 'rgba(22, 163, 74, 0.1)',
                                color:
                                  u.role === 'admin'
                                    ? 'rgb(220, 38, 38)'
                                    : u.role === 'author'
                                    ? 'rgb(37, 99, 235)'
                                    : 'rgb(22, 163, 74)',
                                border: '1px solid currentColor',
                              }}
                            >
                              <option value="user">User</option>
                              <option value="author">Author</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>

                          {/* Status */}
                          <td style={{ padding: 'var(--space-3)' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: 'var(--text-xs)',
                              fontWeight: 600,
                              backgroundColor: u.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: u.status === 'active' ? 'rgb(22, 163, 74)' : 'rgb(220, 38, 38)',
                            }}>
                              {u.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: 'var(--space-3)' }}>
                            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                              {u.status === 'active' ? (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(u.id, 'suspended')}
                                  className="btn btn--ghost btn--sm"
                                  style={{ color: 'rgb(220, 38, 38)', fontSize: 'var(--text-xs)' }}
                                  title="Suspend account"
                                >
                                  Suspend
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(u.id, 'active')}
                                  className="btn btn--ghost btn--sm"
                                  style={{ color: 'rgb(22, 163, 74)', fontSize: 'var(--text-xs)' }}
                                  title="Reactivate account"
                                >
                                  Reactivate
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)', fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)' }}>
                  <span>Page {page} of {totalPages}</span>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="btn btn--secondary btn--sm"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="btn btn--secondary btn--sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Author Applications */}
          {activeTab === 'applications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Status Filter */}
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {['all', 'pending', 'approved', 'rejected'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setAppStatusFilter(st)}
                    className={`btn btn--sm ${appStatusFilter === st ? 'btn--primary' : 'btn--secondary'}`}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {appsLoading ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-ink-secondary)' }}>
                  Loading applications...
                </div>
              ) : applications.length === 0 ? (
                <div style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-8)',
                  textAlign: 'center',
                  color: 'var(--color-ink-secondary)',
                }}>
                  No author applications found for status "{appStatusFilter}".
                </div>
              ) : (
                applications.map((app) => (
                  <div
                    key={app.id}
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-xl)',
                      padding: 'var(--space-6)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: 0, color: 'var(--color-ink-primary)' }}>
                            {app.user?.name || `Applicant #${app.userId}`}
                          </h3>
                          <span style={{
                            fontSize: 'var(--text-xs)',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            textTransform: 'uppercase',
                            backgroundColor:
                              app.status === 'approved'
                                ? 'rgba(34, 197, 94, 0.1)'
                                : app.status === 'rejected'
                                ? 'rgba(239, 68, 68, 0.1)'
                                : 'rgba(234, 179, 8, 0.1)',
                            color:
                              app.status === 'approved'
                                ? 'rgb(22, 163, 74)'
                                : app.status === 'rejected'
                                ? 'rgb(220, 38, 38)'
                                : 'rgb(161, 98, 7)',
                          }}>
                            {app.status}
                          </span>
                        </div>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-secondary)', margin: 'var(--space-1) 0 0 0' }}>
                          {app.user?.email}
                        </p>
                      </div>

                      {/* Application Actions */}
                      {app.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <button
                            type="button"
                            onClick={() => handleApproveApp(app.id)}
                            className="btn btn--primary btn--sm"
                            style={{ backgroundColor: 'rgb(22, 163, 74)', borderColor: 'rgb(22, 163, 74)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <CheckCircle2 size={14} /> Approve & Grant Author
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectModalAppId(app.id)}
                            className="btn btn--secondary btn--sm"
                            style={{ color: 'rgb(220, 38, 38)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)', backgroundColor: 'var(--color-paper)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-ink-tertiary)', marginBottom: 'var(--space-1)' }}>
                          Bio
                        </div>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-primary)', margin: 0, lineHeight: 1.5 }}>
                          {app.bio}
                        </p>
                      </div>

                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-ink-tertiary)', marginBottom: 'var(--space-1)' }}>
                          Hardware & Embedded Experience
                        </div>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-primary)', margin: 0, lineHeight: 1.5 }}>
                          {app.hardwareExperience}
                        </p>
                      </div>

                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-ink-tertiary)', marginBottom: 'var(--space-1)' }}>
                          Planned K10 Projects & Hardware Ideas
                        </div>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-primary)', margin: 0, lineHeight: 1.5 }}>
                          {app.sampleProjectIdeas}
                        </p>
                      </div>

                      {app.githubUrl && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <a
                            href={app.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: 'var(--text-xs)', color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}
                          >
                            View Portfolio / GitHub <ExternalLink size={12} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {/* Reject Modal */}
      {rejectModalAppId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: 'var(--space-4)',
        }}>
          <div style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: 480,
            padding: 'var(--space-6)',
            boxShadow: 'var(--shadow-xl)',
          }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: '0 0 var(--space-2) 0', color: 'var(--color-ink-primary)' }}>
              Reject Author Application
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)', margin: '0 0 var(--space-4) 0' }}>
              Provide constructive feedback to the applicant on why their request was not approved at this time.
            </p>

            <textarea
              rows={3}
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="e.g. Please include more details about your UNIHIKER K10 hardware build plans or link to past Arduino/PlatformIO repositories."
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: 'var(--color-paper)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                outline: 'none',
                marginBottom: 'var(--space-4)',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={() => setRejectModalAppId(null)}
                className="btn btn--secondary btn--sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectApp}
                className="btn btn--primary btn--sm"
                style={{ backgroundColor: 'rgb(220, 38, 38)', borderColor: 'rgb(220, 38, 38)' }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
