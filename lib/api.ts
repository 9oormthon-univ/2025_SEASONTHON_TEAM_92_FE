import axios from 'axios';
import toast from 'react-hot-toast';
import { ApiResponse } from '../types';

// 환경에 따른 API 기본 URL 설정
const getBaseURL = () => {
  // 환경변수가 설정되어 있으면 우선 사용
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  
  // 로컬/배포 환경 모두 Railway 배포 서버 사용
  return 'https://2025seasonthonteam92be-production.up.railway.app';
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
    
    // 네트워크 오류 처리
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.warn('🌐 네트워크 연결 오류 - 백엔드 서버에 연결할 수 없습니다');
      // 네트워크 오류 시에는 로그아웃하지 않고 그대로 진행
      return Promise.reject(error);
    }
    
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
  getCurrentUser: async (): Promise<any> => {
    const response = await api.get('/member/profile');
    return response.data;
  },
  setProfileInfo: async (profileData: any): Promise<any> => {
    const response = await api.post('/member/profile/setting', profileData);
    return response.data;
  },
  updateUserProfile: async (updateData: any): Promise<any> => {
    const response = await api.put('/member/profile', updateData);
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
  getReport: async (publicId: string): Promise<ApiResponse<any>> => {
    // 공개 API로 변경 (비회원도 접근 가능)
    const response = await api.get(`/public/report/${publicId}`);
    return response.data;
  },
  getComprehensiveReport: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/report/comprehensive');
    return response.data;
  },
  getPremiumReport: async (publicId: string): Promise<ApiResponse<any>> => {
    // 프리미엄 리포트 전용 API
    const response = await api.get(`/public/report/premium/${publicId}`);
    return response.data;
  },
  generateShareUrl: async (reportId: string, isPremium: boolean = false): Promise<ApiResponse<{ shareUrl: string }>> => {
    // 공유 URL 생성 API
    const response = await api.post('/report/share-url', { 
      reportId, 
      isPremium 
    });
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
  getSituationInfoCard: async (situationType: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/info-cards/situation/${situationType}`);
    return response.data;
  },
};

export const missionApi = {
  getCurrentMission: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/mission/weekly/current');
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
    const response = await api.get(`/api/officetel/rent-data?lawdCd=${lawdCd}`);
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
  getTimeSeriesAnalysis: async (lawdCd: string, months: number = 24): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/officetel/timeseries?lawdCd=${lawdCd}&months=${months}`);
    return response.data;
  },
};

export const villaApi = {
  getTransactions: async (lawdCd: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/villa/transactions?lawdCd=${lawdCd}`);
    return response.data;
  },
  getJeonseMarket: async (lawdCd: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/villa/jeonse-market?lawdCd=${lawdCd}`);
    return response.data;
  },
  getMonthlyRentMarket: async (lawdCd: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/villa/monthly-rent-market?lawdCd=${lawdCd}`);
    return response.data;
  },
  getTimeSeriesAnalysis: async (lawdCd: string, months: number = 24): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/villa/timeseries?lawdCd=${lawdCd}&months=${months}`);
    return response.data;
  },
};

// 건물 유형별 통합 API
export const realEstateApi = {
  getTimeSeriesAnalysis: async (buildingType: string, lawdCd: string, months: number = 24): Promise<ApiResponse<any>> => {
    // 건물 유형에 따라 다른 API 호출
    switch (buildingType?.toLowerCase()) {
      case '오피스텔':
      case 'officetel':
        return await officetelApi.getTimeSeriesAnalysis(lawdCd, months);
      case '빌라':
      case '다세대주택':
      case 'villa':
        return await villaApi.getTimeSeriesAnalysis(lawdCd, months);
      default:
        // 기본값은 빌라 API 사용
        return await villaApi.getTimeSeriesAnalysis(lawdCd, months);
    }
  },
  getTransactions: async (buildingType: string, lawdCd: string): Promise<ApiResponse<any>> => {
    switch (buildingType?.toLowerCase()) {
      case '오피스텔':
      case 'officetel':
        return await officetelApi.getTransactions(lawdCd);
      case '빌라':
      case '다세대주택':
      case 'villa':
        return await villaApi.getTransactions(lawdCd);
      default:
        return await villaApi.getTransactions(lawdCd);
    }
  },
  getMonthlyRentMarket: async (buildingType: string, lawdCd: string): Promise<ApiResponse<any>> => {
    switch (buildingType?.toLowerCase()) {
      case '오피스텔':
      case 'officetel':
        return await officetelApi.getMonthlyRentMarket(lawdCd);
      case '빌라':
      case '다세대주택':
      case 'villa':
        return await villaApi.getMonthlyRentMarket(lawdCd);
      default:
        return await villaApi.getMonthlyRentMarket(lawdCd);
    }
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

// 스마트 진단 API
export const smartDiagnosisApi = {
  // 소음 측정
  startNoiseMeasurement: async (location: string, duration: number): Promise<ApiResponse<any>> => {
    const response = await api.post('/smart-diagnosis/noise/start', { location, duration });
    return response.data;
  },
  processRealtimeNoise: async (measurementId: number, noiseLevel: number, timestamp: string): Promise<ApiResponse<any>> => {
    const response = await api.post('/smart-diagnosis/noise/realtime', { measurementId, noiseLevel, timestamp });
    return response.data;
  },
  completeNoiseMeasurement: async (measurementId: number, averageNoise: number, maxNoise: number, minNoise: number): Promise<ApiResponse<any>> => {
    const response = await api.post('/smart-diagnosis/noise/complete', { measurementId, averageNoise, maxNoise, minNoise });
    return response.data;
  },

  // 수평계 측정
  startLevelMeasurement: async (location: string): Promise<ApiResponse<any>> => {
    const response = await api.post('/smart-diagnosis/level/start', { location });
    return response.data;
  },
  processLevelMeasurement: async (measurementId: number, x: number, y: number, z: number): Promise<ApiResponse<any>> => {
    const response = await api.post('/smart-diagnosis/level/measure', { measurementId, x, y, z });
    return response.data;
  },

  // 인터넷 속도 측정
  startInternetSpeedTest: async (location: string): Promise<ApiResponse<any>> => {
    const response = await api.post('/smart-diagnosis/internet/start', { location });
    return response.data;
  },
  completeInternetSpeedTest: async (measurementId: number, downloadSpeed: number, uploadSpeed: number, ping: number): Promise<ApiResponse<any>> => {
    const response = await api.post('/smart-diagnosis/internet/complete', { measurementId, downloadSpeed, uploadSpeed, ping });
    return response.data;
  },

  // 측정 기록 조회
  getLevelHistory: async (limit: number = 10): Promise<ApiResponse<any>> => {
    const response = await api.get(`/smart-diagnosis/level/history?limit=${limit}`);
    return response.data;
  },
  getMeasurementDetail: async (measurementId: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/smart-diagnosis/measurements/${measurementId}`);
    return response.data;
  },
  getSmartDiagnosisSummary: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/smart-diagnosis/summary');
    return response.data;
  },
};

