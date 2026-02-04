
export enum Sentiment {
  POSITIVE = 'Positive',
  NEUTRAL = 'Neutral',
  NEGATIVE = 'Negative'
}

export type PerspectiveMode = 'Merchandising' | 'Marketing' | 'Leadership';
export type LifecycleStatus = 'Discovery' | 'Peer Review' | 'Active Strategy';

export interface CampaignManifest {
  activationPlan: { step: string; status: 'Ready' | 'Injected' | 'Monitoring'; delay: string }[];
  technicalHook: string;
  adCopyDraft: string;
  implementationJson: string;
  projectedMetrics: {
    conversionLift: string;
    roi: string;
    reach: string;
    volatilityRisk: string;
  };
}

export interface LearnedDomainContext {
  domainName: string;
  coreLexicon: string[];
  keyBehavioralRules: string[];
  historicalFrictionPoints: string[];
  behavioralWeights: Record<string, number>;
  latentCorrelators: { trigger: string; result: string; logic: string }[];
  segmentPrototypes: string[];
  maturityIndex: number; 
  lastLearnedDate: string;
  version: string;
}

export interface Review {
  id: string;
  userId: string;
  rating: number;
  text: string;
  category: string;
  sentiment?: Sentiment;
}

export interface ShopperSegment {
  id: string;
  name: string;
  description: string;
  behavioralRationale: string; 
  characteristics: string[];
  affinityScores: Record<string, number>;
  kpis: {
    estimatedAOV: string;
    clvPotential: 'High' | 'Medium' | 'Low';
    retentionLikelihood: number;
    churnPropensity: number;
  };
  sampleSize: number;
  growthTrend: 'Momentum' | 'Stable' | 'At Risk' | 'Emerging';
  preferredChannels: string[];
  patternStabilityIndex: number; 
  dataQuality: 'High' | 'Mixed' | 'Sparse';
  lastUpdated: string;
  analystNotes?: string;
  status: LifecycleStatus;
  volatilityIndex: number;
  manifest?: CampaignManifest;
}

export interface MerchandisingRecommendation {
  title: string;
  targetSegment: string;
  action: string;
  rationale: string;
  supportingEvidence: string[];
  roiProjection: string;
  metricLift: { label: string; value: string };
  channel: 'E-mail' | 'Social' | 'Mobile Push' | 'On-Site' | 'Search';
  strategyType: 'Conversion' | 'Retention' | 'AOV Expansion' | 'Discovery' | 'Inventory';
  impact: 'High' | 'Medium' | 'Low';
  confidence: number;
  complexity: 'Low' | 'Medium' | 'High';
}
