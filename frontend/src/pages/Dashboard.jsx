import React, { useState, useEffect, useMemo } from 'react';
import { analyzeImage, checkHealth } from '../api';
import UploadZone from '../components/UploadZone.jsx';
import ReportView from '../components/ReportView.jsx';
import { ScanLine, RefreshCw, LogOut, User, ChevronDown, Settings, CreditCard, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '../lib/auth';
import { useTheme } from '../components/ThemeProvider';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const TRACKING_PARAM_KEYS = new Set([
  'fbclid', 'gclid', 'mkt_tok', 'mc_cid', 'mc_eid', 'ref_src', 'ref', 'scid', 'msclkid', 'dclid', 'yclid', 'spm', 'affid', 'trackingid'
]);

const TRACKING_PARAM_PREFIXES = ['utm_', 'utm-', 'ref_', 'trk_', 'ga_', 'fb_', 'mc_', 'sc_', 'amp_'];

const cleanProductUrl = (rawUrl) => {
  if (!rawUrl) return null;
  let candidate = rawUrl.trim();
  if (!candidate) return null;
  if (!/^https?:\/\//i.test(candidate)) candidate = `https://${candidate}`;
  try {
    const normalized = new URL(candidate);
    normalized.hash = '';
    Array.from(normalized.searchParams.keys()).forEach((key) => {
      const lowerKey = key.toLowerCase();
      if (TRACKING_PARAM_KEYS.has(lowerKey) || TRACKING_PARAM_PREFIXES.some((prefix) => lowerKey.startsWith(prefix))) {
        normalized.searchParams.delete(key);
      }
    });
    const sanitized = normalized.toString();
    return sanitized.endsWith('?') ? sanitized.slice(0, -1) : sanitized;
  } catch {
    return candidate;
  }
};

const parseProductUrls = (text) => {
  if (!text) return [];
  const rawList = text.split(/\r?\n|,/).map((entry) => entry.trim()).filter(Boolean);
  const seen = new Set();
  const cleaned = [];
  for (const entry of rawList) {
    if (!entry) continue;
    const sanitized = cleanProductUrl(entry);
    if (!sanitized || seen.has(sanitized)) continue;
    seen.add(sanitized);
    cleaned.push(sanitized);
  }
  return cleaned;
};

// Agent Loading Sequence Component
const AgentRow = ({ icon, name, status, type }) => {
  const statusClasses = {
    done: "bg-green-bg text-green",
    running: "bg-amber-bg text-amber animate-[pulse_1.4s_ease-in-out_infinite]",
    wait: "bg-paper-2 text-ink-4"
  };
  const iconBg = type === 'done' || type === 'running' 
    ? 'bg-green-bg border-green/20' 
    : 'bg-paper-2 border-transparent text-ink-3';

  return (
    <div className="flex items-center gap-3">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-[15px] shrink-0 border", iconBg)}>{icon}</div>
      <div className="text-[14px] font-medium flex-1 text-ink">{name}</div>
      <div className={cn("text-[11px] font-semibold px-3 py-1.5 rounded-full tracking-wide", statusClasses[type])}>
        {status}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [productUrlsText, setProductUrlsText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null);
  const [agentProgress, setAgentProgress] = useState(0); // 0 to 4
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const sanitizedPreviewUrls = useMemo(() => parseProductUrls(productUrlsText), [productUrlsText]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const result = await authClient.getSession();
        if (result?.data?.user) setUser(result.data.user);
      } catch (err) {
        console.error('Failed to get user session:', err);
      }
    };
    loadUser();

    const checkBackend = async () => {
      const health = await checkHealth();
      setBackendStatus(health.status === 'ok' ? 'online' : 'offline');
    };
    checkBackend();
  }, [navigate]);

  // Simulate agent progress while analyzing
  useEffect(() => {
    let interval;
    if (isAnalyzing) {
      setAgentProgress(0);
      interval = setInterval(() => {
        setAgentProgress(prev => Math.min(prev + 1, 4));
      }, 2500);
    } else {
      setAgentProgress(0);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleAnalyze = async () => {
    const productUrls = sanitizedPreviewUrls;
    const hasUrls = productUrls.length > 0;
    const hasImage = !!selectedFile;

    if (!hasImage && !hasUrls) {
      setError("Please upload an image OR enter at least one product URL.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setData(null);

    try {
      const result = await analyzeImage(selectedFile, { productUrls });
      // Ensure the final agent shows "Done" immediately before transitioning to results
      setAgentProgress(5);
      setTimeout(() => setData(result.data), 800);
    } catch (err) {
      setError(err.message || "Failed to analyze. Please try again.");
    } finally {
      setTimeout(() => setIsAnalyzing(false), 800);
    }
  };

  const handleScanAgain = () => {
    setData(null);
    setError(null);
    setSelectedFile(null);
    setProductUrlsText('');
  };

  const handleLogout = async () => {
    try { await authClient.signOut(); } catch (err) {}
    navigate('/');
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  const getUserDisplayName = () => user ? (user.name || user.email?.split('@')[0]) : 'User';
  const getUserEmail = () => user?.email || 'No email';

  const agents = [
    { icon: "👁", name: "Visual Identification" },
    { icon: "🧠", name: "Knowledge Enrichment" },
    { icon: "👥", name: "Use Case Analysis" },
    { icon: "🌍", name: "Impact Analysis" },
    { icon: "🛒", name: "Buy Link Discovery" }
  ];

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Header */}
      <nav className="sticky top-0 z-[500] flex items-center justify-between px-8 py-4 bg-paper/80 backdrop-blur-2xl border-b border-border-md shadow-sm">
        <div className="flex items-center gap-2 font-serif text-[19px] font-medium text-ink tracking-tight cursor-pointer" onClick={() => navigate('/')}>
          VisionProbe
        </div>

        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 text-ink-3 hover:text-ink transition-colors rounded-full hover:bg-paper-2">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-full bg-paper-2 hover:bg-paper-3 border border-border transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-green text-white flex items-center justify-center font-medium shadow-sm">
                {getInitials(getUserDisplayName())}
              </div>
              <div className="hidden md:flex flex-col items-start leading-tight">
                <span className="text-[13px] font-semibold text-ink">{getUserDisplayName()}</span>
                <span className="text-[10px] text-ink-4">Pro Plan</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-ink-4 transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`} />
            </button>

            {showProfile && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-white border border-border rounded-xl shadow-[0_12px_40px_rgba(13,13,12,0.11)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-border bg-paper-2">
                    <p className="text-sm font-semibold text-ink">{getUserDisplayName()}</p>
                    <p className="text-[11px] text-ink-4 truncate mt-0.5">{getUserEmail()}</p>
                  </div>
                  <div className="p-2">
                    <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-ink-3 hover:text-ink hover:bg-paper-2 transition-colors">
                      <User className="w-4 h-4" /> Profile
                    </button>
                    <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-ink-3 hover:text-ink hover:bg-paper-2 transition-colors">
                      <Settings className="w-4 h-4" /> Settings
                    </button>
                    <button onClick={() => navigate('/billing')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-ink-3 hover:text-ink hover:bg-paper-2 transition-colors">
                      <CreditCard className="w-4 h-4" /> Billing
                    </button>
                  </div>
                  <div className="p-2 border-t border-border">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-rose hover:bg-rose-bg transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-[1400px] mx-auto p-8 md:p-12 relative z-10">
        {!data && !isAnalyzing && (
          <div className="max-w-[800px] mx-auto animate-in fade-in duration-500">
            <h1 className="font-serif text-[clamp(32px,4vw,48px)] font-normal text-ink mb-3 tracking-tight">Uncover the Truth</h1>
            <p className="text-lg text-ink-3 font-light mb-10">Drop a product image here or paste a URL to instantly analyze ingredients, risks, and impact.</p>
            
            <div className="bg-white rounded-[24px] border border-border shadow-sm p-8 flex flex-col gap-8 relative overflow-hidden">
              <UploadZone
                onFileSelected={handleFileSelected}
                isAnalyzing={isAnalyzing}
                error={productUrlsText.trim() ? null : error}
              />

              <div className="flex items-center gap-4 text-ink-4">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-xs font-medium uppercase tracking-widest">or provide url</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>

              <div className="flex flex-col gap-2">
                <textarea
                  value={productUrlsText}
                  onChange={(e) => {
                    setProductUrlsText(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Paste product page URL..."
                  rows={2}
                  className="w-full rounded-xl bg-paper border border-border-md text-ink placeholder:text-ink-4 p-4 text-[15px] font-light focus:outline-none focus:ring-2 focus:ring-green/20 focus:border-green-2 resize-none transition-all shadow-inner"
                  disabled={isAnalyzing}
                />
                
                {sanitizedPreviewUrls.length > 0 && (
                  <div className="mt-2 text-xs text-ink-4 p-3 bg-paper rounded-lg border border-border">
                    <p className="font-medium text-ink-3 mb-1.5 uppercase tracking-wider text-[10px]">Canonical URLs:</p>
                    <div className="space-y-1">
                      {sanitizedPreviewUrls.map(url => (
                        <a key={url} href={url} target="_blank" rel="noreferrer" className="block text-[11px] truncate hover:text-green-2 transition-colors">
                          {url}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {(selectedFile || productUrlsText.trim()) && (
                <div className="pt-2 flex justify-end animate-in fade-in slide-in-from-bottom-2">
                  <button onClick={handleAnalyze} className="btn btn-green btn-lg shadow-md hover:shadow-lg w-full md:w-auto justify-center">
                    <ScanLine className="w-5 h-5" /> Analyze Product
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="max-w-[700px] mx-auto mt-12 animate-in fade-in zoom-in-95 duration-500">
            <h2 className="font-serif text-[32px] font-normal text-ink mb-8 tracking-tight text-center">Pipeline Active</h2>
            <div className="bg-white rounded-[24px] border border-border shadow-sm p-8">
              <div className="flex flex-col gap-4">
                {agents.map((agent, index) => {
                  let type = 'wait';
                  let status = 'Waiting';
                  
                  if (index < agentProgress) {
                    type = 'done';
                    status = 'Done';
                  } else if (index === agentProgress) {
                    type = 'running';
                    status = 'Running...';
                  }

                  return (
                    <AgentRow 
                      key={index}
                      icon={agent.icon}
                      name={agent.name}
                      status={status}
                      type={type}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {data && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex justify-between items-center mb-8">
              <h1 className="font-serif text-[36px] font-normal text-ink tracking-tight">Intelligence Report</h1>
              <button onClick={handleScanAgain} className="btn btn-ghost">
                <RefreshCw className="w-4 h-4" /> New Analysis
              </button>
            </div>
            <ReportView data={data} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
