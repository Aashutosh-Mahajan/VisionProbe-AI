import React, { useState, useEffect } from 'react';
import { analyzeImage, checkHealth } from '../api';
import UploadZone from '../components/UploadZone.jsx';
import ReportView from '../components/ReportView.jsx';
import { ScanLine, RefreshCw, Activity, LogOut, User, ChevronDown, Settings, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '../lib/auth';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [productUrlsText, setProductUrlsText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from Neon Auth session
    const loadUser = async () => {
      try {
        const result = await authClient.getSession();
        if (result?.data?.user) {
          setUser(result.data.user);
        }
      } catch (err) {
        console.error('Failed to get user session:', err);
      }
    };
    loadUser();

    const checkBackend = async () => {
      const health = await checkHealth();
      setBackendStatus(health.status === 'ok' ? 'online' : 'offline');

                    {error && (
                      <div className="w-full max-w-xl text-sm text-rose-100 bg-rose-500/20 border border-rose-500/40 rounded-xl px-4 py-3 shadow-lg backdrop-blur">
                        {error}
                      </div>
                    )}
    };
    checkBackend();
  }, [navigate]);

  const parseProductUrls = (text) => {
    if (!text) return [];
    // Only split on newlines and commas, not spaces (URLs can have encoded spaces)
    const urls = text
      .split(/\r?\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);
    
    // Auto-prepend https:// if missing
    return urls.map(url => {
      if (!/^https?:\/\//i.test(url)) {
        return 'https://' + url;
      }
      return url;
    });
  };

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleAnalyze = async () => {
    console.log('[Dashboard] handleAnalyze triggered');
    const productUrls = parseProductUrls(productUrlsText);
    const hasUrls = productUrls.length > 0;
    const hasImage = !!selectedFile;
    
    console.log('[Dashboard] Analysis request:', { hasImage, hasUrls, urlCount: productUrls.length });

    if (!hasImage && !hasUrls) {
      console.warn('[Dashboard] No image or URLs provided');
      setError("Please upload an image OR enter at least one product URL above.");
      return;
    }

    if (!hasImage && hasUrls) {
      console.log('[Dashboard] URL-only analysis starting with URLs:', productUrls);
    }

    setIsAnalyzing(true);
    setError(null);
    setData(null);

    try {
      console.log('[Dashboard] Calling analyzeImage API...');
      const result = await analyzeImage(selectedFile, { productUrls });
      console.log('[Dashboard] Analysis complete, setting data');
      setData(result.data);
    } catch (err) {
      console.error('[Dashboard] Analysis failed:', err);
      // If backend complains about missing image/URL, show a clearer hint
      const msg = err.message || "Failed to analyze. Please try again.";
      setError(msg);
    } finally {
      console.log('[Dashboard] Analysis finished, resetting isAnalyzing');
      setIsAnalyzing(false);
    }
  };

  const handleScanAgain = () => {
    setData(null);
    setError(null);
    setSelectedFile(null);
    setProductUrlsText('');
  };

  const handleLogout = async () => {
    try {
      await authClient.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Helper to get display name from Neon Auth user
  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.name || user.email?.split('@')[0] || 'User';
  };

  const getUserEmail = () => {
    return user?.email || 'No email';
  };

  return (
    <div className="min-h-screen relative flex flex-col text-foreground overflow-x-hidden">
      {/* Background Image */}
      <div 
          className="fixed inset-0 z-0"
          style={{
              backgroundImage: 'url("/static/background1.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
          }}
      >
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Dashboard Header - Transparent/Floating */}
        <header className="sticky top-0 z-50 h-20 flex items-center">
          <div className="container mx-auto px-6 flex items-center justify-between">
            <div className="text-2xl font-bold text-white tracking-tight cursor-pointer" onClick={() => navigate('/')}>
              VisionProbe AI
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg ring-2 ring-white/10 group-hover:ring-white/20">
                  <span className="text-sm font-bold text-white">{getInitials(getUserDisplayName())}</span>
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-white">{getUserDisplayName()}</span>
                  <span className="text-[10px] text-white/50 capitalize">Pro Plan</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/50 transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`} />
              </button>

              {showProfile && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowProfile(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-white/10 bg-white/5">
                      <p className="text-sm font-medium text-white">{getUserDisplayName()}</p>
                      <p className="text-xs text-white/50 truncate">{getUserEmail()}</p>
                    </div>
                    <div className="p-2">
                      <button 
                        onClick={() => navigate('/profile')}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </button>
                      <button 
                        onClick={() => navigate('/settings')}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                      <button 
                        onClick={() => navigate('/billing')}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors text-left"
                      >
                        <CreditCard className="w-4 h-4" />
                        Billing
                      </button>
                    </div>
                    <div className="p-2 border-t border-white/10">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {!data && (
              <div className="mb-12 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">
                  New Analysis
                </h1>
                <p className="text-lg text-white/70 max-w-2xl mx-auto font-light">
                  Upload a product image or paste product URLs to generate a comprehensive intelligence report.
                </p>
              </div>
            )}

            {data && (
              <div className="flex justify-between items-center mb-8 animate-in fade-in duration-500">
                <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">Analysis Report</h1>
                <button
                  onClick={handleScanAgain}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-xl transition-all border border-white/10 backdrop-blur-md shadow-lg"
                >
                  <RefreshCw className="w-4 h-4" />
                  New Analysis
                </button>
              </div>
            )}

            {!data && (
              <div className="max-w-2xl mx-auto mt-8">
                <div className="mb-6 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-5">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Product URLs (optional)
                  </label>
                  <textarea
                    value={productUrlsText}
                    onChange={(e) => {
                      setProductUrlsText(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Paste product page URLs (one per line)"
                    rows={3}
                    className="w-full rounded-xl bg-black/30 border border-white/10 text-white/80 placeholder:text-white/40 p-3 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none overflow-hidden"
                    disabled={isAnalyzing}
                  />
                  <p className="mt-2 text-xs text-white/50">
                    Enter product page URLs (one per line). http:// prefix optional.
                  </p>
                </div>
                <UploadZone
                  onFileSelected={handleFileSelected}
                  isAnalyzing={isAnalyzing}
                  // Suppress the upload-area error when URLs are provided; we'll show any error below instead
                  error={productUrlsText.trim() ? null : error}
                />
                {(selectedFile || productUrlsText.trim()) && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className={`px-8 py-4 rounded-xl font-semibold text-white transition-all shadow-lg ${
                        isAnalyzing
                          ? 'bg-white/20 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transform hover:scale-105'
                      }`}
                    >
                      {isAnalyzing ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          {selectedFile ? 'Analyzing...' : 'Analyzing URLs (may take 1-2 minutes)...'}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <ScanLine className="w-5 h-5" />
                          Analyze Product
                        </div>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            <ReportView data={data} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
