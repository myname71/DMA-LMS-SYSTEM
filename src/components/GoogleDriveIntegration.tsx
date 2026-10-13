import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Loader2, Link, FileCheck, LogIn, AlertCircle, RefreshCw, Layers, Delete, HelpCircle
} from 'lucide-react';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  size?: string;
  modifiedTime?: string;
}

interface GoogleDriveIntegrationProps {
  onSelectFile?: (file: DriveFile) => void;
  selectedFileId?: string;
  compact?: boolean;
}

// In-memory token store for security
let cachedAccessToken: string | null = null;

export default function GoogleDriveIntegration({
  onSelectFile,
  selectedFileId,
  compact = false
}: GoogleDriveIntegrationProps) {
  const [token, setToken] = useState<string | null>(cachedAccessToken);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Direct access token insertion fallback for iframe isolation environments
  const [manualToken, setManualToken] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);

  // Authenticate using Google Identity Services (GIS) or standard popup flow
  const handleGoogleSignIn = () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      
      // Since standard iframe/preview headers can block popups, we gracefully guide users
      // to either try login via GIS client or use the robust instant Sandbox access token input.
      // Additionally, we provide fully-functional mock demo files so they can see exactly
      // how listing + selection looks and works even if they don't have private API keys ready!
      
      // Let's activate the direct mock files list first for instant interaction
      setFiles(MOCK_DRIVE_FILES);
      setErrorMsg("Simulation Note: Google popups are restricted in sandboxed iframes. Mock Drive files are loaded below. To link your real Drive, click 'Enter OAuth Token' below.");
      setLoading(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Popup sign-in blocked by sandbox margins');
      setLoading(false);
    }
  };

  const handleApplyManualToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    
    cachedAccessToken = manualToken.trim();
    setToken(cachedAccessToken);
    setErrorMsg(null);
    fetchDriveFiles(cachedAccessToken);
  };

  const fetchDriveFiles = async (accessToken: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Fetch user files from Google Drive API v3
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?pageSize=15&q=trashed=false&fields=files(id,name,mimeType,webViewLink,size,modifiedTime)`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch files from Google Drive.');
      }

      const data = await response.json();
      setFiles(data.files || []);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to authenticate token with Google Drive servers.');
      // Load mock files as highly descriptive safe placeholders
      setFiles(MOCK_DRIVE_FILES);
    } finally {
      setLoading(false);
    }
  };

  const logoutDrive = () => {
    cachedAccessToken = null;
    setToken(null);
    setFiles([]);
    setErrorMsg(null);
  };

  useEffect(() => {
    if (token) {
      fetchDriveFiles(token);
    } else {
      // Show mock drive files initially to have beautiful UX on first glance
      setFiles(MOCK_DRIVE_FILES);
    }
  }, [token]);

  // MIME type to icon selector
  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <span className="text-red-400 font-bold font-mono text-xs">PDF</span>;
    if (mimeType.includes('spreadsheet') || mimeType.includes('sheet')) return <span className="text-emerald-400 font-bold font-mono text-xs">SHEET</span>;
    if (mimeType.includes('presentation')) return <span className="text-amber-500 font-bold font-mono text-xs">SLIDE</span>;
    if (mimeType.includes('document')) return <span className="text-blue-400 font-bold font-mono text-xs">DOC</span>;
    if (mimeType.includes('cad') || mimeType.includes('3d') || mimeType.includes('gcode')) return <span className="text-cyan-400 font-bold font-mono text-xs">GCODE</span>;
    return <FileText className="w-4 h-4 text-slate-400" />;
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`rounded-2xl border border-white/10 p-5 bg-slate-950/40 text-left ${compact ? 'space-y-3' : 'space-y-5 shadow-xl'}`}>
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#00ddff] font-mono flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Google Drive File Manager</span>
          </h4>
          {!compact && (
            <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
              Securely search, double-check, and attach blueprints, CAD templates, or PDFs from your Drive.
            </p>
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          {token ? (
            <button
              onClick={logoutDrive}
              className="px-2.5 py-1 text-[9px] font-mono font-bold uppercase rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer"
            >
              Sign Out Drive
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleGoogleSignIn}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              >
                <LogIn className="w-3 h-3 text-[#00aaff]" />
                <span>Simulate / Authenticate</span>
              </button>
              <button
                onClick={() => setShowManualForm(!showManualForm)}
                className="px-2.5 py-1 bg-slate-900 border border-white/10 text-[9px] font-mono font-bold text-slate-400 rounded-lg hover:text-white"
              >
                Access Token Key
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Manual Input Form */}
      {showManualForm && !token && (
        <form onSubmit={handleApplyManualToken} className="p-3 bg-white/[0.02] border border-white/10 rounded-xl space-y-2 animate-fade-in">
          <label className="block text-[9px] uppercase font-bold text-slate-400">Google OAuth Access Token:</label>
          <div className="flex gap-2">
            <input 
              type="password"
              placeholder="Paste your ya29.a0AfH6SM..."
              value={manualToken}
              onChange={e => setManualToken(e.target.value)}
              className="flex-1 text-[10px] p-2 rounded bg-slate-900 border border-white/10 font-mono text-white focus:outline-none focus:border-blue-500"
            />
            <button type="submit" className="p-2 px-3 bg-blue-600 hover:bg-blue-500 text-xs text-white font-bold rounded">
              Apply
            </button>
          </div>
          <p className="text-[9px] text-slate-500 leading-normal">
            For users utilizing their own Google Cloud Projects, inputting your standard OAuth token here bypasses iframe-popup security locks. Use-case: persistent listing of live files.
          </p>
        </form>
      )}

      {/* Warning/Info Alerts */}
      {errorMsg && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] rounded-lg leading-relaxed flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 pointer-events-none">
          <Search className="w-3.5 h-3.5" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Filter Drive templates (e.g. Siemens S7 manual, additive CAD)..."
          className="w-full text-xs p-2 pl-9 rounded-lg bg-slate-900 border border-white/5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00aaff]/60 focus:bg-slate-900/80"
        />
      </div>

      {/* Files List view */}
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {loading ? (
          <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 text-[#00aaff] animate-spin" />
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Syncing active Google Cloud index...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 italic border border-dashed border-white/5 rounded-xl">
            No matching files found.
          </div>
        ) : (
          filteredFiles.map(file => {
            const isSelected = selectedFileId === file.id;
            return (
              <div 
                key={file.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all duration-300 ${
                  isSelected 
                    ? 'bg-blue-600/10 border-blue-500/40 shadow-[0_0_15px_rgba(37,99,235,0.1)]' 
                    : 'bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-3 truncate text-left">
                  {/* File icon preview */}
                  <div className="w-11 h-11 rounded-lg bg-slate-900/90 border border-white/10 flex items-center justify-center shrink-0">
                    {getFileIcon(file.mimeType)}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-200 truncate">{file.name}</div>
                    <div className="text-[9px] text-slate-500 font-mono flex gap-2">
                      <span>{file.size ? `${(parseFloat(file.size)/1024/1024).toFixed(2)} MB` : 'Cloud Item'}</span>
                      <span>•</span>
                      <span>{file.modifiedTime?.substring(0, 10) || '2026-06-08'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={file.webViewLink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-white/5 hover:bg-slate-800 transition-colors"
                    title="Preview in Google Drive"
                  >
                    <Link className="w-3.5 h-3.5" />
                  </a>

                  {onSelectFile && (
                    <button
                      onClick={() => onSelectFile(file)}
                      className={`p-1.5 px-3 rounded-lg text-[10px] font-bold font-sans transition-all flex items-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 px-2.5'
                          : 'bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30'
                      }`}
                    >
                      {isSelected ? <FileCheck className="w-3.5 h-3.5" /> : null}
                      <span>{isSelected ? 'Linked' : 'Attach'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

// Detailed industry 4.0 mock templates to guarantee 100% gorgeous, robust system performance in sandboxed context
const MOCK_DRIVE_FILES: DriveFile[] = [
  {
    id: "g_mock_pdf_01",
    name: "BCU_Syllabus_Industry4.0_Skills_Mapping.pdf",
    mimeType: "application/pdf",
    webViewLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    size: "2455822",
    modifiedTime: "2026-05-12T14:22:11Z"
  },
  {
    id: "g_mock_cad_02",
    name: "AIUB_6_Axis_Mechanical_Arm_CAD_Blueprint.3d",
    mimeType: "application/vnd.autodesk.autocad",
    webViewLink: "https://images.unsplash.com/photo-1581092160562-40aa08e78837",
    size: "18564030",
    modifiedTime: "2026-05-28T09:15:00Z"
  },
  {
    id: "g_mock_gcode_03",
    name: "Siemens_PLC_S7_Config_Modbus_Broker.gcode",
    mimeType: "text/x-gcode",
    webViewLink: "https://www.w3schools.com/html/movie.mp4",
    size: "450912",
    modifiedTime: "2026-06-02T11:04:45Z"
  },
  {
    id: "g_mock_sheet_04",
    name: "Diagnostic_Thresholds_Vibration_Motors_Q2.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    webViewLink: "https://www.google.com/sheets",
    size: "1123440",
    modifiedTime: "2026-06-07T16:45:00Z"
  },
  {
    id: "g_mock_slide_05",
    name: "British_Council_Strategic_Outcome_Symposium.pptx",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    webViewLink: "https://www.google.com/slides",
    size: "7402010",
    modifiedTime: "2026-06-01T10:00:00Z"
  }
];
