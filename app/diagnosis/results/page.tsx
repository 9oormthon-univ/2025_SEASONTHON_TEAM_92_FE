
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DiagnosisResultsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overall');

  // Mock data - 실제로는 API에서 가져올 데이터
  const results = {
    overall: {
      myScore: 73,
      buildingAverage: 68,
      neighborhoodAverage: 71,
      rank: { 
        building: 8, 
        total: 42, 
        neighborhood: 156, 
        totalNeighborhood: 320 
      }
    },
    categories: [
      { name: '소음', myScore: 68, buildingAvg: 65, neighborhoodAvg: 70, icon: 'ri-volume-down-line' },
      { name: '수압', myScore: 85, buildingAvg: 80, neighborhoodAvg: 78, icon: 'ri-drop-line' },
      { name: '채광', myScore: 90, buildingAvg: 75, neighborhoodAvg: 82, icon: 'ri-sun-line' },
      { name: '주차', myScore: 45, buildingAvg: 50, neighborhoodAvg: 55, icon: 'ri-parking-line' },
      { name: '난방', myScore: 78, buildingAvg: 72, neighborhoodAvg: 75, icon: 'ri-fire-line' },
      { name: '환기', myScore: 82, buildingAvg: 70, neighborhoodAvg: 73, icon: 'ri-windy-line' },
      { name: '보안', myScore: 75, buildingAvg: 85, neighborhoodAvg: 80, icon: 'ri-shield-line' },
      { name: '관리', myScore: 65, buildingAvg: 60, neighborhoodAvg: 68, icon: 'ri-tools-line' },
      { name: '편의성', myScore: 88, buildingAvg: 82, neighborhoodAvg: 85, icon: 'ri-store-line' },
      { name: '인터넷', myScore: 95, buildingAvg: 88, neighborhoodAvg: 90, icon: 'ri-wifi-line' }
    ]
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return '우수';
    if (score >= 60) return '보통';
    return '개선필요';
  };

  const handleWeeklyMission = () => {
    router.push('/');
  };

  // 안전한 데이터 접근을 위한 체크
  const rankData = results?.overall?.rank || {
    building: 0,
    total: 0,
    neighborhood: 0,
    totalNeighborhood: 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-bold text-gray-800 cursor-pointer mb-2 font-['Pacifico']">월세 공동협약</h1>
          </Link>
          <div className="w-16 h-1 bg-gray-700 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">우리 집 진단 결과</h2>
          <p className="text-gray-600">이웃들과 비교한 결과입니다</p>
        </div>

        {/* 종합 점수 카드 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
              <span className="text-3xl font-bold text-white">{results.overall.myScore}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">종합 점수</h3>
            <p className={`text-lg font-semibold ${getScoreColor(results.overall.myScore)}`}>
              {getScoreLabel(results.overall.myScore)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <h4 className="text-sm font-semibold text-gray-600 mb-2">우리 건물 평균</h4>
              <div className="text-2xl font-bold text-gray-800 mb-2">{results.overall.buildingAverage}점</div>
              <p className="text-sm text-gray-500">
                {results.overall.myScore > results.overall.buildingAverage ? '+' : ''}
                {results.overall.myScore - results.overall.buildingAverage}점 차이
              </p>
              <div className="mt-3 text-xs text-gray-500">
                건물 내 {rankData.building}위 / {rankData.total}세대
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 text-center">
              <h4 className="text-sm font-semibold text-blue-600 mb-2">우리 동네 평균</h4>
              <div className="text-2xl font-bold text-blue-800 mb-2">{results.overall.neighborhoodAverage}점</div>
              <p className="text-sm text-blue-600">
                {results.overall.myScore > results.overall.neighborhoodAverage ? '+' : ''}
                {results.overall.myScore - results.overall.neighborhoodAverage}점 차이
              </p>
              <div className="mt-3 text-xs text-blue-500">
                동네 {rankData.neighborhood}위 / {rankData.totalNeighborhood}세대
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-6 text-center">
              <h4 className="text-sm font-semibold text-green-600 mb-2">개선 포인트</h4>
              <div className="text-lg font-bold text-green-800 mb-2">주차</div>
              <p className="text-sm text-green-600">가장 낮은 점수</p>
              <div className="mt-3 text-xs text-green-500">
                이웃들보다 -10점 낮음
              </div>
            </div>
          </div>
        </div>

        {/* 카테고리별 상세 결과 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
            <h3 className="text-xl font-bold text-white">카테고리별 상세 분석</h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.categories.map((category, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <i className={`${category.icon} text-lg text-gray-600`}></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{category.name}</h4>
                      <p className={`text-sm font-medium ${getScoreColor(category.myScore)}`}>
                        {category.myScore}점 ({getScoreLabel(category.myScore)})
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">내 점수</span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${category.myScore}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{category.myScore}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">건물 평균</span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-gray-400 h-2 rounded-full" 
                            style={{ width: `${category.buildingAvg}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{category.buildingAvg}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">동네 평균</span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-gray-300 h-2 rounded-full" 
                            style={{ width: `${category.neighborhoodAvg}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{category.neighborhoodAvg}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA 버튼들 */}
        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/dashboard">
              <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all cursor-pointer whitespace-nowrap">
                <div className="flex items-center justify-center">
                  <i className="ri-file-text-line text-xl mr-2"></i>
                  협상 리포트 생성하기
                </div>
              </button>
            </Link>
            
            <button
              onClick={handleWeeklyMission}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
            >
              <div className="flex items-center justify-center">
                <i className="ri-home-line text-xl mr-2"></i>
                메인으로 돌아가기
              </div>
            </button>
          </div>
        </div>

        {/* 추가 인사이트 섹션 */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">🏠 우리 집 진단 상세 분석</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* 강점 분야 */}
            <div className="bg-green-50 rounded-xl p-5">
              <div className="flex items-center mb-3">
                <i className="ri-thumb-up-line text-green-600 text-xl mr-2"></i>
                <h4 className="font-semibold text-green-800">우수한 항목</h4>
              </div>
              <div className="space-y-2">
                {results.categories
                  .filter(cat => cat.myScore >= 80)
                  .sort((a, b) => b.myScore - a.myScore)
                  .slice(0, 3)
                  .map((cat, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-green-700 text-sm">{cat.name}</span>
                      <span className="font-semibold text-green-800">{cat.myScore}점</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* 개선 필요 분야 */}
            <div className="bg-orange-50 rounded-xl p-5">
              <div className="flex items-center mb-3">
                <i className="ri-tools-line text-orange-600 text-xl mr-2"></i>
                <h4 className="font-semibold text-orange-800">개선 가능한 항목</h4>
              </div>
              <div className="space-y-2">
                {results.categories
                  .filter(cat => cat.myScore < 70)
                  .sort((a, b) => a.myScore - b.myScore)
                  .slice(0, 3)
                  .map((cat, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-orange-700 text-sm">{cat.name}</span>
                      <span className="font-semibold text-orange-800">{cat.myScore}점</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* 이웃 비교 요약 */}
          <div className="bg-blue-50 rounded-xl p-5">
            <div className="flex items-center mb-4">
              <i className="ri-community-line text-blue-600 text-xl mr-2"></i>
              <h4 className="font-semibold text-blue-800">이웃들과의 비교</h4>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-700">{rankData.building}</div>
                <div className="text-xs text-blue-600">건물 내 순위</div>
                <div className="text-xs text-gray-500">총 {rankData.total}세대</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-700">{rankData.neighborhood}</div>
                <div className="text-xs text-blue-600">동네 순위</div>
                <div className="text-xs text-gray-500">총 {rankData.totalNeighborhood}세대</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {results.categories.filter(cat => cat.myScore > cat.buildingAvg).length}
                </div>
                <div className="text-xs text-green-600">건물보다 우수</div>
                <div className="text-xs text-gray-500">10개 항목 중</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {results.categories.filter(cat => cat.myScore > cat.neighborhoodAvg).length}
                </div>
                <div className="text-xs text-green-600">동네보다 우수</div>
                <div className="text-xs text-gray-500">10개 항목 중</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            분석 결과는 참여자들의 평가를 바탕으로 하며, 더 많은 데이터가 쌓일수록 정확해집니다.
          </p>
        </div>
      </div>
    </div>
  );
}