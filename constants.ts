
import { Review, ShopperSegment } from './types';

export const CATEGORIES = [
  'Electronics',
  'Home Decor',
  'Sustainable Fashion',
  'Organic Grocery',
  'Luxury Beauty',
  'Fitness Gear'
];

export const MOCK_REVIEWS: Review[] = [
  { id: '1', userId: 'u1', rating: 5, text: "Packaging is biodegradable. Product quality is top-tier.", category: 'Sustainable Fashion' },
  { id: '2', userId: 'u2', rating: 4, text: "Solid performance, but pricey for this category.", category: 'Electronics' },
  { id: '3', userId: 'u3', rating: 2, text: "Delivery delay ruined the experience.", category: 'Organic Grocery' },
  { id: '4', userId: 'u4', rating: 5, text: "Feels premium and scent is intoxicating.", category: 'Luxury Beauty' },
  { id: '5', userId: 'u5', rating: 3, text: "Basic fitness tracker. Does the job.", category: 'Fitness Gear' }
];

export const MOCK_SEGMENTS: ShopperSegment[] = [
  {
    id: 'seg_1',
    name: 'Conscious Consumers',
    description: 'High-engagement shoppers prioritizing ethical sourcing and sustainability.',
    behavioralRationale: 'Driven by personal values and environmental consciousness, seeking products that align with their ethical standards.',
    kpis: {
      estimatedAOV: '$85.00',
      clvPotential: 'High',
      retentionLikelihood: 88,
      churnPropensity: 12
    },
    characteristics: ['Eco-friendly', 'Quality seekers', 'Loyal'],
    growthTrend: 'Momentum',
    preferredChannels: ['Email', 'Instagram'],
    affinityScores: {
      'Sustainable Fashion': 95,
      'Organic Grocery': 88,
      'Home Decor': 45,
      'Luxury Beauty': 60
    },
    sampleSize: 1240,
    patternStabilityIndex: 95,
    dataQuality: 'High',
    lastUpdated: '2025-01-01T00:00:00Z',
    status: 'Peer Review',
    volatilityIndex: 12
  },
  {
    id: 'seg_2',
    name: 'Value Driven Techies',
    description: 'Price-sensitive shoppers waiting for promotional cycles for high-end gear.',
    behavioralRationale: 'Highly analytical consumers who prioritize technical specifications and performance benchmarks over brand prestige.',
    kpis: {
      estimatedAOV: '$240.00',
      clvPotential: 'Medium',
      retentionLikelihood: 42,
      churnPropensity: 58
    },
    characteristics: ['Price sensitive', 'Review readers', 'Tech savvy'],
    growthTrend: 'Stable',
    preferredChannels: ['Search', 'SMS'],
    affinityScores: {
      'Electronics': 98,
      'Fitness Gear': 70,
      'Sustainable Fashion': 15
    },
    sampleSize: 2150,
    patternStabilityIndex: 88,
    dataQuality: 'High',
    lastUpdated: '2025-01-01T00:00:00Z',
    status: 'Peer Review',
    volatilityIndex: 8
  },
  {
    id: 'seg_3',
    name: 'Wellness Enthusiasts',
    description: 'Frequent buyers of health-related goods, often purchasing in bulk.',
    behavioralRationale: 'View health as a holistic long-term investment and seek convenience in replenishing essential wellness products.',
    kpis: {
      estimatedAOV: '$165.00',
      clvPotential: 'High',
      retentionLikelihood: 94,
      churnPropensity: 6
    },
    characteristics: ['Health conscious', 'High frequency', 'Bulk buyers'],
    growthTrend: 'Emerging',
    preferredChannels: ['Mobile App', 'Email'],
    affinityScores: {
      'Organic Grocery': 92,
      'Fitness Gear': 85,
      'Luxury Beauty': 50
    },
    sampleSize: 1890,
    patternStabilityIndex: 82,
    dataQuality: 'High',
    lastUpdated: '2025-01-01T00:00:00Z',
    status: 'Peer Review',
    volatilityIndex: 15
  }
];
