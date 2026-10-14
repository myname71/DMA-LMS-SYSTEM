import React, { useState } from 'react';
import { 
  Database, HardDrive, Cpu, 
  Terminal, CheckCircle, FileCode, Copy
} from 'lucide-react';
import { 
  POSTGRES_SCHEMA,
  HOSTING_OPTIMIZATION, WINDOWS_LOCAL_SETUP, 
  ARCHITECTURE_LANDSCAPE 
} from '../data/dbDocsData';

export default function DatabaseDocs() {
  const [activeSegment, setActiveSegment] = useState<'schema' | 'hosting' | 'windows' | 'architecture'>('schema');
  const [copied, setCopied] = useState<string | null>(null);

  const segments = [
    { id: 'schema', label: 'Postgres SQL Schema', icon: Database, source: POSTGRES_SCHEMA },
    { id: 'hosting', label: 'Hostinger Node/Redis', icon: HardDrive, source: HOSTING_OPTIMIZATION },
    { id: 'windows', label: 'Windows Station Setup', icon: Terminal, source: WINDOWS_LOCAL_SETUP },
    { id: 'architecture', label: 'System Landscape', icon: Cpu, source: ARCHITECTURE_LANDSCAPE }
  ];

  const currentSource = segments.find(s => s.id === activeSegment)?.source || "";

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSource);
    setCopied(activeSegment);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="relative text-white min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="code-docs-workspace">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.06),transparent_50%)] z-0 pointer-events-none" />

      {/* Title block */}
      <div className="relative z-10 text-left space-y-4 border-b border-white/10 pb-6 mb-8">
        <div>
          <span className="text-xs font-bold text-blue-400 uppercase block mb-1">
            DIGITAL MANUFACTURING ACADEMY • ARCHITECTURE MANUAL
          </span>
          <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2 font-sans">
            <FileCode className="w-6 h-6 text-blue-400" />
            <span>Developer Code & SQL Database Workspace</span>
          </h2>
          <p className="text-xs text-slate-400">
            Explore fully detailed model tables, server proxies, Hostinger server deployment optimizations, and Windows offline workstation setups.
          </p>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        {/* Left column options index selector */}
        <div className="lg:col-span-4 space-y-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1 mb-2">Technical Categories</h3>
          
          {segments.map(s => {
            const isCurrent = activeSegment === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSegment(s.id as any)}
                className={`w-full flex items-center gap-3.5 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  isCurrent 
                    ? 'border-blue-500 bg-blue-600/10 shadow-lg shadow-blue-550/5' 
                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
              >
                <s.icon className={`w-5 h-5 ${isCurrent ? 'text-blue-400' : 'text-slate-400'}`} />
                <div>
                  <div className={`text-xs font-bold ${isCurrent ? 'text-white' : 'text-slate-200'}`}>
                    {s.label}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono capitalize">
                    {s.id === 'schema' ? 'Cascade constraints schemas' : s.id === 'hosting' ? 'Phusion reverse proxy guide' : s.id === 'windows' ? 'Offline workstation setup' : 'System overview'}
                  </div>
                </div>
              </button>
            );
          })}

          <div className="p-4 rounded-xl border border-dashed border-white/10 bg-white/[0.01] text-[11px] text-slate-400 leading-relaxed font-sans space-y-3">
            <div className="flex gap-2 text-emerald-400 font-bold items-center">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Production Config Valid</span>
            </div>
            <p>Database migrations leverage relational keys and cascade deletion triggers. Feel free to copy these SQL definitions and run directly into your PostgreSQL or phpMyAdmin environments.</p>
          </div>
        </div>

        {/* Right column: code display canvas view */}
        <div className="lg:col-span-8 flex flex-col h-full rounded-2xl border border-white/10 bg-[#030712]/75 backdrop-blur-md shadow-inner overflow-hidden">
          {/* Editor Header console bar bar */}
          <div className="bg-white/5 border-b border-white/10 p-3.5 flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-teal-500/80" />
              <span className="ml-1 text-slate-500">
                {activeSegment === 'schema' ? 'postgres_mysql_schema.sql' : activeSegment === 'hosting' ? 'hostinger_node_guide.txt' : activeSegment === 'windows' ? 'windows_setup_guide.txt' : 'system_landscape.md'}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="p-1 px-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 flex items-center gap-1 text-slate-200 transition-all font-sans font-bold text-[10px] cursor-pointer"
            >
              {copied === activeSegment ? (
                <>
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 text-[10px]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Code block</span>
                </>
              )}
            </button>
          </div>

          {/* Source display container scrollable */}
          <div className="flex-1 p-5 overflow-auto text-xs font-mono text-slate-350 bg-slate-950/40 leading-relaxed max-h-[580px] word-break-all whitespace-pre">
            {currentSource}
          </div>
        </div>
      </div>
    </div>
  );
}
