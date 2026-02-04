
import React, { useState } from 'react';
import { 
  CheckCircle2, FlaskConical, Gavel, 
  ArrowUpRight, BarChart3, AlertTriangle, Loader2
} from 'lucide-react';
import { ShopperSegment, LifecycleStatus, PerspectiveMode } from '../types';

interface Props {
  segments: ShopperSegment[];
  selectedId: string;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ShopperSegment>) => void;
  onRefine: (id: string, instruction: string) => void;
  perspective: PerspectiveMode;
}

const SegmentGrid: React.FC<Props> = ({ segments, selectedId, onSelect, onUpdate, onRefine, perspective }) => {
  const [refiningId, setRefiningId] = useState<string | null>(null);
  const [refinePrompt, setRefinePrompt] = useState("");
  const [deployingId, setDeployingId] = useState<string | null>(null);

  const handleExecute = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeployingId(id);
    setTimeout(() => {
      onUpdate(id, { status: 'Active Strategy' });
      setDeployingId(null);
    }, 1500);
  };

  const getStatusBadge = (status: LifecycleStatus) => {
    switch(status) {
      case 'Discovery': 
        return <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-widest border border-amber-500/20"><FlaskConical size={10} /> Discovery Mode</span>;
      case 'Peer Review': 
        return <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[8px] font-black uppercase tracking-widest border border-indigo-500/20"><Gavel size={10} /> Validation Sync</span>;
      case 'Active Strategy': 
        return <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20"><CheckCircle2 size={10} /> Tactical Active</span>;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {segments.map((seg) => {
        const isSelected = selectedId === seg.id;
        const isRefining = refiningId === seg.id;
        const isLowStability = seg.patternStabilityIndex < 50;
        const isDeploying = deployingId === seg.id;

        return (
          <div
            key={seg.id}
            onClick={() => !isRefining && onSelect(seg.id)}
            className={`group relative flex flex-col p-10 rounded-[2.5rem] border transition-all duration-500 cursor-pointer ${
              isSelected 
                ? 'bg-slate-900 border-indigo-500 shadow-2xl -translate-y-2' 
                : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex justify-between items-start mb-8">
              {getStatusBadge(seg.status)}
              <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                seg.growthTrend === 'Momentum' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                seg.growthTrend === 'At Risk' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                'bg-slate-800 text-slate-500 border-slate-700'
              }`}>
                Trend: {seg.growthTrend}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic">{seg.name}</h4>
                {isLowStability && (
                  <div className="p-1 bg-amber-500/10 rounded-lg text-amber-500 border border-amber-500/20">
                     <AlertTriangle size={14} />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-bold uppercase leading-relaxed tracking-tight line-clamp-3 mb-6">{seg.description}</p>
              
              {isLowStability && (
                <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 mb-6">
                   <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest leading-tight">Data Sparse Node: Pattern stability index reflects low confidence markers.</p>
                </div>
              )}
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 flex items-center justify-between shadow-inner">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Inferred CLV Potential</span>
                  <div className="flex items-center gap-3">
                    <BarChart3 size={14} className="text-indigo-500" />
                    <span className="text-[11px] font-black text-white italic uppercase tracking-widest">{seg.kpis.clvPotential} Priority</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t border-slate-800 flex justify-between items-end">
              <div className="flex flex-col gap-3">
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Neural Stability Index</span>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-24 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                    <div className={`h-full ${isLowStability ? 'bg-amber-500' : 'bg-indigo-600'}`} style={{ width: `${seg.patternStabilityIndex}%` }} />
                  </div>
                  <span className={`text-[10px] font-black mono ${isLowStability ? 'text-amber-500' : 'text-slate-400'}`}>{seg.patternStabilityIndex}%</span>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <span className="text-[11px] font-black text-slate-300 mono leading-none">{seg.sampleSize.toLocaleString()}</span>
                <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest">Validated Telemetry Nodes</span>
              </div>
            </div>
            
            {isSelected && seg.status !== 'Active Strategy' && (
              <button 
                onClick={(e) => handleExecute(e, seg.id)}
                disabled={isDeploying}
                className={`mt-10 w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${
                  isDeploying 
                  ? 'bg-indigo-600/50 text-indigo-100 cursor-not-allowed' 
                  : 'bg-white text-black hover:bg-indigo-600 hover:text-white'
                }`}
              >
                {isDeploying ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Sequencing Tactical Manifest...
                  </>
                ) : (
                  <>
                    Deploy Strategy Manifest <ArrowUpRight size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SegmentGrid;
