import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Shield, Lock, X, Check } from 'lucide-react';
import { CustomRole } from '../../types';
import { getAuthHeaders } from '../../lib/session';

const ALL_PERMISSIONS = [
  { key: 'view_courses', label: 'View Courses', group: 'Content' },
  { key: 'edit_content', label: 'Edit Content', group: 'Content' },
  { key: 'moderate_courses', label: 'Moderate Courses', group: 'Content' },
  { key: 'manage_users', label: 'Manage Users', group: 'Users' },
  { key: 'approve_instructors', label: 'Approve Instructors', group: 'Users' },
  { key: 'view_financials', label: 'View Financials', group: 'Platform' },
  { key: 'view_analytics', label: 'View Analytics', group: 'Platform' },
  { key: 'manage_settings', label: 'Manage Settings', group: 'Platform' },
];

const BUILTIN_ROLES: { name: string; role: string; color: string; permissions: string[] }[] = [
  { name: 'Super Admin', role: 'super_admin', color: 'text-purple-400 border-purple-500/20 bg-purple-500/5', permissions: ALL_PERMISSIONS.map(p => p.key) },
  { name: 'Admin', role: 'admin', color: 'text-amber-400 border-amber-500/20 bg-amber-500/5', permissions: ['view_courses', 'edit_content', 'moderate_courses', 'manage_users', 'approve_instructors', 'view_financials', 'view_analytics'] },
  { name: 'Instructor', role: 'instructor', color: 'text-[#00aaff] border-[#00aaff]/20 bg-[#00aaff]/5', permissions: ['view_courses', 'edit_content'] },
  { name: 'Student', role: 'student', color: 'text-slate-300 border-white/10 bg-white/[0.02]', permissions: ['view_courses'] },
];

interface Props {
  triggerToast: (msg: string, type?: 'success' | 'warn') => void;
}

