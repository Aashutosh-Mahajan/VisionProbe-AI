import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Lock, Eye, Moon, Globe, Shield } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const Toggle = ({ label, description, defaultChecked = false }) => {
    const [checked, setChecked] = useState(defaultChecked);
    return (
        <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
            <div className="pr-8">
                <h3 className="text-sm font-medium text-white">{label}</h3>
                <p className="text-xs text-white/50 mt-1">{description}</p>
            </div>
            <button 
                onClick={() => setChecked(!checked)}
                className={cn(
                    "w-11 h-6 rounded-full transition-colors relative flex-shrink-0",
                    checked ? "bg-primary" : "bg-white/10"
                )}
            >
                <div className={cn(
                    "absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform",
                    checked ? "translate-x-5" : "translate-x-0"
                )} />
            </button>
        </div>
    );
};

const SettingsPage = () => {
  const navigate = useNavigate();

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
        {/* Header */}
        <header className="sticky top-0 z-50 h-20 flex items-center">
            <div className="container mx-auto px-6">
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/20 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Dashboard</span>
                </button>
            </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">Settings</h1>
                
                <div className="space-y-6">
                    {/* Notifications Section */}
                    <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                                <Bell className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-semibold text-white">Notifications</h2>
                        </div>
                        <div className="space-y-1">
                            <Toggle 
                                label="Email Notifications" 
                                description="Receive daily summaries and alerts via email."
                                defaultChecked={true}
                            />
                            <Toggle 
                                label="Push Notifications" 
                                description="Get real-time alerts on your desktop."
                                defaultChecked={false}
                            />
                            <Toggle 
                                label="Marketing Emails" 
                                description="Receive updates about new features and promotions."
                                defaultChecked={false}
                            />
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                                <Shield className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-semibold text-white">Security</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <h3 className="text-sm font-medium text-white">Password</h3>
                                    <p className="text-xs text-white/50 mt-1">Last changed 3 months ago</p>
                                </div>
                                <button className="px-4 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors">
                                    Change Password
                                </button>
                            </div>
                            <div className="flex items-center justify-between py-2 border-t border-white/5 pt-4">
                                <div>
                                    <h3 className="text-sm font-medium text-white">Two-Factor Authentication</h3>
                                    <p className="text-xs text-white/50 mt-1">Add an extra layer of security to your account</p>
                                </div>
                                <button className="px-4 py-2 text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors">
                                    Enable 2FA
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Appearance Section */}
                    <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                                <Eye className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-semibold text-white">Appearance</h2>
                        </div>
                        <div className="space-y-1">
                            <Toggle 
                                label="Dark Mode" 
                                description="Use dark theme across the application."
                                defaultChecked={true}
                            />
                            <Toggle 
                                label="Compact View" 
                                description="Show more content on the screen."
                                defaultChecked={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;