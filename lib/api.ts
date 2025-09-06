import axios from 'axios';

// API 기본 URL 설정
const API_BASE_URL = 'https://jinwook.shop'; // team_backend의 기본 포트

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
  
  // JWT 토큰이 필요하지 않은 엔드포인트들 (team_backend 기준)
  const noAuthEndpoints = ['/member/create', '/member/doLogin', '/api/location/health', '/api/location/preview'];
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

// API 응답 타입 정의 (team_backend의 공통 응답 형식에 맞춤)
// Member API는 이 형식을 따르지 않으므로, 해당 API는 별도로 처리해야 합니다.
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  message: string;
}

// 사용자 타입 정의 (프론트엔드 기존 User 인터페이스 유지)
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

// 인증 API (team_backend 코드 기반)
// 응답 형식이 ApiResponse<T>를 따르지 않으므로, 호출하는 곳에서 raw 응답을 처리해야 합니다.
export const authApi = {
  register: async (userData: any): Promise<any> => { // Promise<any>로 변경
    const response = await api.post('/member/create', userData);
    return response.data; // { id: number }
  },
  
  login: async (credentials: any): Promise<any> => { // Promise<any>로 변경
    const response = await api.post('/member/doLogin', credentials);
    return response.data; // { id: number, token: string }
  },
  
  // updateUser: team_backend에 없음
  // async (userData: any): Promise<any> => {
  //   const response = await api.put('/api/auth/update', userData);
  //   return response.data;
  // },
  
  getCurrentUser: async (): Promise<any> => { // Promise<any>로 변경
    const response = await api.get('/member/profile');
    return response.data; // MemberProfileDto
  },

  setProfileSetting: async (settingData: any): Promise<any> => { // Promise<any>로 변경
    const response = await api.post('/member/profile/setting', settingData);
    return response.data; // { success: boolean, message: string }
  },
};

// 위치 API (team_backend 코드 기반)
export const locationApi = {
  healthCheck: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/api/location/health');
    return response.data;
  },
  getAddressPreview: async (longitude: number, latitude: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/api/location/preview?longitude=${longitude}&latitude=${latitude}`);
    return response.data;
  },
  verifyLocation: async (payload: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/location/verify', payload);
    return response.data;
  },
};

// // 그룹 API (team_backend에 없음)
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

// 진단 API (team_backend 코드 기반)
export const diagnosisApi = {
  submitDiagnosis: async (diagnosisData: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/v1/diagnosis/responses', diagnosisData);
    return response.data;
  },
  
  getDiagnosisResult: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/api/v1/diagnosis/result');
    return response.data;
  },
};

// // 리포트 API (team_backend에 없음)
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

// 주간 미션 API (team_backend 코드 기반)
export const missionApi = {
  getCurrentMission: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/mission/weekly/current');
    return response.data;
  },
  
  participateInMission: async (missionId: number, responses: any): Promise<ApiResponse<any>> => {
    const response = await api.post(`/mission/weekly/${missionId}/participate`, { responses });
    return response.data;
  },
  
  getMissionResults: async (missionId: number): Promise<ApiResponse<any>> => {
    const response = await api.get(`/mission/weekly/${missionId}/result`);
    return response.data;
  },
};

// 오피스텔 API (team_backend 코드 기반)
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

export default api;