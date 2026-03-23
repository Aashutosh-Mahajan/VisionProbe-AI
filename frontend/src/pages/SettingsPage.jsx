import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Lock, Eye, Moon, Globe, Shield } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const Toggle = ({ label, description, defaultChecked = false }) => {
    const [checked, setChecked] = useState(defaultChecked);
    return (
        <div className="flex items-center justify-between py-5 border-b border-[#F7F4EF]/10 last:border-0">
            <div className="pr-8">
                <h3 className="text-[15px] font-medium text-[#F7F4EF] tracking-wide">{label}</h3>
                <p className="text-[13px] font-light text-[#F7F4EF]/60 mt-1.5 leading-relaxed">{description}</p>
            </div>
            <button 
                onClick={() => setChecked(!checked)}
                className={cn(
                    "w-12 h-6 rounded-full transition-colors relative flex-shrink-0 border",
                    checked ? "bg-green-2 border-green-2" : "bg-[#0D0D0C] border-[#F7F4EF]/20"
                )}
            >
                <div className={cn(
                    "absolute top-0.5 w-4 h-4 rounded-full bg-[#F7F4EF] transition-transform shadow-sm",
                    checked ? "translate-x-6 left-1" : "translate-x-0 left-1"
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
          <div className="absolute inset-0 bg-[#0D0D0C]/80 backdrop-blur-[4px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 h-20 flex items-center">
            <div className="container mx-auto px-6">
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-[#F7F4EF]/70 hover:text-[#F7F4EF] transition-colors bg-[#F7F4EF]/5 hover:bg-[#F7F4EF]/10 px-4 py-2 rounded-full border border-[#F7F4EF]/10 backdrop-blur-md text-sm font-medium">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Dashboard</span>
                </button>
            </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="font-serif text-[clamp(32px,4vw,42px)] font-normal text-[#F7F4EF] mb-10 tracking-tight">Settings</h1>
                
                <div className="space-y-8">
                    {/* Notifications Section */}
                    <div className="bg-[#0D0D0C]/60 backdrop-blur-xl border border-[#F7F4EF]/10 rounded-[24px] p-8 md:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.4)]">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-xl bg-blue/20 text-blue ring-1 ring-blue/30 shadow-sm">
                                <Bell className="w-5 h-5" />
                            </div>
                            <h2 className="font-serif text-2xl font-medium text-[#F7F4EF] tracking-[-0.01em]">Notifications</h2>
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
                    <div className="bg-[#0D0D0C]/60 backdrop-blur-xl border border-[#F7F4EF]/10 rounded-[24px] p-8 md:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.4)]">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-xl bg-green/20 text-green-2 ring-1 ring-green/30 shadow-sm">
                                <Shield className="w-5 h-5" />
                            </div>
                            <h2 className="font-serif text-2xl font-medium text-[#F7F4EF] tracking-[-0.01em]">Security</h2>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between py-4">
                                <div>
                                    <h3 className="text-[15px] font-medium text-[#F7F4EF] tracking-wide">Password</h3>
                                    <p className="text-[13px] font-light text-[#F7F4EF]/60 mt-1.5 leading-relaxed">Last changed 3 months ago</p>
                                </div>
                                <button className="px-5 py-2.5 text-[13px] font-medium text-[#F7F4EF] bg-[#F7F4EF]/5 hover:bg-[#F7F4EF]/10 border border-[#F7F4EF]/10 rounded-xl transition-all shadow-sm">
                                    Change Password
                                </button>
                            </div>
                            <div className="flex items-center justify-between py-4 border-t border-[#F7F4EF]/10 pt-6">
                                <div>
                                    <h3 className="text-[15px] font-medium text-[#F7F4EF] tracking-wide">Two-Factor Authentication</h3>
                                    <p className="text-[13px] font-light text-[#F7F4EF]/60 mt-1.5 leading-relaxed">Add an extra layer of security to your account</p>
                                </div>
                                <button className="px-5 py-2.5 text-[13px] font-medium text-[#F7F4EF] bg-[#F7F4EF]/5 hover:bg-[#F7F4EF]/10 border border-[#F7F4EF]/10 rounded-xl transition-all shadow-sm">
                                    Enable 2FA
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Appearance Section */}
                    <div className="bg-[#0D0D0C]/60 backdrop-blur-xl border border-[#F7F4EF]/10 rounded-[24px] p-8 md:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.4)]">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-xl bg-amber/20 text-amber ring-1 ring-amber/30 shadow-sm">
                                <Eye className="w-5 h-5" />
                            </div>
                            <h2 className="font-serif text-2xl font-medium text-[#F7F4EF] tracking-[-0.01em]">Appearance</h2>
                        </div>
                        <div className="space-y-1">
                            <Toggle 
                                label="Dark Mode" 
                                description="Use dark theme across the application. Note: Required on settings pages."
                                defaultChecked={true}
                            />
                            <Toggle 
                                label="Compact View" 
                                description="Show more content on the screen by reducing padding."
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