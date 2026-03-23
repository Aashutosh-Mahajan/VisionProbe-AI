import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/ThemeProvider';
import { Moon, Sun, ArrowRight, ScanLine } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const LandingPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Navbar */}
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 z-[500] flex items-center justify-between transition-all duration-400 ease-ease px-12 py-5",
          "bg-paper/80 backdrop-blur-2xl border-b",
          scrolled ? "py-3.5 border-border-md shadow-sm" : "border-transparent"
        )}
      >
        <a 
          href="#"
          onClick={(e) => { e.preventDefault(); window.scrollTo(0,0); }}
          className="flex items-center gap-2 font-serif text-[19px] font-medium text-ink tracking-tight cursor-pointer"
        >
          VisionProbe
        </a>
        <ul className="hidden md:flex items-center gap-9 list-none m-0">
          <li><a href="#features" className="text-sm font-normal text-ink-3 hover:text-ink transition-colors tracking-wide">Features</a></li>
          <li><a href="#how" className="text-sm font-normal text-ink-3 hover:text-ink transition-colors tracking-wide">How it works</a></li>
        </ul>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2 mr-2 text-ink-3 hover:text-ink transition-colors rounded-full hover:bg-paper-2"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={() => navigate('/auth?mode=signin')}
            className="btn btn-ghost hidden sm:inline-flex"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/auth?mode=register')}
            className="btn btn-primary"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-[160px] pb-[100px] px-12 max-w-[1320px] mx-auto grid md:grid-cols-2 gap-16 items-center min-h-[90vh]">
        <div className="flex flex-col gap-7">
          <div className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.08em] uppercase text-green bg-green-bg px-3.5 py-1.5 rounded-full border border-green/20 w-fit animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-1.5 h-1.5 rounded-full bg-green-2" />
            Powered by GPT-5.1 Vision
          </div>
          <h1 className="font-serif text-[clamp(48px,5.5vw,76px)] font-normal leading-[1.06] tracking-[-0.03em] text-ink animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Know exactly<br />
            <em className="italic text-green pr-2">what you're</em>
            <span className="block">buying.</span>
          </h1>
          <p className="text-lg font-light text-ink-3 leading-relaxed max-w-[480px] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            Upload any product image. VisionProbe's AI agents instantly decode ingredients, assess health risks, score environmental impact, and surface smarter alternatives.
          </p>
          <div className="flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn btn-green btn-lg"
            >
              <ScanLine className="w-5 h-5" />
              Analyze a Product
            </button>
            <a href="#how" className="btn btn-ghost btn-lg">
              See how it works
            </a>
          </div>
          <div className="flex gap-9 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            <div className="flex flex-col gap-1">
              <span className="font-serif text-[28px] font-medium text-ink tracking-tight">5</span>
              <span className="text-[13px] text-ink-4 font-light">AI Agents</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-serif text-[28px] font-medium text-ink tracking-tight">98%</span>
              <span className="text-[13px] text-ink-4 font-light">Detection accuracy</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-serif text-[28px] font-medium text-ink tracking-tight">&lt; 12s</span>
              <span className="text-[13px] text-ink-4 font-light">Full analysis</span>
            </div>
          </div>
        </div>

        {/* Hero Right - Product Card Demo */}
        <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-300 hidden md:block">
          {/* Floating Tags */}
          <div className="absolute -top-4 right-5 bg-white border border-border rounded-xl px-4 py-2.5 shadow-md text-[13px] font-medium text-ink flex items-center gap-2 animate-[float_4s_ease-in-out_infinite] z-10 whitespace-nowrap">
            <div className="w-2 h-2 rounded-full bg-green-2" />
            94% confidence match
          </div>
          <div className="absolute bottom-16 -left-6 bg-white border border-border rounded-xl px-4 py-2.5 shadow-md text-[13px] font-medium text-ink flex items-center gap-2 animate-[float_4s_ease-in-out_infinite_1.5s] z-10 whitespace-nowrap">
            <div className="w-2 h-2 rounded-full bg-amber" />
            Moderate sugar content
          </div>

          <div className="bg-white rounded-[22px] border border-border shadow-lg overflow-hidden relative">
            <div className="bg-paper-2 p-7 flex items-center gap-4 border-b border-border">
              <div className="w-[72px] h-[72px] rounded-xl bg-gradient-to-br from-paper-3 to-paper-2 border border-border flex items-center justify-center text-4xl shadow-sm shrink-0">
                🥤
              </div>
              <div className="flex-1">
                <div className="font-serif text-lg font-medium text-ink mb-1">Coke Zero Sugar</div>
                <div className="text-[13px] text-ink-4">Coca-Cola · Beverage · 330ml</div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-green mt-2">
                  <div className="flex-1 h-1 bg-paper-3 rounded-full overflow-hidden">
                    <div className="h-full bg-green-2 rounded-full w-[94%]" />
                  </div>
                  94%
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-px bg-border">
              <div className="bg-white p-4 flex flex-col gap-2">
                <div className="text-[11px] font-medium uppercase tracking-wider text-ink-4">Health</div>
                <div className="flex items-center gap-2.5">
                  <svg className="w-8 h-8 shrink-0" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="var(--paper-2)" strokeWidth="3"/>
                    <circle cx="18" cy="18" r="14" fill="none" stroke="var(--amber)" strokeWidth="3" strokeDasharray="58 88" strokeDashoffset="22" strokeLinecap="round" transform="rotate(-90 18 18)"/>
                  </svg>
                  <span className="font-serif text-xl text-amber">58</span>
                </div>
              </div>
              <div className="bg-white p-4 flex flex-col gap-2">
                <div className="text-[11px] font-medium uppercase tracking-wider text-ink-4">Eco</div>
                <div className="flex items-center gap-2.5">
                  <svg className="w-8 h-8 shrink-0" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="var(--paper-2)" strokeWidth="3"/>
                    <circle cx="18" cy="18" r="14" fill="none" stroke="var(--green)" strokeWidth="3" strokeDasharray="72 88" strokeDashoffset="22" strokeLinecap="round" transform="rotate(-90 18 18)"/>
                  </svg>
                  <span className="font-serif text-xl text-green">72</span>
                </div>
              </div>
              <div className="bg-white p-4 flex flex-col gap-2">
                <div className="text-[11px] font-medium uppercase tracking-wider text-ink-4">Risk</div>
                <div className="flex items-center gap-2.5">
                  <svg className="w-8 h-8 shrink-0" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="var(--paper-2)" strokeWidth="3"/>
                    <circle cx="18" cy="18" r="14" fill="none" stroke="var(--rose)" strokeWidth="3" strokeDasharray="35 88" strokeDashoffset="22" strokeLinecap="round" transform="rotate(-90 18 18)"/>
                  </svg>
                  <span className="font-serif text-xl text-rose">35</span>
                </div>
              </div>
            </div>

            <div className="p-5 flex flex-col gap-2.5 bg-white">
              <AgentRow icon="👁" name="Visual Identification" status="Done" type="done" />
              <AgentRow icon="🧠" name="Knowledge Enrichment" status="Done" type="done" />
              <AgentRow icon="👥" name="Use Case Analysis" status="Running…" type="running" />
              <AgentRow icon="🌍" name="Impact Analysis" status="Waiting" type="wait" />
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <div className="border-y border-border py-4 bg-paper-2 overflow-hidden flex whitespace-nowrap">
        <div className="animate-[marquee_28s_linear_infinite] flex items-center min-w-full">
          {marqueeItems.map((item, i) => (
            <div key={i} className="flex items-center text-[13px] font-medium text-ink-3 tracking-wider uppercase shrink-0">
              <span className="px-10">{item}</span>
              <div className="w-1 h-1 rounded-full bg-ink-4" />
            </div>
          ))}
        </div>
        <div className="animate-[marquee_28s_linear_infinite] flex items-center min-w-full" aria-hidden="true">
          {marqueeItems.map((item, i) => (
            <div key={i} className="flex items-center text-[13px] font-medium text-ink-3 tracking-wider uppercase shrink-0">
              <span className="px-10">{item}</span>
              <div className="w-1 h-1 rounded-full bg-ink-4" />
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section id="features" className="max-w-[1320px] mx-auto px-12 py-[100px]">
        <div className="text-[11px] font-medium tracking-[0.1em] uppercase text-green mb-4">What VisionProbe reveals</div>
        <h2 className="font-serif text-[clamp(28px,4vw,54px)] font-normal leading-[1.1] tracking-[-0.025em] text-ink max-w-[640px]">
          Five agents working<br/><em className="italic text-green pr-2">in perfect sequence</em>
        </h2>
        
        <div className="grid md:grid-cols-3 gap-px bg-border mt-14 rounded-2xl overflow-hidden border border-border shadow-sm">
          <FeatureCard icon="👁" bg="bg-green-bg" title="Visual Identification" desc="Scans your image for product name, brand, category, and text via OCR. Aborts if confidence is below 50% to ensure accuracy." />
          <FeatureCard icon="🧠" bg="bg-blue-bg" title="Knowledge Enrichment" desc="Retrieves factual data — ingredients for food, specifications for tech, material composition for household items." />
          <FeatureCard icon="👥" bg="bg-purple-100 dark:bg-purple-900/30 text-purple-600" title="Use Case Analysis" desc="Identifies target demographics and maps out real-world usage scenarios so you know exactly who the product is designed for." />
          <FeatureCard icon="🌍" bg="bg-amber-bg" title="Impact Analysis" desc="Checks for allergens, carcinogens, and processed sugars. Scores packaging recyclability and estimates carbon footprint." />
          <FeatureCard icon="🛒" bg="bg-rose-bg" title="Ethical Buy Links" desc="Surfaces purchase options from trusted retailers. Automatically suppresses links if the product risk level is flagged as High." />
          <FeatureCard icon="✦" bg="bg-white/10" wrapperClass="bg-ink text-paper" titleColor="text-paper" descColor="text-paper/60" title="Fail-Safe System" desc="If any agent's confidence falls below threshold, the pipeline stops immediately. No guesses, no hallucinations." />
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-[120px] px-12 relative overflow-hidden bg-[#0D0D0C] text-[#F7F4EF]">
        {/* Subtle background effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-green-2/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-[1320px] mx-auto relative z-10">
          <div className="flex flex-col items-center text-center mb-24 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[12px] font-medium tracking-[0.1em] uppercase text-green-2 mb-8">
               <span className="w-1.5 h-1.5 rounded-full bg-green-2 animate-pulse"></span>
               Pipeline architecture
            </div>
            <h2 className="font-serif text-[clamp(40px,5vw,64px)] font-normal leading-[1.05] tracking-[-0.03em] text-[#F7F4EF] max-w-[800px]">
              From image upload exclusively to <em className="italic text-green pr-2">full intelligence</em>
            </h2>
          </div>

          <div className="relative">
            <style>{`
              @keyframes scanRight {
                0% { left: -25%; }
                100% { left: 100%; }
              }
            `}</style>
            {/* Connecting Line (Desktop Only) */}
            <div className="hidden md:block absolute top-[56px] left-[5%] right-[5%] h-[2px] bg-white/5 z-0 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 h-full w-1/4 bg-gradient-to-r from-transparent via-green-2 to-transparent opacity-80" 
                  style={{ animation: 'scanRight 3s linear infinite' }}
                />
            </div>

            <div className="grid md:grid-cols-5 gap-6">
                <AgentStep 
                    num="01" icon="👁" name="Visual Agent" 
                    desc="Identifies the product, detects brand, extracts text with OCR." 
                    tag="Raw image"
                    colorClass="bg-blue" hex="#3B82F6" gradientClass="bg-gradient-to-br from-blue/20 to-blue/5 border-blue/20 text-blue" delay="delay-100" />
                <AgentStep 
                    num="02" icon="🧠" name="Knowledge Agent" 
                    desc="Enriches the product name and brand with factual ingredient data." 
                    tag="Product name"
                    colorClass="bg-purple-500" hex="#A855F7" gradientClass="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400" delay="delay-200" />
                <AgentStep 
                    num="03" icon="👥" name="Use Case Agent" 
                    desc="Maps demographics and real-world usage scenarios." 
                    tag="Context"
                    colorClass="bg-amber" hex="#F59E0B" gradientClass="bg-gradient-to-br from-amber/20 to-amber/5 border-amber/20 text-amber" delay="delay-300" />
                <AgentStep 
                    num="04" icon="🌍" name="Impact Agent" 
                    desc="Calculates health risk and sustainability rating." 
                    tag="Ingredients"
                    colorClass="bg-green" hex="#10B981" gradientClass="bg-gradient-to-br from-green/20 to-green/5 border-green/20 text-green-2" delay="delay-400" />
                <AgentStep 
                    num="05" icon="🛒" name="Buy Link Agent" 
                    desc="Finds purchase URLs. Skips entirely if risk is High." 
                    tag="Risk level"
                    colorClass="bg-rose" hex="#F43F5E" gradientClass="bg-gradient-to-br from-rose/20 to-rose/5 border-rose/20 text-rose" delay="delay-500" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-[100px] px-12 text-center max-w-4xl mx-auto">
        <div className="text-[11px] font-medium tracking-[0.1em] uppercase text-green mb-4 flex justify-center">Start for free</div>
        <h2 className="font-serif text-[clamp(36px,4.5vw,54px)] font-normal leading-tight tracking-[-0.025em] text-ink mb-6">
          Ready to see <em className="italic text-green pr-1">the truth</em><br/>behind your products?
        </h2>
        <p className="text-lg text-ink-3 font-light max-w-[480px] mx-auto mb-10 leading-relaxed">
          Upload any product image and get a full intelligence report in under 12 seconds.
        </p>
        <button 
          onClick={() => navigate('/auth?mode=register')}
          className="btn btn-green btn-lg"
        >
          <ScanLine className="w-5 h-5" />
          Analyze Your First Product
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-ink pt-[64px] pb-[36px] px-12 text-paper-2">
        <div className="max-w-[1320px] mx-auto hidden md:grid grid-cols-5 gap-12 mb-14">
          <div className="col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-2 font-serif text-[18px] font-medium text-paper tracking-tight">
              VisionProbe AI
            </div>
            <p className="text-sm font-light text-paper/50 leading-relaxed max-w-[280px]">
              Visual product intelligence platform. Know what you're buying before you buy it.
            </p>
          </div>
          <div>
            <div className="text-xs font-medium tracking-widest uppercase text-paper/40 mb-5">Product</div>
            <div className="flex flex-col gap-3">
              <a href="#" className="text-sm font-light text-paper/70 hover:text-paper transition-colors">Features</a>
              <a href="#" className="text-sm font-light text-paper/70 hover:text-paper transition-colors">How it works</a>
              <a href="#" className="text-sm font-light text-paper/70 hover:text-paper transition-colors">Pricing</a>
            </div>
          </div>
          <div>
            <div className="text-xs font-medium tracking-widest uppercase text-paper/40 mb-5">Company</div>
            <div className="flex flex-col gap-3">
              <a href="#" className="text-sm font-light text-paper/70 hover:text-paper transition-colors">About</a>
              <a href="#" className="text-sm font-light text-paper/70 hover:text-paper transition-colors">Blog</a>
              <a href="#" className="text-sm font-light text-paper/70 hover:text-paper transition-colors">Contact</a>
            </div>
          </div>
          <div>
            <div className="text-xs font-medium tracking-widest uppercase text-paper/40 mb-5">Legal</div>
            <div className="flex flex-col gap-3">
              <a href="#" className="text-sm font-light text-paper/70 hover:text-paper transition-colors">Privacy</a>
              <a href="#" className="text-sm font-light text-paper/70 hover:text-paper transition-colors">Terms</a>
            </div>
          </div>
        </div>
        <div className="max-w-[1320px] mx-auto border-t border-white/10 pt-7 flex items-center justify-between text-[13px] text-paper/30">
          <span>© 2026 VisionProbe AI. Built with passion.</span>
          <span>Powered by GPT-5.1</span>
        </div>
      </footer>

      {/* Tailwind marquee keyframes are added in index.css or via arbitrary config conceptually */}
    </div>
  );
};

// Sub-components
const marqueeItems = [
  "Visual Identification", "Health Risk Scoring", "Environmental Impact", 
  "Use Case Analysis", "Ethical Shopping", "Ingredient Breakdown", "Smart Alternatives"
];

const FeatureCard = ({ icon, bg, title, desc, wrapperClass = "bg-white hover:bg-paper transition-colors", titleColor = "text-ink", descColor = "text-ink-3" }) => (
  <div className={cn("p-10 flex flex-col gap-4 group cursor-default", wrapperClass)}>
    <div className={cn("w-11 h-11 rounded-lg flex items-center justify-center text-xl shrink-0 transition-transform group-hover:scale-110", bg)}>
      {icon}
    </div>
    <div className={cn("font-serif text-xl font-medium tracking-[-0.02em]", titleColor)}>{title}</div>
    <div className={cn("text-sm font-light leading-relaxed", descColor)}>{desc}</div>
  </div>
);

const AgentRow = ({ icon, name, status, type }) => {
  const statusClasses = {
    done: "bg-green-bg text-green",
    running: "bg-amber-bg text-amber animate-[pulse_1.4s_ease-in-out_infinite]",
    wait: "bg-paper-2 text-ink-4"
  };
  const iconBg = type === 'done' || type === 'running' 
    ? 'bg-green-bg border-green/20' 
    : 'bg-paper-2 border-transparent';

  return (
    <div className="flex items-center gap-3">
      <div className={cn("w-7 h-7 rounded-md flex items-center justify-center text-[13px] shrink-0 border", iconBg)}>{icon}</div>
      <div className="text-[13px] font-medium flex-1 text-ink">{name}</div>
      <div className={cn("text-[10px] font-medium px-2.5 py-1 rounded-full tracking-wide", statusClasses[type])}>
        {status}
      </div>
    </div>
  );
};

const AgentStep = ({ num, icon, name, desc, tag, colorClass, hex, gradientClass, delay }) => (
  <div className={cn(
    "relative flex-1 p-8 flex flex-col gap-4 rounded-[28px] transition-all duration-500",
    "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20",
    "group cursor-default hover:-translate-y-2 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.5)]",
    "animate-in fade-in slide-in-from-bottom-8", delay
  )}>
    {/* Background glow on hover */}
    <div 
        className="absolute inset-0 rounded-[28px] opacity-0 group-hover:opacity-[0.15] transition-opacity duration-500 blur-2xl z-0 pointer-events-none"
        style={{ backgroundColor: hex }} 
    />
    
    <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
            <div className={cn("font-serif text-[14px] font-medium tracking-wider transition-colors", "text-white/30 group-hover:" + colorClass.replace('bg-', 'text-'))}>{num}</div>
            
            {/* Beautiful Icon Container */}
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-transform duration-500 group-hover:scale-110 border",
                gradientClass
            )}>
                {icon}
            </div>
        </div>
        
        <h3 className="font-serif text-[20px] font-normal text-[#F7F4EF] tracking-[-0.01em] mb-3 transition-colors">{name}</h3>
        <p className="text-[14px] font-light text-white/50 leading-[1.65] mb-8 flex-grow">{desc}</p>
        
        <div className="mt-auto">
            <div className="inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.04em] uppercase text-white/70 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/10 group-hover:border-white/20 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full shadow-sm" style={{ backgroundColor: hex }}></span>
                {tag}
            </div>
        </div>
    </div>
  </div>
);

export default LandingPage;
