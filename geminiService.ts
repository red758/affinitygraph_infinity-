
import { GoogleGenAI, Type } from "@google/genai";
import { Review, ShopperSegment, MerchandisingRecommendation, LearnedDomainContext, CampaignManifest } from "../types";

export class QuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuotaError";
  }
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message?.toLowerCase() || "";
      const isRateLimit = errorMessage.includes('429') || 
                          errorMessage.includes('resource_exhausted') || 
                          errorMessage.includes('quota');
      
      if (isRateLimit) {
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 2000;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw new QuotaError("Gemini API Quota Exceeded.");
      }
      throw error;
    }
  }
  throw lastError;
}

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const PROBABILISTIC_GUARDRAILS = `
CORE ANALYTICS RULES:
1. Use high-end professional terminology (e.g., "Cognitive Load", "Friction Topology", "Vector Propensity").
2. No childish or flowery language. Maintain a cold, sovereign, data-driven tone.
3. Frame findings as probabilistic correlations.
4. Every metric provided must be derived logically from the input data.
5. Use technical metadata like "Confidence Index" and "Pattern Stability".
6. Avoid randomness: all insights must have a traceable behavioral rationale.
`;

export const generateCampaignManifest = async (segment: ShopperSegment, context: LearnedDomainContext | null): Promise<CampaignManifest> => {
  return withRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
      ACT AS A SENIOR GROWTH ENGINEER.
      CONTEXT: ${context?.domainName || 'General Retail'}.
      TARGET SEGMENT: ${segment.name}.
      DATA SIGNALS: ${JSON.stringify(segment.affinityScores)}.
      
      TASK: Generate a technical Tactical Activation Manifest.
      1. Activation Plan: Define 3 sequential technical operations.
      2. Ad Copy Draft: Performance-engineered copy based on segment intent.
      3. Technical Hook: A one-line Javascript snippet for implementation.
      4. implementationJson: Minified JSON configuration for CRM/Ad-stack routing.
      5. Projected Metrics: Rigorous estimations for Lift, ROI, Reach, and Volatility.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            activationPlan: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT, 
                properties: { 
                  step: { type: Type.STRING }, 
                  status: { type: Type.STRING }, 
                  delay: { type: Type.STRING } 
                },
                required: ['step', 'status', 'delay']
              } 
            },
            technicalHook: { type: Type.STRING },
            adCopyDraft: { type: Type.STRING },
            implementationJson: { type: Type.STRING },
            projectedMetrics: {
              type: Type.OBJECT,
              properties: {
                conversionLift: { type: Type.STRING },
                roi: { type: Type.STRING },
                reach: { type: Type.STRING },
                volatilityRisk: { type: Type.STRING }
              },
              required: ['conversionLift', 'roi', 'reach', 'volatilityRisk']
            }
          },
          required: ['activationPlan', 'technicalHook', 'adCopyDraft', 'implementationJson', 'projectedMetrics']
        }
      }
    });
    return JSON.parse(response.text);
  });
};

export const synthesizeDomainDNA = async (dataSample: any[], headers: string[], existingContext: LearnedDomainContext | null) => {
  return withRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a Consumer Analytics Engine. 
      ${PROBABILISTIC_GUARDRAILS}
      TASK: Synthesize portable "Neural Domain DNA".
      ANALYZE HEADERS: ${headers.join(', ')}
      SAMPLE DATA: ${JSON.stringify(dataSample.slice(0, 5))}
      Deduce core lexicon, behavioral rules, and latent correlators based on these variables.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            domainName: { type: Type.STRING },
            coreLexicon: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyBehavioralRules: { type: Type.ARRAY, items: { type: Type.STRING } },
            behavioralWeights: { 
              type: Type.ARRAY, 
              items: {
                type: Type.OBJECT,
                properties: { feature: { type: Type.STRING }, weight: { type: Type.NUMBER } },
                required: ['feature', 'weight']
              }
            },
            latentCorrelators: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { trigger: { type: Type.STRING }, result: { type: Type.STRING }, logic: { type: Type.STRING } },
                required: ['trigger', 'result', 'logic']
              }
            },
            segmentPrototypes: { type: Type.ARRAY, items: { type: Type.STRING } },
            historicalFrictionPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            maturityIndex: { type: Type.NUMBER }
          },
          required: ['domainName', 'coreLexicon', 'behavioralWeights', 'latentCorrelators', 'maturityIndex']
        }
      }
    });
    const dnaResult = JSON.parse(response.text);
    const behavioralWeights: Record<string, number> = {};
    if (Array.isArray(dnaResult.behavioralWeights)) {
      dnaResult.behavioralWeights.forEach((bw: any) => { behavioralWeights[bw.feature] = bw.weight; });
    }
    return { ...dnaResult, behavioralWeights, lastLearnedDate: new Date().toISOString(), version: "2.4.0-PRO" } as LearnedDomainContext;
  });
};

