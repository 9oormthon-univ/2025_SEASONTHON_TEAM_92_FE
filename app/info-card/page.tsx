'use client';

import InfoCard from '@/components/InfoCard';

export default function InfoCardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">상황별 맞춤 정보 카드</h1>
          <p className="text-gray-600 mb-2">현재 겪고 있는 상황에 맞는 종합 정보를 한 번에 확인하세요</p>
          <p className="text-sm text-gray-500">• 상황별 추천 정책</p>
          <p className="text-sm text-gray-500">• 관련 법령 조항</p>
          <p className="text-sm text-gray-500">• 해결 기관 및 행동 가이드</p>
        </div>
        
        <InfoCard />
      </div>
    </div>
  );
}