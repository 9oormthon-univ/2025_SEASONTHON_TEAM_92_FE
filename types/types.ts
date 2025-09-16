export interface User {
  id?: string;
  timestamp?: string;
  email: string;
  password?: string;
  nickname: string;
  role: 'tenant' | 'landlord' | 'anonymous';
  latitude?: number;
  longitude?: number;
  address?: string;
  neighborhood?: string;
  buildingName?: string;
  profileCompleted?: boolean;
  diagnosisCompleted?: boolean;
  onboardingCompleted?: boolean;
  active?: boolean;
}

export interface Tenant {
  id?: string;
  timestamp?: string;
  buildingName: string;
  streetAddress: string;
  neighborhood: string;
  city: string;
  buildingType: 'apartment' | 'officetel' | 'villa';
  contractType: 'monthly' | 'yearly';
  currentRentKrw: number;
  depositKrw: number;
  maintenanceFee?: number;
  leaseEndYyyyMm: string;
  increaseNoticePctOptional?: number;
  landlordEmailOptional?: string;
  painPointsFreeText?: string;
  consentYesNo: boolean;
}

export interface MarketData {
  neighborhood: string;
  buildingName: string;
  avgDeposit: number;
  avgMonthlyRent: number;
  medianDeposit: number;
  medianMonthlyRent: number;
  transactionCount: number;
  recentTransactionDate: string;
}

export interface Group {
  groupId: string;
  label: string;
  scope: string;
  groupSize: number;
  avgRentKrw: number;
  medianRentKrw: number;
  avgNoticePct: number;
  marketData?: MarketData;
}

export interface LetterRequest {
  groupId: string;
  capPct: number;
  termMonths: number;
  noticeDays: number;
  contactEmail: string;
  contactPhone: string;
  selectedPainPoints?: string[];
  selectedDiscussions?: string[];
  customContent?: string;
}

export interface LetterResponse {
  generatedText: string;
  tokens: number;
  usedLlm: boolean;
}

export interface DiagnosisStats {
  totalScore: number;
  categoryScores: {
    rent: number;
    contract: number;
    communication: number;
    maintenance: number;
  };
  userScores: { [key: string]: number };
  buildingAverageScores: { [key: string]: number };
  neighborhoodAverageScores: { [key: string]: number };
  recommendations: string[];
}


export interface ProposalDiscussion {
  id?: string;
  timestamp?: string;
  proposalId: string;
  authorId: string;
  authorRole: 'tenant' | 'landlord';
  content: string;
  isReply?: boolean;
  parentId?: string;
}

export interface AnonymousReport {
  id?: string;
  timestamp?: string;
  buildingName: string;
  report: string;
  neighborhood?: string;
  city?: string;
  verified?: boolean;
}

export interface Vote {
  id?: string;
  timestamp?: string;
  proposalId: string;
  userId: string;
  vote: 'agree' | 'disagree';
  deadline?: string;
}

export interface VoteResult {
  proposalId: string;
  totalVotes: number;
  agreeVotes: number;
  disagreeVotes: number;
  agreePercentage: number;
  disagreePercentage: number;
}

export interface LandlordVerification {
  id?: string;
  timestamp?: string;
  userId: string;
  businessRegistrationNumber: string;
  propertyAddresses: string[];
  verificationDocuments: string[];
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface LandlordProperty {
  id?: string;
  timestamp?: string;
  landlordId: string;
  address: string;
  buildingName: string;
  totalUnits: number;
  currentTenants: number;
  avgRent: number;
  isActive: boolean;
}

export interface Notification {
  id?: string;
  timestamp?: string;
  userId: string;
  type: 'proposal' | 'vote' | 'discussion' | 'system' | 'verification';
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: string; // proposalId, voteId, etc.
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// 진단 시스템 관련 타입들
export interface DiagnosisQuestion {
  id: string;
  category: 'noise' | 'water_pressure' | 'lighting' | 'parking' | 'heating' | 'security' | 'elevator' | 'facilities';
  question: string;
  options: string[];
  weight: number;
}

export interface DiagnosisResult {
  id: string;
  userId: string;
  category: string;
  score: number;
  answers: { [questionId: string]: string };
  createdAt: string;
}

export interface ComprehensiveDiagnosis {
  id: string;
  userId: string;
  overallScore: number;
  categoryScores: { [category: string]: number };
  buildingComparison: ComparisonData;
  neighborhoodComparison: ComparisonData;
  recommendations: string[];
  createdAt: string;
}

export interface ComparisonData {
  averageScore: number;
  participantCount: number;
  rank: number;
  percentile: number;
}

export interface WeeklyMission {
  id: string;
  title: string;
  description: string;
  questions: DiagnosisQuestion[];
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface MissionParticipation {
  id: string;
  userId: string;
  missionId: string;
  answers: { [questionId: string]: string };
  completedAt: string;
}

export interface NegotiationReport {
  id: string;
  userId: string;
  reportUrl: string;
  shareToken?: string;
  title: string;
  summary: string;
  keyFindings: string[];
  recommendations: string[];
  marketData: MarketData;
  diagnosisData: ComprehensiveDiagnosis;
  createdAt: string;
  isShared: boolean;
}

// 백엔드 AdvancedReport와 매칭되는 타입
export interface AdvancedReport {
  userProfile: User;
  marketData: MarketData;
  diagnosisStats: DiagnosisStats;
  negotiationStrategies: NegotiationTip[];
  dataReliability: DataReliability;
  keyFindings: string[];
  recommendations: string[];
}

export interface NegotiationTip {
  category: string;
  message: string;
  priority: number;
}

export interface DataReliability {
  buildingParticipantCount: number;
  neighborhoodParticipantCount: number;
  buildingReliabilityScore: number;
  neighborhoodReliabilityScore: number;
  isReportEligible: boolean;
  reliabilityMessage: string;
  categoryParticipantCounts?: { [key: string]: number };
}

export interface NegotiationCard {
  issueId: string;
  issueName: string;
  category: IssueCategory;
  description: string;
  negotiationStrategy: string;
  priority: number;
  scoreDifference: number;
  legalBasis: string;
  suggestedAction: string;
}

export enum IssueCategory {
  LEGAL_REPAIR = 'LEGAL_REPAIR',
  STRUCTURAL = 'STRUCTURAL',
  GENERAL = 'GENERAL'
}