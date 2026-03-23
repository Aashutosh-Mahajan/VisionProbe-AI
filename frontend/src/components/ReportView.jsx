import React, { useState, useEffect } from 'react';
import {
    Info, ShieldAlert, BrainCircuit, GitCompare, ShoppingCart, AlertTriangle, MessageCircle, ExternalLink, Leaf, HeartPulse, Send
} from 'lucide-react';
import { chatAboutProduct } from '../api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

// Basic Card Component for the new design
const Card = ({ children, className }) => (
    <div className={cn("bg-white border border-border rounded-[22px] shadow-sm overflow-hidden", className)}>
        {children}
    </div>
);

const ReportView = ({ data }) => {
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatting, setIsChatting] = useState(false);

    const normalizeReport = (rawReport) => {
        if (!rawReport) return null;
        if (typeof rawReport === 'string') {
            try { return normalizeReport(JSON.parse(rawReport)); } catch (e) { return null; }
        }
        if (!rawReport.data && (rawReport.product_summary || rawReport.knowledge || rawReport.impact)) {
            return { status: rawReport.status || 'complete', data: rawReport, steps_completed: rawReport.steps_completed || [] };
        }
        return rawReport.data ? rawReport : null;
    };

    const normalizedReport = normalizeReport(data?.report);
    const report = normalizedReport?.data;
    const { product_summary, knowledge, usage, impact, recommendations, buy_guidance } = report || {};
    const canonicalUrls = report?.input_urls || [];

    const resetKey = `${product_summary?.product_name || ''}-${canonicalUrls.join('|')}-${normalizedReport?.status || ''}`;

    useEffect(() => {
        setChatMessages([]);
        setChatInput('');
    }, [resetKey]);

    if (!data || !normalizedReport) return null;

    if (normalizedReport.status === "aborted") {
        return (
            <Card className="max-w-2xl mx-auto mt-12 p-10 text-center flex flex-col items-center gap-4 bg-rose-bg border-rose/20">
                <div className="w-16 h-16 rounded-full bg-rose/10 flex items-center justify-center text-rose">
                    <AlertTriangle className="w-8 h-8" />
                </div>
                <h2 className="font-serif text-2xl font-medium text-ink">Analysis Stopped</h2>
                <p className="text-ink-3 leading-relaxed max-w-md">{normalizedReport.confidence_notice}</p>
            </Card>
        );
    }

    const reportContextForChat = {
        product_summary, knowledge, usage, impact, recommendations, buy_guidance, web_context: report?.web_context, input_urls: report?.input_urls, disclaimer: normalizedReport?.disclaimer,
    };

    const sendChat = async () => {
        const msg = chatInput.trim();
        if (!msg || isChatting) return;

        setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
        setChatInput('');
        setIsChatting(true);
        try {
            const res = await chatAboutProduct({ message: msg, reportContext: reportContextForChat });
            const answer = res?.data?.answer || 'No answer returned.';
            setChatMessages(prev => [...prev, { role: 'assistant', text: answer }]);
        } catch (e) {
            setChatMessages(prev => [...prev, { role: 'assistant', text: e.message || 'Chat failed.' }]);
        } finally {
            setIsChatting(false);
        }
    };

    const score = impact?.impact_score || 0;
    const scoreColor = score > 70 ? 'text-green' : score > 40 ? 'text-amber' : 'text-rose';
    const scoreStroke = score > 70 ? 'var(--green)' : score > 40 ? 'var(--amber)' : 'var(--rose)';

    return (
        <div className="max-w-[1320px] mx-auto grid lg:grid-cols-[1fr_360px] gap-10 items-start">
            
            {/* MAIN COLUMN */}
            <div className="flex flex-col gap-6">
                
                {/* Header Card */}
                <Card className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center bg-paper-2 border-transparent">
                    {data.image_url ? (
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-[20px] bg-white shadow-sm border border-border overflow-hidden shrink-0 flex items-center justify-center">
                            <img src={data.image_url} alt="Product" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-32 h-32 md:w-48 md:h-48 rounded-[20px] bg-white shadow-sm border border-border flex items-center justify-center shrink-0">
                            <Info className="w-12 h-12 text-ink-4" />
                        </div>
                    )}
                    <div className="flex flex-col gap-3 text-center md:text-left flex-1">
                        <div className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.06em] uppercase text-ink-3 bg-white px-3py-1.5 px-3 py-1.5 rounded-full border border-border w-fit md:mx-0 mx-auto">
                            {product_summary?.category || 'Unknown Category'}
                        </div>
                        <h1 className="font-serif text-[clamp(28px,4vw,42px)] font-normal text-ink leading-tight tracking-tight">
                            {product_summary?.product_name || 'Unidentified Product'}
                        </h1>
                        <p className="text-[15px] font-light text-ink-3 leading-relaxed mt-1">
                            {knowledge?.overview || 'No overview available for this product.'}
                        </p>
                    </div>
                </Card>

                {/* Key Features / Knowledge */}
                {knowledge?.key_features && knowledge.key_features.length > 0 && (
                    <Card className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-bg flex items-center justify-center text-blue"><BrainCircuit className="w-5 h-5" /></div>
                            <h3 className="font-serif text-2xl font-medium text-ink">Product Knowledge</h3>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {knowledge.key_features.map((feature, idx) => (
                                <div key={idx} className="p-4 rounded-xl bg-paper-2 border border-border text-[14px] text-ink-2 leading-relaxed font-light">
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Impact Analysis */}
                {impact && (
                    <Card className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-green-bg flex items-center justify-center text-green"><ShieldAlert className="w-5 h-5" /></div>
                            <h3 className="font-serif text-2xl font-medium text-ink">Impact Analysis</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-[18px] bg-paper-2 border border-border">
                                <h4 className="flex items-center gap-2 text-[15px] font-semibold text-ink mb-3"><HeartPulse className="w-4 h-4 text-rose" /> Health Impact</h4>
                                <p className="text-[14px] text-ink-3 font-light leading-relaxed">{impact.health_impact || 'No health impact data provided.'}</p>
                            </div>
                            <div className="p-6 rounded-[18px] bg-paper-2 border border-border">
                                <h4 className="flex items-center gap-2 text-[15px] font-semibold text-ink mb-3"><Leaf className="w-4 h-4 text-green" /> Environmental Impact</h4>
                                <p className="text-[14px] text-ink-3 font-light leading-relaxed">{impact.environmental_impact || 'No environmental impact data provided.'}</p>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Usage Intelligence */}
                {usage && (
                    <Card className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-ink text-paper flex items-center justify-center"><Info className="w-5 h-5" /></div>
                            <h3 className="font-serif text-2xl font-medium text-ink">Target & Usage Context</h3>
                        </div>
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1">
                                <h4 className="text-[11px] uppercase tracking-widest font-medium text-ink-4 mb-3">Intended Users</h4>
                                <div className="flex flex-wrap gap-2">
                                    {usage?.intended_users?.map((u, i) => (
                                        <span key={i} className="px-3.5 py-1.5 rounded-full bg-paper-2 text-ink-2 text-[13px] border border-border">
                                            {u}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            {usage?.misuse_warnings && usage.misuse_warnings.length > 0 && (
                                <div className="flex-1 p-5 rounded-xl bg-rose-bg border border-rose/20">
                                    <h4 className="text-[13px] font-semibold text-rose mb-3">Misuse Warnings</h4>
                                    <ul className="list-disc list-inside space-y-2 text-[13px] text-rose/80 font-light leading-relaxed">
                                        {usage.misuse_warnings.map((w, i) => <li key={i}>{w}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </Card>
                )}

                {/* Purchase Links */}
                {buy_guidance && (
                    <Card className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-amber-bg text-amber flex items-center justify-center"><ShoppingCart className="w-5 h-5" /></div>
                            <h3 className="font-serif text-2xl font-medium text-ink">Where to Buy</h3>
                        </div>
                        
                        {buy_guidance.purchase_recommended === false ? (
                            <div className="p-5 rounded-xl bg-rose-bg border border-rose/20 text-[14px] text-rose leading-relaxed font-medium">
                                {buy_guidance.purchase_reason || "Purchase not recommended due to severe health or environmental risks."}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {buy_guidance.purchase_reason && (
                                    <p className="text-[14px] text-ink-3 font-light leading-relaxed mb-2">{buy_guidance.purchase_reason}</p>
                                )}
                                {(!buy_guidance.buy_links || buy_guidance.buy_links.length === 0) ? (
                                    <div className="p-5 rounded-xl bg-paper-2 border border-border text-[14px] text-ink-3 font-light text-center">
                                        No purchase links discovered.
                                    </div>
                                ) : (
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {buy_guidance.buy_links.map((link, i) => (
                                            <a 
                                                key={i} href={link.link} target="_blank" rel="noopener noreferrer"
                                                className="group p-5 rounded-xl bg-white border border-border hover:border-ink hover:shadow-md transition-all flex justify-between items-center"
                                            >
                                                <div>
                                                    <div className="font-serif text-[18px] font-medium text-ink mb-1 group-hover:text-blue transition-colors">{link.platform}</div>
                                                    <div className="text-[13px] text-ink-3 font-light mb-2">{link.description}</div>
                                                    <div className="inline-flex px-2.5 py-1 rounded bg-paper-2 text-[11px] font-medium text-ink-2">{link.price || 'Check Price'}</div>
                                                </div>
                                                <ExternalLink className="w-5 h-5 text-ink-4 group-hover:text-ink transition-colors" />
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                )}

                {/* AI Chat */}
                <Card className="flex flex-col h-[500px]">
                    <div className="p-6 border-b border-border bg-paper-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-bg text-blue flex items-center justify-center"><MessageCircle className="w-5 h-5" /></div>
                            <div>
                                <h3 className="font-serif text-[20px] font-medium text-ink">Ask Follow-up Questions</h3>
                                <p className="text-[12px] text-ink-3 font-light">Dig deeper into ingredients, alternatives, or use-cases.</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 bg-white/50">
                        {chatMessages.length === 0 && (
                            <div className="m-auto text-center max-w-[280px]">
                                <div className="w-12 h-12 bg-paper-2 rounded-full flex items-center justify-center mx-auto mb-3 border border-border">
                                    <MessageCircle className="w-5 h-5 text-ink-4" />
                                </div>
                                <p className="text-[13px] text-ink-4 font-light leading-relaxed">Try asking: "Is this safe for daily use?" or "What does the eco score mean?"</p>
                            </div>
                        )}
                        {chatMessages.map((m, idx) => (
                            <div key={idx} className={cn(
                                "max-w-[85%] p-4 rounded-2xl text-[14px] leading-relaxed font-light shadow-sm",
                                m.role === 'user' 
                                    ? "ml-auto bg-ink text-paper border border-ink" 
                                    : "mr-auto bg-white border border-border text-ink"
                            )}>
                                {m.text}
                            </div>
                        ))}
                        {isChatting && (
                            <div className="mr-auto w-16 h-10 rounded-2xl bg-paper border border-border flex items-center justify-center gap-1 shadow-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-ink-4 animate-bounce" />
                                <div className="w-1.5 h-1.5 rounded-full bg-ink-4 animate-bounce delay-75" />
                                <div className="w-1.5 h-1.5 rounded-full bg-ink-4 animate-bounce delay-150" />
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-border bg-white flex gap-3">
                        <input
                            value={chatInput} onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendChat()}
                            placeholder="Type a message..."
                            disabled={isChatting}
                            className="flex-1 bg-paper border border-border rounded-full px-5 py-3 text-[14px] text-ink placeholder:text-ink-4 focus:outline-none focus:border-ink transition-colors"
                        />
                        <button 
                            onClick={sendChat} disabled={isChatting || !chatInput.trim()}
                            className="w-12 h-12 rounded-full bg-ink hover:bg-ink-2 text-white flex items-center justify-center transition-colors disabled:opacity-50"
                        >
                            <Send className="w-5 h-5 ml-[-2px]" />
                        </button>
                    </div>
                </Card>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="relative">
                <div className="sticky top-28 flex flex-col gap-6">
                    
                    {/* Overall Score Card */}
                    <Card className="p-8 text-center flex flex-col items-center gap-6">
                        <h3 className="font-serif text-[22px] font-medium text-ink">Overall Impact Score</h3>
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle cx="80" cy="80" r="70" fill="none" stroke="var(--paper-2)" strokeWidth="12" />
                                <circle 
                                    cx="80" cy="80" r="70" fill="none" 
                                    stroke={scoreStroke} strokeWidth="12" strokeLinecap="round"
                                    strokeDasharray="440" strokeDashoffset={440 - (440 * score) / 100}
                                    style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                                />
                            </svg>
                            <div className="flex flex-col items-center">
                                <span className={cn("font-serif text-[48px] font-medium leading-none tracking-tight", scoreColor)}>{score}</span>
                                <span className="text-[12px] uppercase tracking-widest text-ink-4 mt-1">/ 100</span>
                            </div>
                        </div>
                        <p className="text-[13px] text-ink-3 font-light leading-relaxed px-4">
                            Reflects aggregate health and sustainability metrics. Higher is safer.
                        </p>
                    </Card>

                    {/* Quick Facts */}
                    <Card className="p-6 border-transparent bg-paper-2">
                        <h4 className="text-[11px] uppercase tracking-[0.08em] font-medium text-ink-4 mb-4">Quick Facts</h4>
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center text-[13px]">
                                <span className="text-ink-3">Category</span>
                                <span className="font-medium text-ink">{product_summary?.category || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center text-[13px]">
                                <span className="text-ink-3">Confidence</span>
                                <span className="font-medium text-ink">{Math.round((product_summary?.confidence || 0) * 100)}%</span>
                            </div>
                            <div className="flex justify-between items-center text-[13px]">
                                <span className="text-ink-3">Sources Check</span>
                                <span className="font-medium text-ink">{canonicalUrls.length > 0 ? `${canonicalUrls.length} links` : 'Visual Only'}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Alternatives */}
                    {recommendations?.alternatives && recommendations.alternatives.length > 0 && (
                        <Card className="p-6 border-amber/20 bg-amber-bg">
                            <div className="flex items-center gap-2 mb-4">
                                <GitCompare className="w-5 h-5 text-amber" />
                                <h4 className="font-serif text-[20px] font-medium text-amber">Smarter Alternatives</h4>
                            </div>
                            <div className="flex flex-col gap-3">
                                {recommendations.alternatives.map((alt, i) => (
                                    <div key={i} className="p-4 rounded-xl bg-white border border-border shadow-sm">
                                        <div className="text-[14px] font-medium text-ink mb-1">{alt.alternative_type}</div>
                                        <p className="text-[12px] text-ink-3 font-light leading-relaxed">{alt.reason}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
            
        </div>
    );
};

export default ReportView;
