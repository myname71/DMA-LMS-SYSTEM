import React, { useState, useEffect, useRef } from 'react';
import {
  Upload, Trash2, Image, Flag, CheckCircle2, X, FolderOpen
} from 'lucide-react';
import { MediaItem } from '../../types';
import { getAuthHeaders } from '../../lib/session';

interface Props {
  triggerToast: (msg: string, type?: 'success' | 'warn') => void;
}

const BANNER_TARGETS = [
  { value: 'hero_banner', label: 'Hero Banner' },
  { value: 'course_thumbnail', label: 'Course Thumbnail' },
  { value: 'about_banner', label: 'About Page Banner' },
  { value: 'email_header', label: 'Email Header' },
];

export default function MediaLibraryTab({ triggerToast }: Props) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [bannerTarget, setBannerTarget] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchMedia(); }, []);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/media', { headers: getAuthHeaders() });
      const d = await r.json();
      if (d.status === 'success') setMedia(d.media || []);
    } catch { /* silent */ }
    setLoading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files) as File[]) {
        const dataUrl = await readFileAsDataUrl(file);
        const r = await fetch('/api/admin/media/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({ name: file.name, dataUrl, type: file.type.startsWith('image') ? 'image' : 'document' }),
        });
        const d = await r.json();
        if (d.status !== 'success') {
          triggerToast(`Failed to upload ${file.name}`, 'warn');
        }
      }
      triggerToast(`${files.length} file(s) uploaded successfully.`);
      fetchMedia();
    } catch {
      triggerToast('Upload error occurred', 'warn');
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    try {
      const r = await fetch(`/api/admin/media/${item.id}`, { method: 'DELETE', headers: getAuthHeaders() });
      const d = await r.json();
      if (d.status === 'success') {
        triggerToast('Media deleted.', 'warn');
        if (previewItem?.id === item.id) setPreviewItem(null);
        fetchMedia();
      } else {
        triggerToast(d.error || 'Failed to delete', 'warn');
      }
    } catch { triggerToast('Network error', 'warn'); }
  };

  const handleSetBanner = async (item: MediaItem) => {
    const target = bannerTarget[item.id];
    if (!target) { triggerToast('Select a banner target first', 'warn'); return; }
    try {
      const r = await fetch(`/api/admin/media/${item.id}/set-banner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ target }),
      });
      const d = await r.json();
      if (d.status === 'success') {
        triggerToast(`"${item.name}" set as ${target.replace('_', ' ')}.`);
        fetchMedia();
      } else {
        triggerToast(d.error || 'Failed to set banner', 'warn');
      }
    } catch { triggerToast('Network error', 'warn'); }
  };

  const formatDate = (iso: string) => iso.substring(0, 10);
  const formatSize = (dataUrl: string) => {
    const bytes = Math.round((dataUrl.length * 3) / 4);
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold uppercase text-slate-300">Media Library</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">{media.length} asset{media.length !== 1 ? 's' : ''} stored · Upload images for banners and course thumbnails</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-[#00aaff]/30 bg-[#00aaff]/10 text-[#00aaff] hover:bg-[#00aaff]/20 cursor-pointer transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <><span className="animate-spin text-sm">⟳</span> Uploading...</>
          ) : (
            <><Upload className="w-3.5 h-3.5" /> Upload Files</>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs italic">Loading media...</div>
      ) : media.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-white/10 space-y-3">
          <FolderOpen className="w-10 h-10 text-slate-700 mx-auto" />
          <p className="text-slate-500 text-xs">No media uploaded yet.</p>
          <button onClick={() => fileInputRef.current?.click()}
            className="text-xs text-[#00aaff] hover:underline cursor-pointer">Upload your first image →</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {media.map(item => (
            <div key={item.id} className="group relative rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden hover:border-white/20 transition-all duration-200">
              {/* Thumbnail */}
              <div className="aspect-square bg-slate-900 cursor-pointer" onClick={() => setPreviewItem(item)}>
                {item.type === 'image' ? (
                  <img src={item.dataUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-8 h-8 text-slate-600" />
                  </div>
                )}
                {item.usedAs && (
                  <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-teal-500/80 text-[8px] font-bold text-white">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    {item.usedAs.replace('_', ' ')}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-2 space-y-1.5">
                <p className="text-[10px] text-slate-300 font-medium truncate" title={item.name}>{item.name}</p>
                <p className="text-[9px] text-slate-600 font-mono">{formatDate(item.uploadedAt)} · {formatSize(item.dataUrl)}</p>

                {/* Banner assign */}
                <div className="flex gap-1">
                  <select
                    value={bannerTarget[item.id] || ''}
                    onChange={e => setBannerTarget(p => ({ ...p, [item.id]: e.target.value }))}
                    className="flex-1 text-[9px] p-1 rounded bg-white/5 border border-white/10 text-slate-400 cursor-pointer"
                  >
                    <option value="">Set as...</option>
                    {BANNER_TARGETS.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleSetBanner(item)}
                    title="Set as banner"
                    className="p-1 rounded bg-teal-500/10 border border-teal-500/20 text-teal-400 hover:bg-teal-500/20 cursor-pointer transition-colors"
                  >
                    <Flag className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(item)}
                  className="w-full flex items-center justify-center gap-1 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-bold hover:bg-rose-500/20 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-2.5 h-2.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreviewItem(null)}>
          <div className="relative max-w-3xl w-full rounded-2xl overflow-hidden border border-white/10 bg-slate-950" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewItem(null)} className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 cursor-pointer z-10">
              <X className="w-4 h-4" />
            </button>
            <img src={previewItem.dataUrl} alt={previewItem.name} className="w-full max-h-[80vh] object-contain" />
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">{previewItem.name}</p>
                <p className="text-xs text-slate-500">{formatDate(previewItem.uploadedAt)} · {formatSize(previewItem.dataUrl)}</p>
              </div>
              {previewItem.usedAs && (
                <span className="text-[10px] font-bold px-2 py-1 rounded bg-teal-500/15 border border-teal-500/20 text-teal-400">
                  Used as: {previewItem.usedAs.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
