'use client';

export default function ExpertConsultingMock() {
  return (
    <section className="print-break bg-green-50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold text-gray-900">💬 전문가 컨설팅 연결</h2>
        <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">Premium</span>
      </div>
      <p className="text-gray-600 mb-6">리포트 분석 결과, 협상에 어려움이 예상되시나요? 부동산 및 법률 전문가와 직접 상담해보세요.</p>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <img className="h-16 w-16 rounded-full" src="https://i.pravatar.cc/150?u=expert1" alt="김민준 변호사" />
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-lg">김민준 변호사</h3>
            <p className="text-sm text-gray-500">임대차 분쟁 전문</p>
            <div className="text-sm text-yellow-500 mt-1">⭐ 4.9 (28건 상담)</div>
          </div>
          <div className="ml-auto">
            <button className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">상담 예약하기</button>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-gray-500 mt-4">15분 음성/채팅 상담 (1회)은 프리미엄 리포트에 포함되어 있습니다.</p>
    </section>
  );
}
