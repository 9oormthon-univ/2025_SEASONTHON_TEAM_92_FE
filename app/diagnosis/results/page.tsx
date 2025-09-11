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
            <h1 className="text-3xl font-bold text-gray-800 cursor-pointer mb-2 font-['Pacifico']">월세의 정석</h1>
          </Link>
          <div className="w-16 h-1 bg-gray-700 mx-auto mb-6"></div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-check-circle-fill text-4xl text-green-600"></i>
            </div>
            <h2 className="text-3xl font-bold mb-3 text-gray-900">진단 완료! 🎉</h2>
            <p className="text-lg text-gray-600 mb-4">우리 집 거주 환경을 분석했습니다</p>
            
            {diagnosisResult && (
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center justify-center text-blue-800">
                  <i className="ri-bar-chart-line mr-2"></i>
                  <span className="font-medium">
                    {diagnosisResult.participantCount || 0}명의 이웃 데이터와 비교 분석
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
              <h3 className="text-2xl font-bold mb-6 text-gray-900">📊 종합 만족도</h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">
                      {diagnosisResult.overallScore || 0}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">내 점수</h4>
                  <p className="text-sm text-gray-600">종합 만족도</p>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-green-600">
                      {diagnosisResult.buildingAverage || 0}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">건물 평균</h4>
                  <p className="text-sm text-gray-600">같은 건물 이웃들</p>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-orange-600">
                      {diagnosisResult.neighborhoodAverage || 0}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">동네 평균</h4>
                  <p className="text-sm text-gray-600">같은 동네 이웃들</p>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            {diagnosisResult.categories && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <h3 className="text-2xl font-bold mb-6 text-gray-900">📋 카테고리별 분석</h3>
                
                <div className="space-y-4">
                  {Object.entries(diagnosisResult.categories).map(([category, data]: [string, any]) => (
                    <div key={category} className="bg-gray-50 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-gray-900 capitalize">{category}</h4>
                        <div className="text-right">
                          <div className="text-xl font-bold text-blue-600">{data.myScore || 0}</div>
                          <div className="text-sm text-gray-600">내 점수</div>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">건물 평균</span>
                            <span className="font-semibold text-green-600">{data.buildingAvg || 0}</span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">동네 평균</span>
                            <span className="font-semibold text-orange-600">{data.neighborhoodAvg || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-900">💡 개선 제안</h3>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-blue-800 mb-3">시설 개선 우선순위</h4>
                  <p className="text-gray-700">
                    낮은 점수를 받은 항목들을 우선적으로 개선하여 거주 만족도를 높일 수 있습니다.
                  </p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-green-800 mb-3">협상 전략</h4>
                  <p className="text-gray-700">
                    이 데이터를 바탕으로 임대인과의 협상에서 객관적 근거를 제시할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h3 className="text-xl font-bold mb-4 text-gray-900">다음 단계</h3>
            <p className="text-gray-600 mb-6">진단 결과를 바탕으로 다음 단계를 진행해보세요</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGoToDashboard}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="flex items-center justify-center">
                  <i className="ri-file-text-line mr-2"></i>
                  협상 리포트 생성하기
                </div>
              </button>
              
              <button
                onClick={handleGoToWeeklyMission}
                className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="flex items-center justify-center">
                  <i className="ri-task-line mr-2"></i>
                  주간 미션 참여하기
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}