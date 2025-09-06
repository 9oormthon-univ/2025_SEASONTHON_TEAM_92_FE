import axios from 'axios';

// API 기본 URL 설정
const API_BASE_URL = 'https://www.jinwook.shop'; // SeasonToneBackend API 서버

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// JWT 토큰을 자동으로 헤더에 추가하는 인터셉터
api.interceptors.request.use((config) => {
  console.log('🚀 API 요청 시작:', config.method?.toUpperCase(), config.url);
  console.log('📤 요청 데이터:', config.data);
  console.log('🌐 Base URL:', config.baseURL);
  
  const token = localStorage.getItem('jwtToken');
  
  // JWT 토큰이 필요하지 않은 엔드포인트들 (2025_SEASONTHON_TEAM_92_BE 기준)
  const noAuthEndpoints = ['/api/auth/register', '/api/auth/login', '/api/location/verify'];
  const needsAuth = !noAuthEndpoints.some(endpoint => config.url?.includes(endpoint));
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    if (needsAuth) {
      console.log('🔑 JWT 토큰이 요청 헤더에 추가됨:', config.url);
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
    return Promise.reject(error);
  }
);

// API 응답 타입 정의
export interface ApiResponse<T = any> {
  ok: boolean;
  data: T | null;
  message: string;
}

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

// 인증 API (SeasonToneBackend와 일치)
export const authApi = {
  register: async (userData: { name: string; email: string; password: string }): Promise<ApiResponse<number>> => {
    const response = await api.post('/member/create', userData);
    return response.data;
  },
  
  login: async (credentials: { email: string; password: string }): Promise<ApiResponse<{ id: number; token: string }>> => {
    const response = await api.post('/member/doLogin', credentials);
    return response.data;
  },
  
  getProfile: async (): Promise<ApiResponse<{ profileName: string; profileEmail: string; profileBuilding: string; profileDong: string }>> => {
    const response = await api.get('/member/profile');
    return response.data;
  },
  
  updateProfile: async (profileData: { building: string; dong: string; detailAddress: string; buildingType: string; contractType: string; security: number }): Promise<ApiResponse<any>> => {
    const response = await api.post('/member/profile/setting', profileData);
    return response.data;
  },
};

// 위치 API (SeasonToneBackend와 일치)
export const locationApi = {
  healthCheck: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/api/location/health');
    return response.data;
  },
  
  getAddressPreview: async (longitude: number, latitude: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/location/preview?longitude=${longitude}&latitude=${latitude}`);
    return response.data;
  },
  
  verifyLocation: async (payload: { latitude: number; longitude: number; buildingName: string }): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/location/verify', payload);
    return response.data;
  },
};

// // 그룹 API (사용자 요청으로 비활성화)
// export const groupApi = {
//   getGroups: async (scope: 'building' | 'neighborhood'): Promise<ApiResponse<any[]>> => {
//     const response = await api.get(`/api/groups?scope=${scope}`);
//     return response.data;
//   },
//   
//   createGroup: async (groupData: any): Promise<ApiResponse<any>> => {
//     const response = await api.post('/api/groups', groupData);
//     return response.data;
//   },
//   
//   joinGroup: async (groupId: string): Promise<ApiResponse<any>> => {
//     const response = await api.post(`/api/groups/${groupId}/join`);
//     return response.data;
//   },
// };

// 오피스텔 API (SeasonToneBackend와 일치)
export const officetelApi = {
  getRentData: async (lawdCd: string): Promise<ApiResponse<any>> => {
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
};

// // 리포트 API (사용자 요청으로 비활성화)
// export const reportApi = {
//   generateReport: async (): Promise<ApiResponse<any>> => {
//     const response = await api.post('/api/reports/generate');
//     return response.data;
//   },
//   
//   getReport: async (reportId: string): Promise<ApiResponse<any>> => {
//     const response = await api.get(`/api/reports/${reportId}`);
//     return response.data;
//   },
//   
//   shareReport: async (reportId: string): Promise<ApiResponse<{ shareToken: string }>> => {
//     const response = await api.post(`/api/reports/${reportId}/share`);
//     return response.data;
//   },
// };

// 주간 미션 API (SeasonToneBackend와 일치)
export const missionApi = {
  getCurrentMission: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/mission/weekly/current');
    return response.data;
  },
  
  participateInMission: async (missionId: number, responses: Array<{ questionId: number; answer: string; score: number }>): Promise<ApiResponse<any>> => {
    const response = await api.post(`/mission/weekly/${missionId}/participate`, { responses });
    return response.data;
  },
  
  getMissionResult: async (missionId: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/mission/weekly/${missionId}/result`);
    return response.data;
  },
};

export default api;