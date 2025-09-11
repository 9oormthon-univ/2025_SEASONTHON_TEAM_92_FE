'use client';

import DisputeAgency from '@/components/DisputeAgency';

export default function DisputePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">분쟁 해결 기관</h1>
          <p className="text-gray-600 mb-2">임대차 관련 분쟁 해결을 위한 전문 기관 정보</p>
          <p className="text-sm text-gray-500">• 지역별 분쟁 해결 기관</p>
          <p className="text-sm text-gray-500">• 분쟁 유형별 추천 기관</p>
          <p className="text-sm text-gray-500">• 연락처 및 서비스 안내</p>
        </div>
        
        <DisputeAgency />
      </div>
    </div>
  );
}