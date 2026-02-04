
import React, { useMemo, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Label } from 'recharts';
import { Binary, Globe, Target, Share2, TrendingUp, Cpu, Compass, ShieldCheck, AlertCircle, Layers } from 'lucide-react';
import { ShopperSegment } from '../types';

interface Props {
  segments: ShopperSegment[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const BehavioralMap: React.FC<Props> = ({ segments, selectedId, onSelect }) => {
  const [view, setView] = useState<'matrix' | 'projection'>('matrix');

  const categories = useMemo(() => {
    if (!segments.length) return [];
    const allCats = new Set<string>();
    segments.forEach(s => Object.keys(s.affinityScores).forEach(c => allCats.add(c)));
    return Array.from(allCats);
  }, [segments]);

  const [xAxisDim, setXAxisDim] = useState<string>('');
  const [yAxisDim, setYAxisDim] = useState<string>('');

  const averages = useMemo(() => {
    const res: Record<string, number> = {};
    categories.forEach(cat => {
      const sum = segments.reduce((sum, s) => sum + (s.affinityScores[cat] || 0), 0);
      res[cat] = sum / (segments.length || 1);
    });
    return res;
  }, [categories, segments]);

  useMemo(() => {
    if (categories.length >= 2 && (!xAxisDim || !yAxisDim)) {
      const variances = categories.map(cat => {
        const scores = segments.map(s => s.affinityScores[cat] || 0);
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
        return { cat, variance };
      }).sort((a, b) => b.variance - a.variance);
      
      setXAxisDim(variances[0].cat);
      setYAxisDim(variances[1].cat);
    }
  }, [categories, segments, xAxisDim, yAxisDim]);

  const projectionData = useMemo(() => {
    if (!xAxisDim || !yAxisDim) return [];
    return segments.map(seg => ({
      name: seg.name,
      x: seg.affinityScores[xAxisDim] || 0,
      y: seg.affinityScores[yAxisDim] || 0,
      z: seg.sampleSize,
      id: seg.id
    }));
  }, [segments, xAxisDim, yAxisDim]);

  const chartDomains = useMemo(() => {
    if (!projectionData.length) return { x: [0, 100], y: [0, 100] };
    const xValues = projectionData.map(d => d.x);
    const yValues = projectionData.map(d => d.y);
    const getPadding = (vals: number[]) => {
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const range = max - min || 10;
      return [Math.max(0, min - range * 0.15), max + range * 0.15];
    };
    return {
      x: getPadding(xValues),
      y: getPadding(yValues)
    };
  }, [projectionData]);

  const matrixData = useMemo(() => {
    return segments.map(seg => ({
      id: seg.id,
      name: seg.name,
      patternStabilityIndex: seg.patternStabilityIndex,
      affinities: categories.map(cat => {
        const score = seg.affinityScores[cat] || 0;
        const avg = averages[cat] || 1;
        const index = ((score / avg) - 1) * 100;
        return { category: cat, score, index };
      })
    }));
  }, [categories, segments, averages]);

  const similarityData = useMemo(() => {
    const active = segments.find(s => s.id === selectedId);
    if (!active || segments.length < 2) return [];
    return segments
      .filter(s => s.id !== selectedId)
      .map(s => {
        let dotProduct = 0;
        let magA = 0;
        let magB = 0;
        categories.forEach(cat => {
          const valA = active.affinityScores[cat] || 0;
          const valB = s.affinityScores[cat] || 0;
          dotProduct += valA * valB;
          magA += valA * valA;
          magB += valB * valB;
        });
        const similarity = dotProduct / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
        return { name: s.name, id: s.id, score: Math.round(similarity * 100) };
      })
      .sort((a, b) => b.score - a.score);
  }, [segments, selectedId, categories]);

  // Mathematically precise Euclidean distance from the aggregate centroid
  const calculatedDelta = useMemo(() => {
    const active = segments.find(s => s.id === selectedId);
    if (!active || !categories.length) return 0;
    
    let squaredDiffSum = 0;
    categories.forEach(cat => {
      const val = active.affinityScores[cat] || 0;
      const avg = averages[cat] || 0;
      squaredDiffSum += Math.pow(val - avg, 2);
    });
    
    // Normalize based on number of dimensions to keep it comparable
    return Math.sqrt(squaredDiffSum) / Math.sqrt(categories.length);
  }, [segments, selectedId, categories, averages]);

  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const getAffinityColor = (index: number, isSelected: boolean) => {
    if (index > 40) return isSelected ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-indigo-600/90 border-indigo-500/30 text-white';
    if (index > 15) return isSelected ? 'bg-indigo-500/40 border-indigo-500/20 text-white' : 'bg-indigo-500/10 border-indigo-500/10 text-indigo-300';
    if (index > 0) return isSelected ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-800/30 border-white/5 text-slate-400';
    return isSelected ? 'bg-rose-950/30 border-rose-500/40 text-rose-500' : 'bg-rose-950/10 border-transparent text-rose-950/20 opacity-30';
  };

  const gridTemplateColumns = `280px repeat(${categories.length}, minmax(120px, 1fr))`;

  if (!segments.length) return null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
      <div className="xl:col-span-9 bg-slate-900/40 p-10 rounded-[2.5rem] border border-white/10 shadow-3xl flex flex-col min-h-[700px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div>
            <div className="flex items-center gap-5 mb-3">
              <div className="p-3 bg-indigo-600/10 rounded-xl text-indigo-400 border border-indigo-500/20 shadow-inner">
                <Binary size={24} />
              </div>
              <h3 className="text-2xl lg:text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Hypothesis Synthesis Matrix</h3>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] ml-2">Mapping behavioral nodes against category-specific affinity vectors.</p>
          </div>
          
          <div className="flex bg-slate-950/80 p-1 rounded-xl border border-white/10 shadow-inner backdrop-blur-xl shrink-0">
            <button 
                onClick={() => setView('matrix')}
                className={`flex items-center gap-3 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'matrix' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}
            >
              <Target size={14} /> Matrix View
            </button>
            <button 
                onClick={() => setView('projection')}
                className={`flex items-center gap-3 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'projection' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}
            >
              <Globe size={14} /> Vector Projection
            </button>
          </div>
        </div>

        {view === 'matrix' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 p-8 bg-slate-950/60 rounded-3xl border border-white/5">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded bg-indigo-500 shadow-[0_0_10px_#6366f1]" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Primary Affinity</span>
                </div>
                <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed tracking-tight">Significant correlation detected in purchase logs.</p>
            </div>
            <div className="flex flex-col gap-2 border-l border-white/5 pl-8">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded bg-slate-800 border border-slate-700" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Global Baseline</span>
                </div>
                <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed tracking-tight">Calculated average for the entire consumer cluster.</p>
            </div>
            <div className="flex flex-col gap-2 border-l border-white/5 pl-8">
                <div className="flex items-center gap-3 text-emerald-500">
                  <TrendingUp size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Growth Alpha</span>
                </div>
                <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed tracking-tight">Percentage variance against the established mean.</p>
            </div>
          </div>
        )}

        <div className="flex-grow relative overflow-hidden">
          {view === 'matrix' ? (
            <div className="w-full h-full overflow-x-auto custom-scrollbar pb-8">
              <div className="min-w-max flex flex-col gap-4 pt-4">
                <div 
                  className="grid px-8 border-b border-white/5 pb-8 sticky top-0 bg-[#020617] z-[50]"
                  style={{ gridTemplateColumns }}
                >
                  <div className="sticky left-0 bg-[#020617] z-[60] flex flex-col gap-1 pr-10 justify-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] whitespace-nowrap">Vector Origin Node</span>
                    <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Primary cluster ID</span>
                  </div>
                  {categories.map(cat => (
                    <div key={cat} className="flex flex-col items-center justify-center gap-1.5 text-center px-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] break-words line-clamp-2 max-w-[100px] leading-tight">{cat}</span>
                      <span className="text-[8px] font-bold text-slate-700 uppercase tracking-tighter whitespace-nowrap">Mean: {Math.round(averages[cat] || 0)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  {matrixData.map((row) => (
                    <div 
                      key={row.id} 
                      onClick={() => onSelect(row.id)}
                      className={`grid px-8 py-7 rounded-2xl border transition-all duration-300 cursor-pointer items-center group/row relative ${
                        selectedId === row.id 
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-2xl translate-x-2 z-[40]' 
                          : 'bg-slate-950/50 border-white/5 text-slate-400 hover:bg-slate-900 z-[30]'
                      }`}
                      style={{ gridTemplateColumns }}
                    >
                      <div className="sticky left-0 z-[41] pr-10 flex flex-col justify-center">
                        <div className={`flex flex-col gap-1 ${selectedId === row.id ? 'bg-indigo-600' : 'bg-transparent'}`}>
                          <span className="text-base font-black uppercase tracking-tight italic leading-none block whitespace-nowrap">
                            {row.name}
                          </span>
                          <span className={`text-[8px] font-black uppercase tracking-[0.3em] ${selectedId === row.id ? 'text-indigo-200' : 'text-slate-600'}`}>
                            Stability: {row.patternStabilityIndex}%
                          </span>
                        </div>
                      </div>
                      {row.affinities.map((aff, j) => (
                        <div key={j} className="flex flex-col items-center justify-center gap-2">
                          <div 
                            className={`w-14 h-11 rounded-xl flex items-center justify-center text-[15px] font-black mono border-2 transition-all ${getAffinityColor(aff.index, selectedId === row.id)}`}
                          >
                            {Math.round(aff.score)}
                          </div>
                          <span className={`text-[9px] font-black mono ${aff.index > 0 ? 'text-emerald-400' : 'text-rose-500'} ${selectedId === row.id ? 'text-white' : 'opacity-80'}`}>
                             {aff.index > 0 ? '+' : ''}{Math.round(aff.index)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full w-full flex flex-col gap-6">
              <div className="flex items-center gap-6 px-4 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">H-Vector:</span>
                  <select 
                    value={xAxisDim} 
                    onChange={(e) => setXAxisDim(e.target.value)}
                    className="bg-slate-950 border border-white/10 rounded-lg px-4 py-1.5 text-[9px] font-black text-indigo-400 uppercase tracking-widest focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">V-Vector:</span>
                  <select 
                    value={yAxisDim} 
                    onChange={(e) => setYAxisDim(e.target.value)}
                    className="bg-slate-950 border border-white/10 rounded-lg px-4 py-1.5 text-[9px] font-black text-indigo-400 uppercase tracking-widest focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex-grow p-10 bg-slate-950 rounded-[2.5rem] border border-white/5 shadow-inner relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
                    <XAxis type="number" dataKey="x" hide domain={chartDomains.x} />
                    <YAxis type="number" dataKey="y" hide domain={chartDomains.y} />
                    <ZAxis type="number" dataKey="z" range={[400, 2500]} />
                    <ReferenceLine x={averages[xAxisDim]} stroke="rgba(99,102,241,0.2)" strokeDasharray="5 5">
                      <Label value="MEAN" position="insideTopLeft" fill="#475569" fontSize={8} fontWeight={900} offset={10} />
                    </ReferenceLine>
                    <ReferenceLine y={averages[yAxisDim]} stroke="rgba(99,102,241,0.2)" strokeDasharray="5 5">
                      <Label value="MEAN" position="insideBottomRight" fill="#475569" fontSize={8} fontWeight={900} offset={10} />
                    </ReferenceLine>
                    <Tooltip cursor={{ strokeDasharray: '6 6', stroke: '#6366f1' }} content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[#0f172a] text-white p-6 rounded-2xl shadow-2xl border border-white/10 opacity-100">
                               <h4 className="text-xs font-black uppercase italic tracking-widest mb-3 border-b border-white/10 pb-3">{data.name}</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between gap-8 text-[9px] font-bold uppercase">
                                  <span className="text-slate-500">{xAxisDim}</span> 
                                  <span className="mono text-indigo-400">{Math.round(data.x)}</span>
                                </div>
                                <div className="flex justify-between gap-8 text-[9px] font-bold uppercase">
                                  <span className="text-slate-500">{yAxisDim}</span> 
                                  <span className="mono text-indigo-400">{Math.round(data.y)}</span>
                                </div>
                                <div className="flex justify-between gap-8 text-[9px] font-bold uppercase mt-2 pt-2 border-t border-white/5">
                                  <span className="text-slate-500">Sample Size</span> 
                                  <span className="mono text-emerald-400">{data.z.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter data={projectionData} onClick={(e: any) => onSelect(e.id)}>
                      {projectionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} fillOpacity={selectedId === entry.id ? 1 : 0.3} stroke={selectedId === entry.id ? '#fff' : 'none'} strokeWidth={2} className="cursor-pointer transition-all duration-1000" />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
                <div className="absolute top-6 right-10 flex flex-col items-end gap-1 opacity-20 pointer-events-none">
                  <span className="text-[12px] font-black text-white uppercase tracking-[0.5em] italic">Vector Projection Hub</span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Adaptive spatial analysis</span>
                </div>
                <div className="absolute bottom-10 left-10 flex flex-col gap-2.5 bg-slate-900/40 backdrop-blur-md p-4 rounded-xl border border-white/5">
                   <div className="flex items-center gap-3">
                     <div className="w-1 h-3 bg-indigo-500" />
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{xAxisDim}</p>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="w-1 h-3 bg-indigo-500 rotate-90" />
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{yAxisDim}</p>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="xl:col-span-3 flex flex-col gap-10">
        <div className="bg-slate-900/40 p-10 rounded-[2.5rem] shadow-3xl border border-white/10 relative flex flex-col h-full overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none -rotate-12">
            <Compass size={140} />
          </div>
          <div className="flex flex-col gap-3 mb-12 relative z-10">
            <div className="flex items-center gap-4">
              <Cpu size={24} className="text-indigo-400" />
              <h3 className="text-xl font-black tracking-tighter uppercase italic leading-none">Intelligence Pulse</h3>
            </div>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Cross-segment correlation analysis and proximity detection.</p>
          </div>
          <div className="space-y-12 relative z-10">
            <div>
              <div className="flex flex-col gap-2 mb-6">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" /> Cluster Variance
                </span>
                <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Euclidean delta from aggregate centroid.</p>
              </div>
              <div className="bg-slate-950 p-8 rounded-2xl border border-white/5 shadow-inner">
                <div className="flex items-end justify-between">
                  <div>
                    <h4 className="text-5xl font-black text-white italic mono leading-none tracking-tighter">
                      {calculatedDelta.toFixed(1)}
                    </h4>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] mt-4">Normalized L2 Distance</p>
                  </div>
                  <TrendingUp size={28} className="text-emerald-500 mb-1 opacity-50" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-2">
                   <Share2 size={14} className="text-indigo-500" /> Behavioral Proxies
                </span>
                <p className="text-[8px] text-slate-700 font-bold uppercase tracking-widest">Closest matched patterns.</p>
              </div>
              <div className="space-y-4">
                {similarityData.slice(0, 4).map((sim, i) => (
                  <div key={i} onClick={() => onSelect(sim.id)} className="flex items-center justify-between p-5 bg-slate-950/80 rounded-xl border border-white/5 hover:border-indigo-500/40 transition-all cursor-pointer group shadow-xl">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-slate-400 group-hover:text-white uppercase tracking-tight">{sim.name}</span>
                      <span className="text-[8px] text-slate-700 font-black uppercase tracking-widest mt-0.5">Vector Correlation</span>
                    </div>
                    <span className="text-[10px] font-black text-indigo-400 italic mono bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">
                      {sim.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-10 pt-10 border-t border-white/5 relative z-10">
             <div className="flex items-center gap-3 mb-4 text-amber-500/50">
               <AlertCircle size={16} />
               <span className="text-[9px] font-black uppercase tracking-widest">Diagnostic Brief</span>
             </div>
             <p className="text-[10px] text-slate-600 font-bold leading-relaxed italic uppercase tracking-tight">
               Proximity scoring is derived from multi-dimensional L2-norm calculations across active affinity histograms.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BehavioralMap;
