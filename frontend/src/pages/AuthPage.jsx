import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthView } from '@neondatabase/neon-js/auth/react/ui';
import { Zap } from 'lucide-react';
import { authClient } from '../lib/auth';
import { demoLogin } from '../api';

const AuthPage = () => {
  const navigate = useNavigate();
  const { pathname } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isSignUp = pathname === 'sign-up';
  const title = isSignUp ? 'Create Account' : 'Welcome Back';
  const subtitle = isSignUp
    ? 'Join VisionProbe AI to start analyzing products'
    : 'Enter your credentials to access your dashboard';

  // Do not auto-redirect on page load. Users must sign in explicitly.
  const containerRef = useRef(null);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    let interval = null;

    const startPolling = () => {
      if (polling) return;
      setPolling(true);
      interval = setInterval(async () => {
        try {
          const result = await authClient.getSession();
          if (result?.data?.session) {
            clearInterval(interval);
            navigate('/dashboard');
          }
        } catch (err) {
          // ignore
        }
      }, 1000);
    };

    // Start polling when any input inside the container receives focus
    const onFocusIn = (e) => {
      const tag = e.target && e.target.tagName && e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'button' || tag === 'textarea') {
        startPolling();
      }
    };

    const node = containerRef.current;
    if (node) {
      node.addEventListener('focusin', onFocusIn);
    }

    return () => {
      if (node) node.removeEventListener('focusin', onFocusIn);
      if (interval) clearInterval(interval);
    };
  }, [navigate, polling]);
  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Use backend demo endpoint to create/return demo user
      const res = await demoLogin();
      if (res && res.data) {
        // Backend returns tokens and user info. We simply navigate to dashboard.
        navigate('/dashboard');
      } else {
        setError('Demo login failed.');
      }
    } catch (err) {
      console.error('Demo login error:', err);
      setError('Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url("/static/background2.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Glass Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-8 text-center border-b border-white/10 bg-black/20">
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-gray-300 text-sm">{subtitle}</p>
          </div>

          {/* Neon Auth UI */}
          <div className="p-8">
            <AuthView pathname={pathname || 'sign-in'} />

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-transparent px-2 text-gray-400">Or</span>
                </div>
              </div>

              {error && (
                <p className="mt-4 text-center text-sm text-rose-400">{error}</p>
              )}

              <button
                onClick={handleDemoLogin}
                disabled={loading}
                className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all text-white font-semibold shadow-lg"
              >
                <Zap className="w-4 h-4" />
                {loading ? 'Logging in...' : 'Try Demo Account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
