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
  ok: boolean;
  data: T | null;
  message: string;
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

// 진단 결과 타입 정의
export interface ComprehensiveDiagnosis {
  overallScore: number;
  categoryScores: {
    [key: string]: number;
  };
  recommendations: string[];
  comparisonData: {
    building: {
      average: number;
      totalResponses: number;
    };
    neighborhood: {
      average: number;
      totalResponses: number;
    };
  };
}

// 주간 미션 타입 정의
export interface WeeklyMission {
  id: string;
  week: string;
  theme: string;
  description: string;
  questions: MissionQuestion[];
  reward: string;
}

export interface MissionQuestion {
  id: string;
  type: 'scale' | 'choice' | 'multiple';
  text: string;
  options: {
    value: string | number;
    label: string;
  }[];
}

// 리포트 타입 정의
export interface Report {
  id: string;
  title: string;
  content: string;
  generatedAt: string;
  shareToken?: string;
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