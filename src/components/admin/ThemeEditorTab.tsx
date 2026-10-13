import React, { useState, useEffect } from 'react';
import { Palette, RotateCcw, Save, Check, Monitor } from 'lucide-react';
import { getAuthHeaders } from '../../lib/session';

interface ThemeSettings {
  accentColor: string;
  accentHover: string;
  accentLight: string;
  bgColor: string;
  bgMid: string;
  cardRadius: string;
  fontHeading: string;
  preset: string;
}

const DEFAULT_THEME: ThemeSettings = {
  accentColor: '#2563eb',
  accentHover: '#1d4ed8',
  accentLight: '#3b82f6',
  bgColor: '#020617',
  bgMid: '#090d1f',
  cardRadius: '1rem',
  fontHeading: 'Space Grotesk',
  preset: 'ocean',
};

const PRESETS: { id: string; name: string; emoji: string; theme: Partial<ThemeSettings> }[] = [
  {
    id: 'ocean',
    name: 'Ocean',
    emoji: '🌊',
    theme: { accentColor: '#2563eb', accentHover: '#1d4ed8', accentLight: '#3b82f6', bgColor: '#020617', bgMid: '#090d1f' },
  },
  {
    id: 'violet',
    name: 'Violet',
    emoji: '🔮',
    theme: { accentColor: '#7c3aed', accentHover: '#6d28d9', accentLight: '#8b5cf6', bgColor: '#0d0a1a', bgMid: '#130f28' },
  },
  {
    id: 'emerald',
    name: 'Emerald',
    emoji: '🌿',
    theme: { accentColor: '#059669', accentHover: '#047857', accentLight: '#10b981', bgColor: '#020f09', bgMid: '#041810' },
  },
  {
    id: 'amber',
    name: 'Amber',
    emoji: '🔥',
    theme: { accentColor: '#d97706', accentHover: '#b45309', accentLight: '#f59e0b', bgColor: '#0f0a02', bgMid: '#1a1004' },
  },
  {
    id: 'rose',
    name: 'Rose',
    emoji: '🌹',
    theme: { accentColor: '#e11d48', accentHover: '#be123c', accentLight: '#f43f5e', bgColor: '#0f0208', bgMid: '#1a040f' },
  },
];

const FONTS = ['Space Grotesk', 'Inter', 'Sora', 'Outfit', 'DM Sans'];
const RADII = [
  { label: 'Sharp', value: '0.25rem' },
  { label: 'Default', value: '1rem' },
  { label: 'Rounded', value: '1.5rem' },
  { label: 'Pill', value: '9999px' },
];

function applyTheme(t: ThemeSettings) {
  const root = document.documentElement;
  root.style.setProperty('--dma-accent', t.accentColor);
  root.style.setProperty('--dma-accent-hover', t.accentHover);
  root.style.setProperty('--dma-accent-light', t.accentLight);
  root.style.setProperty('--dma-bg', t.bgColor);
  root.style.setProperty('--dma-bg-mid', t.bgMid);
  root.style.setProperty('--dma-radius-card', t.cardRadius);
  root.style.setProperty('--dma-font-heading', `"${t.fontHeading}", sans-serif`);
  document.body.style.backgroundColor = t.bgColor;
}

interface ThemeEditorTabProps {
  triggerToast: (msg: string, type?: 'success' | 'warn') => void;
}

