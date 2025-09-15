'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { diagnosisApi } from '../../../lib/api';
import toast from 'react-hot-toast';

export default function DiagnosisResultsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDiagnosisResult = async () => {
      try {
        const response = await diagnosisApi.getResult();
        console.log('진단 결과 API 응답:', response);
        
        // 백엔드 응답 구조: { success: true, data: DiagnosisResultResponseDTO, message: string }
        const resultData = response?.data;
        
        if (resultData) {
          setDiagnosisResult(resultData);
        } else {
          throw new Error('진단 결과 데이터를 찾을 수 없습니다.');
        }
      } catch (err: any) {
        console.error('진단 결과 로드 실패:', err);
        setError('진단 결과를 불러오는 데 실패했습니다.');
        toast.error('진단 결과를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiagnosisResult();
  }, []);

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleGoToWeeklyMission = () => {
    router.push('/weekly-mission');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900">진단 결과 분석 중...</h2>
          <p className="text-gray-600">이웃들과 비교 분석을 진행하고 있습니다</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-error-warning-line text-3xl text-red-600"></i>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900">오류가 발생했습니다</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/diagnosis')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            다시 진단하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-bold text-purple-600 cursor-pointer mb-2 font-['Roboto']">월세의 정석</h1>
          </Link>
          <div className="w-16 h-1 bg-purple-600 rounded-full mx-auto mb-6"></div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-check-circle-fill text-4xl text-purple-600"></i>
            </div>
            <h2 className="text-3xl font-bold mb-3 text-gray-800">진단 완료! 🎉</h2>
            <p className="text-lg text-gray-600 mb-4">우리 집 거주 환경을 분석했습니다</p>
            
            {diagnosisResult && (
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex items-center justify-center text-purple-800">
                  <i className="ri-bar-chart-line mr-2"></i>
                  <span className="font-medium">
                    {diagnosisResult.statistics?.participantCount || 0}명의 이웃 데이터와 비교 분석
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {diagnosisResult && (
          <div className="space-y-8">
            {/* Overall Score */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">📊 종합 만족도</h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-600">
                      {diagnosisResult.summary?.totalScore || 0}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-1">내 점수</h4>
                  <p className="text-sm text-gray-600">종합 만족도</p>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-600">
                      {(diagnosisResult.summary?.buildingAverage || 0).toFixed(2)}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-1">건물 평균</h4>
                  <p className="text-sm text-gray-600">같은 건물 이웃들</p>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-600">
                      {(diagnosisResult.summary?.neighborhoodAverage || 0).toFixed(2)}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-1">동네 평균</h4>
                  <p className="text-sm text-gray-600">같은 동네 이웃들</p>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            {diagnosisResult.categoryDetails && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">📋 카테고리별 분석</h3>
                
                <div className="space-y-4">
                  {diagnosisResult.categoryDetails.map((category: any, index: number) => {
                    const categoryNames = ['소음', '수압', '채광', '주차', '난방', '환기', '보안', '관리', '편의성', '인터넷'];
                    const categoryName = categoryNames[category.categoryId - 1] || `카테고리 ${category.categoryId}`;
                    
                    return (
                      <div key={category.categoryId} className="bg-purple-50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold text-gray-800">{categoryName}</h4>
                          <div className="text-right">
                            <div className="text-xl font-bold text-purple-600">{category.myScore || 0}</div>
                            <div className="text-sm text-gray-600">내 점수</div>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">건물 평균</span>
                              <span className="font-semibold text-purple-600">{(category.buildingAverage || 0).toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">동네 평균</span>
                              <span className="font-semibold text-purple-600">{(category.neighborhoodAverage || 0).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">💡 개선 제안</h3>
              
              <div className="space-y-4">
                {/* 시설 개선 우선순위 - 실제 데이터 기반 */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-purple-800 mb-3">시설 개선 우선순위</h4>
                  {(() => {
                    const categoryNames = ['소음', '수압', '채광', '주차', '난방', '환기', '보안', '관리', '편의성', '인터넷'];
                    const lowScoreCategories = diagnosisResult.categoryDetails
                      ?.filter((category: any) => category.myScore < 60)
                      ?.sort((a: any, b: any) => a.myScore - b.myScore)
                      ?.slice(0, 3) || [];
                    
                    if (lowScoreCategories.length > 0) {
                      return (
                        <div>
                          <p className="text-gray-700 mb-3">
                            다음 항목들이 건물 평균보다 낮은 점수를 받았습니다. 우선적으로 개선을 요구하세요:
                          </p>
                          <div className="space-y-2">
                            {lowScoreCategories.map((category: any, index: number) => {
                              const categoryName = categoryNames[category.categoryId - 1] || `카테고리 ${category.categoryId}`;
                              const gap = (category.buildingAverage || 0) - (category.myScore || 0);
                              return (
                                <div key={category.categoryId} className="bg-white rounded-lg p-3 border border-blue-100">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-800">{categoryName}</span>
                                    <div className="text-right">
                                      <span className="text-sm text-red-600 font-semibold">
                                        내 점수: {category.myScore}점
                                      </span>
                                      <span className="text-xs text-gray-500 ml-2">
                                        (건물 평균 대비 -{gap.toFixed(1)}점)
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <p className="text-gray-700">
                          모든 항목에서 건물 평균 이상의 점수를 받았습니다! 현재 거주 환경이 양호한 상태입니다.
                        </p>
                      );
                    }
                  })()}
                </div>
                
                {/* 협상 전략 - 실제 데이터 기반 */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-purple-800 mb-3">협상 전략</h4>
                  {(() => {
                    const categoryNames = ['소음', '수압', '채광', '주차', '난방', '환기', '보안', '관리', '편의성', '인터넷'];
                    const lowScoreCategories = diagnosisResult.categoryDetails
                      ?.filter((category: any) => category.myScore < 60)
                      ?.sort((a: any, b: any) => a.myScore - b.myScore)
                      ?.slice(0, 3) || [];
                    
                    if (lowScoreCategories.length > 0) {
                      const worstCategory = lowScoreCategories[0];
                      const categoryName = categoryNames[worstCategory.categoryId - 1] || `카테고리 ${worstCategory.categoryId}`;
                      const gap = (worstCategory.buildingAverage || 0) - (worstCategory.myScore || 0);
                      
                      return (
                        <div>
                          <p className="text-gray-700 mb-3">
                            <strong>{categoryName}</strong> 항목에서 건물 평균 대비 <strong>{gap.toFixed(1)}점 낮은 점수</strong>를 받았습니다.
                          </p>
                          <div className="bg-white rounded-lg p-4 border border-green-100">
                            <h5 className="font-semibold text-gray-800 mb-2">협상 포인트:</h5>
                            <ul className="text-sm text-gray-700 space-y-1">
                              <li>• "{categoryName} 항목에서 건물 평균({worstCategory.buildingAverage?.toFixed(1)}점)보다 {gap.toFixed(1)}점 낮은 점수를 받았습니다"</li>
                              <li>• "이웃 {diagnosisResult.statistics?.participantCount || 0}명의 객관적 데이터를 바탕으로 개선이 필요합니다"</li>
                              <li>• "주택임대차보호법 제20조에 따른 수선의무에 해당할 수 있습니다"</li>
                            </ul>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div>
                          <p className="text-gray-700 mb-3">
                            모든 항목에서 건물 평균 이상의 점수를 받았습니다.
                          </p>
                          <div className="bg-white rounded-lg p-4 border border-green-100">
                            <h5 className="font-semibold text-gray-800 mb-2">협상 포인트:</h5>
                            <ul className="text-sm text-gray-700 space-y-1">
                              <li>• "현재 거주 환경이 건물 평균보다 우수합니다"</li>
                              <li>• "이웃 {diagnosisResult.statistics?.participantCount || 0}명의 데이터로 검증된 양호한 상태입니다"</li>
                              <li>• "현재 조건 유지 또는 적정한 인상률을 요구할 수 있습니다"</li>
                            </ul>
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h3 className="text-xl font-bold mb-4 text-gray-800">다음 단계</h3>
            <p className="text-gray-600 mb-6">진단 결과를 바탕으로 다음 단계를 진행해보세요</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGoToDashboard}
                className="bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="flex items-center justify-center">
                  <i className="ri-file-text-line mr-2"></i>
                  협상 리포트 생성하기
                </div>
              </button>
              
              <button
                onClick={handleGoToWeeklyMission}
                className="bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="flex items-center justify-center">
                  <i className="ri-task-line mr-2"></i>
                  주간 미션 참여하기
                </div>
              </button>
              
              <Link href="/profile">
                <button className="bg-gray-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap">
                  <div className="flex items-center justify-center">
                    <i className="ri-user-line mr-2"></i>
                    내 프로필 보기
                  </div>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}