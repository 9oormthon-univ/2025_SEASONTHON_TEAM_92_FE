'use client';

import PolicyInfo from '@/components/PolicyInfo';

export default function PolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">맞춤형 정책 정보</h1>
          <p className="text-gray-600 mb-2">당신의 상황에 맞는 정책과 지원사업을 찾아보세요</p>
          <p className="text-sm text-gray-500">• 청년 주거 지원 정책</p>
          <p className="text-sm text-gray-500">• 지역별 맞춤 지원사업</p>
          <p className="text-sm text-gray-500">• 신청 조건 및 방법 안내</p>
        </div>
        
        <PolicyInfo />
      </div>
    </div>
  );
}