export default function ThemeEditorTab({ triggerToast }: ThemeEditorTabProps) {
  const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME);
  const [savedTheme, setSavedTheme] = useState<ThemeSettings>(DEFAULT_THEME);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/theme')
      .then(r => r.json())
      .then((data: ThemeSettings) => {
        if (data && data.accentColor) {
          setTheme(data);
          setSavedTheme(data);
          applyTheme(data);
        }
      })
      .catch(() => {});
  }, []);

  const update = (patch: Partial<ThemeSettings>) => {
    const next = { ...theme, ...patch };
    setTheme(next);
    applyTheme(next);
  };

  const applyPreset = (presetId: string) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    update({ ...preset.theme, preset: presetId });
  };

  const resetToDefault = () => {
    update({ ...DEFAULT_THEME });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(theme),
      });
      if (res.ok) {
        setSavedTheme(theme);
        setSaved(true);
        triggerToast('Theme saved successfully!', 'success');
        setTimeout(() => setSaved(false), 2500);
      } else {
        triggerToast('Failed to save theme', 'warn');
      }
    } catch {
      triggerToast('Network error saving theme', 'warn');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(theme) !== JSON.stringify(savedTheme);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-bold uppercase text-slate-300 flex items-center gap-2">
            <Palette className="w-4 h-4 text-blue-400" />
            Site Theme Editor
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Customise colours, typography and shape radius. Changes preview live on the page.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetToDefault}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[11px] font-bold text-slate-400 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] font-bold transition-all cursor-pointer"
          >
            {saved ? <><Check className="w-3 h-3" /> Saved!</> : saving ? 'Saving…' : <><Save className="w-3 h-3" /> Save Theme</>}
          </button>
        </div>
      </div>

      {/* Presets */}
      <div className="space-y-3">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Colour Presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                theme.preset === p.id
                  ? 'border-blue-500/50 bg-blue-500/15 text-blue-300'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <span
                className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                style={{ backgroundColor: p.theme.accentColor }}
              />
              {p.emoji} {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colours */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Primary Accent', key: 'accentColor' as const, desc: 'Buttons, links, highlights' },
          { label: 'Accent (Hover)', key: 'accentHover' as const, desc: 'Button hover state' },
          { label: 'Accent Light', key: 'accentLight' as const, desc: 'Icons, badges, borders' },
          { label: 'Background', key: 'bgColor' as const, desc: 'Main page background' },
          { label: 'Background Mid', key: 'bgMid' as const, desc: 'Mid-section gradient' },
        ].map(({ label, key, desc }) => (
          <div key={key} className="p-4 rounded-xl glass-card space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">{label}</p>
                <p className="text-[10px] text-slate-500">{desc}</p>
              </div>
              <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-white/20 shrink-0 cursor-pointer">
                <div className="w-full h-full" style={{ backgroundColor: theme[key] }} />
                <input
                  type="color"
                  value={theme[key]}
                  onChange={e => update({ [key]: e.target.value, preset: 'custom' })}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded border border-white/10 shrink-0" style={{ backgroundColor: theme[key] }} />
              <input
                type="text"
                value={theme[key]}
                onChange={e => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && update({ [key]: e.target.value, preset: 'custom' })}
                className="flex-1 bg-transparent text-[11px] font-mono text-slate-300 focus:outline-none"
                maxLength={7}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Typography */}
      <div className="space-y-3">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Heading Font</p>
        <div className="flex flex-wrap gap-2">
          {FONTS.map(f => (
            <button
              key={f}
              onClick={() => update({ fontHeading: f })}
              className={`px-3.5 py-2 rounded-xl text-xs border transition-all cursor-pointer ${
                theme.fontHeading === f
                  ? 'border-blue-500/50 bg-blue-500/15 text-blue-300 font-bold'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
              style={{ fontFamily: `"${f}", sans-serif` }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Border Radius */}
      <div className="space-y-3">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Card Border Radius</p>
        <div className="flex flex-wrap gap-2">
          {RADII.map(r => (
            <button
              key={r.value}
              onClick={() => update({ cardRadius: r.value })}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                theme.cardRadius === r.value
                  ? 'border-blue-500/50 bg-blue-500/15 text-blue-300'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Preview */}
      <div className="space-y-3">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Monitor className="w-3.5 h-3.5" /> Live Preview
        </p>
        <div
          className="p-6 rounded-2xl border border-white/10 space-y-4"
          style={{ backgroundColor: theme.bgColor, borderRadius: theme.cardRadius }}
        >
          <h4 className="font-extrabold text-xl text-white" style={{ fontFamily: `"${theme.fontHeading}", sans-serif` }}>
            Digital Manufacturing <span style={{ color: theme.accentLight }}>Academy</span>
          </h4>
          <p className="text-sm text-slate-400">This is how your accent colour and typography will look across the site.</p>
          <div className="flex flex-wrap gap-2">
            <button
              className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-all"
              style={{ backgroundColor: theme.accentColor, borderRadius: theme.cardRadius }}
            >
              Primary Button
            </button>
            <button
              className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-all border"
              style={{ backgroundColor: 'transparent', borderColor: theme.accentColor, color: theme.accentLight, borderRadius: theme.cardRadius }}
            >
              Outline Button
            </button>
            <span
              className="px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ backgroundColor: `${theme.accentColor}20`, color: theme.accentLight, borderRadius: '9999px' }}
            >
              Badge
            </span>
          </div>
        </div>
      </div>

      {hasChanges && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 font-medium">
          ⚠ You have unsaved changes. Click <strong>Save Theme</strong> to persist them across sessions.
        </div>
      )}
    </div>
  );
}
