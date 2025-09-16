'use client';

interface PlanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBasic: () => void;
  onSelectPremium: () => void;
  isLoading: boolean;
}

export default function PlanSelectionModal({ 
  isOpen, 
  onClose, 
  onSelectBasic, 
  onSelectPremium,
  isLoading
}: PlanSelectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">리포트 플랜 선택</h2>
          <p className="text-gray-600 mt-2">원하는 리포트 종류를 선택해주세요.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 기본 리포트 플랜 */}
          <div 
            className="border-2 border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-all"
            onClick={onSelectBasic}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">기본 리포트</h3>
            <p className="text-2xl font-bold text-gray-800 mb-4">무료</p>
            <ul className="text-sm text-gray-600 space-y-2 text-left">
              <li>✓ 주관적 지표 분석</li>
              <li>✓ 객관적 시세 비교 (일부)</li>
              <li>✓ 기본 협상 카드</li>
            </ul>
            <button className="mt-6 w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700">기본으로 생성</button>
          </div>

          {/* 프리미엄 리포트 플랜 */}
          <div 
            className="border-2 border-blue-600 rounded-lg p-6 text-center cursor-pointer ring-4 ring-blue-200 transition-all"
            onClick={onSelectPremium}
          >
            <h3 className="text-xl font-semibold text-blue-600 mb-4">💎 프리미엄 리포트</h3>
            <p className="text-2xl font-bold text-blue-600 mb-4">5,000원</p>
            <ul className="text-sm text-gray-600 space-y-2 text-left">
              <li>✓ **모든 기본 리포트 기능**</li>
              <li>✓ **심층 시세 분석 (유사 그룹 비교)**</li>
              <li>✓ **전세가율 등 위험도 분석**</li>
              <li>✓ **프리미엄 협상 전략**</li>
              <li>✓ **전자문서 자동작성 (목업)**</li>
            </ul>
            <button className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">프리미엄으로 생성</button>
          </div>
        </div>
        {isLoading && <p className='text-center mt-4 text-sm text-gray-500'>리포트를 생성하고 있습니다...</p>}
      </div>
    </div>
  );
}
