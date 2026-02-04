
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronRight, ChevronLeft, X, Rocket, Terminal, Brain } from 'lucide-react';

interface Step {
  id: string;
  targetId: string;
  title: string;
  content: string;
}

interface Props {
  onComplete: () => void;
  isVisible: boolean;
}

const Walkthrough: React.FC<Props> = ({ onComplete, isVisible }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [displayText, setDisplayText] = useState("");
  const typingTimer = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const steps: Step[] = useMemo(() => [
    {
      id: 'intro',
      targetId: 'root',
      title: "Induction Protocol Initiated",
      content: "Welcome to AffinityGraph. Our neural core is ready to synthesize your telemetry data into actionable consumer archetypes. Let's calibrate your workspace."
    },
    {
      id: 'ingestion',
      targetId: 'walkthrough-ingestion',
      title: "Telemetry Ingestion",
      content: "This is your primary data gateway. Drop .CSV behavioral logs here to begin the probabilistic synthesis. We scrub PII automatically before processing."
    },
    {
      id: 'workspace',
      targetId: 'walkthrough-workspace',
      title: "Global Logic Core",
      content: "Behold the Neural Workspace. Here, the AI stores learned Domain DNA, extracts hidden behavioral weights, and tracks latent purchase correlators."
    },
    {
      id: 'archetypes',
      targetId: 'walkthrough-segments',
      title: "Cluster Discovery",
      content: "Validated shopper segments appear here. Each archetype is tracked for stability, churn propensity, and growth alpha in real-time."
    },
    {
      id: 'diagnostics',
      targetId: 'walkthrough-diagnostics',
      title: "High-Fidelity Diagnostics",
      content: "Deep-dive into individual clusters. Analyze the 'Intent Matrix' to understand the cognitive drivers behind every transaction."
    },
    {
      id: 'playbook',
      targetId: 'walkthrough-playbook',
      title: "Tactical Manifests",
      content: "These are AI-generated merchandising plays. Use 'Deployment' to inject these strategies directly into your marketing stack."
    },
    {
      id: 'matrix',
      targetId: 'walkthrough-matrix',
      title: "Affinity Topography",
      content: "Finalize your analysis with the Vector Projection. Map category-specific spend propensities across your entire consumer base."
    }
  ], []);

  const step = steps[currentStep];

  // Effect for typewriting text
  useEffect(() => {
    if (!isVisible) return;
    setDisplayText("");
    let i = 0;
    const fullText = steps[currentStep].content;
    
    if (typingTimer.current) window.clearInterval(typingTimer.current);
    
    typingTimer.current = window.setInterval(() => {
      setDisplayText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) {
        if (typingTimer.current) window.clearInterval(typingTimer.current);
      }
    }, 15);

    return () => {
      if (typingTimer.current) window.clearInterval(typingTimer.current);
    };
  }, [currentStep, isVisible, steps]);

  // Effect for updating spotlight position and auto-scrolling
  useEffect(() => {
    if (!isVisible) return;
    
    const updateRect = () => {
      if (step.id === 'intro') {
        setTargetRect(null);
        return;
      }
      const el = document.getElementById(step.targetId);
      if (el) {
        // If the element is too big, scroll to its top instead of center
        const isVeryLarge = el.offsetHeight > window.innerHeight * 0.8;
        el.scrollIntoView({ 
          behavior: 'smooth', 
          block: isVeryLarge ? 'start' : 'center' 
        });

        // We need multiple measurements to catch the element after smooth scrolling finishes
        const measure = () => setTargetRect(el.getBoundingClientRect());
        const intervals = [100, 300, 600, 1000];
        intervals.forEach(ms => setTimeout(measure, ms));
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [currentStep, isVisible, step]);

  if (!isVisible) return null;

  // Improved positioning logic with boundary constraints
  const getCardStyle = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const cardWidth = 400;
    const cardHeight = 350; // Approximation
    const padding = 20;

    let top = targetRect.bottom + 40;
    let left = targetRect.left + (targetRect.width / 2) - (cardWidth / 2);

    // If target is very large, place card at the bottom of the screen instead of bottom of element
    const isTooLow = top + cardHeight > window.innerHeight - padding;
    if (isTooLow) {
      top = targetRect.top - cardHeight - 40;
    }

    // If still too high (out of top) or still too low, default to a fixed safe corner
    if (top < padding || top + cardHeight > window.innerHeight - padding) {
      top = window.innerHeight - cardHeight - padding;
      left = window.innerWidth - cardWidth - padding;
    }

    // Horizontal boundary check
    left = Math.max(padding, Math.min(left, window.innerWidth - cardWidth - padding));
    
    return { 
      top: `${top}px`, 
      left: `${left}px`
    };
  };

  const cardStyle = getCardStyle();

  return (
    <div className="fixed inset-0 z-[10000] pointer-events-none">
      {/* Dynamic SVG Mask for proper spotlight */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="walkthrough-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect 
                x={targetRect.left - 10} 
                y={targetRect.top - 10} 
                width={targetRect.width + 20} 
                height={targetRect.height + 20} 
                rx="40" 
                fill="black" 
                className="transition-all duration-500 ease-in-out"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(2, 6, 23, 0.9)" mask="url(#walkthrough-mask)" />
      </svg>
      
      {/* Animated Focus Border */}
      {targetRect && (
        <div 
          className="absolute border-2 border-indigo-500/50 rounded-[2.5rem] animate-pulse transition-all duration-500 ease-in-out pointer-events-none"
          style={{
            top: targetRect.top - 15,
            left: targetRect.left - 15,
            width: targetRect.width + 30,
            height: targetRect.height + 30,
            boxShadow: '0 0 40px rgba(99, 102, 241, 0.2)'
          }}
        />
      )}

      {/* Instruction Card */}
      <div 
        ref={cardRef}
        className="absolute w-[400px] pointer-events-auto transition-all duration-500 ease-in-out z-[10001]"
        style={cardStyle}
      >
        <div className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-3xl overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
          
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Brain size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1">Neural Briefing</span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.3em]">Protocol Phase 0{currentStep + 1}</span>
              </div>
            </div>
            <button 
              onClick={onComplete}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-800 text-slate-500 hover:text-white hover:bg-slate-700 transition-all"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mb-10">
            <h4 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4 leading-tight">{step.title}</h4>
            <div className="min-h-[80px]">
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed italic">
                {displayText}
                <span className="inline-block w-2 h-4 bg-indigo-500 ml-1 animate-pulse" />
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-white/5">
            <button 
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${currentStep === 0 ? 'opacity-0' : 'text-slate-500 hover:text-white'}`}
            >
              <ChevronLeft size={14} /> Previous
            </button>

            <div className="flex gap-4">
              <button 
                onClick={onComplete}
                className="text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-slate-400 transition-all"
              >
                Abort
              </button>
              <button 
                onClick={() => {
                  if (currentStep === steps.length - 1) onComplete();
                  else setCurrentStep(prev => prev + 1);
                }}
                className="flex items-center gap-3 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
              >
                {currentStep === steps.length - 1 ? (
                  <>Commence <Rocket size={14} /></>
                ) : (
                  <>Proceed <ChevronRight size={14} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Walkthrough;
