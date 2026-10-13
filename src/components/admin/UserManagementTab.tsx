import React, { useState, useEffect } from 'react';
import {
  UserPlus, Mail, Search, Edit2, Ban, KeyRound, Check, X,
  UserCheck, Link2, Copy, Eye, EyeOff
} from 'lucide-react';
import { User, UserRole, InviteRecord, CustomRole } from '../../types';
import { getAuthHeaders } from '../../lib/session';

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  admin: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  instructor: 'text-[#00aaff] bg-[#00aaff]/10 border-[#00aaff]/20',
  student: 'text-slate-300 bg-white/5 border-white/10',
};

interface Props {
  users: User[];
  currentUser: User;
  onRefresh: () => void;
  triggerToast: (msg: string, type?: 'success' | 'warn') => void;
}

type ModalType = 'create' | 'edit' | 'invite' | 'reset' | null;

export default function UserManagementTab({ users, currentUser, onRefresh, triggerToast }: Props) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [invites, setInvites] = useState<InviteRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);

  // Create user form
  const [form, setForm] = useState({ name: '', email: '', role: 'student' as UserRole, avatar: '', password: '', customRoleId: '' });
  const [showPassword, setShowPassword] = useState(false);
  // Edit user form
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'student' as UserRole, subscriptionPlan: '', avatar: '', customRoleId: '' });
  // Invite form
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'student' as UserRole });
  const [inviteLink, setInviteLink] = useState('');
  // Reset password result
  const [tempPassword, setTempPassword] = useState('');

  useEffect(() => {
    fetchInvites();
    fetchCustomRoles();
  }, []);

  const fetchCustomRoles = async () => {
    try {
      const r = await fetch('/api/admin/roles', { headers: getAuthHeaders() });
      const d = await r.json();
      if (d.status === 'success') setCustomRoles(d.roles || []);
    } catch { /* silent */ }
  };

  const fetchInvites = async () => {
    try {
      const r = await fetch('/api/admin/invites', { headers: getAuthHeaders() });
      const d = await r.json();
      if (d.status === 'success') setInvites(d.invites || []);
    } catch { /* silent */ }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || (statusFilter === 'suspended' ? u.suspended : !u.suspended);
    return matchSearch && matchRole && matchStatus;
  });

  const openEdit = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan || '',
      avatar: user.avatar || '',
      customRoleId: user.customRoleId || '',
    });
    setModal('edit');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (d.status === 'success') {
        triggerToast(`User ${form.name} created successfully.`);
        setModal(null);
        setForm({ name: '', email: '', role: 'student', avatar: '', password: '', customRoleId: '' });
        onRefresh();
      } else {
        triggerToast(d.error || 'Failed to create user', 'warn');
      }
    } catch { triggerToast('Network error', 'warn'); }
    setLoading(false);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(editForm),
      });
      const d = await r.json();
      if (d.status === 'success') {
        triggerToast('User profile updated.');
        setModal(null);
        onRefresh();
      } else {
        triggerToast(d.error || 'Failed to update user', 'warn');
      }
    } catch { triggerToast('Network error', 'warn'); }
    setLoading(false);
  };

  const handleSuspend = async (user: User) => {
    const action = user.suspended ? 'unsuspend' : 'suspend';
    try {
      const r = await fetch(`/api/admin/users/${user.id}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ suspend: !user.suspended }),
      });
      const d = await r.json();
      if (d.status === 'success') {
        triggerToast(`User ${action}ed.`, user.suspended ? 'success' : 'warn');
        onRefresh();
      } else {
        triggerToast(d.error || `Failed to ${action}`, 'warn');
      }
    } catch { triggerToast('Network error', 'warn'); }
  };

  const handleResetPassword = async (user: User) => {
    setSelectedUser(user);
    try {
      const r = await fetch(`/api/admin/users/${user.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      });
      const d = await r.json();
      if (d.status === 'success') {
        setTempPassword(d.tempPassword);
        setModal('reset');
        onRefresh();
      } else {
        triggerToast(d.error || 'Failed to reset password', 'warn');
      }
    } catch { triggerToast('Network error', 'warn'); }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await fetch('/api/admin/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(inviteForm),
      });
      const d = await r.json();
      if (d.status === 'success') {
        const fullUrl = `${window.location.origin}${d.inviteUrl}`;
        setInviteLink(fullUrl);
        fetchInvites();
        triggerToast('Invite link generated!');
      } else {
        triggerToast(d.error || 'Failed to generate invite', 'warn');
      }
    } catch { triggerToast('Network error', 'warn'); }
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedLink(text);
      setTimeout(() => setCopiedLink(null), 2000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-bold uppercase text-slate-300">User Management</h3>
        <div className="flex gap-2">
          <button
            onClick={() => { setModal('invite'); setInviteLink(''); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-[#00aaff]/30 bg-[#00aaff]/10 text-[#00aaff] hover:bg-[#00aaff]/20 cursor-pointer transition-colors"
          >
            <Mail className="w-3.5 h-3.5" /> Invite User
          </button>
          <button
            onClick={() => setModal('create')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 cursor-pointer transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" /> Create User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex-1 min-w-[160px]">
          <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="bg-transparent text-xs text-white outline-none w-full placeholder:text-slate-600"
          />
        </div>
        <div className="flex gap-1.5 text-[10px] font-mono flex-wrap">
          {['all', 'student', 'instructor', 'admin', 'super_admin'].map(rf => (
            <button key={rf} onClick={() => setRoleFilter(rf)}
              className={`px-2.5 py-1.5 rounded-lg border capitalize cursor-pointer transition-colors ${roleFilter === rf ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : 'border-white/5 bg-white/[0.02] text-slate-400 hover:bg-white/10'}`}>
              {rf.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 text-[10px] font-mono flex-wrap">
          {['all', 'active', 'suspended'].map(sf => (
            <button key={sf} onClick={() => setStatusFilter(sf)}
              className={`px-2.5 py-1.5 rounded-lg border capitalize cursor-pointer transition-colors ${statusFilter === sf ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' : 'border-white/5 bg-white/[0.02] text-slate-400 hover:bg-white/10'}`}>
              {sf}
            </button>
          ))}
        </div>
      </div>

      {/* User table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.01]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03] text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="p-4">User</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Joined</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map(user => (
              <tr key={user.id} className={`hover:bg-white/[0.03] transition-colors ${user.suspended ? 'opacity-60' : ''}`}>
                <td className="p-4">
                  <div className="flex items-center gap-2.5">
                    <img src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} alt="" className="w-8 h-8 rounded-full object-cover border border-white/10" />
                    <div>
                      <div className="font-bold text-slate-200 leading-none">{user.name}</div>
                      {user.suspended && <span className="text-[9px] font-mono text-rose-400 block mt-0.5">SUSPENDED</span>}
                      {user.role === 'instructor' && (
                        <span className={`text-[9px] font-mono font-bold px-1 rounded block mt-0.5 w-max ${user.isApproved ? 'bg-teal-500/10 text-teal-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {user.isApproved ? 'Approved' : 'Pending Approval'}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4 text-slate-400 font-mono text-[11px]">{user.email}</td>
                <td className="p-4">
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border capitalize ${ROLE_COLORS[user.role] || ROLE_COLORS.student}`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4 text-slate-400 text-[11px]">{user.joinedAt}</td>
                <td className="p-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${user.subscriptionPlan && user.subscriptionPlan !== 'none' ? 'text-[#00ddff] bg-[#00aaff]/10 border-[#00aaff]/20' : 'text-slate-500 bg-white/5 border-white/10'}`}>
                    {user.subscriptionPlan || 'no plan'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-1.5">
                    <button title="Edit user" onClick={() => openEdit(user)}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors">
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button title={user.suspended ? 'Unsuspend user' : 'Suspend user'}
                      onClick={() => handleSuspend(user)}
                      disabled={user.id === currentUser.id}
                      className={`p-1.5 rounded-lg border cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${user.suspended ? 'bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500/20' : 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'}`}>
                      {user.suspended ? <UserCheck className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                    </button>
                    <button title="Reset password" onClick={() => handleResetPassword(user)}
                      className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 cursor-pointer transition-colors">
                      <KeyRound className="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500 italic">No users found matching filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Invite history */}
      {invites.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Recent Invites</h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {invites.slice(0, 10).map(inv => (
              <div key={inv.id} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-[11px]">
                <div className="flex items-center gap-2">
                  <Link2 className="w-3 h-3 text-slate-500" />
                  <span className="text-slate-300 font-mono">{inv.email}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold capitalize ${ROLE_COLORS[inv.role]}`}>{inv.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 text-[10px]">{inv.createdAt.substring(0, 10)}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${inv.status === 'accepted' ? 'bg-teal-500/10 text-teal-400' : 'bg-amber-500/10 text-amber-400'}`}>{inv.status}</span>
                  <button onClick={() => copyToClipboard(`${window.location.origin}/register?invite=${inv.token}`)}
                    className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
                    {copiedLink?.includes(inv.token) ? <Check className="w-3 h-3 text-teal-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="glass-dialog border border-white/15 rounded-2xl p-6 w-full max-w-md space-y-5 text-left shadow-2xl">

            {/* Create User Modal */}
            {modal === 'create' && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Create New User</h3>
                  <button onClick={() => setModal(null)} className="text-slate-500 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={handleCreate} className="space-y-3">
                  {[
                    { label: 'Full Name', key: 'name', type: 'text', placeholder: 'e.g. Dr. Jane Smith' },
                    { label: 'Email Address', key: 'email', type: 'email', placeholder: 'jane@example.com' },
                    { label: 'Avatar URL (optional)', key: 'avatar', type: 'url', placeholder: 'https://...' },
                  ].map(({ label, key, type, placeholder }) => (
                    <div key={key}>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{label}</label>
                      <input type={type} value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder} required={key !== 'avatar'}
                        className="w-full text-xs p-2.5 rounded-lg glass-input text-white" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Password <span className="text-rose-400">*</span></label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} value={form.password}
                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                        placeholder="Set initial password" required
                        className="w-full text-xs p-2.5 pr-9 rounded-lg glass-input text-white" />
                      <button type="button" onClick={() => setShowPassword(v => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer">
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Built-in Role</label>
                    <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as UserRole }))}
                      className="w-full text-xs p-2.5 rounded-lg glass-input text-white cursor-pointer">
                      {['student', 'instructor', 'admin', 'super_admin'].map(r => (
                        <option key={r} value={r}>{r.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  {customRoles.length > 0 && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Custom Role (optional)</label>
                      <select value={form.customRoleId} onChange={e => setForm(p => ({ ...p, customRoleId: e.target.value }))}
                        className="w-full text-xs p-2.5 rounded-lg glass-input text-white cursor-pointer">
                        <option value="">— none —</option>
                        {customRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                      <p className="text-[10px] text-slate-600 mt-1">Custom role overrides built-in permissions when set.</p>
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setModal(null)} className="flex-1 py-2 rounded-lg border border-white/10 text-xs text-slate-400 hover:bg-white/5 cursor-pointer">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/30 cursor-pointer disabled:opacity-50">
                      {loading ? 'Creating...' : 'Create User'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Edit User Modal */}
            {modal === 'edit' && selectedUser && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Edit User</h3>
                  <button onClick={() => setModal(null)} className="text-slate-500 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={handleEdit} className="space-y-3">
                  {[
                    { label: 'Full Name', key: 'name', type: 'text' },
                    { label: 'Email Address', key: 'email', type: 'email' },
                    { label: 'Avatar URL', key: 'avatar', type: 'url' },
                  ].map(({ label, key, type }) => (
                    <div key={key}>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{label}</label>
                      <input type={type} value={(editForm as any)[key]} onChange={e => setEditForm(p => ({ ...p, [key]: e.target.value }))}
                        className="w-full text-xs p-2.5 rounded-lg glass-input text-white" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Role</label>
                    <select value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value as UserRole }))}
                      className="w-full text-xs p-2.5 rounded-lg glass-input text-white cursor-pointer">
                      {['student', 'instructor', 'admin', 'super_admin'].map(r => (
                        <option key={r} value={r}>{r.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Subscription Plan</label>
                    <select value={editForm.subscriptionPlan} onChange={e => setEditForm(p => ({ ...p, subscriptionPlan: e.target.value }))}
                      className="w-full text-xs p-2.5 rounded-lg glass-input text-white cursor-pointer">
                      {['', 'none', 'basic', 'pro', 'enterprise'].map(p => (
                        <option key={p} value={p}>{p || '— unchanged —'}</option>
                      ))}
                    </select>
                  </div>
                  {customRoles.length > 0 && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Custom Role (optional)</label>
                      <select value={editForm.customRoleId} onChange={e => setEditForm(p => ({ ...p, customRoleId: e.target.value }))}
                        className="w-full text-xs p-2.5 rounded-lg glass-input text-white cursor-pointer">
                        <option value="">— none —</option>
                        {customRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                      <p className="text-[10px] text-slate-600 mt-1">Custom role overrides built-in permissions when set.</p>
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setModal(null)} className="flex-1 py-2 rounded-lg border border-white/10 text-xs text-slate-400 hover:bg-white/5 cursor-pointer">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/30 cursor-pointer disabled:opacity-50">
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Invite User Modal */}
            {modal === 'invite' && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Invite User by Email</h3>
                  <button onClick={() => setModal(null)} className="text-slate-500 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={handleInvite} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Address</label>
                    <input type="email" value={inviteForm.email} onChange={e => setInviteForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="user@example.com" required className="w-full text-xs p-2.5 rounded-lg glass-input text-white" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assign Role</label>
                    <select value={inviteForm.role} onChange={e => setInviteForm(p => ({ ...p, role: e.target.value as UserRole }))}
                      className="w-full text-xs p-2.5 rounded-lg glass-input text-white cursor-pointer">
                      {['student', 'instructor', 'admin'].map(r => (
                        <option key={r} value={r}>{r.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" disabled={loading} className="w-full py-2 rounded-lg bg-[#00aaff]/20 border border-[#00aaff]/30 text-[#00aaff] text-xs font-bold hover:bg-[#00aaff]/30 cursor-pointer disabled:opacity-50">
                    {loading ? 'Generating...' : 'Generate Invite Link'}
                  </button>
                </form>
                {inviteLink && (
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-teal-500 uppercase">Invite Link Generated</label>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-teal-500/5 border border-teal-500/20">
                      <span className="flex-1 text-[10px] text-teal-300 font-mono break-all">{inviteLink}</span>
                      <button onClick={() => copyToClipboard(inviteLink)} className="shrink-0 p-1.5 rounded bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 cursor-pointer">
                        {copiedLink === inviteLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500">Share this link with the invitee. It is only displayed once — copy it now.</p>
                  </div>
                )}
              </>
            )}

            {/* Password Reset Modal */}
            {modal === 'reset' && selectedUser && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Password Reset</h3>
                  <button onClick={() => setModal(null)} className="text-slate-500 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                </div>
                <p className="text-xs text-slate-400">Temporary password generated for <span className="text-white font-bold">{selectedUser.name}</span>:</p>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <span className="flex-1 text-sm font-mono font-bold text-amber-300">{tempPassword}</span>
                  <button onClick={() => copyToClipboard(tempPassword)} className="p-1.5 rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 cursor-pointer">
                    {copiedLink === tempPassword ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">Share this password securely. The user should change it on next login. This is a demo environment — no actual email is sent.</p>
                <button onClick={() => setModal(null)} className="w-full py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-400 hover:bg-white/10 cursor-pointer">Close</button>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
