'use client';

import { useState } from 'react';

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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // 시연용 결제 처리 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    onConfirm();
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">결제하기</h2>
          <p className="text-gray-600">안전한 결제를 진행해주세요</p>
        </div>

        {/* 결제 정보 요약 */}
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-6 mb-6 border border-purple-200">
          <div className="flex justify-between items-center border-b border-purple-200 pb-3 mb-3">
            <span className="text-gray-700 font-medium">서비스</span>
            <span className="text-gray-900 font-bold">{itemName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg text-gray-700 font-medium">결제 금액</span>
            <span className="text-3xl text-purple-600 font-bold">{price.toLocaleString()}원</span>
          </div>
        </div>

        {/* 결제 수단 선택 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">결제 수단</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedPaymentMethod('card')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedPaymentMethod === 'card'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center justify-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                신용카드
              </div>
            </button>
            <button
              onClick={() => setSelectedPaymentMethod('bank')}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedPaymentMethod === 'bank'
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center justify-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                계좌이체
              </div>
            </button>
          </div>
        </div>

        {/* 카드 정보 입력 */}
        {selectedPaymentMethod === 'card' && (
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800">카드 정보</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">카드 번호</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">만료일</label>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                  placeholder="123"
                  maxLength={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">카드 소유자명</label>
              <input
                type="text"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="홍길동"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
        )}

        {/* 계좌이체 정보 */}
        {selectedPaymentMethod === 'bank' && (
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800">계좌 정보</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 space-y-2">
                <div>은행: 국민은행</div>
                <div>계좌번호: 123456-78-901234</div>
                <div>예금주: (주)월세의정석</div>
                <div className="text-red-600 font-medium">※ 계좌이체는 별도 안내를 따릅니다</div>
              </div>
            </div>
          </div>
        )}

        {/* 결제 버튼 */}
        <div className="space-y-3">
          <button
            onClick={handlePayment}
            disabled={isProcessing || (selectedPaymentMethod === 'card' && (!cardNumber || !expiryDate || !cvv || !cardholderName))}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-4 px-6 rounded-lg hover:from-purple-700 hover:to-violet-700 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                결제 처리 중...
              </>
            ) : (
              `${price.toLocaleString()}원 결제하기`
            )}
          </button>
          
          <button
            onClick={onClose}
            className="w-full bg-transparent text-gray-600 py-3 px-4 rounded-lg hover:bg-gray-100 font-medium transition-colors"
          >
            취소
          </button>
        </div>

        {/* 시연용 안내 */}
        <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-purple-800 font-medium">시연용 결제 화면입니다</span>
          </div>
          <p className="text-xs text-purple-700 mt-1">실제 결제가 이루어지지 않으며, 모든 정보는 시연 목적으로만 사용됩니다.</p>
        </div>
      </div>
    </div>
  );
}
