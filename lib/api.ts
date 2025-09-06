import axios from 'axios';

// API 기본 URL 설정
const API_BASE_URL = 'https://www.jinwook.shop'; // 사용자 제공 명세서 Base URL

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
  
  // JWT 토큰이 필요하지 않은 엔드포인트들 (제공된 명세서 기준)
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

// API 응답 타입 정의 (제공된 명세서의 공통 응답 형식에 맞춤)
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

// 인증 API (명세서 기준)
export const authApi = {
  register: async (userData: any): Promise<ApiResponse<number>> => { // 응답 데이터 타입 변경 (ID)
    const response = await api.post('/member/create', userData);
    return response.data;
  },
  
  login: async (credentials: any): Promise<ApiResponse<{ id: number; token: string }>> => { // 응답 데이터 타입 변경 (id, token)
    const response = await api.post('/member/doLogin', credentials);
    return response.data;
  },
  
  // updateUser: 명세서에 없음 (이전 프론트엔드에 있었으나 team_backend 명세에 없음)
  // async (userData: any): Promise<ApiResponse<User>> => {
  //   const response = await api.put('/api/auth/update', userData);
  //   return response.data;
  // },
  
  getCurrentUser: async (): Promise<ApiResponse<{ profileName: string; profileEmail: string; profileBuilding: string; profileDong: string; }>> => { // 응답 데이터 타입 변경
    const response = await api.get('/member/profile');
    return response.data;
  },

  // 거주지 정보 설정 (명세서 기준)
  setProfileSetting: async (settingData: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/member/profile/setting', settingData);
    return response.data;
  },
};

// 위치 API (명세서 기준)
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

// // 그룹 API (명세서에 없음)
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

// // 진단 API (명세서에 없음)
// export const diagnosisApi = {
//   submitDiagnosis: async (diagnosisData: any): Promise<ApiResponse<any>> => {
//     const response = await api.post('/api/diagnosis', diagnosisData);
//     return response.data;
//   },
//   
//   getDiagnosisResult: async (): Promise<ApiResponse<any>> => {
//     const response = await api.get('/api/diagnosis/result');
//     return response.data;
//   },
// };

// // 리포트 API (명세서에 없음)
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

// 주간 미션 API (명세서 기준)
export const missionApi = {
  getCurrentMission: async (): Promise<ApiResponse<any>> => { // 응답 데이터 타입 변경
    const response = await api.get('/mission/weekly/current');
    return response.data;
  },
  
  participateInMission: async (missionId: number, responses: any): Promise<ApiResponse<any>> => { // missionId 추가
    const response = await api.post(`/mission/weekly/${missionId}/participate`, { responses });
    return response.data;
  },
  
  getMissionResults: async (missionId: number): Promise<ApiResponse<any>> => { // missionId 추가
    const response = await api.get(`/mission/weekly/${missionId}/result`);
    return response.data;
  },
};

// 오피스텔 API (명세서 기준 - 새로 추가)
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