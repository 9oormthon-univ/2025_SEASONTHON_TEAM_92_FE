
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, diagnosisApi, missionApi } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('report');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [weeklyMission, setWeeklyMission] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // User data state
  const [userData, setUserData] = useState({
    id: '',
    name: '',
    building: '',
    location: '',
    monthsLived: 0,
    overallScore: 0,
    buildingAverage: 0,
    neighborhoodAverage: 0
  });
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  
  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Check if user is logged in
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
          router.push('/auth/login');
          return;
        }

        // Get JWT token
        const jwtToken = localStorage.getItem('jwtToken');
        if (!jwtToken) {
          router.push('/auth/login');
          return;
        }

        // Fetch user profile from API
        const userProfile = await authApi.getCurrentUser();
        console.log('사용자 프로필 데이터:', userProfile);

        // 주간 미션 로드
        try {
          const missionResponse = await missionApi.getCurrentMission();
          if (missionResponse.success) {
            setWeeklyMission(missionResponse.data);
          }
        } catch (error) {
          console.log('주간 미션 로드 실패:', error);
        }

        // 알림 데이터 로드 (하드코딩)
        setNotifications([
          {
            id: 1,
            type: 'new_participant',
            message: '새로운 이웃 2명이 우리 건물 데이터에 참여했어요!',
            time: '2시간 전',
            icon: 'ri-user-add-line'
          },
          {
            id: 2,
            type: 'score_update',
            message: '지난주 \'소음\' 미션에 대한 우리 동네 평균 점수가 업데이트되었어요.',
            time: '1일 전',
            icon: 'ri-bar-chart-line'
          },
          {
            id: 3,
            type: 'report_update',
            message: 'OO동 월세 리포트가 5명의 추가 데이터로 업데이트되었습니다.',
            time: '3일 전',
            icon: 'ri-file-text-line'
          }
        ]);

        // 백엔드 응답 구조에 맞게 데이터 매핑
        setUserData({
          id: (userProfile as any).id?.toString() || '',
          name: (userProfile as any).name || (userProfile as any).email?.split('@')[0] || '사용자',
          building: (userProfile as any).buildingName || '건물명',
          location: (userProfile as any).neighborhood || (userProfile as any).address || '위치',
          monthsLived: (userProfile as any).monthsLived || 0,
          overallScore: (userProfile as any).overallScore || 0,
          buildingAverage: (userProfile as any).buildingAverage || 0,
          neighborhoodAverage: (userProfile as any).neighborhoodAverage || 0
        });

      } catch (error) {
        console.error('사용자 데이터 로드 실패:', error);
        // Fallback to localStorage data if API fails
        const email = localStorage.getItem('userEmail') || '';
        const nickname = localStorage.getItem('userNickname') || email.split('@')[0];
        const buildingName = localStorage.getItem('userBuildingName') || '건물명';
        const location = localStorage.getItem('userLocation') || '위치';
        const monthsLived = parseInt(localStorage.getItem('userMonthsLived') || '0');

        setUserData({
          id: localStorage.getItem('userId') || '',
          name: nickname,
          building: buildingName,
          location: location,
          monthsLived: monthsLived,
          overallScore: 0,
          buildingAverage: 0,
          neighborhoodAverage: 0
        });
      } finally {
        setIsLoadingUserData(false);
      }
    };

    loadUserData();
  }, [router]);
  
  // Analysis data state
  const [analysisData, setAnalysisData] = useState({
    lowScoreItems: [
      { 
        category: '수압', 
        myScore: 45, 
        buildingAvg: 72, 
        neighborhoodAvg: 68, 
        type: 'facility',
        priority: 1,
        description: '샤워할 때 수압이 매우 약해서(45점) 건물 평균(72점)보다 27점이나 낮아 일상생활에 큰 불편을 겪고 있습니다.',
        suggestion: '수압 펌프 점검 또는 수전 교체 요구',
        legalBasis: '주택임대차보호법 제20조 수선의무'
      },
      { 
        category: '곰팡이/습도', 
        myScore: 38, 
        buildingAvg: 65, 
        neighborhoodAvg: 62, 
        type: 'facility',
        priority: 1,
        description: '습도 조절이 매우 어려워(38점) 건물 평균(65점)보다 27점 낮아 곰팡이 발생으로 건강에 영향을 받고 있습니다.',
        suggestion: '벽지 교체 및 환기시설 개선 요구',
        legalBasis: '주택임대차보호법 제20조 수선의무'
      },
      { 
        category: '주차', 
        myScore: 52, 
        buildingAvg: 68, 
        neighborhoodAvg: 71, 
        type: 'structural',
        priority: 2,
        description: '주차공간 확보가 어려워(52점) 동네 평균(71점)보다 19점 낮아 매일 주차 스트레스를 받고 있습니다.',
        suggestion: '월세 인상률 조정 근거로 활용',
        reasoning: '해결이 어려운 구조적 문제를 근거로 월세 협상'
      },
      { 
        category: '방음', 
        myScore: 58, 
        buildingAvg: 72, 
        neighborhoodAvg: 75, 
        type: 'structural',
        priority: 2,
        description: '층간소음이 자주 들려(58점) 동네 평균(75점)보다 17점 낮아 수면과 휴식에 방해를 받고 있습니다.',
        suggestion: '월세 동결 또는 최소 인상 요구',
        reasoning: '건물 구조상 개선이 어려운 문제로 인상률 조정 요구'
      }
    ],
    marketData: {
      avgRent: 85,
      avgDeposit: 5000,
      recentIncreaseRate: 3.2,
      recommendedIncreaseRate: 1.5,
      participantCount: 87
    }
  });

  const handleGenerateReport = async () => {
    console.log('리포트 생성 버튼 클릭됨');
    // 리포트 페이지로 이동
    router.push('/report');
  };

  const handleGenerateReportInModal = async () => {
    console.log('리포트 생성 버튼 클릭됨 (모달)');
    setIsGeneratingReport(true);
    setShowReportModal(true);
    setGeneratedReport(null);
    
    try {
      const jwtToken = localStorage.getItem('jwtToken');
      if (!jwtToken) {
        throw new Error('JWT Token not found. Please log in.');
      }

      // 1단계: 백엔드에 리포트 작성 요청 (POST)
      const reportContent = `${userData.name} 님의 거주지 ${userData.building}에서 겪고 있는 문제점들을 바탕으로 협상 리포트를 생성해주세요.`;
      
      // API 기본 URL 가져오기
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 
        (process.env.NODE_ENV === 'production' 
          ? 'https://2025seasonthonteam92be-production.up.railway.app' 
          : 'http://localhost:8080');
      
      const createResponse = await fetch(`${baseURL}/report/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({ reportContent })
      });

      console.log('HTTP 상태 코드:', createResponse.status);
      console.log('응답 헤더:', createResponse.headers);

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        console.error('에러 응답:', errorData);
        throw new Error(errorData.message || 'Failed to create report');
      }

      const createData = await createResponse.json();
      console.log('백엔드 응답 데이터:', createData);
      console.log('응답 타입:', typeof createData);
      console.log('응답이 배열인가?', Array.isArray(createData));
      
      // 백엔드에서 반환하는 ID 처리
      let reportId;
      
      if (typeof createData === 'number') {
        // 백엔드에서 숫자로 직접 반환하는 경우
        reportId = createData;
        console.log('숫자로 반환된 ID:', reportId);
      } else if (Array.isArray(createData) && createData.length > 0) {
        // 배열인 경우 첫 번째 요소에서 ID 추출
        reportId = createData[0].reportId || createData[0].id || createData[0].report_id;
        console.log('배열에서 추출한 ID:', reportId);
      } else if (typeof createData === 'object' && createData !== null) {
        // 객체인 경우
        reportId = createData.reportId || createData.id || createData.report_id;
        console.log('객체에서 추출한 ID:', reportId);
      } else {
        // 다른 타입인 경우
        console.log('예상치 못한 응답 타입:', createData);
      }

      if (!reportId) {
        console.error('사용 가능한 ID 필드가 없습니다. 전체 응답:', createData);
        throw new Error('백엔드에서 reportId를 반환하지 않았습니다.');
      }

      // 2단계: 백엔드에서 작성한 리포트 불러오기 (GET)
      const getResponse = await fetch(`${baseURL}/report/${reportId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });

      if (!getResponse.ok) {
        const errorData = await getResponse.json();
        throw new Error(errorData.message || 'Failed to fetch report');
      }

      const reportData = await getResponse.json();
      console.log('리포트 데이터:', reportData);

      // Show report in modal
      setGeneratedReport(reportData);
      setShowReportModal(true);

    } catch (error: any) {
      console.error('리포트 생성 실패:', error);
      alert(`리포트 생성 중 오류가 발생했습니다: ${error.message}. 다시 시도해주세요.`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const facilityIssues = analysisData.lowScoreItems.filter(item => item.type === 'facility');
  const structuralIssues = analysisData.lowScoreItems.filter(item => item.type === 'structural');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-bold text-gray-800 cursor-pointer mb-2 font-['Pacifico']">월세의 정석</h1>
          </Link>
          <div className="w-16 h-1 bg-gray-700 mx-auto mb-6"></div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            {isLoadingUserData ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mr-3"></div>
                <span className="text-gray-600">사용자 정보를 불러오는 중...</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">안녕하세요, {userData.name} 님!</h2>
                  <p className="text-gray-600">{userData.building} • {userData.location}</p>
                  <p className="text-sm text-gray-500 mt-1">거주 기간: {userData.monthsLived}개월</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-white">{userData.overallScore}</span>
                  </div>
                  <p className="text-sm text-gray-600">종합 만족도</p>
                </div>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('report')}
                className={`flex-1 px-6 py-4 text-left font-semibold transition-colors cursor-pointer ${
                  activeTab === 'report'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <i className="ri-file-text-line mr-2"></i>
                  맞춤형 협상 리포트
                </div>
              </button>
              <button
                onClick={() => setActiveTab('market')}
                className={`flex-1 px-6 py-4 text-left font-semibold transition-colors cursor-pointer ${
                  activeTab === 'market'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <i className="ri-bar-chart-line mr-2"></i>
                  우리 동네 시세
                </div>
              </button>
              <button
                onClick={() => setActiveTab('support')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors cursor-pointer ${
                  activeTab === 'support'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center">
                  <i className="ri-information-line mr-2"></i>
                  정책 정보
                </div>
              </button>
            </div>

            <div className="p-8">
              {/* 맞춤형 협상 리포트 탭 */}
              {activeTab === 'report' && (
                <div className="space-y-8">
                  {/* 리포트 생성 섹션 */}
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-2">맞춤형 협상 리포트</h3>
                        <p className="text-blue-100 mb-2">수집된 데이터를 바탕으로 실질적인 협상 자료를 생성합니다</p>
                        <div className="text-xs text-blue-200 flex items-center">
                          <i className="ri-group-line mr-1"></i>
                          최소 87명 참여 데이터 기반
                        </div>
                      </div>
                      <div className="text-right">
                        <button
                          onClick={handleGenerateReport}
                          disabled={isGeneratingReport}
                          className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                          type="button"
                        >
                          {isGeneratingReport ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                              생성 중...
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <i className="ri-file-add-line mr-2"></i>
                              리포트 생성하기
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 협상 전략 제안 */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">📋 재계약 협상 전략 제안</h3>
                    
                    {/* 데이터 신뢰도 표시 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center text-blue-800">
                        <i className="ri-shield-check-line mr-2"></i>
                        <span className="font-medium">
                          이 분석은 {analysisData.marketData.participantCount}명의 이웃 데이터를 기반으로 합니다
                        </span>
                      </div>
                    </div>
                    

                    {/* 활용 가이드 */}
                    
                  </div>
                </div>
              )}


              {/* 정책 정보 탭 */}
              {activeTab === 'support' && (
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">🏛️ 맞춤형 정책 정보</h3>
                  
                  {/* 청년 지원 정책 */}
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <h4 className="text-xl font-bold text-green-800 mb-4">청년 월세 지원 정책</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4">
                        <h5 className="font-bold text-gray-900 mb-2">청년 월세 한시 특별지원</h5>
                        <p className="text-sm text-gray-600 mb-3">만 19~34세 청년에게 월 20만원씩 12개월 지원</p>
                        <a 
                          href="https://www.gov.kr" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-green-600 text-sm font-medium hover:text-green-700 cursor-pointer"
                        >
                          자세히 보기 <i className="ri-external-link-line ml-1"></i>
                        </a>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <h5 className="font-bold text-gray-900 mb-2">청년 전월세 보증금 대출</h5>
                        <p className="text-sm text-gray-600 mb-3">최대 2억원까지 연 1.8% 금리로 지원</p>
                        <a 
                          href="https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00005696" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-green-600 text-sm font-medium hover:text-green-700 cursor-pointer"
                        >
                          자세히 보기 <i className="ri-external-link-line ml-1"></i>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* 분쟁 해결 정보 */}
                  <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                    <h4 className="text-xl font-bold text-orange-800 mb-4">임대차 분쟁 해결 기관</h4>
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-bold text-gray-900">임대차분쟁조정위원회</h5>
                            <p className="text-sm text-gray-600">임대차 관련 분쟁의 조정 및 중재</p>
                          </div>
                          <a 
                            href="https://adrhome.reb.or.kr/adrhome/reb/main" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-orange-600 hover:text-orange-700 cursor-pointer"
                          >
                            <i className="ri-external-link-line text-xl"></i>
                          </a>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-bold text-gray-900">한국소비자원</h5>
                            <p className="text-sm text-gray-600">소비자 피해 구제 및 상담</p>
                          </div>
                          <a 
                            href="https://www.kca.go.kr" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-orange-600 hover:text-orange-700 cursor-pointer"
                          >
                            <i className="ri-external-link-line text-xl"></i>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 법률 정보 */}
                  <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                    <h4 className="text-xl font-bold text-purple-800 mb-4">주요 임대차보호법 조항</h4>
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4">
                        <h5 className="font-bold text-gray-900 mb-2">수선 의무 (제20조)</h5>
                        <p className="text-sm text-gray-600">
                          임대인은 임대목적물을 임차인이 사용·수익하기에 필요한 상태를 유지하도록 할 의무가 있습니다.
                        </p>
                        <div className="mt-2 text-xs text-purple-600">
                          해당 항목: 누수, 수압, 곰팡이, 도어락, 보일러 등
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-4">
                        <h5 className="font-bold text-gray-900 mb-2">차임 증액 제한 (제7조)</h5>
                        <p className="text-sm text-gray-600">
                          임대인은 차임 등을 임차권 존속기간 중 증액할 수 없으며, 약정한 차임 등의 20분의 1을 초과하여 증액할 수 없습니다.
                        </p>
                        <div className="mt-2 text-xs text-purple-600">
                          연간 최대 5% 이내 인상 가능
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <Link href="/diagnosis">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <i className="ri-refresh-line text-xl text-blue-600"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">진단 다시 받기</h4>
                    <p className="text-sm text-gray-600">최신 상태로 다시 진단받아보세요</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/weekly-mission">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <i className="ri-task-line text-xl text-green-600"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">주간 미션 참여</h4>
                    <p className="text-sm text-gray-600">이웃들과 함께 데이터를 개선해보세요</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* 알림 설정 */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🔔 알림 설정</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">새로운 설문 알림</h4>
                  <p className="text-sm text-gray-600">우리 동네에 새로운 설문이 시작되면 알려드려요</p>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">참여 현황 알림</h4>
                  <p className="text-sm text-gray-600">내가 참여한 설문에 새로운 응답이 있으면 알려드려요</p>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">시세 업데이트 알림</h4>
                  <p className="text-sm text-gray-600">우리 동네 월세 리포트가 업데이트되면 알려드려요</p>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">맞춤형 협상 리포트</h2>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setGeneratedReport(null);
                  setIsGeneratingReport(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {isGeneratingReport ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">리포트 생성 중...</h3>
                  <p className="text-gray-600 text-center">
                    AI가 당신만의 맞춤형 협상 가이드를 생성하고 있습니다.<br />
                    잠시만 기다려주세요.
                  </p>
                </div>
              ) : generatedReport ? (
                <div className="space-y-6">
                {/* Primary Negotiation Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
                    <i className="ri-file-text-line mr-2"></i>
                    주요 협상 카드
                  </h3>
                  <div className="bg-white rounded-lg p-4 border border-blue-100">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {generatedReport.primaryNegotiationCard || '주요 협상 카드가 생성되지 않았습니다.'}
                    </p>
                  </div>
                </div>

                {/* Secondary Negotiation Card */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center">
                    <i className="ri-file-list-line mr-2"></i>
                    보조 협상 카드
                  </h3>
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {generatedReport.secondaryNegotiationCard || '보조 협상 카드가 생성되지 않았습니다.'}
                    </p>
                  </div>
                </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-red-500 text-center">
                    <i className="ri-error-warning-line text-4xl mb-4"></i>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">리포트 생성 실패</h3>
                    <p className="text-gray-600">리포트를 생성하는 중 오류가 발생했습니다.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                <i className="ri-information-line mr-1"></i>
                이 리포트는 AI가 생성한 맞춤형 협상 가이드입니다.
              </div>
              <div className="flex space-x-3">
                {generatedReport && (
                  <button
                    onClick={() => {
                      const fullReport = `주요 협상 카드:\n\n${generatedReport.primaryNegotiationCard || '주요 협상 카드가 생성되지 않았습니다.'}\n\n보조 협상 카드:\n\n${generatedReport.secondaryNegotiationCard || '보조 협상 카드가 생성되지 않았습니다.'}`;
                      navigator.clipboard.writeText(fullReport);
                      alert('리포트가 클립보드에 복사되었습니다!');
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <i className="ri-file-copy-line mr-2"></i>
                    전문 복사
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setGeneratedReport(null);
                    setIsGeneratingReport(false);
                  }}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  {isGeneratingReport ? '취소' : '닫기'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