export const discoverSegments = async (dataSample: any[], headers: string[], context: LearnedDomainContext | null) => {
  return withRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${PROBABILISTIC_GUARDRAILS}
      TASK: Perform probabilistic clustering. 
      DOMAIN CONTEXT: ${JSON.stringify(context?.coreLexicon)}
      TELEMETRY: ${JSON.stringify(dataSample.slice(0, 15))}
      Calculate affinity scores mathematically relative to the headers: ${headers.join(', ')}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              behavioralRationale: { type: Type.STRING },
              characteristics: { type: Type.ARRAY, items: { type: Type.STRING } },
              affinityScores: { 
                type: Type.ARRAY,
                items: { type: Type.OBJECT, properties: { key: { type: Type.STRING }, value: { type: Type.NUMBER } }, required: ['key', 'value'] }
              },
              kpis: {
                type: Type.OBJECT,
                properties: { 
                  estimatedAOV: { type: Type.STRING }, 
                  clvPotential: { type: Type.STRING }, 
                  retentionLikelihood: { type: Type.NUMBER },
                  churnPropensity: { type: Type.NUMBER }
                },
                required: ['estimatedAOV', 'clvPotential', 'retentionLikelihood', 'churnPropensity']
              },
              growthTrend: { type: Type.STRING },
              preferredChannels: { type: Type.ARRAY, items: { type: Type.STRING } },
              sampleSize: { type: Type.NUMBER },
              patternStabilityIndex: { type: Type.NUMBER }, 
              volatilityIndex: { type: Type.NUMBER }
            }
          }
        }
      }
    });
    
    const results = JSON.parse(response.text);
    return results.map((s: any) => {
      const affinityScores: Record<string, number> = {};
      if (Array.isArray(s.affinityScores)) { s.affinityScores.forEach((item: any) => { affinityScores[item.key] = item.value; }); }
      return { ...s, affinityScores, status: 'Discovery', lastUpdated: new Date().toISOString() };
    }) as ShopperSegment[];
  });
};

export const generateMerchandisingRecommendations = async (segments: ShopperSegment[], context: LearnedDomainContext | null) => {
  return withRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${PROBABILISTIC_GUARDRAILS}
      TASK: Identify 5 merchandising plays.
      EVIDENCE: Based on segments: ${segments.map(s => `${s.name}: Stability ${s.patternStabilityIndex}%`).join(', ')}.
      RATIONALE: For each play, explain exactly WHICH data signal triggered the hypothesis.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              targetSegment: { type: Type.STRING },
              action: { type: Type.STRING },
              rationale: { type: Type.STRING },
              roiProjection: { type: Type.STRING },
              metricLift: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, value: { type: Type.STRING } } },
              strategyType: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              complexity: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text) as MerchandisingRecommendation[];
  });
};

export const getPersonaDetails = async (segment: ShopperSegment, context: LearnedDomainContext | null) => {
  return withRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${PROBABILISTIC_GUARDRAILS}
      Synthesize behavior-inferred patterns for: ${segment.name}. 
      AFFINITY DATA: ${JSON.stringify(segment.affinityScores)}.
      Explain the 'WHY' behind the retention likelihood of ${segment.kpis.retentionLikelihood}%.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { backstory: { type: Type.STRING }, motivation: { type: Type.STRING }, churnRisks: { type: Type.STRING } }
        }
      }
    });
    return JSON.parse(response.text);
  });
};

export const analyzeFriction = async (segment: ShopperSegment, reviews: Review[]) => {
  return withRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform high-fidelity friction analysis for segment ${segment.name}. 
      ANALYZE LOGS: ${reviews.map(r => r.text).join('|')}
      Identify specific gaps where telemetry deviates from ideal conversion paths.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { frictionScore: { type: Type.NUMBER }, primaryGaps: { type: Type.ARRAY, items: { type: Type.STRING } } }
        }
      }
    });
    return JSON.parse(response.text);
  });
};

export const generateContextualReviews = async (segments: ShopperSegment[], context: LearnedDomainContext | null) => {
  return withRetry(async () => {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Synthesize 10 feedback logs that match the behavioral prototypes discovered: ${segments.map(s => s.name).join(', ')}. 
      Context: ${context?.domainName}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: { id: { type: Type.STRING }, rating: { type: Type.NUMBER }, text: { type: Type.STRING }, category: { type: Type.STRING } }
          }
        }
      }
    });
    return JSON.parse(response.text) as Review[];
  });
};
