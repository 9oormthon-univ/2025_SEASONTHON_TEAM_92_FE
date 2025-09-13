import axios from 'axios';
import toast from 'react-hot-toast';
import { ApiResponse } from '../types';

// 환경에 따른 API 기본 URL 설정
const getBaseURL = () => {
  // 환경변수가 설정되어 있으면 우선 사용
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  
  // 개발 환경
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8080'; // 로컬 개발 서버
  }
  
  // 프로덕션 환경 - 실제 백엔드 도메인으로 변경 필요
  if (process.env.NODE_ENV === 'production') {
    // 실제 백엔드 배포 URL (Railway 배포)
    return 'https://2025seasonthonteam92be-production.up.railway.app';
  }
  
  // 기본값 - 개발 환경으로 설정
  return 'http://localhost:8080';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT 토큰을 자동으로 헤더에 추가하는 인터셉터
api.interceptors.request.use((config) => {
  console.log('🚀 API 요청 시작:', config.method?.toUpperCase(), config.url);
  console.log('📤 요청 데이터:', config.data);
  console.log('🌐 Base URL:', config.baseURL);
  
  const token = localStorage.getItem('jwtToken');
  
  // JWT 토큰이 필요하지 않은 엔드포인트들
  const noAuthEndpoints = ['/member/create', '/member/doLogin', '/api/location/preview'];
  const needsAuth = !noAuthEndpoints.some(endpoint => config.url?.includes(endpoint));
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    if (needsAuth) {
      console.log('🔑 JWT 토큰이 요청 헤더에 추가됨:', config.url);
      console.log('🎫 토큰 미리보기:', token.substring(0, 50) + '...');
    }
  } else if (needsAuth) {
    console.log('❌ JWT 토큰이 없음:', config.url);
  }
  return config;
});

// 응답 인터셉터 추가
api.interceptors.response.use(
  (response) => {
    console.log('✅ API 응답 성공:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API 응답 에러:', error.config?.url, error.response?.status, error.message);
    
    // 401 Unauthorized 오류 처리 - 자동 로그아웃
    if (error.response?.status === 401) {
      console.log('🔐 인증 오류 감지 - 자동 로그아웃 실행');
      
      // 사용자에게 알림
      const errorMessage = error.response?.data?.message || '인증이 만료되었습니다. 다시 로그인해주세요.';
      
      // localStorage에서 토큰과 사용자 정보 제거
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userNickname');
      
      // 토스트 메시지 표시
      toast.error(errorMessage);
      
      // 로그인 페이지로 리다이렉트
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    
    // 500 서버 에러 처리
    if (error.response?.status >= 500) {
      toast.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
    
    // 네트워크 에러 처리
    if (!error.response) {
      toast.error('네트워크 연결을 확인해주세요.');
    }
    
    return Promise.reject(error);
  }
);

export const authApi = {
  register: async (userData: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/member/create', userData);
    return response.data;
  },
  login: async (credentials: any): Promise<any> => {
    const response = await api.post('/member/doLogin', credentials);
    return response.data; // 백엔드에서 직접 { id: number, token: string } 응답
  },
  updateUser: async (userData: any): Promise<any> => {
    const response = await api.put('/member/update', userData);
    return response; // Return the whole response
  },
  getCurrentUser: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/member/profile');
    return response.data;
  },
};

export const locationApi = {
  verifyLocation: async (payload: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/location/verify', payload);
    return response.data;
  },
  getAddressPreview: async (lat: number, lon: number): Promise<ApiResponse<any>> => {
    const response = await api.get('/api/location/preview', { params: { latitude: lat, longitude: lon } });
    return response.data;
  },
};

// ... other api objects ...

export const diagnosisApi = {
  getQuestions: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/api/v1/diagnosis/questions');
    return response.data;
  },
  submitResponses: async (responses: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/v1/diagnosis/responses', responses);
    return response.data;
  },
  submitBulk: async (responses: any[]): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/v1/diagnosis/responses/bulk', responses);
    return response.data;
  },
  getResult: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/api/v1/diagnosis/result');
    return response.data;
  },
};

export const reportApi = {
  createReport: async (reportData: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/report/create', reportData);
    return response.data;
  },
  getReport: async (reportId: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/report/${reportId}`);
    return response.data;
  },
  // 백엔드에 맞는 새로운 리포트 API 추가
  getComprehensiveReport: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/report/comprehensive');
    return response.data;
  },
};

export const groupApi = {
  getGroups: async (scope: 'building' | 'neighborhood' = 'building'): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/api/groups?scope=${scope}`);
    return response.data;
  },
  getGroupPainPoints: async (groupId: string): Promise<ApiResponse<string[]>> => {
    const response = await api.get(`/api/groups/${groupId}/pain-points`);
    return response.data;
  },
  getGroupDiscussions: async (groupId: string): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/api/groups/${groupId}/discussions`);
    return response.data;
  },
};

export const tenantApi = {
  createTenant: async (tenantData: any): Promise<ApiResponse<string>> => {
    const response = await api.post('/api/tenants', tenantData);
    return response.data;
  },
  getAllTenants: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/api/tenants');
    return response.data;
  },
  getTenantById: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/tenants/${id}`);
    return response.data;
  },
};

