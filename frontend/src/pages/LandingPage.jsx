import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Zap, Shield, Eye, BarChart3, Cpu } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Hero Section */}
      <div className="relative h-screen w-full overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{ 
            backgroundImage: 'url("/static/background.jpg")', 
            filter: 'brightness(0.4)'
          }}
        />
        
        {/* Overlay Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Navigation - Transparent & Minimal */}
          <nav className="flex justify-between items-center px-8 py-6">
            <div className="text-2xl font-bold text-white tracking-tight">
              VisionProbe AI
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => navigate('/auth?mode=signin')}
                className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Sign in
              </button>
              <button 
                onClick={() => navigate('/auth?mode=register')}
                className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg transition-colors border border-white/10"
              >
                Register
              </button>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              Product Intelligence
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Reimagined
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl font-light">
              "From image to insight — understand products before you use or buy them."
            </p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 text-lg font-semibold text-background bg-white hover:bg-gray-100 rounded-full transition-all transform hover:scale-105 shadow-lg"
            >
              Try Now
            </button>
          </div>
        </div>
      </div>

      {/* Features & Benefits Section */}
      <div className="py-24 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why VisionProbe AI?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Advanced computer vision technology that reveals the hidden details of any product.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-24">
            <FeatureCard 
              icon={<Shield className="w-8 h-8 text-emerald-400" />}
              title="Safety First"
              description="Instantly identify hazardous materials, recall notices, and safety warnings hidden in fine print."
            />
            <FeatureCard 
              icon={<Eye className="w-8 h-8 text-blue-400" />}
              title="Deep Analysis"
              description="Our AI sees what you miss. From ingredient sourcing to environmental impact scores."
            />
            <FeatureCard 
              icon={<BarChart3 className="w-8 h-8 text-purple-400" />}
              title="Market Insights"
              description="Compare products against market standards and get real-time pricing intelligence."
            />
          </div>

          {/* Specs Section */}
          <div className="bg-secondary/30 rounded-3xl p-8 md:p-12 border border-white/5">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-6">Technical Specifications</h3>
                <ul className="space-y-4">
                  <SpecItem text="Multi-modal GPT-4o Vision Analysis" />
                  <SpecItem text="Real-time Hazard Detection" />
                  <SpecItem text="ISO 9001 Compliance Checking" />
                  <SpecItem text="Sub-second Processing Latency" />
                  <SpecItem text="Enterprise-grade Encryption" />
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <StatBox number="99.9%" label="Accuracy" />
                <StatBox number="<2s" label="Analysis Time" />
                <StatBox number="50+" label="Data Points" />
                <StatBox number="24/7" label="Availability" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="p-6 rounded-2xl bg-secondary/20 border border-white/5 hover:bg-secondary/40 transition-colors">
    <div className="mb-4 p-3 bg-background/50 w-fit rounded-xl">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const SpecItem = ({ text }) => (
  <li className="flex items-center gap-3 text-gray-300">
    <CheckCircle2 className="w-5 h-5 text-primary" />
    <span>{text}</span>
  </li>
);

const StatBox = ({ number, label }) => (
  <div className="p-6 bg-background/50 rounded-xl text-center border border-white/5">
    <div className="text-3xl font-bold text-white mb-1">{number}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>
);

export default LandingPage;
