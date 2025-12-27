import React, { useState, useEffect } from 'react';
import { analyzeImage, checkHealth, logout as apiLogout } from '../api';
import UploadZone from '../components/UploadZone.jsx';
import ReportView from '../components/ReportView.jsx';
import { ScanLine, RefreshCw, Activity, LogOut, User, ChevronDown, Settings, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/auth');
      return;
    }
    setUser(JSON.parse(storedUser));

    const checkBackend = async () => {
      const health = await checkHealth();
      setBackendStatus(health.status === 'ok' ? 'online' : 'offline');
    };
    checkBackend();
  }, [navigate]);

  const handleFileSelected = async (file) => {
    setIsAnalyzing(true);
    setError(null);
    setData(null);

    try {
      const result = await analyzeImage(file);
      setData(result.data);
    } catch (err) {
      setError(err.message || "Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleScanAgain = () => {
    setData(null);
    setError(null);
  };

  const handleLogout = () => {
    apiLogout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
                  <span className="text-sm font-bold text-white">{user ? getInitials(user.full_name || user.username) : 'U'}</span>
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-white">{user?.full_name || user?.username || 'User'}</span>
                  <span className="text-[10px] text-white/50 capitalize">{user?.plan || 'Free'} Plan</span>
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
                      <p className="text-sm font-medium text-white">{user?.full_name || user?.username || 'User'}</p>
                      <p className="text-xs text-white/50 truncate">{user?.email || 'No email'}</p>
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
                  Upload a product image to generate a comprehensive intelligence report.
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
                <UploadZone
                  onFileSelected={handleFileSelected}
                  isAnalyzing={isAnalyzing}
                  error={error}
                />
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
