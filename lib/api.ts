import axios from 'axios';

// API 기본 URL 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://www.jinwook.shop'; // team_backend의 기본 포트

// 목업 모드 설정 (백엔드 API가 구현되지 않은 경우)
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

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

// 진단 API (API 명세 기반)
export const diagnosisApi = {
  getDiagnosisQuestions: async (): Promise<any> => {
    const response = await api.get('/diagnosis/questions');
    return response.data; // ApiResponse<DiagnosisQuestions>
  },
  
  submitDiagnosis: async (diagnosisData: any): Promise<any> => {
    const response = await api.post('/diagnosis/responses', diagnosisData);
    return response.data; // ApiResponse<DiagnosisSubmission>
  },
  
  getDiagnosisResult: async (): Promise<any> => {
    const response = await api.get('/diagnosis/result');
    return response.data; // ApiResponse<DiagnosisResult>
  },
};

// 리포트 API (API 명세 기반)
export const reportApi = {
  createReport: async (reportData: any): Promise<any> => {
    const response = await api.post('/report/create', reportData);
    return response.data; // { reportId: number }
  },
  
  getReport: async (reportId: number): Promise<any> => {
    const response = await api.get(`/report/${reportId}`);
    return response.data; // { primaryNegotiationCard, secondaryNegotiationCard, step1, step2 }
  },
};

// 주간 미션 API (API 명세 기반)
export const missionApi = {
  getCurrentMission: async (): Promise<any> => {
    try {
      const response = await api.get('/missions/current');
      return response.data; // ApiResponse<CurrentMission>
    } catch (error: any) {
      // 백엔드가 구현되지 않은 경우 목업 데이터 반환
      if (USE_MOCK_DATA || error.response?.status === 404) {
        console.log('백엔드 API가 구현되지 않아 목업 데이터를 사용합니다.');
        return {
          success: true,
          data: {
            mission_id: 1,
            category: "소음",
            title: "방음 상태 점검",
            description: "우리 집 소음 환경을 체크해보세요",
            start_date: "2024-01-08",
            end_date: "2024-01-14",
            questions: [
              {
                question_id: 1,
                question_text: "옆집 생활 소음이 들리는 편인가요?",
                question_type: "select",
                options: ["전혀 안 들림", "가끔 들림", "자주 들림"],
                order_number: 1
              },
              {
                question_id: 2,
                question_text: "최근 1달 내 층간소음으로 불편을 겪은 적이 있나요?",
                question_type: "select", 
                options: ["없음", "1~2번", "3번 이상"],
                order_number: 2
              }
            ],
            participation_count: 156,
            user_participated: false
          }
        };
      }
      throw error;
    }
  },
  
  participateInMission: async (missionId: number, responseData: any): Promise<any> => {
    try {
      const response = await api.post(`/missions/${missionId}/participate`, responseData);
      return response.data; // ApiResponse<ParticipationResult>
    } catch (error: any) {
      // 백엔드가 구현되지 않은 경우 목업 데이터 반환
      if (USE_MOCK_DATA || error.response?.status === 404) {
        console.log('백엔드 API가 구현되지 않아 목업 데이터를 사용합니다.');
        return {
          success: true,
          data: {
            response_id: 123,
            total_score: 7,
            message: "미션 참여가 완료되었습니다!",
            next_step: "결과 확인하기"
          }
        };
      }
      throw error;
    }
  },
  
  getMissionResult: async (missionId: number): Promise<any> => {
    try {
      const response = await api.get(`/missions/${missionId}/result`);
      return response.data; // ApiResponse<MissionResult>
    } catch (error: any) {
      // 백엔드가 구현되지 않은 경우 목업 데이터 반환
      if (USE_MOCK_DATA || error.response?.status === 404) {
        console.log('백엔드 API가 구현되지 않아 목업 데이터를 사용합니다.');
        return {
          success: true,
          data: {
            user_score: 7,
            max_score: 10,
            category: "소음",
            building_comparison: {
              building_average: 6.2,
              user_rank: 8,
              total_participants: 12,
              comparison_text: "우리 건물 평균보다 소음이 적은 편입니다"
            },
            neighborhood_comparison: {
              neighborhood_average: 5.8,
              user_rank: 23,
              total_participants: 45,
              comparison_text: "우리 동네 평균보다 소음이 적은 편입니다"
            },
            insights: [
              "우리 건물은 전반적으로 방음이 잘 되는 편입니다",
              "87% 참가자가 소음에 만족하고 있습니다"
            ]
          }
        };
      }
      throw error;
    }
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