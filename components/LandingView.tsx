
import React, { useState } from 'react';
import { Terminal, ChevronRight, Activity, Cpu, Globe } from 'lucide-react';
import Logo from './Logo';

interface Props {
  onInitialize: () => void;
}

const LandingView: React.FC<Props> = ({ onInitialize }) => {
  const [booting, setBooting] = useState(false);
  const [bootLog, setBootLog] = useState<string[]>([]);

  const logs = [
    "Establishing secure connection to Infinity Core...",
    "Validating enterprise credentials...",
    "Calibrating probabilistic inference engines...",
    "Indexing latent behavioral vectors...",
    "Synchronizing telemetry stream...",
    "System Ready. Handshake complete."
  ];

  const handleStart = () => {
    setBooting(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setBootLog(prev => [...prev, logs[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(onInitialize, 800);
      }
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col relative overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Structural Background */}
      <div className="absolute inset-0 z-0 opacity-[0.1]" style={{
        backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />
      
      {/* Refined Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] sm:w-[800px] h-[400px] bg-indigo-500/10 rounded-full blur-[80px] sm:blur-[120px]" />
      </div>

      {/* Corporate Header Nav */}
      <nav className="relative z-20 w-full px-6 sm:px-12 py-6 sm:py-10 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <Logo size={22} className="text-white" />
          <div className="h-5 w-px bg-slate-800" />
          <span className="text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.4em] text-slate-400">Infinity Intelligence</span>
        </div>
      </nav>
      
      {/* Centered Content Container */}
      <main className="flex-grow flex flex-col items-center justify-center w-full z-10 px-4 py-12">
        <div className="max-w-4xl w-full flex flex-col items-center">
          {/* Hero Section */}
          <div className="text-center mb-12 sm:mb-16 animate-in fade-in duration-1000 slide-in-from-bottom-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full mb-8">
               <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
               <span className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest">Next-Gen Behavioral Discovery</span>
            </div>
            
            <div className="mb-8 flex flex-col items-center">
              <Logo size={100} className="sm:size-[140px] text-white mb-8" />
              <h1 className="text-4xl sm:text-6xl lg:text-8xl font-extrabold text-white tracking-tighter uppercase leading-tight sm:leading-none mb-6">
                AffinityGraph<span className="text-indigo-500">.</span>
              </h1>
              <p className="max-w-xl mx-auto text-slate-400 text-sm sm:text-lg font-medium leading-relaxed px-4">
                An elite command center for <span className="text-white">probabilistic shopper analytics</span>. Decipher latent intent with sovereign intelligence.
              </p>
            </div>
          </div>

          {/* Action Controller */}
          <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            {booting ? (
              <div className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500/20" />
                 <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <div className="flex items-center gap-3">
                      <Terminal size={14} className="text-indigo-400" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Initialization</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
                    </div>
                 </div>
                 
                 <div className="space-y-3 h-32 overflow-hidden">
                    {bootLog.map((log, i) => (
                      <div key={i} className="text-[10px] font-medium text-slate-400 mono animate-in fade-in slide-in-from-left-2 flex gap-4">
                         <span className="text-slate-700 w-4">0{i+1}</span>
                         <span className="tracking-tight">{log}</span>
                      </div>
                    ))}
                 </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-12 sm:gap-16">
                <button 
                  onClick={handleStart}
                  className="group relative flex items-center gap-4 sm:gap-8 px-10 py-5 sm:px-14 sm:py-7 bg-white text-black rounded-full text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.3em] overflow-hidden transition-all shadow-xl hover:shadow-white/5 active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-slate-100 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10">Access Intelligence Portal</span>
                  <ChevronRight size={18} className="relative z-10 group-hover:translate-x-2 transition-transform" />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 w-full px-4">
                   <div className="flex flex-col items-center sm:items-start gap-4 text-center sm:text-left">
                     <Activity size={18} className="text-indigo-400" />
                     <div>
                       <span className="text-[10px] font-bold text-white uppercase tracking-widest block mb-1">Inference Mapping</span>
                       <p className="text-[9px] font-medium text-slate-500 uppercase leading-relaxed tracking-wider">Neural pattern extraction from raw logs.</p>
                     </div>
                   </div>
                   <div className="flex flex-col items-center sm:items-start gap-4 text-center sm:text-left">
                     <Cpu size={18} className="text-slate-400" />
                     <div>
                       <span className="text-[10px] font-bold text-white uppercase tracking-widest block mb-1">Vector Core</span>
                       <p className="text-[9px] font-medium text-slate-500 uppercase leading-relaxed tracking-wider">High-dimensional intent categorization.</p>
                     </div>
                   </div>
                   <div className="flex flex-col items-center sm:items-start gap-4 text-center sm:text-left">
                     <Globe size={18} className="text-slate-400" />
                     <div>
                       <span className="text-[10px] font-bold text-white uppercase tracking-widest block mb-1">Global Scale</span>
                       <p className="text-[9px] font-medium text-slate-500 uppercase leading-relaxed tracking-wider">Privacy-first sovereign data synthesis.</p>
                     </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingView;
