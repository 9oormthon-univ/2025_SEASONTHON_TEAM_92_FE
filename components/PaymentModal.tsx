'use client';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  price: number;
  itemName: string;
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  price,
  itemName
}: PaymentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">결제하기</h2>
          <p className="text-gray-600 mb-6">아래 서비스에 대한 결제를 진행합니다.</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <span className="text-gray-700 font-medium">서비스 항목</span>
            <span className="text-gray-900 font-bold">{itemName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg text-gray-700 font-medium">최종 결제 금액</span>
            <span className="text-2xl text-blue-600 font-bold">{price.toLocaleString()}원</span>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={onConfirm}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
          >
            {price.toLocaleString()}원 결제하기
          </button>
          <button
            onClick={onClose}
            className="w-full bg-transparent text-gray-600 py-3 px-4 rounded-lg hover:bg-gray-100 font-medium transition-colors"
          >
            취소
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-4">* 실제 결제가 이루어지지 않는 목업 화면입니다.</p>
      </div>
    </div>
  );
}
