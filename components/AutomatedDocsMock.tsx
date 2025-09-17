'use client';

export default function AutomatedDocsMock() {
  return (
    <section className="print-break bg-gray-50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold text-gray-900">전자문서 자동 작성</h2>
        <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">Premium</span>
      </div>
      <p className="text-gray-600 mb-6">리포트 데이터를 기반으로 필요한 법률 문서를 자동으로 생성합니다.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-lg mb-2">수선 요구서 (내용증명)</h3>
          <p className="text-sm text-gray-500 mb-4">누수, 곰팡이 등 집에 문제가 발생했을 때, 집주인에게 공식적으로 수리를 요청하는 문서를 생성합니다.</p>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">PDF 생성하기</button>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-lg mb-2">임대차 계약 조건 조정 요청서</h3>
          <p className="text-sm text-gray-500 mb-4">월세, 관리비 등 계약 조건이 부당하다고 판단될 때, 조정을 요청하는 공식 문서를 생성합니다.</p>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">PDF 생성하기</button>
        </div>
      </div>

      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.636-1.21 2.37-1.21 3.006 0l4.5 8.625c.636 1.21-.24 2.776-1.503 2.776H5.254c-1.263 0-2.14-1.566-1.503-2.776l4.5-8.625zM10 12a1 1 0 110-2 1 1 0 010 2zm0-5a1 1 0 011 1v2a1 1 0 11-2 0V8a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              내용증명 우편 발송 대행 서비스는 추가 결제가 필요합니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
