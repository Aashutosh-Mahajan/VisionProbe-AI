import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, MapPin, Camera } from 'lucide-react';
import { authClient } from '../lib/auth';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await authClient.getSession();
                if (res?.data?.user) setUser(res.data.user);
            } catch (err) {
                console.error('Failed to load session for profile:', err);
            }
        };
        load();
    }, []);

  return (
    <div className="min-h-screen relative flex flex-col text-[#F7F4EF] overflow-x-hidden">
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
                <h1 className="font-serif text-[clamp(32px,4vw,42px)] font-normal text-[#F7F4EF] mb-10 tracking-tight">My Profile</h1>
                
                <div className="bg-[#0D0D0C]/60 backdrop-blur-xl border border-[#F7F4EF]/10 rounded-[28px] p-8 md:p-12 shadow-[0_24px_60px_rgba(0,0,0,0.4)]">
                    {/* Profile Header */}
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                        <div className="relative group cursor-pointer">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-green-2 to-amber flex items-center justify-center shadow-xl ring-1 ring-[#F7F4EF]/20">
                                <span className="font-serif text-5xl font-medium text-[#F7F4EF] tracking-[-0.02em]">{(() => {
                                    const name = user?.user_metadata?.full_name || user?.name || user?.email || '';
                                    if (!name) return 'U';
                                    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
                                })()}</span>
                            </div>
                            <div className="absolute inset-0 rounded-full bg-[#0D0D0C]/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                <Camera className="w-8 h-8 text-[#F7F4EF]" />
                            </div>
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h2 className="font-serif text-3xl font-medium text-[#F7F4EF] mb-1 tracking-tight">{user?.user_metadata?.full_name || user?.name || (user?.email ? user.email.split('@')[0] : 'User')}</h2>
                            <p className="text-[#F7F4EF]/60 mb-5 font-light text-[15px]">{user?.email || 'No email provided'}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <span className="px-3.5 py-1.5 rounded-full bg-green/20 text-green-2 text-[11px] font-medium uppercase tracking-[0.06em] border border-green/30">Pro Plan</span>
                                <span className="px-3.5 py-1.5 rounded-full bg-blue/20 text-blue text-[11px] font-medium uppercase tracking-[0.06em] border border-blue/30">Verified</span>
                            </div>
                        </div>
                        <button className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-[#F7F4EF]/5 hover:bg-[#F7F4EF]/10 border border-[#F7F4EF]/10 transition-colors text-[#F7F4EF]/70 hover:text-[#F7F4EF] shadow-sm">
                            <User className="w-5 h-5" />
                        </button>
                    </div>

                    <hr className="border-[#F7F4EF]/10 mb-10" />

                    {/* Form Fields */}
                    <div className="grid gap-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2.5">
                                <label className="text-[13px] font-medium text-[#F7F4EF]/80 uppercase tracking-wide">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F7F4EF]/40 group-focus-within:text-green-2 transition-colors" />
                                    <input 
                                        type="text" 
                                        value={user?.user_metadata?.full_name || user?.name || ''}
                                        onChange={(e) => setUser(prev => ({...prev, user_metadata: {...(prev?.user_metadata||{}), full_name: e.target.value}}))}
                                        className="w-full bg-[#0D0D0C]/50 border border-[#F7F4EF]/10 rounded-xl py-3.5 pl-12 pr-4 text-[15px] text-[#F7F4EF] font-light placeholder:text-[#F7F4EF]/30 focus:outline-none focus:border-green-2 focus:ring-1 focus:ring-green-2 transition-all shadow-inner"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[13px] font-medium text-[#F7F4EF]/80 uppercase tracking-wide">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F7F4EF]/40 group-focus-within:text-green-2 transition-colors" />
                                    <input 
                                        type="email" 
                                        value={user?.email || ''}
                                        onChange={(e) => setUser(prev => ({...prev, email: e.target.value}))}
                                        className="w-full bg-[#0D0D0C]/50 border border-[#F7F4EF]/10 rounded-xl py-3.5 pl-12 pr-4 text-[15px] text-[#F7F4EF] font-light placeholder:text-[#F7F4EF]/30 focus:outline-none focus:border-green-2 focus:ring-1 focus:ring-green-2 transition-all shadow-inner"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2.5">
                                <label className="text-[13px] font-medium text-[#F7F4EF]/80 uppercase tracking-wide">Phone Number</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F7F4EF]/40 group-focus-within:text-green-2 transition-colors" />
                                    <input 
                                        type="tel" 
                                        value={user?.user_metadata?.phone || ''}
                                        onChange={(e) => setUser(prev => ({...prev, user_metadata: {...(prev?.user_metadata||{}), phone: e.target.value}}))}
                                        className="w-full bg-[#0D0D0C]/50 border border-[#F7F4EF]/10 rounded-xl py-3.5 pl-12 pr-4 text-[15px] text-[#F7F4EF] font-light placeholder:text-[#F7F4EF]/30 focus:outline-none focus:border-green-2 focus:ring-1 focus:ring-green-2 transition-all shadow-inner"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[13px] font-medium text-[#F7F4EF]/80 uppercase tracking-wide">Location</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F7F4EF]/40 group-focus-within:text-green-2 transition-colors" />
                                    <input 
                                        type="text" 
                                        value={user?.user_metadata?.location || ''}
                                        onChange={(e) => setUser(prev => ({...prev, user_metadata: {...(prev?.user_metadata||{}), location: e.target.value}}))}
                                        className="w-full bg-[#0D0D0C]/50 border border-[#F7F4EF]/10 rounded-xl py-3.5 pl-12 pr-4 text-[15px] text-[#F7F4EF] font-light placeholder:text-[#F7F4EF]/30 focus:outline-none focus:border-green-2 focus:ring-1 focus:ring-green-2 transition-all shadow-inner"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 flex justify-end">
                            <button className="btn btn-green px-8 py-3 rounded-xl shadow-[0_8px_20px_rgba(10,122,85,0.25)] hover:shadow-[0_12px_24px_rgba(10,122,85,0.35)] font-medium text-[15px]">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;