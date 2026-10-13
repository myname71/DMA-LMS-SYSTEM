import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface CMSPageRendererProps {
  page: {
    label: string;
    sections?: Array<{
      id: string;
      type: string;
      title: string;
      order?: number;
      visible?: boolean;
      content?: Record<string, any>;
    }>;
  };
}

function SectionImage({ src, alt }: { src?: string; alt: string }) {
  if (!src) return null;
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-950 shadow-xl">
      <img src={src} alt={alt} className="w-full max-h-[380px] object-cover" />
    </div>
  );
}

export default function CMSPageRenderer({ page }: CMSPageRendererProps) {
  const sections = [...(page.sections || [])]
    .filter(section => section.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <main className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-5xl mx-auto space-y-10">
        {sections.map(section => {
          const content = section.content || {};
          const items = Array.isArray(content.items) ? content.items : [];
          return (
            <section key={section.id} className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 sm:p-10 space-y-6">
              <div className="space-y-3">
                {content.badge && <span className="text-xs font-bold uppercase tracking-widest text-blue-400">{content.badge}</span>}
                <h1 className="text-2xl sm:text-4xl font-extrabold">{content.title || content.headline || section.title}</h1>
                {content.subtitle && <p className="text-blue-400 font-bold">{content.subtitle}</p>}
                {content.body && <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{content.body}</p>}
                {content.description && <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{content.description}</p>}
              </div>

              <SectionImage src={content.imageUrl || content.image} alt={section.title} />

              {items.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {items.map((item: any, index: number) => (
                    <article key={item.id || index} className="rounded-2xl border border-white/10 bg-slate-950/50 p-5 space-y-3">
                      {item.imageUrl && <img src={item.imageUrl} alt={item.title || item.name || `Item ${index + 1}`} className="w-full h-36 object-cover rounded-xl" />}
                      {item.icon && <div className="text-2xl">{item.icon}</div>}
                      <h2 className="text-sm font-extrabold text-white">{item.title || item.name || item.q}</h2>
                      <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">{item.desc || item.a || item.text || item.count || ''}</p>
                    </article>
                  ))}
                </div>
              )}

              {content.primaryCTA && <span className="inline-flex px-4 py-2 rounded-lg bg-blue-600 text-xs font-bold">{content.primaryCTA}</span>}
            </section>
          );
        })}
        {sections.length === 0 && (
          <div className="py-24 text-center text-slate-500">
            <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>This page has no published sections yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}