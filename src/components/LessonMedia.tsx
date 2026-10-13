import React, { useState } from 'react';
import {
  FileText, ExternalLink, ChevronLeft, ChevronRight, Download,
  Presentation, Video, AlertCircle, Layers,
} from 'lucide-react';
import { resolveVideoEmbed, isPublicDocument, pdfEmbedUrl } from '../lib/media';

export interface LessonLike {
  id?: string;
  title?: string;
  type?: string;              // video | pdf | pptx | assignment
  contentUrl?: string;        // public URL (video / pdf / deck)
  videoSource?: 'file' | 'youtube' | 'vimeo';
  richTextContent?: string;
  slides?: { title?: string; content?: string; bullets?: string[]; image?: string }[];
  duration?: string;
}

/**
 * Renders whatever media a lesson carries:
 *  - video → YouTube/Vimeo/Drive/any public URL (iframe) or a direct file (<video>)
 *  - pdf   → embedded viewer with a page slider (prev/next + jump)
 *  - pptx  → built-in slide slider when slides exist, otherwise an embedded deck
 *  - anything else → readable notice card
 */
export default function LessonMedia({ lesson }: { lesson: LessonLike }) {
  const type = (lesson.type || 'video').toLowerCase();
  const url = lesson.contentUrl || '';
  const title = lesson.title || 'Lesson';

  // ── video ──────────────────────────────────────────────────────────────────
  if (type === 'video') {
    const embed = resolveVideoEmbed(url, lesson.videoSource);
    if (embed.kind === 'iframe') {
      return (
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/5 shadow-2xl">
          <iframe
            src={embed.src}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            title={title}
          />
        </div>
      );
    }
    if (embed.kind === 'video') {
      return (
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/5 shadow-2xl">
          <video src={embed.src} controls playsInline className="absolute inset-0 w-full h-full" title={title} />
        </div>
      );
    }
    return <Notice icon={Video} title="No video link attached" body="This lesson has no playable video URL yet. Add a YouTube, Vimeo, Google Drive, .mp4 or any public video link in the course editor." raw={url} />;
  }

  // ── pdf (page slider via the browser PDF viewer) ────────────────────────────
  if (type === 'pdf') {
    const [page, setPage] = useState(1);
    if (!isPublicDocument(url)) {
      return <Notice icon={FileText} title="No PDF link attached" body="Add a public PDF URL (https://…) to this lesson to display it here." raw={url} />;
    }
    return (
      <div className="relative w-full rounded-xl overflow-hidden border border-white/5 shadow-2xl bg-slate-950">
        <div className="flex items-center justify-between gap-3 px-4 py-2 bg-slate-900/90 border-b border-white/5">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-blue-400 font-extrabold tracking-wider uppercase truncate">
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">PDF Reader · {title}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 disabled:opacity-40 cursor-pointer transition-colors" title="Previous page">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-400 px-2 py-1 rounded bg-white/5 border border-white/10">page {page}</span>
            <button type="button" onClick={() => setPage(p => p + 1)}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 cursor-pointer transition-colors" title="Next page">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <a href={url} target="_blank" rel="noreferrer"
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors" title="Open in a new tab">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a href={url} download
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors" title="Download PDF">
              <Download className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
        <div style={{ position: 'relative', paddingTop: '68%' }}>
          <iframe
            key={page}
            src={pdfEmbedUrl(url, page)}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            title={title}
          />
        </div>
        <p className="px-4 py-2 text-[10px] text-slate-500 border-t border-white/5">
          If the document does not render, use <span className="text-slate-300">Open in a new tab</span> — some browsers block inline PDFs from external hosts.
        </p>
      </div>
    );
  }

  // ── pptx / slides ──────────────────────────────────────────────────────────
  if (type === 'pptx' || type === 'slides') {
    const slides = Array.isArray(lesson.slides) ? lesson.slides : [];
    if (slides.length > 0) return <SlideDeck title={title} slides={slides} url={url} />;
    if (isPublicDocument(url)) {
      return (
        <div className="relative w-full rounded-xl overflow-hidden border border-white/5 shadow-2xl bg-slate-950">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-white/5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-blue-400 font-extrabold tracking-wider uppercase">
              <Presentation className="w-3.5 h-3.5" /> Slide deck (embedded)
            </div>
            <a href={url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:underline flex items-center gap-1">
              Open <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div style={{ position: 'relative', paddingTop: '56.25%' }}>
            <iframe src={url} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} allowFullScreen title={title} />
          </div>
        </div>
      );
    }
    return <Notice icon={Presentation} title="Slide deck not attached" body="Add slides in the course editor, or a public Google Slides / PowerPoint link." raw={url} />;
  }

  // ── assignment / unknown ───────────────────────────────────────────────────
  return (
    <Notice
      icon={Layers}
      title={lesson.title || 'Lesson material'}
      body={lesson.richTextContent?.replace(/[#*_`>-]/g, '').slice(0, 400)
        || 'Read the instructions for this activity, then submit your work from the Assignments panel.'}
      raw={url}
    />
  );
}

/* ── internal pieces ─────────────────────────────────────────────────────── */

function SlideDeck({ title, slides, url }: { title: string; slides: NonNullable<LessonLike['slides']>; url?: string }) {
  const [index, setIndex] = useState(0);
  const slide = slides[Math.min(index, slides.length - 1)] || {};
  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-white/5 shadow-2xl bg-slate-950">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-white/5">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-blue-400 font-extrabold tracking-wider uppercase truncate">
          <Presentation className="w-3.5 h-3.5 shrink-0" /> Slides · {title}
        </div>
        <span className="text-[10px] font-mono text-slate-400">{index + 1} / {slides.length}</span>
      </div>

      <div className="p-6 sm:p-10 min-h-[280px] space-y-4">
        {slide.title && <h4 className="text-lg font-extrabold text-white leading-snug">{slide.title}</h4>}
        {slide.image && <img src={slide.image} alt="" className="w-full max-h-72 object-contain rounded-lg border border-white/5" />}
        {slide.content && <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{slide.content}</p>}
        {Array.isArray(slide.bullets) && slide.bullets.length > 0 && (
          <ul className="space-y-2">
            {slide.bullets.map((b, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300 leading-relaxed">
                <span className="text-blue-400 mt-0.5">▸</span><span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-slate-900/60">
        <button type="button" onClick={() => setIndex(i => Math.max(0, i - 1))} disabled={index === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs font-bold hover:bg-white/10 disabled:opacity-40 cursor-pointer transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" /> Prev
        </button>
        <div className="flex gap-1">
          {slides.map((_, i) => (
            <button key={i} type="button" onClick={() => setIndex(i)} title={`Slide ${i + 1}`}
              className={`w-1.5 h-1.5 rounded-full transition-colors cursor-pointer ${i === index ? 'bg-blue-400' : 'bg-white/20 hover:bg-white/40'}`} />
          ))}
        </div>
        <button type="button" onClick={() => setIndex(i => Math.min(slides.length - 1, i + 1))} disabled={index >= slides.length - 1}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 disabled:opacity-40 cursor-pointer transition-colors">
          Next <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      {url && (
        <p className="px-4 pb-3 text-[10px] text-slate-500 truncate">Source: <a className="text-blue-400 hover:underline" href={url} target="_blank" rel="noreferrer">{url}</a></p>
      )}
    </div>
  );
}

function Notice({ icon: Icon, title, body, raw }: { icon: any; title: string; body: string; raw?: string }) {
  return (
    <div className="relative w-full rounded-xl border border-white/5 bg-slate-950/70 p-6 space-y-3">
      <div className="flex items-center gap-2 text-blue-400">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-extrabold uppercase tracking-wider">{title}</span>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed">{body}</p>
      {raw && <p className="text-[10px] font-mono text-slate-600 truncate">URL: {raw}</p>}
      <p className="text-[10px] text-amber-400/80 flex items-center gap-1.5">
        <AlertCircle className="w-3 h-3" /> Attach the file/link from Admin → Courses (or Instructor → CMS) to enable this player.
      </p>
    </div>
  );
}
