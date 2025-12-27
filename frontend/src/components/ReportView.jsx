import React, { useState } from 'react';
import {
    Info,
    ShieldAlert,
    BrainCircuit,
    GitCompare,
    ShoppingCart,
    AlertTriangle
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

// Glass Card Component
const GlassCard = ({ children, className }) => (
    <div className={cn(
        "bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden",
        className
    )}>
        {children}
    </div>
);

const ReportView = ({ data }) => {
    const [activeTab, setActiveTab] = useState('knowledge');

    if (!data || !data.report || !data.report.data) return null;

    const report = data.report.data;
    const { product_summary, knowledge, usage, impact, recommendations, buy_guidance } = report;

    if (data.report.status === "aborted") {
        return (
            <GlassCard className="max-w-2xl mx-auto mt-12 p-8 text-center space-y-4 border-amber-500/30 bg-amber-950/20">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto border border-amber-500/20">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <h2 className="text-xl font-semibold text-amber-100">Analysis Stopped</h2>
                <p className="text-white/60">{data.report.confidence_notice}</p>
            </GlassCard>
        );
    }

    const tabs = [
        { id: 'knowledge', label: 'Product Knowledge', icon: Info },
        { id: 'risk', label: 'Risk Assessment', icon: ShieldAlert },
        { id: 'intelligence', label: 'Intelligence', icon: BrainCircuit },
        { id: 'alternatives', label: 'Alternatives', icon: GitCompare },
        { id: 'purchase', label: 'Purchase Links', icon: ShoppingCart },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'knowledge':
                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <h3 className="text-2xl font-bold mb-4 text-white">Product Knowledge</h3>
                        <p className="text-lg text-white/80 leading-relaxed">{knowledge?.overview}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            {knowledge?.key_features?.map((feature, idx) => (
                                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 text-white/90">
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'risk':
                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <h3 className="text-2xl font-bold mb-4 text-white">Risk Assessment</h3>
                        <div className="grid gap-6">
                            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                                <h4 className="text-lg font-semibold text-emerald-400 mb-2">Health Impact</h4>
                                <p className="text-white/70">{impact?.health_impact}</p>
                            </div>
                            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                                <h4 className="text-lg font-semibold text-blue-400 mb-2">Environmental Impact</h4>
                                <p className="text-white/70">{impact?.environmental_impact}</p>
                            </div>
                            <div className="flex items-center justify-between p-6 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-lg font-medium text-white">Overall Safety Score</span>
                                <span className={cn(
                                    "text-4xl font-bold",
                                    impact?.impact_score > 70 ? "text-emerald-400" : "text-amber-400"
                                )}>{impact?.impact_score}/100</span>
                            </div>
                        </div>
                    </div>
                );
            case 'intelligence':
                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <h3 className="text-2xl font-bold mb-4 text-white">Usage Intelligence</h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm uppercase tracking-wider text-white/50 mb-2">Intended Users</h4>
                                <div className="flex flex-wrap gap-2">
                                    {usage?.intended_users?.map((u, i) => (
                                        <span key={i} className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm border border-blue-500/30">
                                            {u}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                                <h4 className="text-rose-400 font-semibold mb-2">Misuse Warnings</h4>
                                <ul className="list-disc list-inside space-y-1 text-rose-200/80">
                                    {usage?.misuse_warnings?.map((w, i) => (
                                        <li key={i}>{w}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            case 'alternatives':
                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <h3 className="text-2xl font-bold mb-4 text-white">Better Alternatives</h3>
                        <div className="grid gap-4">
                            {recommendations?.alternatives?.map((alt, i) => (
                                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                    <div className="font-bold text-lg text-emerald-400 mb-1">{alt.alternative_type}</div>
                                    <p className="text-white/70">{alt.reason}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'purchase':
                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <h3 className="text-2xl font-bold mb-4 text-white">Purchase Links</h3>
                        {buy_guidance?.purchase_recommended === false ? (
                            <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/20">
                                <p className="text-lg leading-relaxed text-rose-200">{buy_guidance?.purchase_reason || "Purchase not recommended due to safety concerns."}</p>
                            </div>
                        ) : (
                            <>
                                {buy_guidance?.purchase_reason && (
                                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                        <p className="text-white/80">{buy_guidance.purchase_reason}</p>
                                    </div>
                                )}
                                {(!buy_guidance?.buy_links || buy_guidance.buy_links.length === 0) && (
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                        <p className="text-white/70">No direct purchase links are available yet. Try again or check back shortly.</p>
                                    </div>
                                )}
                                <div className="space-y-4">
                                    <h4 className="text-lg font-semibold text-white/90">Available Purchase Options:</h4>
                                    {buy_guidance?.buy_links?.map((link, i) => (
                                        <a 
                                            key={i}
                                            href={link.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="font-bold text-lg text-blue-400 group-hover:text-blue-300 mb-1">
                                                        {link.platform}
                                                    </div>
                                                    <p className="text-sm text-white/60">{link.description}</p>
                                                </div>
                                                <ShoppingCart className="w-5 h-5 text-white/40 group-hover:text-blue-400 transition-colors" />
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            {/* Top Section: 3 Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-auto md:h-48">
                {/* Photo Block */}
                <GlassCard className="md:col-span-1 p-2 flex items-center justify-center bg-black/40">
                    <img 
                        src={data.image_url} 
                        alt="Product" 
                        className="w-full h-full object-cover rounded-xl"
                    />
                </GlassCard>

                {/* Name Block */}
                <GlassCard className="md:col-span-2 p-8 flex flex-col justify-center items-center text-center">
                    <h2 className="text-sm uppercase tracking-widest text-white/50 mb-2">Product Name</h2>
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight drop-shadow-md">
                        {product_summary?.product_name}
                    </h1>
                </GlassCard>

                {/* Category Block */}
                <GlassCard className="md:col-span-1 p-6 flex flex-col justify-center items-center text-center">
                    <h2 className="text-sm uppercase tracking-widest text-white/50 mb-2">Category</h2>
                    <div className="text-xl font-semibold text-emerald-400">
                        {product_summary?.category}
                    </div>
                    <div className="mt-4 px-3 py-1 rounded-full bg-white/10 text-xs border border-white/10 text-white/80">
                        {Math.round((product_summary?.confidence || 0) * 100)}% Confidence
                    </div>
                </GlassCard>
            </div>

            {/* Bottom Section: Split View */}
            <GlassCard className="flex-1 flex flex-col md:flex-row min-h-[500px]">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 p-4 flex flex-col gap-2 bg-black/20">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left",
                                    isActive 
                                        ? "bg-white/20 text-white shadow-lg border border-white/10" 
                                        : "text-white/60 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 overflow-y-auto">
                    {renderContent()}
                </div>
            </GlassCard>
        </div>
    );
};

export default ReportView;
