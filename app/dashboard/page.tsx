
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('report');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportUrl, setReportUrl] = useState('');

  // Mock user data
  const userData = {
    name: '김지원',
    building: '래미안 아파트 101동',
    location: '강남구 개포동',
    monthsLived: 14,
    overallScore: 73,
    buildingAverage: 68,
    neighborhoodAverage: 71
  };

  // Mock analysis data
  const analysisData = {
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
  };

  const handleGenerateReport = async () => {
    console.log('리포트 생성 버튼 클릭됨');
    setIsGeneratingReport(true);
    setReportGenerated(false);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const generatedUrl = `${window.location.origin}/report/share/${Date.now()}`;
      setReportUrl(generatedUrl);
      setReportGenerated(true);
    } catch (error) {
      console.error('리포트 생성 실패:', error);
      alert('리포트 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(reportUrl);
      // 시각적 피드백 제공
      const button = document.getElementById('share-button');
      if (button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<div class="flex items-center"><i class="ri-check-line mr-2"></i>복사 완료!</div>';
        setTimeout(() => {
          button.innerHTML = originalText;
        }, 2000);
      }
    } catch (error) {
      // fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = reportUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('링크가 클립보드에 복사되었습니다!');
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
            <div className="flex items-center justify-between">
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">안녕하세요, {userData.name}님!</h2>
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
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('report')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors cursor-pointer ${
                  activeTab === 'report'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center">
                  <i className="ri-file-text-line mr-2"></i>
                  맞춤형 협상 리포트
                </div>
              </button>
              <button
                onClick={() => setActiveTab('market')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors cursor-pointer ${
                  activeTab === 'market'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center">
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
                        {!reportGenerated ? (
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
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center text-green-200 text-sm">
                              <i className="ri-check-circle-fill mr-2"></i>
                              리포트 생성 완료!
                            </div>
                            <div className="bg-white/10 rounded-lg p-3 mb-3">
                              <div className="text-xs text-blue-200 mb-2">공유 링크</div>
                              <div className="text-sm text-white break-all bg-black/20 rounded p-2 mb-2">
                                {reportUrl}
                              </div>
                              <div className="text-xs text-blue-200">
                                임대인은 회원가입 없이 리포트를 확인할 수 있습니다
                              </div>
                            </div>
                            <button
                              id="share-button"
                              onClick={handleCopyLink}
                              className="w-full bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <div className="flex items-center justify-center">
                                <i className="ri-file-copy-line mr-2"></i>
                                링크 복사하고 공유하기
                              </div>
                            </button>
                          </div>
                        )}
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
                    
                    {/* 1순위: 시설 개선 요구 */}
                    {facilityIssues.length > 0 && (
                      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                            1
                          </div>
                          <h4 className="text-xl font-bold text-red-800">최우선 협상 카드: 시설 개선 요구</h4>
                        </div>
                        
                        <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4">
                          <p className="text-red-700 text-sm">
                            <strong>법적 수선 의무에 해당하는 항목들입니다.</strong> 
                            월세 인하가 어렵다면, 이 데이터를 근거로 명확한 시설 개선을 최우선으로 요구하세요.
                          </p>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border border-red-200">
                          <p className="text-sm leading-relaxed text-gray-700">
                            샤워할 때 수압이 매우 약해서(45점) 건물 평균(72점)보다 27점이나 낮아 일상생활에 큰 불편을 겪고 있습니다. 습도 조절이 매우 어려워(38점) 건물 평균(65점)보다 27점 낮아 곰팡이 발생으로 건강에 영향을 받고 있습니다.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 2순위: 월세 조정 요구 */}
                    {structuralIssues.length > 0 && (
                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                            2
                          </div>
                          <h4 className="text-xl font-bold text-yellow-800">차선 협상 카드: 월세 조정 요구</h4>
                        </div>
                        
                        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-4">
                          <p className="text-yellow-700 text-sm">
                            <strong>구조적 문제로 해결이 어려운 항목들입니다.</strong> 
                            이를 근거로 월세 인상률을 동네 평균({analysisData.marketData.recentIncreaseRate}%)보다 
                            낮은 {analysisData.marketData.recommendedIncreaseRate}%로 조정 요구하세요.
                          </p>
                        </div>
                        
                        <div className="bg-white rounded-lg p-4 border border-yellow-200">
                          <p className="text-sm leading-relaxed text-gray-700">
                            주차공간 확보가 어려워(52점) 동네 평균(71점)보다 19점 낮아 매일 주차 스트레스를 받고 있습니다. 층간소음이 자주 들려(58점) 동네 평균(75점)보다 17점 낮아 수면과 휴식에 방해를 받고 있습니다.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 종합 협상 가이드 */}
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                      <h4 className="text-xl font-bold text-blue-800 mb-4">💡 종합 협상 가이드라인</h4>
                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4">
                          <h5 className="font-bold text-gray-900 mb-2">
                            1단계: {facilityIssues.map(item => item.category).join(', ')}
                          </h5>
                          <p className="text-gray-700 text-sm">
                            법적 수선 의무 해당 항목들을 최우선으로 개선 요구
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <h5 className="font-bold text-gray-900 mb-2">
                            2단계: {structuralIssues.map(item => item.category).join(', ')}
                          </h5>
                          <p className="text-gray-700 text-sm">
                            구조적 문제 해결이 어려울 경우 월세 인상률 조정 요구
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <h5 className="font-bold text-gray-900 mb-2">3단계: 데이터 근거 제시</h5>
                          <p className="text-gray-700 text-sm">
                            "이웃 {analysisData.marketData.participantCount}명의 비교 데이터에 따르면..." 으로 객관적 근거 제시
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 활용 가이드 */}
                    {reportGenerated && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                        <h4 className="text-xl font-bold text-green-800 mb-4">📱 리포트 활용 가이드</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-4">
                            <div className="flex items-center mb-3">
                              <i className="ri-chat-1-line text-green-600 text-xl mr-2"></i>
                              <h5 className="font-bold text-gray-900">카카오톡 공유</h5>
                            </div>
                            <p className="text-sm text-gray-600">
                              복사한 링크를 카톡으로 임대인에게 전송하세요. 
                              "재계약 관련해서 이웃들과 비교한 데이터가 있어서 공유드립니다" 라고 말하며 자연스럽게 전달하세요.
                            </p>
                          </div>
                          <div className="bg-white rounded-lg p-4">
                            <div className="flex items-center mb-3">
                              <i className="ri-message-2-line text-green-600 text-xl mr-2"></i>
                              <h5 className="font-bold text-gray-900">문자 메시지</h5>
                            </div>
                            <p className="text-sm text-gray-600">
                              문자로 링크를 전송할 때는 "거주환경 진단 결과를 공유드립니다. 
                              재계약 시 참고해주시면 감사하겠습니다" 라는 정중한 메시지와 함께 보내세요.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 우리 동네 시세 탭 */}
              {activeTab === 'market' && (
                <div className="space-y-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">📊 {userData.location} 시세 리포트</h3>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="ri-home-line text-xl text-blue-600"></i>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">평균 월세</h4>
                        <div className="text-2xl font-bold text-blue-600 mb-1">{analysisData.marketData.avgRent}만원</div>
                        <p className="text-sm text-gray-500">아파트 기준</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="ri-bank-line text-xl text-green-600"></i>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">평균 보증금</h4>
                        <div className="text-2xl font-bold text-green-600 mb-1">{analysisData.marketData.avgDeposit}만원</div>
                        <p className="text-sm text-gray-500">아파트 기준</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <i className="ri-arrow-up-line text-xl text-orange-600"></i>
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2">평균 인상률</h4>
                        <div className="text-2xl font-bold text-orange-600 mb-1">{analysisData.marketData.recentIncreaseRate}%</div>
                        <p className="text-sm text-gray-500">최근 6개월</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-bold text-gray-900 mb-4">건물 유형별 시세 비교</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="font-medium text-gray-900">아파트</span>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">85-95만원</div>
                          <div className="text-sm text-gray-500">월세 범위</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="font-medium text-gray-900">빌라/연립</span>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">70-80만원</div>
                          <div className="text-sm text-gray-500">월세 범위</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="font-medium text-gray-900">원룸/투룸</span>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">55-70만원</div>
                          <div className="text-sm text-gray-500">월세 범위</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-6">
                    <h4 className="font-bold text-blue-800 mb-3">💡 내 계약 조건 분석</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">현재 월세 수준</span>
                        <span className="font-semibold text-green-600">시세 대비 적정</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">예상 인상률</span>
                        <span className="font-semibold text-orange-600">{analysisData.marketData.recentIncreaseRate}% (동네 평균)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">권장 협상 목표</span>
                        <span className="font-semibold text-blue-600">{analysisData.marketData.recommendedIncreaseRate}% 이하</span>
                      </div>
                    </div>
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
                          href="https://www.hug.or.kr" 
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
                            href="https://www.scourt.go.kr" 
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
    </div>
  );
}
