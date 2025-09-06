
'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function WeeklyMissionResultsPage() {
  const [activeComparison, setActiveComparison] = useState('building');

  // Mock mission results data
  const results = {
    mission: {
      theme: '방음 상태 점검',
      week: '2024년 1주차',
      completedAt: '2024.01.15',
      participants: { building: 18, neighborhood: 87 }
    },
    comparison: {
      building: {
        title: '우리 건물',
        myScore: 68,
        average: 72,
        totalResponses: 18,
        insights: [
          '우리 건물은 평균보다 방음이 4점 낮습니다',
          '18세대 중 12세대가 층간소음을 경험했습니다',
          '주로 저녁 시간대(18-22시) 소음이 많이 발생합니다'
        ],
        chart: {
          categories: ['전혀 안들림', '거의 안들림', '가끔 들림', '자주 들림', '항상 들림'],
          myData: [0, 1, 0, 1, 0], // 사용자 응답 (가끔 들림)
          avgData: [2, 4, 8, 3, 1] // 건물 평균 분포
        }
      },
      neighborhood: {
        title: '우리 동네',
        myScore: 68,
        average: 75,
        totalResponses: 87,
        insights: [
          '우리 동네는 평균보다 방음이 7점 낮습니다',
          '87세대 중 45세대가 층간소음을 경험했습니다',
          '아파트 단지들이 빌라보다 방음이 우수합니다'
        ],
        chart: {
          categories: ['전혀 안들림', '거의 안들림', '가끔 들림', '자주 들림', '항상 들림'],
          myData: [0, 1, 0, 1, 0],
          avgData: [8, 18, 32, 22, 7]
        }
      }
    }
  };

  const currentData = results.comparison[activeComparison as keyof typeof results.comparison];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-bold text-gray-800 cursor-pointer mb-2 font-['Pacifico']">월세 공동협약</h1>
          </Link>
          <div className="w-16 h-1 bg-gray-700 mx-auto mb-6"></div>
          <div className="inline-flex items-center bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            <i className="ri-check-circle-fill mr-2"></i>
            미션 완료!
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{results.mission.theme} 결과</h2>
          <p className="text-gray-600">{results.mission.week} • {results.mission.completedAt}</p>
        </div>

        {/* 탭 선택 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveComparison('building')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors cursor-pointer ${
                activeComparison === 'building'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center">
                <i className="ri-building-line mr-2"></i>
                우리 건물 비교
              </div>
              <div className="text-xs mt-1 opacity-80">
                {results.mission.participants.building}세대 참여
              </div>
            </button>
            <button
              onClick={() => setActiveComparison('neighborhood')}
              className={`flex-1 px-6 py-4 text-center font-semibold transition-colors cursor-pointer ${
                activeComparison === 'neighborhood'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center">
                <i className="ri-community-line mr-2"></i>
                우리 동네 비교
              </div>
              <div className="text-xs mt-1 opacity-80">
                {results.mission.participants.neighborhood}세대 참여
              </div>
            </button>
          </div>

          <div className="p-8">
            {/* 점수 비교 */}
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{currentData.title} 방음 점수 비교</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{currentData.myScore}점</div>
                  <div className="text-sm font-medium text-blue-800 mb-2">내 점수</div>
                  <div className="text-xs text-blue-600">가끔 들림 수준</div>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-3xl font-bold text-gray-600 mb-2">{currentData.average}점</div>
                  <div className="text-sm font-medium text-gray-800 mb-2">{currentData.title} 평균</div>
                  <div className="text-xs text-gray-600">
                    {currentData.myScore > currentData.average ? '평균보다 좋음' : 
                     currentData.myScore < currentData.average ? '평균보다 낮음' : '평균과 같음'}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-center text-yellow-800">
                  <i className="ri-lightbulb-line mr-2"></i>
                  <span className="font-medium">
                    {currentData.title}보다 {Math.abs(currentData.myScore - currentData.average)}점 
                    {currentData.myScore > currentData.average ? ' 높습니다!' : ' 낮습니다'}
                  </span>
                </div>
              </div>
            </div>

            {/* 상세 분석 */}
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-gray-900">📊 상세 분석</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 응답 분포 차트 */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h5 className="font-semibold text-gray-800 mb-4">응답 분포</h5>
                  <div className="space-y-3">
                    {currentData.chart.categories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{category}</span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${(currentData.chart.avgData[index] / currentData.totalResponses) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 w-8">
                            {currentData.chart.avgData[index]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 주요 인사이트 */}
                <div className="space-y-3">
                  {currentData.insights.map((insight, index) => (
                    <div key={index} className="flex items-start p-3 bg-white rounded-lg border border-gray-200">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <i className="ri-information-line text-sm text-green-600"></i>
                      </div>
                      <p className="text-sm text-gray-700">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 다음 미션 안내 */}
            <div className="mt-8 p-6 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-lg mb-2">다음 주 미션 예고</h4>
                  <p className="text-emerald-100 text-sm">수압 및 온수 상태 점검</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">+5점</div>
                  <div className="text-xs text-emerald-100">참여 보너스</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA 버튼 - 메인으로 돌아가기만 */}
        <div className="text-center">
          <Link href="/">
            <button className="bg-green-600 text-white px-12 py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap">
              <div className="flex items-center justify-center">
                <i className="ri-home-line text-xl mr-2"></i>
                메인으로 돌아가기
              </div>
            </button>
          </Link>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            매주 미션에 참여하여 더 정확한 이웃 비교 데이터를 받아보세요!
          </p>
        </div>
      </div>
    </div>
  );
}
