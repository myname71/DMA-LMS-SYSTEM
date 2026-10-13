import React, { useState, useEffect, useRef } from 'react';
import {
  Globe, Home, Info, Phone, Eye, EyeOff, GripVertical,
  Save, Plus, Trash2, RefreshCw, CheckCircle, Edit3,
  Layout, ChevronRight, AlertCircle, ArrowUp, ArrowDown,
  BarChart2, FileText, MessageSquare, Image, Link, Upload
} from 'lucide-react';
import { getAuthHeaders } from '../lib/session';

interface CMSSection {
  id: string;
  type: string;
  title: string;
  order: number;
  visible: boolean;
  content: Record<string, any>;
}

interface CMSPage {
  id: string;
  label: string;
  slug: string;
  sections: CMSSection[];
}

interface CMSData {
  pages: CMSPage[];
}

interface SiteCMSDashboardProps {
  currentUser: any;
  triggerToast: (msg: string, type?: 'success' | 'warn') => void;
  onContentChange?: (content: CMSData) => void;
}

const PAGE_ICONS: Record<string, React.ReactNode> = {
  home: <Home className="w-4 h-4" />,
  about: <Info className="w-4 h-4" />,
  contact: <Phone className="w-4 h-4" />,
};

const SECTION_TYPE_COLORS: Record<string, string> = {
  hero: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  stats: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  categories: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  partnership: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  faq: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  testimonials: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  outcomes: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  text_block: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  contact_hero: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  contact_info: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  contact_form: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  about_hero: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
};

function TextField({ label, value, onChange, multiline = false, rows = 2 }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; rows?: number;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
      {multiline ? (
        <textarea
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          rows={rows}
          className="w-full text-xs p-2.5 rounded-lg glass-input text-white resize-none font-mono"
        />
      ) : (
        <input
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="w-full text-xs p-2.5 rounded-lg glass-input text-white"
        />
      )}
    </div>
  );
}

function ImageField({ value, onChange, triggerToast }: {
  value: string;
  onChange: (value: string) => void;
  triggerToast: (msg: string, type?: 'success' | 'warn') => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      triggerToast('Please choose an image file.', 'warn');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      triggerToast('Images must be 5 MB or smaller.', 'warn');
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await handleUpload(file);
      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ name: file.name, dataUrl, type: 'image' }),
      });
      const data = await response.json();
      if (!response.ok || data.status !== 'success') throw new Error(data.error || 'Upload failed');
      onChange(data.item.dataUrl);
      triggerToast('Image uploaded. Publish CMS changes to make it live.', 'success');
    } catch (error: any) {
      triggerToast(error.message || 'Image upload failed.', 'warn');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="p-3 rounded-xl border border-blue-500/15 bg-blue-500/[0.04] space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-[10px] font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
          <Image className="w-3.5 h-3.5" /> Section Image
        </label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-2.5 py-1 rounded-lg border border-blue-500/25 bg-blue-500/10 text-blue-300 text-[10px] font-bold hover:bg-blue-500/20 disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
        >
          <Upload className="w-3 h-3" /> {uploading ? 'Uploading...' : 'Upload image'}
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => {
          const file = e.target.files?.[0];
          if (file) uploadImage(file);
        }} />
      </div>
      <input
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder="Paste an image URL or upload an image"
        className="w-full text-[11px] p-2 rounded-lg glass-input text-white"
      />
      {value && (
        <div className="relative h-24 rounded-lg overflow-hidden border border-white/10 bg-slate-950">
          <img src={value} alt="Section preview" className="w-full h-full object-cover" />
          <button type="button" onClick={() => onChange('')} className="absolute top-1.5 right-1.5 px-2 py-1 rounded bg-black/70 text-[9px] text-white hover:bg-rose-500/80 cursor-pointer">Remove</button>
        </div>
      )}
    </div>
  );
}

