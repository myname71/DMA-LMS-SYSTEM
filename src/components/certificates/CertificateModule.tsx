import React, { useState, useEffect, useRef } from 'react';
import {
  Award, Shield, Download, CheckCircle, XCircle, Search,
  Plus, Trash2, Edit3, Save, X, Eye, History, Palette, Star
} from 'lucide-react';

interface CertificateModuleProps {
  currentUser: any;
  courses: any[];
  enrollments: any[];
}

type TabType = 'my_certs' | 'verify' | 'templates' | 'history';

const API = (url: string, opts?: RequestInit) =>
  fetch(url, { credentials: 'include', headers: { 'Content-Type': 'application/json' }, ...opts });

export default function CertificateModule({ currentUser, courses, enrollments }: CertificateModuleProps) {
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  const [tab, setTab] = useState<TabType>('my_certs');

  // ── MY CERTS STATE ──────────────────────────────────────────────────────────
  const [myCerts, setMyCerts] = useState<any[]>([]);
  const [certLoading, setCertLoading] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [previewCert, setPreviewCert] = useState<any>(null);

  // ── VERIFY STATE ────────────────────────────────────────────────────────────
  const [verifyId, setVerifyId] = useState('');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  // ── TEMPLATES STATE (Admin) ─────────────────────────────────────────────────
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: '', style: 'classic', primaryColor: '#0066ff', accentColor: '#00aaff',
    headerText: 'Digital Manufacturing Academy', footerText: 'British Council Co-funded · AIUB–BCU Partnership',
    signatureLabel: 'Programme Director', logoEnabled: true, badgeEnabled: true,
  });

  // ── DOWNLOAD HISTORY STATE ──────────────────────────────────────────────────
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    loadMyCerts();
    loadTemplates();
  }, [currentUser]);

  useEffect(() => {
    if (tab === 'history') loadHistory();
  }, [tab]);

  async function loadMyCerts() {
    if (!currentUser) return;
    setCertLoading(true);
    try {
      const r = await API(`/api/certificates/user/${currentUser.id}`);
      const d = await r.json();
      setMyCerts(d.certificates || []);
    } catch {}
    setCertLoading(false);
  }

  async function loadTemplates() {
    try {
      const r = await API('/api/certificates/templates');
      const d = await r.json();
      setTemplates(d.templates || []);
      const def = d.templates?.find((t: any) => t.isDefault);
      if (def) setSelectedTemplateId(def.id);
    } catch {}
  }

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const url = isAdmin ? '/api/certificates/download-history/all' : `/api/certificates/download-history/${currentUser.id}`;
      const r = await API(url);
      const d = await r.json();
      setHistory(d.history || []);
    } catch {}
    setHistoryLoading(false);
  }

  async function generateCert(courseId: string) {
    setGenerating(courseId);
    try {
      const r = await API('/api/certificates/generate', {
        method: 'POST',
        body: JSON.stringify({ courseId, templateId: selectedTemplateId }),
      });
      const d = await r.json();
      if (d.certificate) {
        setMyCerts(prev => {
          const exists = prev.find(c => c.id === d.certificate.id);
          return exists ? prev : [d.certificate, ...prev];
        });
      }
    } catch {}
    setGenerating(null);
  }

  async function downloadCert(cert: any) {
    try {
      await API(`/api/certificates/download/${cert.id}`, { method: 'POST' });
      // Trigger browser print of cert preview
      setPreviewCert(cert);
      setTimeout(() => window.print(), 400);
    } catch {}
  }

  async function verifyCert() {
    if (!verifyId.trim()) return;
    setVerifyLoading(true);
    setVerifyResult(null);
    setVerifyError('');
    try {
      const r = await API(`/api/certificates/verify/${verifyId.trim()}`);
      const d = await r.json();
      if (d.valid) setVerifyResult(d.certificate);
      else setVerifyError('Certificate not found or invalid.');
    } catch {
      setVerifyError('Verification failed. Please check the ID and try again.');
    }
    setVerifyLoading(false);
  }

  async function saveTemplate() {
    try {
      const method = editingTemplate?.id && !isCreating ? 'PUT' : 'POST';
      const url = editingTemplate?.id && !isCreating
        ? `/api/certificates/templates/${editingTemplate.id}`
        : '/api/certificates/templates';
      await API(url, { method, body: JSON.stringify(templateForm) });
      await loadTemplates();
      setEditingTemplate(null);
      setIsCreating(false);
    } catch {}
  }

  async function deleteTemplate(id: string) {
    if (!confirm('Delete this template?')) return;
    try {
      await API(`/api/certificates/templates/${id}`, { method: 'DELETE' });
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch {}
  }

  async function setDefaultTemplate(id: string) {
    try {
      await API(`/api/certificates/templates/${id}`, { method: 'PUT', body: JSON.stringify({ isDefault: true }) });
      await loadTemplates();
    } catch {}
  }

  // Completed courses that don't have certificates yet
  const completedEnrollments = enrollments.filter(e =>
    e.userId === currentUser?.id && e.progress >= 100
  );
  const uncertifiedCourses = completedEnrollments
    .map(e => courses.find(c => c.id === e.courseId))
    .filter(Boolean)
    .filter(c => !myCerts.find(cert => cert.courseId === c.id));

  const TAB_CLASSES = (active: boolean) =>
    `px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`;

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Print overlay */}
      {previewCert && (
        <div className="fixed inset-0 z-50 bg-white flex items-center justify-center print:static print:inset-auto">
          <div className="max-w-2xl w-full p-12 text-center space-y-6 border-4 border-blue-600 rounded-3xl relative print:border-0">
            <button onClick={() => setPreviewCert(null)} className="absolute top-4 right-4 text-slate-400 hover:text-black text-lg cursor-pointer print:hidden">×</button>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Digital Manufacturing Academy</p>
            <h1 className="text-3xl font-extrabold text-gray-900">Certificate of Completion</h1>
            <p className="text-lg text-gray-700">This certifies that</p>
            <h2 className="text-2xl font-extrabold text-blue-700">{previewCert.userName}</h2>
            <p className="text-lg text-gray-700">has successfully completed</p>
            <h3 className="text-xl font-bold text-gray-900">{previewCert.courseTitle}</h3>
            {previewCert.grade && <p className="text-base text-gray-600">Overall Score: <strong>{previewCert.grade}%</strong></p>}
            <p className="text-sm text-gray-500">Issued: {new Date(previewCert.issuedAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-xs text-gray-400 border-t pt-4">Credential ID: {previewCert.id} · British Council Co-funded · AIUB–BCU Partnership</p>
            <div className="print:hidden">
              <button onClick={() => window.print()} className="mt-4 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg cursor-pointer">Print / Save PDF</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <Award className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest font-mono">Credentials</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Certificate Centre</h1>
        <p className="text-slate-400 text-sm">Generate, verify, and manage your academic certificates.</p>
      </div>

      {/* Tab Bar */}
      <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-slate-900/50 border border-slate-800 rounded-xl w-fit">
        <button onClick={() => setTab('my_certs')} className={TAB_CLASSES(tab === 'my_certs')}>
          <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> My Certificates</span>
        </button>
        <button onClick={() => setTab('verify')} className={TAB_CLASSES(tab === 'verify')}>
          <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Verify Certificate</span>
        </button>
        {isAdmin && (
          <button onClick={() => setTab('templates')} className={TAB_CLASSES(tab === 'templates')}>
            <span className="flex items-center gap-1.5"><Palette className="w-3.5 h-3.5" /> Templates</span>
          </button>
        )}
        <button onClick={() => setTab('history')} className={TAB_CLASSES(tab === 'history')}>
          <span className="flex items-center gap-1.5"><History className="w-3.5 h-3.5" /> Download History</span>
        </button>
      </div>

      {/* ────────────── MY CERTIFICATES ────────────── */}
      {tab === 'my_certs' && (
        <div className="space-y-6">
          {/* Generate section */}
          {uncertifiedCourses.length > 0 && (
            <div className="p-5 rounded-2xl border border-blue-500/20 bg-blue-600/5">
              <h4 className="text-sm font-extrabold text-white mb-1">Ready to Generate</h4>
              <p className="text-xs text-slate-400 mb-4">You've completed the following courses. Generate your certificates now.</p>

              {templates.length > 0 && (
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Certificate Template</label>
                  <select value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)}
                    className="text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white cursor-pointer">
                    {templates.map(t => (
                      <option key={t.id} value={t.id}>{t.name}{t.isDefault ? ' (Default)' : ''}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-3">
                {uncertifiedCourses.map((course: any) => (
                  <div key={course.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div>
                      <p className="text-xs font-bold text-white">{course.title}</p>
                      <p className="text-[10px] text-slate-500">{course.instructorName}</p>
                    </div>
                    <button onClick={() => generateCert(course.id)} disabled={generating === course.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer disabled:opacity-50 transition-colors">
                      <Award className="w-3 h-3" />
                      {generating === course.id ? 'Generating…' : 'Generate'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Issued Certificates */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Issued Certificates ({myCerts.length})</h4>
            {certLoading ? (
              <div className="text-center py-8 text-slate-500 text-xs">Loading…</div>
            ) : myCerts.length === 0 ? (
              <EmptyState icon={Award} title="No certificates yet" desc="Complete a course to generate your first certificate." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myCerts.map(cert => (
                  <CertificateCard key={cert.id} cert={cert} onDownload={() => downloadCert(cert)} onPreview={() => setPreviewCert(cert)} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────── VERIFY CERTIFICATE ────────────── */}
      {tab === 'verify' && (
        <div className="max-w-lg mx-auto space-y-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-[#111827] space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-extrabold text-white">Certificate Verification</h3>
            </div>
            <p className="text-xs text-slate-400">Enter the Credential ID from a DMA Academy certificate to verify its authenticity.</p>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Credential ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={verifyId}
                  onChange={e => setVerifyId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && verifyCert()}
                  placeholder="e.g. cert_1782743054417_abc123"
                  className="flex-1 text-xs p-3 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                />
                <button onClick={verifyCert} disabled={verifyLoading || !verifyId.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer disabled:opacity-50 flex items-center gap-1.5 transition-colors">
                  <Search className="w-3.5 h-3.5" /> {verifyLoading ? '…' : 'Verify'}
                </button>
              </div>
            </div>
          </div>

          {verifyError && (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-600/5 flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-xs text-red-300">{verifyError}</p>
            </div>
          )}

          {verifyResult && (
            <div className="p-6 rounded-2xl border border-teal-500/30 bg-teal-600/5 space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-teal-400" />
                <div>
                  <h4 className="text-sm font-extrabold text-white">Certificate Verified ✓</h4>
                  <p className="text-xs text-teal-400">This is an authentic DMA Academy credential</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-slate-500 mb-0.5 font-mono text-[10px] uppercase">Recipient</p>
                  <p className="font-bold text-white">{verifyResult.userName}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-slate-500 mb-0.5 font-mono text-[10px] uppercase">Course</p>
                  <p className="font-bold text-white">{verifyResult.courseTitle}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-slate-500 mb-0.5 font-mono text-[10px] uppercase">Issued</p>
                  <p className="font-bold text-white">{new Date(verifyResult.issuedAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-slate-500 mb-0.5 font-mono text-[10px] uppercase">Credential ID</p>
                  <p className="font-mono text-[9px] text-blue-400 break-all">{verifyResult.id}</p>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
            <p className="text-[10px] text-slate-500 leading-relaxed text-center">
              DMA Academy certificates are issued as part of the British Council Going Global Partnerships programme in collaboration with AIUB and Birmingham City University.
            </p>
          </div>
        </div>
      )}

      {/* ────────────── TEMPLATE MANAGER (Admin) ────────────── */}
      {tab === 'templates' && isAdmin && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-white">Certificate Templates</h4>
            <button onClick={() => { setIsCreating(true); setEditingTemplate({}); setTemplateForm({ name: '', style: 'classic', primaryColor: '#0066ff', accentColor: '#00aaff', headerText: 'Digital Manufacturing Academy', footerText: 'British Council Co-funded · AIUB–BCU Partnership', signatureLabel: 'Programme Director', logoEnabled: true, badgeEnabled: true }); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors">
              <Plus className="w-3.5 h-3.5" /> New Template
            </button>
          </div>

          {/* Template Editor */}
          {editingTemplate && (
            <div className="p-6 rounded-2xl border border-blue-500/30 bg-blue-600/5 space-y-4">
              <h5 className="text-sm font-bold text-white">{isCreating ? 'New Template' : 'Edit Template'}</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'name', label: 'Template Name', type: 'text', placeholder: 'Standard Completion Certificate' },
                  { key: 'signatureLabel', label: 'Signature Label', type: 'text', placeholder: 'Programme Director' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">{field.label}</label>
                    <input type={field.type} value={(templateForm as any)[field.key]} placeholder={field.placeholder}
                      onChange={e => setTemplateForm(f => ({ ...f, [field.key]: e.target.value }))}
                      className="w-full text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white" />
                  </div>
                ))}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Primary Color</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={templateForm.primaryColor} onChange={e => setTemplateForm(f => ({ ...f, primaryColor: e.target.value }))} className="w-10 h-8 rounded cursor-pointer border-0 bg-transparent" />
                    <input type="text" value={templateForm.primaryColor} onChange={e => setTemplateForm(f => ({ ...f, primaryColor: e.target.value }))} className="flex-1 text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Accent Color</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={templateForm.accentColor} onChange={e => setTemplateForm(f => ({ ...f, accentColor: e.target.value }))} className="w-10 h-8 rounded cursor-pointer border-0 bg-transparent" />
                    <input type="text" value={templateForm.accentColor} onChange={e => setTemplateForm(f => ({ ...f, accentColor: e.target.value }))} className="flex-1 text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Header Text</label>
                  <input type="text" value={templateForm.headerText} onChange={e => setTemplateForm(f => ({ ...f, headerText: e.target.value }))} className="w-full text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Footer Text</label>
                  <input type="text" value={templateForm.footerText} onChange={e => setTemplateForm(f => ({ ...f, footerText: e.target.value }))} className="w-full text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Style</label>
                  <select value={templateForm.style} onChange={e => setTemplateForm(f => ({ ...f, style: e.target.value }))} className="w-full text-xs p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white cursor-pointer">
                    <option value="classic">Classic</option>
                    <option value="premium">Premium</option>
                    <option value="minimal">Minimal</option>
                    <option value="modern">Modern</option>
                  </select>
                </div>
                <div className="flex items-center gap-6 pt-2">
                  {[['logoEnabled', 'Logo'], ['badgeEnabled', 'Badge']].map(([k, l]) => (
                    <label key={k} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={(templateForm as any)[k]}
                        onChange={e => setTemplateForm(f => ({ ...f, [k]: e.target.checked }))}
                        className="w-4 h-4 accent-blue-500 cursor-pointer" />
                      <span className="text-xs text-slate-300">{l}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setEditingTemplate(null); setIsCreating(false); }}
                  className="flex items-center gap-1.5 px-4 py-2 border border-slate-700 text-slate-400 text-xs rounded-lg cursor-pointer hover:bg-slate-800">
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
                <button onClick={saveTemplate}
                  className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer">
                  <Save className="w-3.5 h-3.5" /> Save Template
                </button>
              </div>
            </div>
          )}

          {/* Template Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {templates.map(tmpl => (
              <div key={tmpl.id} className="p-5 rounded-2xl border border-slate-800 bg-[#111827] space-y-3">
                {/* Mini preview */}
                <div className="h-20 rounded-xl flex items-center justify-center relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${tmpl.primaryColor}20, ${tmpl.accentColor}15)`, border: `1px solid ${tmpl.primaryColor}40` }}>
                  <div className="text-center">
                    <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: tmpl.primaryColor }}>{tmpl.headerText}</p>
                    <p className="text-[10px] font-extrabold text-white mt-0.5">Certificate of Completion</p>
                    <p className="text-[7px] text-slate-400 mt-0.5">{tmpl.footerText}</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-extrabold text-white">{tmpl.name}</h5>
                    {tmpl.isDefault && <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded px-1.5 py-0.5">Default</span>}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 capitalize">{tmpl.style} style · {tmpl.signatureLabel}</p>
                </div>
                <div className="flex gap-2 pt-1">
                  {!tmpl.isDefault && (
                    <button onClick={() => setDefaultTemplate(tmpl.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] border border-slate-700 text-slate-400 rounded-lg cursor-pointer hover:text-amber-400 hover:border-amber-500/30 transition-colors">
                      <Star className="w-3 h-3" /> Set Default
                    </button>
                  )}
                  <button onClick={() => { setEditingTemplate(tmpl); setIsCreating(false); setTemplateForm({ name: tmpl.name, style: tmpl.style, primaryColor: tmpl.primaryColor, accentColor: tmpl.accentColor, headerText: tmpl.headerText, footerText: tmpl.footerText, signatureLabel: tmpl.signatureLabel, logoEnabled: tmpl.logoEnabled, badgeEnabled: tmpl.badgeEnabled }); }}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] border border-slate-700 text-slate-400 rounded-lg cursor-pointer hover:text-white hover:border-slate-600 transition-colors">
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                  {!tmpl.isDefault && (
                    <button onClick={() => deleteTemplate(tmpl.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] border border-red-500/20 text-red-400 rounded-lg cursor-pointer hover:bg-red-500/10 transition-colors ml-auto">
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ────────────── DOWNLOAD HISTORY ────────────── */}
      {tab === 'history' && (
        <div className="space-y-4">
          <h4 className="text-sm font-extrabold text-white mb-4">{isAdmin ? 'All Certificate Downloads' : 'My Download History'}</h4>
          {historyLoading ? (
            <div className="text-center py-8 text-slate-500 text-xs">Loading…</div>
          ) : history.length === 0 ? (
            <EmptyState icon={History} title="No downloads yet" desc="Your certificate download history will appear here." />
          ) : (
            <div className="space-y-3">
              {history.map(record => (
                <div key={record.id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-white">{record.courseTitle}</p>
                    {isAdmin && <p className="text-[10px] text-blue-400 mt-0.5">{record.userName}</p>}
                    <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{new Date(record.downloadedAt).toLocaleString()}</p>
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono shrink-0">{record.certId?.slice(0, 16)}…</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface CertificateCardProps {
  cert: any;
  onDownload: () => void;
  onPreview: () => void;
}

const CertificateCard: React.FC<CertificateCardProps> = ({ cert, onDownload, onPreview }) => {
  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-[#111827] space-y-3">
      <div className="h-24 rounded-xl bg-gradient-to-br from-blue-600/15 to-indigo-600/10 border border-blue-500/20 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #0066ff 0, #0066ff 1px, transparent 0, transparent 50%)' }} />
        <div className="text-center relative z-10 px-4">
          <Award className="w-6 h-6 text-blue-400 mx-auto mb-1" />
          <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Certificate of Completion</p>
          <p className="text-[10px] font-extrabold text-white mt-0.5 leading-tight">{cert.courseTitle}</p>
        </div>
      </div>
      <div>
        <p className="text-xs font-extrabold text-white">{cert.courseTitle}</p>
        <p className="text-[10px] text-slate-500 mt-0.5">Issued {new Date(cert.issuedAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
        {cert.grade && <p className="text-[10px] text-teal-400 mt-0.5">Score: {cert.grade}%</p>}
        <p className="text-[9px] text-slate-600 font-mono mt-1 break-all">{cert.id}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={onPreview}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-slate-700 text-slate-300 text-xs rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
          <Eye className="w-3 h-3" /> Preview
        </button>
        <button onClick={onDownload}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors">
          <Download className="w-3 h-3" /> Download
        </button>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="py-16 flex flex-col items-center text-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
        <Icon className="w-5 h-5 text-slate-600" />
      </div>
      <p className="text-sm font-bold text-slate-400">{title}</p>
      <p className="text-xs text-slate-600 max-w-xs">{desc}</p>
    </div>
  );
}