export const letterApi = {
  generateLetter: async (request: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/letters', request);
    return response.data;
  },
};

export const landlordApi = {
  // Add landlord-specific API calls here
  getLandlordData: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/api/landlord/data');
    return response.data;
  },
  getProperties: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/api/landlord/properties');
    return response.data;
  },
  submitVerification: async (verification: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/landlord/verification', verification);
    return response.data;
  },
};

export const notificationApi = {
  getNotifications: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/api/notifications');
    return response.data;
  },
  getUnreadNotifications: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/api/notifications/unread');
    return response.data;
  },
  getUnreadCount: async (): Promise<ApiResponse<number>> => {
    const response = await api.get('/api/notifications/count');
    return response.data;
  },
  markAsRead: async (id: string): Promise<ApiResponse<string>> => {
    const response = await api.put(`/api/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async (): Promise<ApiResponse<string>> => {
    const response = await api.put('/api/notifications/read-all');
    return response.data;
  },
  deleteNotification: async (id: string): Promise<ApiResponse<string>> => {
    const response = await api.delete(`/api/notifications/${id}`);
    return response.data;
  },
  createNotification: async (notificationData: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/notifications', notificationData);
    return response.data;
  },
};

export const infoCardApi = {
  getAllCards: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/api/info-cards');
    return response.data;
  },
  createCard: async (cardData: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/admin/info-cards', cardData);
    return response.data;
  },
  updateCard: async (id: string, cardData: any): Promise<ApiResponse<any>> => {
    const response = await api.put(`/api/admin/info-cards/${id}`, cardData);
    return response.data;
  },
  deleteCard: async (id: string): Promise<ApiResponse<string>> => {
    const response = await api.delete(`/api/admin/info-cards/${id}`);
    return response.data;
  },
  getSituationInfoCard: async (situationType: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/info-cards/situation/${situationType}`);
    return response.data;
  },
};

export const missionApi = {
  getCurrentMission: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/mission/weekly/active');
    return response.data;
  },
  participateInMission: async (missionId: number, answers: any): Promise<ApiResponse<any>> => {
    const response = await api.post(`/mission/weekly/${missionId}/participate`, answers);
    return response.data;
  },
  getMissionResult: async (missionId: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/mission/weekly/${missionId}/result`);
    return response.data;
  },
};

// 정책 정보 API
export const policyApi = {
  getPersonalizedPolicies: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/api/policy/personalized');
    return response.data;
  },
  getPoliciesByCategory: async (categoryCode: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/policy/category/${categoryCode}`);
    return response.data;
  },
  getPolicyDetail: async (policyId: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/policy/${policyId}`);
    return response.data;
  },
  bookmarkPolicy: async (policyId: number): Promise<ApiResponse<any>> => {
    const response = await api.post(`/api/policy/${policyId}/bookmark`);
    return response.data;
  },
  unbookmarkPolicy: async (policyId: number): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/api/policy/${policyId}/bookmark`);
    return response.data;
  },
  applyPolicy: async (policyId: number): Promise<ApiResponse<any>> => {
    const response = await api.post(`/api/policy/${policyId}/apply`);
    return response.data;
  },
};

// 공공 데이터 (오피스텔) API
export const officetelApi = {
  getTransactions: async (lawdCd: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/officetel/transactions?lawdCd=${lawdCd}`);
    return response.data;
  },
  getJeonseMarket: async (lawdCd: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/officetel/jeonse-market?lawdCd=${lawdCd}`);
    return response.data;
  },
  getMonthlyRentMarket: async (lawdCd: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/officetel/monthly-rent-market?lawdCd=${lawdCd}`);
    return response.data;
  },
};

// 분쟁 해결 기관 API
export const disputeAgencyApi = {
  getAgenciesByRegion: async (region: string, agencyType?: string): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams({ region });
    if (agencyType) params.append('type', agencyType);
    const response = await api.get(`/api/dispute-agencies?${params}`);
    return response.data;
  },
  getRecommendedAgencies: async (disputeType: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/dispute-agencies/recommended?disputeType=${disputeType}`);
    return response.data;
  },
};

// 임대차 법령 정보 API
export const rentalLawApi = {
  getLawArticles: async (situation?: string, keyword?: string): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams();
    if (situation) params.append('situation', situation);
    if (keyword) params.append('keyword', keyword);
    const response = await api.get(`/api/rental-law/articles?${params}`);
    return response.data;
  },
  getLawByCategory: async (category: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/rental-law/category/${category}`);
    return response.data;
  },
};

