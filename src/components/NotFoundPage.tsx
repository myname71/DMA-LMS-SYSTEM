import React from 'react';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';

interface NotFoundPageProps {
  onNavigateHome: () => void;
}

export default function NotFoundPage({ onNavigateHome }: NotFoundPageProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center relative">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-lg space-y-8">
        {/* Icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl" />
          <div className="relative w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-blue-400" />
          </div>
        </div>

        {/* Error code */}
        <div>
          <div className="text-[120px] font-extrabold leading-none bg-gradient-to-b from-slate-700 to-slate-900 bg-clip-text text-transparent select-none">
            404
          </div>
          <div className="text-xs font-bold text-blue-400 uppercase tracking-widest font-mono -mt-4 mb-4">
            Page Not Found
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-3">
            This page doesn't exist
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            The page you're looking for may have been moved, deleted, or never existed.
            Check the URL or navigate back to the Digital Manufacturing Academy.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all cursor-pointer shadow-lg shadow-blue-900/40"
          >
            <Home className="w-4 h-4" />
            Go to Home
          </button>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white font-bold text-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Suggestions */}
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/50 text-left">
          <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-3">You might be looking for</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Courses', page: 'courses' },
              { label: 'Events', page: 'events' },
              { label: 'About', page: 'about' },
              { label: 'Contact', page: 'contact' },
            ].map(item => (
              <button
                key={item.page}
                onClick={() => onNavigateHome()}
                className="text-xs text-blue-400 hover:text-blue-300 text-left transition-colors cursor-pointer font-mono"
              >
                → {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