export default function RoleManagementTab({ triggerToast }: Props) {
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPerms, setEditingPerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', permissions: [] as string[] });

  useEffect(() => { fetchRoles(); }, []);

  const fetchRoles = async () => {
    try {
      const r = await fetch('/api/admin/roles', { headers: getAuthHeaders() });
      const d = await r.json();
      if (d.status === 'success') setRoles(d.roles || []);
    } catch { /* silent */ }
  };

  const toggleFormPerm = (perm: string) => {
    setForm(p => ({
      ...p,
      permissions: p.permissions.includes(perm)
        ? p.permissions.filter(pp => pp !== perm)
        : [...p.permissions, perm]
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const r = await fetch('/api/admin/roles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (d.status === 'success') {
        triggerToast(`Custom role "${form.name}" created.`);
        setForm({ name: '', description: '', permissions: [] });
        setShowCreate(false);
        fetchRoles();
      } else {
        triggerToast(d.error || 'Failed to create role', 'warn');
      }
    } catch { triggerToast('Network error', 'warn'); }
    setLoading(false);
  };

  const handleUpdate = async (role: CustomRole) => {
    try {
      const r = await fetch(`/api/admin/roles/${role.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ ...role, permissions: editingPerms }),
      });
      const d = await r.json();
      if (d.status === 'success') {
        triggerToast('Role permissions saved.');
        setEditingId(null);
        setEditingPerms([]);
        fetchRoles();
      } else {
        triggerToast(d.error || 'Failed to update role', 'warn');
      }
    } catch { triggerToast('Network error', 'warn'); }
  };

  const startEditing = (role: CustomRole) => {
    setEditingId(role.id);
    setEditingPerms([...role.permissions]);
  };

  const toggleEditPerm = (perm: string) => {
    setEditingPerms(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleDelete = async (roleId: string, roleName: string) => {
    if (!confirm(`Delete custom role "${roleName}"? This cannot be undone.`)) return;
    try {
      const r = await fetch(`/api/admin/roles/${roleId}`, { method: 'DELETE', headers: getAuthHeaders() });
      const d = await r.json();
      if (d.status === 'success') {
        triggerToast('Role deleted.', 'warn');
        fetchRoles();
      } else {
        triggerToast(d.error || 'Failed to delete role', 'warn');
      }
    } catch { triggerToast('Network error', 'warn'); }
  };

  const permissionGroups = [...new Set(ALL_PERMISSIONS.map(p => p.group))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold uppercase text-slate-300">Role-Based Access Control</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Manage platform roles and their permission sets.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 cursor-pointer transition-colors">
          <Plus className="w-3.5 h-3.5" /> New Role
        </button>
      </div>

      {/* Built-in Roles */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
          <Lock className="w-3 h-3" /> Built-in Roles (read-only)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {BUILTIN_ROLES.map(br => (
            <div key={br.role} className={`p-4 rounded-xl border ${br.color} space-y-2`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">{br.name}</span>
                </div>
                <span className="text-[9px] font-mono text-slate-600 bg-white/5 px-1.5 py-0.5 rounded">built-in</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {ALL_PERMISSIONS.map(perm => (
                  <span key={perm.key} className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${br.permissions.includes(perm.key) ? 'bg-white/10 text-slate-300' : 'text-slate-700 line-through'}`}>
                    {perm.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Role form */}
      {showCreate && (
        <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/[0.03] space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-amber-400">Create Custom Role</h4>
            <button onClick={() => setShowCreate(false)} className="text-slate-500 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Role Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Content Reviewer" required
                  className="w-full text-xs p-2.5 rounded-lg glass-input text-white" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Brief role description..."
                  className="w-full text-xs p-2.5 rounded-lg glass-input text-white" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Permissions</label>
              <div className="space-y-2">
                {permissionGroups.map(group => (
                  <div key={group}>
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">{group}</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {ALL_PERMISSIONS.filter(p => p.group === group).map(perm => (
                        <button key={perm.key} type="button"
                          onClick={() => toggleFormPerm(perm.key)}
                          className={`text-[10px] px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${form.permissions.includes(perm.key) ? 'bg-amber-500/20 border-amber-500/30 text-amber-300' : 'bg-white/[0.02] border-white/10 text-slate-500 hover:text-slate-300'}`}>
                          {form.permissions.includes(perm.key) && <Check className="w-2.5 h-2.5 inline mr-1" />}
                          {perm.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2 rounded-lg border border-white/10 text-xs text-slate-400 hover:bg-white/5 cursor-pointer">Cancel</button>
              <button type="submit" disabled={loading || !form.name.trim()}
                className="flex-1 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/30 cursor-pointer disabled:opacity-50">
                {loading ? 'Creating...' : 'Create Role'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Custom Roles list */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Custom Roles ({roles.length})</h4>
        {roles.length === 0 ? (
          <div className="p-6 text-center rounded-xl border border-white/5 bg-white/[0.01] text-slate-600 text-xs italic">
            No custom roles yet. Click "New Role" to create one.
          </div>
        ) : (
          <div className="space-y-3">
            {roles.map(role => {
              const isEditing = editingId === role.id;
              const activePerms = isEditing ? editingPerms : role.permissions;
              return (
                <div key={role.id} className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-white">{role.name}</span>
                      {role.description && <span className="text-[10px] text-slate-500 ml-2">{role.description}</span>}
                    </div>
                    <div className="flex gap-1.5">
                      {isEditing ? (
                        <>
                          <button onClick={() => handleUpdate(role)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/15 border border-teal-500/20 text-teal-400 text-[10px] font-bold hover:bg-teal-500/25 cursor-pointer">
                            <Save className="w-3 h-3" /> Save
                          </button>
                          <button onClick={() => { setEditingId(null); setEditingPerms([]); }}
                            className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-[10px] hover:bg-white/10 cursor-pointer">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button onClick={() => startEditing(role)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-[10px] font-bold hover:bg-white/10 cursor-pointer">
                          Edit
                        </button>
                      )}
                      <button onClick={() => handleDelete(role.id, role.name)}
                        className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 cursor-pointer">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {permissionGroups.map(group => (
                      <div key={group} className="flex flex-wrap gap-1 items-center">
                        <span className="text-[9px] font-bold text-slate-700 uppercase w-14 shrink-0">{group}</span>
                        {ALL_PERMISSIONS.filter(p => p.group === group).map(perm => (
                          <button key={perm.key} type="button" disabled={!isEditing}
                            onClick={() => isEditing && toggleEditPerm(perm.key)}
                            className={`text-[9px] px-2 py-0.5 rounded border font-mono transition-colors ${isEditing ? 'cursor-pointer' : 'cursor-default'} ${activePerms.includes(perm.key) ? 'bg-white/10 border-white/20 text-slate-300' : 'bg-transparent border-white/5 text-slate-700'}`}>
                            {perm.label}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
