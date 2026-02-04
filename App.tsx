
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Database, Brain, Activity, ChevronLeft, Terminal, Code, Quote, Rocket,
  Fingerprint, ShieldAlert, Cpu, TrendingUp, Layers, MousePointer2, Box, Command, Search, AlertTriangle, X
} from 'lucide-react';
import { MOCK_SEGMENTS, MOCK_REVIEWS } from './constants';
import { ShopperSegment, MerchandisingRecommendation, PerspectiveMode, Review, LearnedDomainContext, CampaignManifest } from './types';
import { 
  generateMerchandisingRecommendations, getPersonaDetails, discoverSegments, 
  analyzeFriction, generateContextualReviews, synthesizeDomainDNA, generateCampaignManifest, QuotaError
} from './services/geminiService';
import BehavioralMap from './components/BehavioralMap';
import SegmentGrid from './components/SegmentGrid';
import DataUploader from './components/DataUploader';
import NeuralWorkspace from './components/NeuralWorkspace';
import LandingView from './components/LandingView';
import Logo from './components/Logo';
import Walkthrough from './components/Walkthrough';

type ProgressStep = 'idle' | 'parsing' | 'scrubbing' | 'sampling' | 'analyzing';
type AppView = 'landing' | 'dashboard';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('landing');
  const [perspective] = useState<PerspectiveMode>('Merchandising');
  const [error, setError] = useState<{ type: 'quota' | 'general', message: string } | null>(null);
  const [deploymentToast, setDeploymentToast] = useState<string | null>(null);
  
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  useEffect(() => {
    if (view === 'dashboard') {
      const hasSeenWalkthrough = localStorage.getItem('has_seen_walkthrough');
      if (!hasSeenWalkthrough) {
        setShowWalkthrough(true);
      }
    }
  }, [view]);

  const completeWalkthrough = () => {
    setShowWalkthrough(false);
    localStorage.setItem('has_seen_walkthrough', 'true');
  };
  
  const [learnedContext, setLearnedContext] = useState<LearnedDomainContext | null>(() => {
    const saved = localStorage.getItem('neural_dna');
    return saved ? JSON.parse(saved) : null;
  });

  const [segments, setSegments] = useState<ShopperSegment[]>(() => {
    const saved = localStorage.getItem('affinity_segments');
    const raw = saved ? JSON.parse(saved) : MOCK_SEGMENTS;
    return raw.map((s: any) => ({ ...s, patternStabilityIndex: s.patternStabilityIndex ?? s.confidenceScore ?? 85 }));
  });
  
  const [activeReviews, setActiveReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('active_reviews');
    return saved ? JSON.parse(saved) : MOCK_REVIEWS;
  });

  const [selectedSegmentId, setSelectedSegmentId] = useState(segments[0]?.id || MOCK_SEGMENTS[0].id);
  const [recommendations, setRecommendations] = useState<MerchandisingRecommendation[]>([]);
  const [personaDetails, setPersonaDetails] = useState<any>(null);
  const [frictionData, setFrictionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [profilingLoading, setProfilingLoading] = useState(false);
  const [progressStep, setProgressStep] = useState<ProgressStep>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  
  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev.slice(-4), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  useEffect(() => {
    if (logs.length === 0) {
      if (learnedContext) {
        addLog(`Infinity Core stabilized for ${learnedContext.domainName}.`);
      } else {
        addLog("Neural core initialized. Awaiting behavioral telemetry.");
      }
    }
  }, [learnedContext, logs.length, addLog]);

  const activeSegment = useMemo(() => 
    segments.find(s => s.id === selectedSegmentId) || segments[0],
  [segments, selectedSegmentId]);

  const handleImportDNA = (dna: LearnedDomainContext) => {
    setLearnedContext(dna);
    localStorage.setItem('neural_dna', JSON.stringify(dna));
    addLog(`Transferable Hypothesis Injected: ${dna.domainName}.`);
  };

  const handleSegmentUpdate = async (id: string, updates: Partial<ShopperSegment>) => {
    const seg = segments.find(s => s.id === id);
    if (updates.status === 'Active Strategy' && seg) {
      addLog(`DEPLOYMENT INITIATED: Synthesizing Tactical Manifest for ${seg.name}...`);
      try {
        const manifest = await generateCampaignManifest(seg, learnedContext);
        setSegments(prev => prev.map(s => s.id === id ? { ...s, ...updates, manifest } : s));
        addLog(`DEPLOYMENT COMPLETE: ${seg.name} manifest loaded into Tactical Overlay.`);
        setDeploymentToast(seg.name);
        setTimeout(() => setDeploymentToast(null), 3000);
      } catch (err) {
        addLog(`DEPLOYMENT FAILED: AI synthesis interrupted.`);
      }
    } else {
      setSegments(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    }
  };

  const fetchInsights = useCallback(async (targetSegments: ShopperSegment[], reviews: Review[], ctx: LearnedDomainContext | null) => {
    setLoading(true);
    setError(null);
    try {
      const recs = await generateMerchandisingRecommendations(targetSegments, ctx);
      setRecommendations(recs);
    } catch (err: any) {
      if (err instanceof QuotaError) {
        setError({ type: 'quota', message: err.message });
      }
    } finally {
      setLoading(false);
      setProgressStep('idle');
    }
  }, []);

  useEffect(() => {
    if (recommendations.length === 0 && view === 'dashboard') fetchInsights(segments, activeReviews, learnedContext);
  }, [fetchInsights, segments, activeReviews, learnedContext, recommendations.length, view]);

  useEffect(() => {
    if (!activeSegment || view === 'landing') return;
    setProfilingLoading(true);
    const timer = setTimeout(async () => {
      try {
        const [persona, friction] = await Promise.all([
          getPersonaDetails(activeSegment, learnedContext),
          analyzeFriction(activeSegment, activeReviews)
        ]);
        setPersonaDetails(persona);
        setFrictionData(friction);
      } catch (err: any) {
        if (err instanceof QuotaError) {
          setError({ type: 'quota', message: err.message });
        }
      } finally {
        setProfilingLoading(false);
      }
    }, 500); 
    return () => clearTimeout(timer);
  }, [selectedSegmentId, segments, activeReviews, learnedContext, activeSegment, view]);

  const handleCustomDataLoaded = async (cleanedData: any[], headers: string[]) => {
    setLoading(true);
    setError(null);
    addLog("Ingesting telemetry stream...");
    
    try {
      setProgressStep('parsing');
      const stride = Math.max(1, Math.floor(cleanedData.length / 50));
      const sample = cleanedData.filter((_, i) => i % stride === 0).slice(0, 50);
      const newDna = await synthesizeDomainDNA(sample, headers, learnedContext);
      setLearnedContext(newDna);
      localStorage.setItem('neural_dna', JSON.stringify(newDna));
      setProgressStep('analyzing');
      const discovered = await discoverSegments(sample, headers, newDna);
      const contextReviews = await generateContextualReviews(discovered, newDna);
      setSegments(discovered);
      setActiveReviews(contextReviews);
      localStorage.setItem('affinity_segments', JSON.stringify(discovered));
      localStorage.setItem('active_reviews', JSON.stringify(contextReviews));
      setSelectedSegmentId(discovered[0].id);
      addLog(`Synthesis complete. Maturity: ${newDna.maturityIndex}%`);
      await fetchInsights(discovered, contextReviews, newDna);
    } catch (err: any) {
      if (err instanceof QuotaError) {
        setError({ type: 'quota', message: err.message });
      }
    } finally {
      setLoading(false);
      setProgressStep('idle');
    }
  };

  if (view === 'landing') return <LandingView onInitialize={() => setView('dashboard')} />;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col overflow-x-hidden pb-24 selection:bg-indigo-500/30">
      <Walkthrough isVisible={showWalkthrough} onComplete={completeWalkthrough} />
      
      <nav className="sticky top-0 z-[1000] bg-[#020617]/95 backdrop-blur-2xl border-b border-white/5 h-20 flex items-center">
        <div className="max-w-[1600px] w-full mx-auto px-10 flex items-center justify-between">
          <div className="flex items-center gap-10 cursor-pointer" onClick={() => setView('landing')}>
            <div className="flex items-center gap-4">
              <Logo size={24} className="text-white" />
              <div className="h-6 w-px bg-slate-800" />
              <div className="flex flex-col">
                <h1 className="text-lg font-black tracking-tighter text-white uppercase leading-none">AffinityGraph<span className="text-indigo-500">.</span></h1>
                <span className="text-[9px] font-bold tracking-[0.4em] text-slate-500 uppercase mt-1 italic leading-none">Intelligence Hub</span>
              </div>
            </div>
          </div>
          <button onClick={() => setView('landing')} className="flex items-center gap-3 px-8 py-3 bg-slate-900 border border-white/10 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all shadow-xl">
             <ChevronLeft size={14} /> Exit Hub
          </button>
        </div>
      </nav>

      <main className="max-w-[1600px] w-full mx-auto px-10 flex-grow py-12 flex flex-col gap-14">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div id="walkthrough-ingestion" className="lg:col-span-4 h-full">
            <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10 flex flex-col shadow-2xl h-full">
              <div className="flex flex-col gap-2 mb-10">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                  <Database size={16} className="text-indigo-500" /> Ingestion Protocols
                </h3>
                <p className="text-[8px] text-slate-700 font-bold uppercase tracking-widest">Feed behavioral logs for neural pattern discovery.</p>
              </div>
              <DataUploader onDataLoaded={handleCustomDataLoaded} isLoading={loading} progressStep={progressStep} />
            </div>
          </div>
          <div id="walkthrough-workspace" className="lg:col-span-8 h-full">
            <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 flex flex-col shadow-2xl h-full">
              <div className="flex flex-col gap-2 mb-10">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                  <Brain size={16} className="text-indigo-500" /> Neural Workspace Core
                </h3>
                <p className="text-[8px] text-slate-700 font-bold uppercase tracking-widest">Global governing logic and latent purchase correlators.</p>
              </div>
              <NeuralWorkspace dna={learnedContext} segments={segments} onImport={handleImportDNA} />
            </div>
          </div>
        </section>

        <section id="walkthrough-segments">
          <div className="flex flex-col gap-3 mb-12">
            <div className="flex items-center gap-8">
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[1.2em] whitespace-nowrap">Archetype Discovery Hub</h3>
              <div className="h-px w-full bg-white/5" />
            </div>
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">Validated consumer clusters identified from the telemetry stream.</p>
          </div>
          <SegmentGrid segments={segments} selectedId={selectedSegmentId} onSelect={setSelectedSegmentId} onUpdate={handleSegmentUpdate} onRefine={() => {}} perspective={perspective} />
        </section>

        <section className="grid grid-cols-1 2xl:grid-cols-12 gap-10 items-stretch">
          <div id="walkthrough-diagnostics" className="2xl:col-span-8 flex flex-col">
            <div className="bg-slate-900/50 border border-white/10 rounded-[3rem] p-12 shadow-3xl flex flex-col h-full">
              <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-10 mb-12 shrink-0">
                <div className="flex items-center gap-6">
                  <div className={`p-4 rounded-2xl border transition-all duration-700 shadow-2xl ${activeSegment.status === 'Active Strategy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-950 text-indigo-400 border-white/10'}`}>
                    {activeSegment.status === 'Active Strategy' ? <Rocket size={24} className="animate-pulse" /> : <Command size={24} />}
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic leading-none">{activeSegment.name} Profile Diagnostics</h3>
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest italic leading-none">High-fidelity behavioral reconstruction across key nodes.</p>
                  </div>
                </div>
              </div>

              {profilingLoading || !personaDetails ? (
                <div className="h-[500px] flex-grow flex flex-col items-center justify-center gap-6">
                  <div className="w-12 h-12 border-4 border-slate-900 border-t-indigo-500 rounded-full animate-spin" />
                  <span className="text-[10px] text-slate-700 font-black uppercase tracking-[0.5em]">Synchronizing Intelligence...</span>
                </div>
              ) : (
                <div className="grid grid-cols-[380px_1fr_300px] gap-10 items-stretch flex-grow h-full">
                  <div className="flex flex-col gap-4 bg-slate-950 p-10 rounded-[2.5rem] border border-white/5 shadow-2xl h-full">
                    <div className="flex flex-col gap-2 mb-8">
                       <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-2"><Search size={14} /> Intent Matrix</h4>
                       <p className="text-[8px] text-slate-700 font-bold uppercase tracking-widest">Inferred cognitive drivers.</p>
                    </div>
                    <p className="text-[13px] font-bold text-slate-300 uppercase leading-relaxed tracking-tight italic border-l-2 border-indigo-500/20 pl-6 mb-10">
                      "{personaDetails?.backstory}"
                    </p>
                    <div className="space-y-3">
                       {activeSegment.characteristics.map((c, i) => (
                         <div key={i} className="flex items-center justify-between px-5 py-3.5 bg-white/5 rounded-2xl border border-white/5 group shadow-sm">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{c}</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]" />
                         </div>
                       ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 bg-slate-950 p-10 rounded-[2.5rem] border border-white/5 shadow-2xl h-full">
                    <div className="flex flex-col gap-2 mb-10">
                       <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] flex items-center gap-2"><Activity size={14} /> Topography</h4>
                       <p className="text-[8px] text-slate-700 font-bold uppercase tracking-widest">Statistical distribution of core events.</p>
                    </div>
                    <div className="space-y-12">
                       <div className="flex flex-col gap-4">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase">
                             <span className="text-slate-500">Retention Baseline</span>
                             <span className="text-emerald-400 mono">{activeSegment.kpis.retentionLikelihood}%</span>
                          </div>
                          <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                             <div className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981]" style={{ width: `${activeSegment.kpis.retentionLikelihood}%` }} />
                          </div>
                       </div>
                       <div className="flex flex-col gap-4">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase">
                             <span className="text-slate-500">Churn Propensity</span>
                             <span className="text-rose-500 mono">{activeSegment.kpis.churnPropensity}%</span>
                          </div>
                          <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                             <div className="h-full bg-rose-500/50" style={{ width: `${activeSegment.kpis.churnPropensity}%` }} />
                          </div>
                       </div>
                       <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-8">
                          <div className="flex flex-col gap-2">
                             <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Inferred AOV</span>
                             <span className="text-2xl font-black text-white mono leading-none tracking-tighter">{activeSegment.kpis.estimatedAOV}</span>
                          </div>
                          <div className="flex flex-col gap-2 pl-6 border-l border-white/5">
                             <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Stability Index</span>
                             <span className="text-2xl font-black text-indigo-400 mono leading-none tracking-tighter">{activeSegment.patternStabilityIndex}%</span>
                          </div>
                       </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 bg-slate-950 p-10 rounded-[2.5rem] border border-white/5 shadow-2xl h-full">
                    <div className="flex flex-col gap-2 mb-10">
                       <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-[0.4em] flex items-center gap-2"><ShieldAlert size={14} /> Friction Gaps</h4>
                       <p className="text-[8px] text-slate-700 font-bold uppercase tracking-widest">Bottlenecks in the cognitive journey.</p>
                    </div>
                    <div className="flex items-center justify-between mb-8">
                       <span className="text-5xl font-black text-white mono italic tracking-tighter">{frictionData?.frictionScore || 0}%</span>
                       <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500 border border-rose-500/10">
                          <TrendingUp size={20} className="rotate-180" />
                       </div>
                    </div>
                    <div className="space-y-4">
                       {(frictionData?.primaryGaps || []).slice(0, 3).map((gap: string, i: number) => (
                         <div key={i} className="flex gap-4 items-start group">
                            <span className="text-rose-500 font-black text-xs">!</span>
                            <p className="text-[10px] font-bold text-slate-500 uppercase leading-snug tracking-tighter group-hover:text-slate-300 transition-colors">{gap}</p>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div id="walkthrough-playbook" className="2xl:col-span-4 flex flex-col h-full">
            <div className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 flex flex-col shadow-2xl h-full">
              <div className="flex flex-col gap-2 mb-10">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                  <Layers size={16} className="text-indigo-500" /> Strategic Playbook
                </h3>
                <p className="text-[8px] text-slate-700 font-bold uppercase tracking-widest">Synthesized merchandising plays for identified clusters.</p>
              </div>
              <div className="space-y-5 flex-grow overflow-y-auto custom-scrollbar pr-2">
                {recommendations.length > 0 ? recommendations.map((rec, idx) => (
                  <div key={idx} className="group p-8 rounded-3xl bg-slate-950 border border-white/5 hover:border-indigo-500/40 transition-all shadow-xl">
                    <div className="flex justify-between items-start mb-6">
                       <div className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase rounded border border-indigo-500/20 tracking-widest">
                         {rec.strategyType}
                       </div>
                       <span className="text-[10px] font-black text-emerald-400 italic">+{rec.metricLift?.value} Alpha</span>
                    </div>
                    <h4 className="text-sm font-black text-white mb-2 uppercase italic leading-tight">{rec.title}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed tracking-tight mb-8 line-clamp-2">{rec.action}</p>
                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                       <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Risk: {rec.complexity}</span>
                       <MousePointer2 size={12} className="text-slate-800 group-hover:text-indigo-500 transition-colors" />
                    </div>
                  </div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-10 py-40">
                    <Box size={40} className="mb-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">No strategies synthesized</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="walkthrough-matrix">
          <div className="flex flex-col gap-3 mb-12">
            <div className="flex items-center gap-8">
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[1.2em] whitespace-nowrap">Neural Affinity Matrix</h3>
              <div className="h-px w-full bg-white/5" />
            </div>
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">Cross-dimensional category mapping and spend propensity vectors.</p>
          </div>
          <BehavioralMap segments={segments} selectedId={selectedSegmentId} onSelect={setSelectedSegmentId} />
        </section>
      </main>
    </div>
  );
};

export default App;
