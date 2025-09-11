'use client';

import OfficetelData from '@/components/OfficetelData';

export default function OfficetelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">공공 데이터 조회</h1>
          <p className="text-gray-600 mb-2">국토부 실거래가 데이터를 기반으로 한 객관적 시세 정보</p>
          <p className="text-sm text-gray-500">• 오피스텔 거래내역 조회</p>
          <p className="text-sm text-gray-500">• 전세/월세 시세 분석</p>
          <p className="text-sm text-gray-500">• 지역별 시세 비교</p>
        </div>
        
        <OfficetelData />
      </div>
    </div>
  );
}