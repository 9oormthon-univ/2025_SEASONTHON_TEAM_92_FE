// 사용자 타입 정의
export interface User {
  id: string;
  email: string;
  nickname: string;
  role: 'tenant' | 'landlord' | 'admin' | 'anonymous';
  address?: string;
  buildingName?: string;
  neighborhood?: string;
  profileCompleted?: boolean;
  diagnosisCompleted?: boolean;
  onboardingCompleted?: boolean;
}

// API 응답 타입 정의
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  message: string;
}

// 회원가입/로그인 타입 정의
export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  token: string;
}

// 사용자 프로필 설정 타입 정의
export interface ProfileSettingRequest {
  dong: string;
  detailAddress: string;
  building: string;
  buildingType: string;
  contractType: string;
  security: string;
}

export interface UserProfile {
  profileName: string;
  profileDong: string;
  profileBuilding: string;
  profileEmail: string;
}

// 그룹 타입 정의
export interface Group {
  id: string;
  name: string;
  type: 'building' | 'neighborhood';
  memberCount: number;
  description?: string;
  marketData?: {
    neighborhood: string;
    buildingName: string;
    avgDeposit: number;
    avgMonthlyRent: number;
    medianDeposit: number;
    medianMonthlyRent: number;
    transactionCount: number;
    recentTransactionDate: string;
  };
}

// 진단 관련 타입 정의
export interface DiagnosisQuestion {
  questionId: number;
  questionText: string;
  subText: string;
}

export interface DiagnosisCategory {
  categoryId: number;
  sortOrder: number;
  questions: DiagnosisQuestion[];
}

export interface DiagnosisQuestionsResponse {
  scoreOptions: Array<{
    score: string;
    label: string;
  }>;
  categories: DiagnosisCategory[];
}

export interface DiagnosisResponse {
  questionId: number;
  score: string;
}

export interface DiagnosisSubmissionRequest {
  responses: DiagnosisResponse[];
}

export interface DiagnosisSubmissionResponse {
  totalScore: number;
  maxScore: number;
  responseCount: number;
  submittedAt: string;
}

export interface CategoryDetail {
  categoryId: number;
  myScore: number;
  buildingAverage: number;
  neighborhoodAverage: number;
}

export interface Analysis {
  strengths: Array<{
    categoryId: number;
    score: number;
  }>;
  improvements: Array<{
    categoryId: number;
    score: number;
  }>;
}

export interface Statistics {
  participantCount: number;
  responseCount: number;
  buildingResidents: number;
  neighborhoodResidents: number;
}

export interface DiagnosisResult {
  summary: {
    totalScore: number;
    grade: string;
    buildingAverage: number;
    neighborhoodAverage: number;
  };
  categoryDetails: CategoryDetail[];
  analysis: Analysis;
  statistics: Statistics;
}

// 주간 미션 타입 정의
export interface MissionQuestion {
  question_id: number;
  question_text: string;
  question_type: string;
  options: string[];
  order_number: number;
}

export interface CurrentMission {
  mission_id: number;
  category: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  questions: MissionQuestion[];
  participation_count: number;
  user_participated: boolean;
}

export interface MissionParticipationRequest {
  responses: Array<{
    question_id: number;
    answer: string;
    score: number;
  }>;
}

export interface MissionParticipationResponse {
  response_id: number;
  total_score: number;
  message: string;
  next_step: string;
}

export interface BuildingComparison {
  building_average: number;
  user_rank: number;
  total_participants: number;
  comparison_text: string;
}

export interface NeighborhoodComparison {
  neighborhood_average: number;
  user_rank: number;
  total_participants: number;
  comparison_text: string;
}

export interface MissionResult {
  user_score: number;
  max_score: number;
  category: string;
  building_comparison: BuildingComparison;
  neighborhood_comparison: NeighborhoodComparison;
  insights: string[];
}

// 리포트 타입 정의
export interface ReportCreateRequest {
  reportContent: string;
}

export interface ReportCreateResponse {
  reportId: number;
}

export interface ReportResponse {
  primaryNegotiationCard: string;
  secondaryNegotiationCard: string;
  step1: string;
  step2: string;
}

// 새로운 리포트 템플릿 타입 정의
export interface ContractInfo {
  address: string;
  buildingName: string;
  buildingType: string;
  contractType: string;
  deposit: number;
  monthlyRent: number;
  managementFee: number;
  gpsVerified: boolean;
  contractVerified: boolean;
}

export interface SubjectiveMetrics {
  overallScore: number;
  neighborhoodAverage: number;
  buildingAverage: number;
  categories: {
    lighting: { myScore: number; neighborhoodAvg: number; buildingAvg: number };
    soundproofing: { myScore: number; neighborhoodAvg: number; buildingAvg: number };
    parking: { myScore: number; neighborhoodAvg: number; buildingAvg: number };
  };
}

export interface ObjectiveMetrics {
  marketPrice: {
    nationalAverage: number;
    myContract: number;
    difference: number;
    differencePercent: number;
  };
  managementFee: {
    nationalAverage: number;
    myContract: number;
    status: 'normal' | 'high' | 'low';
  };
  noise: {
    nationalAverage: number;
    userReported: number;
    match: boolean;
  };
}

export interface NegotiationCard {
  priority: number;
  title: string;
  content: string;
  recommendedMent: string;
}

export interface PolicyInfo {
  title: string;
  description: string;
  eligibility: string;
  link: string;
}

export interface DisputeGuide {
  relatedLaw: string;
  committeeContact: string;
  templateDownload: string;
}

export interface ReportTemplate {
  // 1. 리포트 헤더
  header: {
    title: string;
    createdAt: string;
    dataPeriod: string;
    trustMetrics: {
      participantCount: number;
      averageResponseDays: number;
      trustScore: number;
    };
  };
  
  // 2. 나의 계약 정보 요약
  contractInfo: ContractInfo;
  
  // 3. 주관적 지표
  subjectiveMetrics: SubjectiveMetrics;
  
  // 4. 객관적 지표
  objectiveMetrics: ObjectiveMetrics;
  
  // 5. 협상 카드
  negotiationCards: NegotiationCard[];
  
  // 6. 맞춤형 정책/지원 정보
  policyInfo: PolicyInfo[];
  
  // 7. 분쟁 해결 가이드
  disputeGuide: DisputeGuide;
  
  // 8. 업데이트 요소
  updateInfo: {
    autoUpdate: boolean;
    dataValidityPeriod: string;
  };
}

// GPS 인증 관련 타입 정의
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface AddressInfo {
  address: string;
  dong: string;
  gu: string;
  si: string;
}

export interface GPSVerificationResult {
  isVerified: boolean;
  confidence: number; // 0-100
  locationData: LocationData;
  addressInfo: AddressInfo;
  verificationMethod: 'gps' | 'manual' | 'hybrid';
  verifiedAt: string;
}

export interface GPSVerificationRequest {
  userLocation: LocationData;
  targetAddress: string;
  toleranceRadius: number; // 미터 단위
}

// 알림 타입 정의
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
}