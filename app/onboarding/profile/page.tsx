
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfileSetupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    address: '',
    buildingName: '',
    buildingType: '',
    contractType: 'monthly',
    deposit: '',
    monthlyRent: '',
    maintenanceFee: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const buildingTypes = [
    { value: 'apartment', label: '아파트' },
    { value: 'officetel', label: '오피스텔' },
    { value: 'villa', label: '빌라/연립' }
  ];

  const formatNumber = (value: string) => {
    const number = value.replace(/[^0-9]/g, '');
    if (!number) return '';
    return parseInt(number).toLocaleString();
  };

  const handleNumberChange = (field: string, value: string) => {
    const formatted = formatNumber(value);
    setFormData({...formData, [field]: formatted});
  };

  const isFormValid = () => {
    return formData.address && 
           formData.buildingName &&
           formData.buildingType && 
           formData.deposit && 
           formData.monthlyRent;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      setError('모든 필수 필드를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Complete registration process
      const tempEmail = localStorage.getItem('temp_userEmail');
      const tempNickname = localStorage.getItem('temp_userNickname');
      const tempRole = localStorage.getItem('temp_userRole');
      
      if (tempEmail && tempNickname) {
        // Set user as logged in
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', tempEmail);
        localStorage.setItem('userNickname', tempNickname);
        localStorage.setItem('userRole', tempRole || 'tenant');
        
        // Clear temporary data
        localStorage.removeItem('temp_userEmail');
        localStorage.removeItem('temp_userNickname');
        localStorage.removeItem('temp_userRole');
        
        // Set onboarding completed flag to show diagnosis prompt
        localStorage.setItem('onboarding_completed', 'true');
      }
      
      // Redirect to main page
      router.push('/');
    } catch (err) {
      setError('프로필 설정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <Link href="/">
            <h1 className="text-3xl font-bold text-gray-800 cursor-pointer mb-2">월세 공동협약</h1>
          </Link>
          <div className="w-16 h-1 bg-gray-700 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            거주 프로필 입력
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            정확한 분석을 위한 거주 정보를 입력해주세요
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 거주지 주소 섹션 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                거주지 주소
              </label>
              <div className="space-y-3">
                <div>
                  <label htmlFor="district" className="block text-xs text-gray-500 mb-1">
                    구/동 (자동 입력됨)
                  </label>
                  <input
                    id="district"
                    name="district"
                    type="text"
                    disabled
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-500 rounded-lg bg-gray-100 text-sm"
                    value="강남구 역삼동"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-xs text-gray-500 mb-1">
                    세부 주소 *
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    required
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors duration-200"
                    placeholder="예: 역삼로 123"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>

                <div>
                  <label htmlFor="buildingName" className="block text-xs text-gray-500 mb-1">
                    건물명 *
                  </label>
                  <input
                    id="buildingName"
                    name="buildingName"
                    type="text"
                    required
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors duration-200"
                    placeholder="예: 역삼타워"
                    value={formData.buildingName}
                    onChange={(e) => setFormData({...formData, buildingName: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* 건물 유형 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                건물 유형 *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {buildingTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({...formData, buildingType: type.value})}
                    className={`px-3 py-3 text-sm font-medium rounded-lg border-2 transition-colors whitespace-nowrap cursor-pointer ${
                      formData.buildingType === type.value
                        ? 'border-gray-500 bg-gray-50 text-gray-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 계약 조건 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                계약 조건
              </label>
              <div className="space-y-4">
                <div>
                  <label htmlFor="deposit" className="block text-xs text-gray-500 mb-1">
                    보증금 *
                  </label>
                  <div className="relative">
                    <input
                      id="deposit"
                      name="deposit"
                      type="text"
                      required
                      className="appearance-none relative block w-full px-4 py-3 pr-12 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors duration-200"
                      placeholder="0"
                      value={formData.deposit}
                      onChange={(e) => handleNumberChange('deposit', e.target.value)}
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      만원
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="monthlyRent" className="block text-xs text-gray-500 mb-1">
                    월세 *
                  </label>
                  <div className="relative">
                    <input
                      id="monthlyRent"
                      name="monthlyRent"
                      type="text"
                      required
                      className="appearance-none relative block w-full px-4 py-3 pr-12 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors duration-200"
                      placeholder="0"
                      value={formData.monthlyRent}
                      onChange={(e) => handleNumberChange('monthlyRent', e.target.value)}
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      만원
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="maintenanceFee" className="block text-xs text-gray-500 mb-1">
                    관리비 (선택)
                  </label>
                  <div className="relative">
                    <input
                      id="maintenanceFee"
                      name="maintenanceFee"
                      type="text"
                      className="appearance-none relative block w-full px-4 py-3 pr-12 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors duration-200"
                      placeholder="0"
                      value={formData.maintenanceFee}
                      onChange={(e) => handleNumberChange('maintenanceFee', e.target.value)}
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      만원
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || !isFormValid()}
                className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-sm font-semibold rounded-xl text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    저장 중...
                  </div>
                ) : (
                  '프로필 저장 완료'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center text-xs text-gray-500">
              <div className="w-4 h-4 flex items-center justify-center mr-2">
                <i className="ri-shield-check-line"></i>
              </div>
              <p>입력된 정보는 분석을 위해서만 사용되며 안전하게 보호됩니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