function ListEditor({ label, items, fields, onChange }: {
  label: string;
  items: any[];
  fields: Array<{ key: string; label: string; multiline?: boolean }>;
  onChange: (items: any[]) => void;
}) {
  const addItem = () => {
    const blank: any = {};
    fields.forEach(f => blank[f.key] = '');
    onChange([...items, blank]);
  };

  const updateItem = (idx: number, key: string, val: string) => {
    const updated = items.map((item, i) => i === idx ? { ...item, [key]: val } : item);
    onChange(updated);
  };

  const removeItem = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  const moveItem = (idx: number, dir: 'up' | 'down') => {
    const arr = [...items];
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    if (swap < 0 || swap >= arr.length) return;
    [arr[idx], arr[swap]] = [arr[swap], arr[idx]];
    onChange(arr);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
        <button
          onClick={addItem}
          className="px-2.5 py-1 bg-blue-600/20 border border-blue-500/25 text-blue-400 text-[10px] font-bold rounded-lg hover:bg-blue-600/30 flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>
      <div className="space-y-2 max-h-80 overflow-y-auto pr-0.5">
        {(items || []).map((item, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-slate-900/70 border border-white/5 space-y-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">Item {idx + 1}</span>
              <div className="flex gap-1">
                <button onClick={() => moveItem(idx, 'up')} disabled={idx === 0} className="p-0.5 text-slate-500 hover:text-white disabled:opacity-20 cursor-pointer"><ArrowUp className="w-3 h-3" /></button>
                <button onClick={() => moveItem(idx, 'down')} disabled={idx === items.length - 1} className="p-0.5 text-slate-500 hover:text-white disabled:opacity-20 cursor-pointer"><ArrowDown className="w-3 h-3" /></button>
                <button onClick={() => removeItem(idx)} className="p-0.5 text-slate-500 hover:text-rose-400 cursor-pointer"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
            {fields.map(f => (
              <div key={f.key}>
                <label className="block text-[9px] text-slate-500 uppercase font-bold mb-0.5">{f.label}</label>
                {f.multiline ? (
                  <textarea
                    value={item[f.key] || ''}
                    onChange={e => updateItem(idx, f.key, e.target.value)}
                    rows={2}
                    className="w-full text-[11px] p-2 rounded glass-input text-white resize-none font-mono"
                  />
                ) : (
                  <input
                    value={item[f.key] || ''}
                    onChange={e => updateItem(idx, f.key, e.target.value)}
                    className="w-full text-[11px] p-2 rounded glass-input text-white"
                  />
                )}
              </div>
            ))}
          </div>
        ))}
        {(!items || items.length === 0) && (
          <p className="text-[10px] text-slate-600 italic text-center py-3">No items. Click Add to create one.</p>
        )}
      </div>
    </div>
  );
}

