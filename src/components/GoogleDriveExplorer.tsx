import React, { useState, useEffect } from 'react';
import { 
  File, Video, FileText, Layout, ChevronRight, 
  Search, Folder, ExternalLink, RefreshCw, AlertCircle, Check, Key
} from 'lucide-react';

interface GoogleDriveExplorerProps {
  onSelectFile: (file: { name: string; url: string; type: 'video' | 'pdf' | 'assignment' }) => void;
  onClose: () => void;
  defaultType?: 'video' | 'pdf' | 'assignment';
}

const SANDBOX_DRIVE_FILES = [
  { id: 'sb_1', name: 'Digital_Twin_Milling_Setup.pdf', mimeType: 'application/pdf', size: '1.2 MB', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
  { id: 'sb_2', name: 'GCODE_Robotics_Arm_Simulation_Calibration.pdf', mimeType: 'application/pdf', size: '3.4 MB', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
  { id: 'sb_3', name: 'BCU_Industry_5_0_Framework.pptx', mimeType: 'application/vnd.google-apps.presentation', size: '8.1 MB', url: 'https://www.google.com/slides/about/' },
  { id: 'sb_4', name: 'Additive_3D_Metal_Printer_Laser.mp4', mimeType: 'video/mp4', size: '24.5 MB', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 'sb_5', name: 'Fanuc_CNC_G01_Linear_Interpolation_Course.mp4', mimeType: 'video/mp4', size: '18.2 MB', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 'sb_6', name: 'TwinCAT_Beckhoff_PLC_Variables_Assignment.pdf', mimeType: 'application/pdf', size: '850 KB', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' },
];

export default function GoogleDriveExplorer({ onSelectFile, onClose, defaultType }: GoogleDriveExplorerProps) {
  const [token, setToken] = useState<string>(() => localStorage.getItem('dma_gd_access_token') || '');
  const [clientId, setClientId] = useState<string>(() => localStorage.getItem('dma_gd_client_id') || '102872365287-tup42g8isof50v63c7r0n96369527n9s.apps.googleusercontent.com');
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState<boolean>(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  useEffect(() => {
    // Listen for OAuth messages from popup window
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'GOOGLE_DRIVE_AUTH_SUCCESS') {
        const accessToken = event.data.token;
        setToken(accessToken);
        localStorage.setItem('dma_gd_access_token', accessToken);
        setError('');
        fetchRealDriveFiles(accessToken);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (token) {
      fetchRealDriveFiles(token);
    } else {
      // populate with sandbox default simulation files initially
      setFiles(SANDBOX_DRIVE_FILES);
    }
  }, [token]);

  const triggerGoogleAuth = () => {
    localStorage.setItem('dma_gd_client_id', clientId);
    const scope = encodeURIComponent('https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.metadata.readonly');
    const redirectUri = encodeURIComponent(window.location.origin + '/drive-callback');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}&prompt=consent`;
    
    // Open standard sized popup
    const width = 600;
    const height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    window.open(authUrl, 'google_drive_oauth', `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`);
  };

  const fetchRealDriveFiles = async (accessToken: string) => {
    setLoading(true);
    setError('');
    try {
      // Call Google Drive v3 REST API to list files
      const url = `https://www.googleapis.com/drive/v3/files?pageSize=20&fields=files(id,name,mimeType,size,webViewLink,webContentLink)&q=trashed=false`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Google API returned status ${response.status}`);
      }
      
      const data = await response.json();
      if (data.files && data.files.length > 0) {
        setFiles(data.files);
      } else {
        setFiles([]);
        setError('No files found in your Google Drive cloud workspace.');
      }
    } catch (err: any) {
      console.error('Error listing Google Drive files:', err);
      setError('OAuth Credentials expired or Google Drive API permissions failed. Showing academy pre-loaded sandbox files.');
      setFiles(SANDBOX_DRIVE_FILES);
    } finally {
      setLoading(false);
    }
  };

  const handleManualTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      localStorage.setItem('dma_gd_access_token', token.trim());
      setShowTokenInput(false);
      fetchRealDriveFiles(token.trim());
    }
  };

  const clearCredentials = () => {
    setToken('');
    localStorage.removeItem('dma_gd_access_token');
    setFiles(SANDBOX_DRIVE_FILES);
    setError('');
  };

  const getIconForMimeType = (mime: string) => {
    if (mime.includes('pdf')) return <FileText className="w-5 h-5 text-red-400 shrink-0" />;
    if (mime.includes('video') || mime.includes('mp4')) return <Video className="w-5 h-5 text-blue-400 shrink-0" />;
    if (mime.includes('presentation') || mime.includes('powerpoint')) return <Layout className="w-5 h-5 text-amber-500 shrink-0" />;
    return <File className="w-5 h-5 text-slate-400 shrink-0" />;
  };

  const inferLessonType = (mime: string, name: string): 'video' | 'pdf' | 'assignment' => {
    const lname = name.toLowerCase();
    if (mime.includes('video') || mime.includes('mp4') || lname.endsWith('.mp4') || lname.endsWith('.mov')) return 'video';
    if (lname.includes('assignment') || lname.includes('homework') || lname.includes('gcode')) return 'assignment';
    return 'pdf';
  };

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (defaultType) {
      // filter files depending on what course creator is requesting
      const inf = inferLessonType(f.mimeType || '', f.name);
      return inf === defaultType;
    }
    return true;
  });

  const selectAndAttach = (file: any) => {
    setSelectedFileId(file.id);
    const inferredType = inferLessonType(file.mimeType || '', file.name);
    // Google Drive webViewLink serves as active external content, or we proxy
    const finalUrl = file.webViewLink || file.url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    
    setTimeout(() => {
      onSelectFile({
        name: file.name,
        url: finalUrl,
        type: inferredType
      });
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in text-left">
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0f172a]/95 p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header section */}
        <div className="flex justify-between items-start border-b border-white/10 pb-4">
          <div>
            <div className="text-[10px] uppercase font-mono font-bold tracking-widest text-blue-400 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>Google Drive Cloud Workspace</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-100">Synchronized Media Importer</h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 cursor-pointer text-xs font-bold uppercase p-1.5 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/15"
          >
            ✕ Close
          </button>
        </div>

        {/* Authenticated Mode details row */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3.5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`p-2.5 rounded-xl ${token ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                {token ? <Check className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">
                  {token ? 'Linked to Google Drive Cloud storage' : 'Sandbox Simulated Storage Mode'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {token ? 'Retrieving files from live authenticated folders' : 'Displaying standard Academy G-Code and PDF blueprints'}
                </div>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              {token ? (
                <button
                  type="button"
                  onClick={clearCredentials}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-[11px] font-bold text-slate-300 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
                >
                  Disconnect Drive
                </button>
              ) : (
                <div className="flex gap-2 w-full">
                  <button
                    type="button"
                    onClick={triggerGoogleAuth}
                    className="flex-1 sm:flex-none px-4.5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Folder className="w-3.5 h-3.5" />
                    Connect Google Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTokenInput(!showTokenInput)}
                    className="px-3 py-2.5 rounded-lg border border-white/5 bg-white/5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    title="Manual Token Input"
                  >
                    <Key className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Config Client ID / Manual Token Section */}
          {hasInputParams(showTokenInput) && (
            <div className="pt-2 border-t border-white/5 space-y-4 animate-fade-in">
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                    Google Client ID (Configured automatically)
                  </label>
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="Enter your oauth2 Client ID"
                    className="w-full text-xs font-mono p-2.5 rounded-lg border border-white/5 bg-[#0f172a] text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                    Manual Access Token Override
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Paste your OAuth access_token from Google Console"
                      className="flex-1 text-xs font-mono p-2.5 rounded-lg border border-white/5 bg-[#0f172a] text-slate-300 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (token) {
                          localStorage.setItem('dma_gd_access_token', token);
                          fetchRealDriveFiles(token);
                          setShowTokenInput(false);
                        }
                      }}
                      className="px-4 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-extrabold text-white cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search input filtering bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={defaultType ? `Search Google Drive for ${defaultType} modules...` : "Search all courses, blueprints, or simulation packages..."}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-white/15 bg-white/[0.02] text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {error && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] text-blue-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-blue-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Primary files list listbox */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400 space-y-2 flex flex-col items-center">
              <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
              <p className="text-xs font-medium">Interrogating Google Drive contents cloud node...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="py-12 text-center text-slate-500 border border-dashed border-white/5 rounded-2xl">
              <p className="text-xs italic">No matched file elements found inside folder indexes.</p>
            </div>
          ) : (
            filteredFiles.map((file) => {
              const fileType = inferLessonType(file.mimeType || '', file.name);
              const isSelected = selectedFileId === file.id;
              
              return (
                <button
                  type="button"
                  key={file.id}
                  onClick={() => selectAndAttach(file)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-4 cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-blue-600/25 border-blue-500/40' 
                      : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.04] hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {getIconForMimeType(file.mimeType || '')}
                    <div className="min-w-0">
                      <div className="text-xs font-bold font-sans text-slate-100 truncate">{file.name}</div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-1">
                        <span className="bg-blue-500/15 text-blue-400 px-1 rounded font-bold uppercase">{fileType}</span>
                        {file.size && <span>• {file.size}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 px-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-slate-100 border border-white/5"
                        title="View original on Drive"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-blue-400 translate-x-1' : 'text-slate-500'} transition-transform`} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1 font-mono pt-2 border-t border-white/10">
          <span>Secure transfer authorized under BCU-AIUB policies.</span>
        </div>
      </div>
    </div>
  );
}

function hasInputParams(flag: boolean) {
  return flag;
}
