import axios from 'axios';

// API 기본 URL 설정
const API_BASE_URL = 'http://localhost:8891'; // 2025_SEASONTHON_TEAM_92_BE의 기본 포트

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

// 인증 API (2025_SEASONTHON_TEAM_92_BE와 일치)
export const authApi = {
  register: async (userData: any): Promise<ApiResponse<User>> => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials: any): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },
  
  updateUser: async (userData: any): Promise<ApiResponse<User>> => {
    const response = await api.put('/api/auth/update', userData);
    return response.data;
  },
  
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

// 위치 API (2025_SEASONTHON_TEAM_92_BE와 일치)
export const locationApi = {
  verifyLocation: async (payload: any): Promise<ApiResponse<any>> => {
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

// 진단 API (2025_SEASONTHON_TEAM_92_BE 경로에 맞춤)
export const diagnosisApi = {
  submitDiagnosis: async (diagnosisData: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/api/diagnoses', diagnosisData); // /api/diagnosis -> /api/diagnoses
    return response.data;
  },
  
  getDiagnosisResult: async (): Promise<ApiResponse<any>> => {
    // /api/diagnosis/result -> /api/diagnoses/comparison/{userId}
    // 프론트엔드 호출부에서 userId를 전달하도록 수정 필요
    const response = await api.get('/api/diagnoses/comparison/YOUR_USER_ID_HERE'); 
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

// 주간 미션 API (2025_SEASONTHON_TEAM_92_BE 경로에 맞춤)
export const missionApi = {
  getWeeklyMission: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/api/missions/current'); // /api/missions/weekly -> /api/missions/current
    return response.data;
  },
  
  submitMissionResponse: async (missionData: any): Promise<ApiResponse<any>> => {
    // /api/missions/submit -> /api/missions/participate
    // 백엔드 경로에 missionId가 필요하여 프론트엔드 호출부 수정 필요
    const response = await api.post('/api/missions/participate', missionData); 
    return response.data;
  },
  
  getMissionResults: async (): Promise<ApiResponse<any>> => {
    // /api/missions/results -> /api/missions/v2/{missionId}/result
    // 백엔드 경로에 missionId가 필요하여 프론트엔드 호출부 수정 필요
    const response = await api.get('/api/missions/v2/YOUR_MISSION_ID_HERE/result'); 
    return response.data;
  },
};

export default api;