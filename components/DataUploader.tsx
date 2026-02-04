
import React, { useState } from 'react';
import { Upload, Database, Sparkles, FileText, AlertCircle, ShieldCheck } from 'lucide-react';

interface Props {
  onDataLoaded: (data: any[], schema: string[]) => void;
  isLoading: boolean;
  progressStep: 'idle' | 'parsing' | 'scrubbing' | 'sampling' | 'analyzing';
}

const DataUploader: React.FC<Props> = ({ onDataLoaded, isLoading, progressStep }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateSampleData = () => {
    const samples = [];
    const categories = ['Sustainable Fashion', 'Electronics', 'Luxury Beauty', 'Home Decor'];
    for (let i = 0; i < 50; i++) {
      samples.push({
        customer_id: `CUST_${1000 + i}`,
        primary_category: categories[Math.floor(Math.random() * categories.length)],
        spend_amount: (Math.random() * 500 + 20).toFixed(2),
        frequency: Math.floor(Math.random() * 10) + 1,
        last_purchase_days: Math.floor(Math.random() * 90),
        feedback_sentiment: Math.random() > 0.5 ? 'Positive' : 'Neutral',
        is_promo_user: Math.random() > 0.7 ? 'Yes' : 'No'
      });
    }
    const headers = Object.keys(samples[0]);
    setFileName("synthetic_telemetry.csv");
    onDataLoaded(samples, headers);
  };

  const handleFiles = (files: FileList) => {
    const file = files[0];
    if (!file) return;
    if (!file.name.endsWith('.json') && !file.name.endsWith('.csv')) {
      setError("Format Unsupported. Use .json or .csv.");
      return;
    }

    setFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let data: any[] = [];
        let headers: string[] = [];
        
        if (file.name.endsWith('.json')) {
          data = JSON.parse(content);
          if (data.length > 0) headers = Object.keys(data[0]);
        } else {
          const lines = content.split('\n');
          headers = lines[0].split(',').map(h => h.trim());
          data = lines.slice(1).filter(line => line.trim()).map(line => {
            const values = line.split(',');
            return headers.reduce((obj: any, header, i) => {
              obj[header] = values[i]?.trim();
              return obj;
            }, {});
          });
        }
        onDataLoaded(data, headers);
      } catch (err) {
        setError("Corrupt file buffer.");
      }
    };
    reader.readAsText(file);
  };

  const steps = [
    { id: 'parsing', label: 'Schema' },
    { id: 'scrubbing', label: 'PII Scrub' },
    { id: 'sampling', label: 'DNA Synthesis' },
    { id: 'analyzing', label: 'Archetypes' }
  ];

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      <div className="flex-grow flex flex-col relative">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); }}
          className={`relative flex-grow border-2 border-dashed rounded-[2.5rem] p-8 sm:p-12 transition-all duration-300 flex flex-col items-center justify-center gap-8 ${
            dragActive ? 'border-indigo-500 bg-indigo-500/5 shadow-2xl shadow-indigo-500/10' : 'border-slate-800 bg-slate-950/50'
          }`}
        >
          {isLoading ? (
            <div className="w-full max-w-sm text-center">
              <Database size={48} className="text-indigo-500 mx-auto mb-10 animate-pulse" />
              <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-10 italic">Inference Engine: {progressStep}</p>
              <div className="flex gap-2 h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                {steps.map((step, i) => {
                  const currentIndex = steps.findIndex(s => s.id === progressStep);
                  return (
                    <div key={step.id} className={`flex-grow transition-all duration-700 ${
                      currentIndex >= i ? 'bg-indigo-500 shadow-[0_0_15px_#6366f1]' : 'bg-slate-700'
                    }`} />
                  );
                })}
              </div>
              <div className="flex justify-between mt-6">
                 {steps.map((step, i) => (
                   <span key={step.id} className={`text-[8px] font-black uppercase tracking-widest ${steps.findIndex(s => s.id === progressStep) >= i ? 'text-indigo-400' : 'text-slate-600'}`}>{step.label}</span>
                 ))}
              </div>
            </div>
          ) : fileName ? (
            <div className="text-center animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center text-emerald-500 border border-emerald-500/20 mx-auto mb-8 shadow-inner">
                <FileText size={48} />
              </div>
              <p className="text-xl font-black text-white uppercase italic tracking-tighter mb-4">{fileName}</p>
              <div className="flex items-center justify-center gap-3 mb-10">
                 <ShieldCheck size={14} className="text-emerald-400" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secure Telemetry Scrubbed</span>
              </div>
              <button onClick={() => setFileName(null)} className="px-10 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-[10px] font-black text-slate-400 hover:text-white transition-all uppercase tracking-[0.3em] border border-slate-700 shadow-lg">
                Flush Buffer
              </button>
            </div>
          ) : (
            <>
              <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-2xl shadow-indigo-600/30 mb-6 shrink-0"><Upload size={40} /></div>
              <div className="text-center max-w-sm">
                <p className="text-lg font-black text-white uppercase italic tracking-tight mb-3">Telemetry Node</p>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                  Drop .CSV or .JSON behavioral logs here to initiate probabilistic synthesis.
                </p>
              </div>
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-20" accept=".json,.csv" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
            </>
          )}
        </div>
      </div>
      
      {!isLoading && !fileName && (
        <div className="mt-10 flex flex-col gap-6 shrink-0">
          <div className="flex flex-col gap-1 px-4">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Simulation Protocols</span>
            <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">Generate synthetic telemetry for immediate validation.</span>
          </div>
          <button onClick={generateSampleData} className="flex items-center justify-center gap-4 w-full py-6 bg-amber-500/5 text-amber-500 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] border border-amber-500/10 hover:bg-amber-500 hover:text-white transition-all shadow-xl group">
            <Sparkles size={20} className="group-hover:rotate-12 transition-transform" /> Synthesize Simulation Pipeline
          </button>
        </div>
      )}
      
      {error && <div className="mt-8 text-[11px] font-black text-rose-400 bg-rose-500/5 p-6 rounded-2xl border border-rose-500/10 flex items-center gap-4 shadow-lg"><AlertCircle size={20} /> {error}</div>}
    </div>
  );
};

export default DataUploader;
