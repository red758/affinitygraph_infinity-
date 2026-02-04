
import React from 'react';
import { Brain, Download, Upload, Shield, Zap, Workflow, Fingerprint, Activity, FileDown, Layers } from 'lucide-react';
import { LearnedDomainContext, ShopperSegment } from '../types';

interface Props {
  dna: LearnedDomainContext | null;
  segments: ShopperSegment[];
  onImport: (dna: LearnedDomainContext) => void;
}

const NeuralWorkspace: React.FC<Props> = ({ dna, segments, onImport }) => {
  const exportDNA = () => {
    if (!dna) return;
    const blob = new Blob([JSON.stringify(dna, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dna.domainName.replace(/\s+/g, '_')}_NeuralCore.dna`;
    a.click();
  };

  const exportCleanedCSV = () => {
    if (!segments.length) return;
    const categories: string[] = Array.from(new Set(segments.flatMap(s => Object.keys(s.affinityScores)) as string[]));
    const headers = [
      'Segment_ID', 'Name', 'Status', 'AOV_Projection', 'CLV_Potential', 'Retention_Likelihood', 'Growth_Trend', 'Pattern_Stability_Index', 'Sample_Size',
      ...categories.map(c => `Affinity_${c.replace(/\s+/g, '_')}`),
      'Characteristics', 'Rationale'
    ];
    const rows = segments.map(s => {
      const affinityValues = categories.map(cat => s.affinityScores[cat] || 0);
      return [s.id, `"${s.name.replace(/"/g, '""')}"`, s.status, s.kpis.estimatedAOV, s.kpis.clvPotential, `${s.kpis.retentionLikelihood}%`, s.growthTrend, `${s.patternStabilityIndex}%`, s.sampleSize, ...affinityValues, `"${s.characteristics.join('; ')}"`, `"${s.behavioralRationale.replace(/"/g, '""')}"`];
    });
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dna?.domainName || 'Structured'}_Dataset_Clean.csv`;
    a.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        onImport(imported);
      } catch (err) {
        alert("Corrupted DNA sequence. Injection failed.");
      }
    };
    reader.readAsText(file);
  };

  if (!dna) return (
    <div className="glass-panel p-10 rounded-[3rem] border-dashed border-white/20 text-center relative flex flex-col items-center justify-center h-full">
       <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-slate-500 border border-white/5">
          <Brain size={32} />
       </div>
       <h4 className="text-xl font-black text-white italic uppercase mb-2">The Intelligence Center</h4>
       <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-10 max-w-xl">
         Awaiting behavioral telemetry ingestion for neural synthesis. Advanced users can bypass training by injecting pre-trained logic files (.dna).
       </p>
       <label className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20">
          <Upload size={14} /> Inject Pre-trained Brain (.dna)
          <input type="file" className="hidden" accept=".dna,.json" onChange={handleFileUpload} />
       </label>
    </div>
  );

  return (
    <div className="glass-panel p-10 rounded-[3rem] relative h-full flex flex-col">
      <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
        <Brain size={150} />
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start gap-10 mb-12 relative z-10 shrink-0">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <Shield size={24} className="text-emerald-400" />
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">Intelligence Node: {dna.domainName}</h3>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <Layers size={12} className="text-indigo-400" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Node Maturity: {dna.maturityIndex}%</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em]">Engine v{dna.version || '2.4.0'}</span>
             </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <button onClick={exportDNA} className="flex flex-col items-start gap-1 group">
             <div className="flex items-center gap-3 px-6 py-2 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-700 transition-all shadow-lg">
                <Download size={14} /> Export Logic
             </div>
             <span className="text-[7px] text-slate-600 uppercase font-black tracking-widest pl-1">Save neural weights</span>
          </button>

          <button onClick={exportCleanedCSV} className="flex flex-col items-start gap-1 group">
             <div className="flex items-center gap-3 px-6 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 transition-all shadow-lg">
                <FileDown size={14} /> Export Dataset
             </div>
             <span className="text-[7px] text-slate-600 uppercase font-black tracking-widest pl-1">Structured CSV stream</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10 flex-grow">
         <div className="flex flex-col gap-8 h-full">
            <div className="flex flex-col gap-2">
              <h5 className="flex items-center gap-2 text-[11px] font-black text-indigo-400 uppercase tracking-widest leading-none">
                <Workflow size={14}/> Behavioral Logic
              </h5>
              <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest italic">Inferred governing principles.</p>
            </div>
            <div className="space-y-3 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
               {dna.keyBehavioralRules.map((rule, i) => (
                 <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 text-[11px] text-slate-300 font-bold leading-relaxed shadow-sm">
                    <span className="text-indigo-500 mr-2 font-black italic">0{i+1}</span> {rule}
                 </div>
               ))}
            </div>
         </div>

         <div className="lg:col-span-2 flex flex-col gap-8 h-full">
            <div className="flex flex-col gap-2">
              <h5 className="flex items-center gap-2 text-[11px] font-black text-amber-400 uppercase tracking-widest leading-none">
                 <Fingerprint size={14}/> Latent Correlators
              </h5>
              <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest italic">Hidden connections discovered in logs.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
               {dna.latentCorrelators?.map((cor, i) => (
                 <div key={i} className="p-6 bg-white/5 rounded-[2rem] border border-white/5 flex flex-col gap-3 group hover:bg-amber-500/5 hover:border-amber-500/30 transition-all">
                    <div className="flex items-center gap-2 text-amber-500">
                       <Zap size={14} />
                       <span className="text-[10px] font-black uppercase tracking-tighter line-clamp-1">{cor.trigger}</span>
                    </div>
                    <p className="text-lg font-black text-white italic uppercase tracking-tight leading-tight">{cor.result}</p>
                    <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase tracking-tight opacity-70">Logic Node: {cor.logic}</p>
                 </div>
               ))}
            </div>
         </div>

         <div className="flex flex-col gap-8 h-full">
            <div className="flex flex-col gap-2">
              <h5 className="flex items-center gap-2 text-[11px] font-black text-emerald-400 uppercase tracking-widest leading-none">
                 <Activity size={14}/> Probabilistic Weights
              </h5>
              <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest italic">Importance index per category node.</p>
            </div>
            <div className="space-y-4 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
               {Object.entries(dna.behavioralWeights).map(([feature, weight], i) => (
                 <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/5 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{feature}</span>
                       <span className="text-[11px] font-black text-white mono">{(Number(weight) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                       <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: `${Number(weight) * 100}%` }} />
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default NeuralWorkspace;
