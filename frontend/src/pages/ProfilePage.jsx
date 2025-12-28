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
                <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">My Profile</h1>
                
                <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl">
                    {/* Profile Header */}
                    <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
                        <div className="relative group cursor-pointer">
                                                        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-2xl ring-4 ring-white/10">
                                                                <span className="text-4xl font-bold text-white">{(() => {
                                                                    const name = user?.user_metadata?.full_name || user?.name || user?.email || '';
                                                                    if (!name) return 'U';
                                                                    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
                                                                })()}</span>
                                                        </div>
                            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-bold text-white mb-1">{user?.user_metadata?.full_name || user?.name || (user?.email ? user.email.split('@')[0] : 'User')}</h2>
                            <p className="text-white/60 mb-4">{user?.email || 'No email provided'}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs border border-emerald-500/30">Pro Plan</span>
                                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs border border-blue-500/30">Verified</span>
                            </div>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                                    <input 
                                        type="text" 
                                        value={user?.user_metadata?.full_name || user?.name || ''}
                                        onChange={(e) => setUser(prev => ({...prev, user_metadata: {...(prev?.user_metadata||{}), full_name: e.target.value}}))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                                    <input 
                                        type="email" 
                                        value={user?.email || ''}
                                        onChange={(e) => setUser(prev => ({...prev, email: e.target.value}))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                                    <input 
                                        type="tel" 
                                        value={user?.user_metadata?.phone || ''}
                                        onChange={(e) => setUser(prev => ({...prev, user_metadata: {...(prev?.user_metadata||{}), phone: e.target.value}}))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                                    <input 
                                        type="text" 
                                        value={user?.user_metadata?.location || ''}
                                        onChange={(e) => setUser(prev => ({...prev, user_metadata: {...(prev?.user_metadata||{}), location: e.target.value}}))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end">
                            <button className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-all shadow-lg shadow-primary/20">
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