function SectionEditor({ section, onUpdate, triggerToast }: {
  section: CMSSection;
  onUpdate: (content: Record<string, any>) => void;
  triggerToast: (msg: string, type?: 'success' | 'warn') => void;
}) {
  const c = section.content;
  const set = (key: string, val: any) => onUpdate({ ...c, [key]: val });

  const renderFields = () => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <TextField label="Badge Text" value={c.badge} onChange={v => set('badge', v)} />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Headline Line 1" value={c.headline} onChange={v => set('headline', v)} />
              <TextField label="Highlighted Word" value={c.headlineHighlight} onChange={v => set('headlineHighlight', v)} />
            </div>
            <TextField label="Sub-headline Paragraph" value={c.subheadline} onChange={v => set('subheadline', v)} multiline rows={3} />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Primary CTA Button" value={c.primaryCTA} onChange={v => set('primaryCTA', v)} />
              <TextField label="Secondary CTA Button" value={c.secondaryCTA} onChange={v => set('secondaryCTA', v)} />
            </div>
          </div>
        );

      case 'stats':
        return (
          <ListEditor
            label="Statistics Items"
            items={c.items || []}
            fields={[
              { key: 'num', label: 'Number/Value (e.g. 5,200+)' },
              { key: 'label', label: 'Label' },
            ]}
            onChange={items => set('items', items)}
          />
        );

      case 'categories':
        return (
          <div className="space-y-4">
            <TextField label="Section Title" value={c.sectionTitle} onChange={v => set('sectionTitle', v)} />
            <TextField label="Section Subtitle" value={c.sectionSubtitle} onChange={v => set('sectionSubtitle', v)} multiline rows={2} />
            <ListEditor
              label="Category Cards"
              items={c.items || []}
              fields={[
                { key: 'icon', label: 'Icon (emoji)' },
                { key: 'name', label: 'Category Name' },
                { key: 'count', label: 'Module Count (e.g. 8 modules)' },
              ]}
              onChange={items => set('items', items)}
            />
          </div>
        );

      case 'partnership':
        return (
          <div className="space-y-4">
            <TextField label="Badge / Eyebrow Text" value={c.badge} onChange={v => set('badge', v)} />
            <TextField label="Title" value={c.title} onChange={v => set('title', v)} />
            <TextField label="Description" value={c.description} onChange={v => set('description', v)} multiline rows={4} />
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-4">
            <TextField label="Section Title" value={c.sectionTitle} onChange={v => set('sectionTitle', v)} />
            <ListEditor
              label="FAQ Items"
              items={c.items || []}
              fields={[
                { key: 'q', label: 'Question' },
                { key: 'a', label: 'Answer', multiline: true },
              ]}
              onChange={items => set('items', items)}
            />
          </div>
        );

      case 'testimonials':
        return (
          <div className="space-y-4">
            <TextField label="Section Title" value={c.sectionTitle} onChange={v => set('sectionTitle', v)} />
            <ListEditor
              label="Testimonials"
              items={c.items || []}
              fields={[
                { key: 'name', label: 'Name' },
                { key: 'role', label: 'Role / Company' },
                { key: 'text', label: 'Testimonial Text', multiline: true },
                { key: 'rating', label: 'Rating (1–5)' },
              ]}
              onChange={items => set('items', items)}
            />
          </div>
        );

      case 'about_hero':
        return (
          <div className="space-y-4">
            <TextField label="Badge Text" value={c.badge} onChange={v => set('badge', v)} />
            <TextField label="Title" value={c.title} onChange={v => set('title', v)} />
            <TextField label="Subtitle / Highlight" value={c.subtitle} onChange={v => set('subtitle', v)} />
            <TextField label="Description Paragraph" value={c.description} onChange={v => set('description', v)} multiline rows={4} />
          </div>
        );

      case 'text_block':
        return (
          <div className="space-y-4">
            <TextField label="Section Title" value={c.title} onChange={v => set('title', v)} />
            <TextField label="Body Content" value={c.body} onChange={v => set('body', v)} multiline rows={6} />
          </div>
        );

      case 'outcomes':
        return (
          <div className="space-y-4">
            <TextField label="Section Title" value={c.title} onChange={v => set('title', v)} />
            <ListEditor
              label="Outcome Cards"
              items={c.items || []}
              fields={[
                { key: 'title', label: 'Card Title' },
                { key: 'desc', label: 'Description', multiline: true },
              ]}
              onChange={items => set('items', items)}
            />
          </div>
        );

      case 'contact_hero':
        return (
          <div className="space-y-4">
            <TextField label="Badge / Eyebrow" value={c.badge} onChange={v => set('badge', v)} />
            <TextField label="Page Title" value={c.title} onChange={v => set('title', v)} />
            <TextField label="Description" value={c.description} onChange={v => set('description', v)} multiline rows={3} />
          </div>
        );

      case 'contact_info':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <TextField label="AIUB Address" value={c.aiub_address} onChange={v => set('aiub_address', v)} multiline rows={2} />
              <TextField label="BCU Address" value={c.bcu_address} onChange={v => set('bcu_address', v)} multiline rows={2} />
              <TextField label="Email Address" value={c.email} onChange={v => set('email', v)} />
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Phone (Bangladesh)" value={c.phone} onChange={v => set('phone', v)} />
                <TextField label="Phone (UK)" value={c.phone2} onChange={v => set('phone2', v)} />
              </div>
            </div>
          </div>
        );

      case 'contact_form':
        return (
          <div className="space-y-4">
            <TextField label="Form Title" value={c.formTitle} onChange={v => set('formTitle', v)} />
            <TextField label="Form Description" value={c.formDescription} onChange={v => set('formDescription', v)} multiline rows={3} />
            <TextField label="Submit Button Label" value={c.submitLabel} onChange={v => set('submitLabel', v)} />
          </div>
        );

      default:
        return (
          <div className="p-4 rounded-xl bg-slate-900/50 border border-white/5 text-center">
            <p className="text-xs text-slate-500 italic">No editor available for section type: <code className="text-blue-400">{section.type}</code></p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-white/5">
        <div className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${SECTION_TYPE_COLORS[section.type] || 'text-slate-400 bg-slate-500/10 border-slate-500/20'}`}>
          {section.type}
        </div>
        <h4 className="text-sm font-bold text-white">{section.title}</h4>
      </div>
      <ImageField
        value={c.imageUrl || c.image || ''}
        onChange={value => set('imageUrl', value)}
        triggerToast={triggerToast}
      />
      {renderFields()}
    </div>
  );
}

export default function SiteCMSDashboard({ currentUser, triggerToast, onContentChange = () => {} }: SiteCMSDashboardProps) {
  const [cmsData, setCmsData] = useState<CMSData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePageId, setActivePageId] = useState('home');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragFromIdx, setDragFromIdx] = useState<number | null>(null);
  const [showAddPage, setShowAddPage] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');

  const fetchCMS = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/cms');
      const d = await r.json();
      setCmsData(d);
    } catch {
      triggerToast('Failed to load CMS data', 'warn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCMS(); }, []);

  const activePage = cmsData?.pages.find(p => p.id === activePageId);
  const sortedSections = activePage ? [...activePage.sections].sort((a, b) => a.order - b.order) : [];
  const selectedSection = activePage?.sections.find(s => s.id === selectedSectionId);

  const updateSectionContent = (sectionId: string, newContent: Record<string, any>) => {
    setCmsData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        pages: prev.pages.map(p =>
          p.id === activePageId
            ? { ...p, sections: p.sections.map(s => s.id === sectionId ? { ...s, content: newContent } : s) }
            : p
        ),
      };
    });
    setHasUnsaved(true);
  };

  const toggleVisibility = (sectionId: string) => {
    setCmsData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        pages: prev.pages.map(p =>
          p.id === activePageId
            ? { ...p, sections: p.sections.map(s => s.id === sectionId ? { ...s, visible: !s.visible } : s) }
            : p
        ),
      };
    });
    setHasUnsaved(true);
  };

  const handleDragStart = (idx: number) => setDragFromIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (dragFromIdx === null || dragFromIdx === idx) return;
    setCmsData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        pages: prev.pages.map(p => {
          if (p.id !== activePageId) return p;
          const sorted = [...p.sections].sort((a, b) => a.order - b.order);
          const [moved] = sorted.splice(dragFromIdx, 1);
          sorted.splice(idx, 0, moved);
          return { ...p, sections: sorted.map((s, i) => ({ ...s, order: i })) };
        }),
      };
    });
    setDragFromIdx(idx);
    setHasUnsaved(true);
  };
  const handleDrop = () => setDragFromIdx(null);

  const updatePage = (updates: Partial<CMSPage>) => {
    setCmsData(prev => prev ? {
      ...prev,
      pages: prev.pages.map(page => page.id === activePageId ? { ...page, ...updates } : page),
    } : prev);
    setHasUnsaved(true);
  };

  const addPage = () => {
    const label = newPageName.trim();
    if (!label) {
      triggerToast('Enter a page name first.', 'warn');
      return;
    }
    const baseId = (newPageSlug.trim() || label)
      .toLowerCase()
      .replace(/^\/+|\/+$/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || `page-${Date.now()}`;
    let id = baseId;
    let suffix = 2;
    while (cmsData?.pages.some(page => page.id === id)) id = `${baseId}-${suffix++}`;
    const slug = `/${id}`;
    const page: CMSPage = {
      id,
      label,
      slug,
      sections: [{
        id: `${id}-content`,
        type: 'text_block',
        title: 'Page Content',
        order: 0,
        visible: true,
        content: { title: label, body: 'Add your page content here.', imageUrl: '' },
      }],
    };
    setCmsData(prev => prev ? { ...prev, pages: [...prev.pages, page] } : prev);
    setActivePageId(id);
    setSelectedSectionId(`${id}-content`);
    setHasUnsaved(true);
    setShowAddPage(false);
    setNewPageName('');
    setNewPageSlug('');
    triggerToast('New page added. Publish CMS changes when ready.', 'success');
  };

  const deletePage = () => {
    if (!activePage || activePage.id === 'home') {
      triggerToast('The homepage cannot be deleted.', 'warn');
      return;
    }
    if (!confirm(`Delete the "${activePage.label}" page?`)) return;
    const remaining = (cmsData?.pages || []).filter(page => page.id !== activePage.id);
    setCmsData(prev => prev ? { ...prev, pages: remaining } : prev);
    const nextPage = remaining[0];
    setActivePageId(nextPage?.id || 'home');
    setSelectedSectionId(null);
    setHasUnsaved(true);
  };

  const saveChanges = async () => {
    if (!cmsData) return;
    setSaving(true);
    try {
      const response = await fetch('/api/cms/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ cmsData }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Save failed');
      onContentChange(data.cmsContent || cmsData);
      setHasUnsaved(false);
      triggerToast('CMS changes published to live site!', 'success');
    } catch {
      triggerToast('Save failed. Please try again.', 'warn');
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    totalSections: cmsData?.pages.reduce((a, p) => a + p.sections.length, 0) || 0,
    visibleSections: cmsData?.pages.reduce((a, p) => a + p.sections.filter(s => s.visible).length, 0) || 0,
    totalPages: cmsData?.pages.length || 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-3" />
        <span className="text-sm">Loading CMS editor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Layout className="w-4 h-4 text-amber-400" />
            Site Content Management System
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Edit homepage, about & contact page sections. Drag to reorder. Toggle visibility.</p>
        </div>
        <div className="flex items-center gap-3">
          {hasUnsaved && (
            <span className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1.5 animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" /> Unsaved Changes
            </span>
          )}
          <button
            onClick={fetchCMS}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white cursor-pointer transition-colors"
            title="Reload CMS data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={saveChanges}
            disabled={!hasUnsaved || saving}
            className="px-4 py-2 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-lg hover:bg-amber-500/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-default transition-colors"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Publishing...' : 'Publish Changes'}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Pages', value: stats.totalPages, icon: <Globe className="w-4 h-4 text-blue-400" /> },
          { label: 'Total Sections', value: stats.totalSections, icon: <Layout className="w-4 h-4 text-violet-400" /> },
          { label: 'Visible Sections', value: stats.visibleSections, icon: <Eye className="w-4 h-4 text-emerald-400" /> },
        ].map((s, i) => (
          <div key={i} className="p-4 rounded-xl glass-card flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">{s.icon}</div>
            <div>
              <div className="text-lg font-extrabold text-white">{s.value}</div>
              <div className="text-[10px] text-slate-500 font-mono uppercase">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main CMS builder: 3-panel layout */}
      <div className="grid grid-cols-12 gap-5">

        {/* Panel 1: Page list */}
        <div className="col-span-12 md:col-span-3">
          <div className="p-4 rounded-xl glass-card space-y-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Pages</h4>
              <button onClick={() => setShowAddPage(v => !v)} className="p-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 cursor-pointer" title="Add page">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {showAddPage && (
              <div className="mb-3 p-3 rounded-xl bg-blue-500/[0.05] border border-blue-500/15 space-y-2">
                <TextField label="Page name" value={newPageName} onChange={setNewPageName} />
                <TextField label="URL slug (optional)" value={newPageSlug} onChange={setNewPageSlug} />
                <div className="flex gap-2">
                  <button onClick={addPage} className="flex-1 py-1.5 rounded-lg bg-blue-600/30 border border-blue-500/30 text-blue-200 text-[10px] font-bold cursor-pointer">Add Page</button>
                  <button onClick={() => setShowAddPage(false)} className="px-2 py-1.5 rounded-lg bg-white/5 text-slate-400 text-[10px] cursor-pointer">Cancel</button>
                </div>
              </div>
            )}
            {cmsData?.pages.map(page => (
              <button
                key={page.id}
                onClick={() => { setActivePageId(page.id); setSelectedSectionId(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  activePageId === page.id
                    ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                    : 'bg-white/[0.02] border border-white/5 text-slate-300 hover:bg-white/[0.05]'
                }`}
              >
                <span className={activePageId === page.id ? 'text-amber-400' : 'text-slate-500'}>{PAGE_ICONS[page.id] || <FileText className="w-4 h-4" />}</span>
                <div>
                  <div className="text-xs font-bold">{page.label}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{page.slug}</div>
                </div>
                <ChevronRight className={`w-3 h-3 ml-auto shrink-0 ${activePageId === page.id ? 'text-amber-400' : 'text-slate-600'}`} />
              </button>
            ))}
          </div>

          {/* Page info */}
          {activePage && (
            <div className="mt-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center space-y-1">
              <div className="text-xs font-bold text-white">{activePage.sections.length} sections</div>
              <div className="text-[10px] text-slate-500">{activePage.sections.filter(s => s.visible).length} visible · {activePage.sections.filter(s => !s.visible).length} hidden</div>
            </div>
          )}
          {activePage && (
            <div className="mt-3 p-4 rounded-xl glass-card space-y-3 text-left">
              <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Page Settings</h4>
              <TextField label="Page name" value={activePage.label} onChange={value => updatePage({ label: value })} />
              <TextField label="URL slug" value={activePage.slug} onChange={value => updatePage({ slug: value.startsWith('/') ? value : `/${value}` })} />
              {activePage.id !== 'home' && (
                <button onClick={deletePage} className="w-full py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold hover:bg-rose-500/20 cursor-pointer flex items-center justify-center gap-1.5">
                  <Trash2 className="w-3 h-3" /> Delete Page
                </button>
              )}
            </div>
          )}
        </div>

        {/* Panel 2: Section list */}
        <div className="col-span-12 md:col-span-4">
          <div className="p-4 rounded-xl glass-card">
            <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-3 flex items-center gap-2">
              <GripVertical className="w-3 h-3" /> Sections — drag to reorder
            </h4>
            {sortedSections.length === 0 ? (
              <p className="text-xs text-slate-600 italic text-center py-6">No sections found.</p>
            ) : (
              <div className="space-y-2">
                {sortedSections.map((section, idx) => (
                  <div
                    key={section.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={e => handleDragOver(e, idx)}
                    onDrop={handleDrop}
                    onClick={() => setSelectedSectionId(section.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedSectionId === section.id
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : section.visible
                          ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                          : 'bg-slate-900/40 border-white/[0.03] opacity-50'
                    } group`}
                  >
                    <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 shrink-0 cursor-grab" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${SECTION_TYPE_COLORS[section.type] || 'text-slate-400 bg-slate-500/10 border-slate-500/20'}`}>
                          {section.type}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-200 mt-0.5 truncate">{section.title}</div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); toggleVisibility(section.id); }}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer shrink-0 ${section.visible ? 'text-emerald-400 hover:text-red-400' : 'text-slate-600 hover:text-slate-300'}`}
                      title={section.visible ? 'Hide section' : 'Show section'}
                    >
                      {section.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel 3: Section content editor */}
        <div className="col-span-12 md:col-span-5">
          {selectedSection ? (
            <div className="p-5 rounded-xl glass-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Section Editor</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleVisibility(selectedSection.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 cursor-pointer transition-colors ${
                      selectedSection.visible
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400'
                        : 'bg-slate-700/40 border-white/10 text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400'
                    }`}
                  >
                    {selectedSection.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {selectedSection.visible ? 'Visible' : 'Hidden'}
                  </button>
                </div>
              </div>

              <SectionEditor
                section={selectedSection}
                onUpdate={newContent => updateSectionContent(selectedSection.id, newContent)}
                triggerToast={triggerToast}
              />

              <div className="pt-3 border-t border-white/5">
                <button
                  onClick={saveChanges}
                  disabled={!hasUnsaved || saving}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600/30 to-orange-600/20 border border-amber-500/30 text-amber-300 font-bold text-xs rounded-xl hover:from-amber-600/40 hover:to-orange-600/30 disabled:opacity-40 disabled:cursor-default flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {saving ? 'Publishing to live site...' : hasUnsaved ? 'Publish All Changes to Live Site' : '✓ All changes saved'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl glass-card flex flex-col items-center justify-center gap-4 text-center h-full min-h-[320px]">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Edit3 className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-300">Select a section to edit</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">Click any section in the middle panel to open its content editor here. Drag sections to reorder them.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
