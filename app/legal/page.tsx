'use client';

import RentalLaw from '@/components/RentalLaw';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">임대차 관련 법령</h1>
          <p className="text-gray-600 mb-2">임대차 관련 법령과 조항을 상황별로 검색하세요</p>
          <p className="text-sm text-gray-500">• 상황별 법령 조항 조회</p>
          <p className="text-sm text-gray-500">• 카테고리별 법령 검색</p>
          <p className="text-sm text-gray-500">• 키워드 기반 법령 검색</p>
        </div>
        
        <RentalLaw />
      </div>
    </div>
  );
}