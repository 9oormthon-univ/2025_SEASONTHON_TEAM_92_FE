
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LocationVerificationPage() {
  const router = useRouter();
  const [location, setLocation] = useState({
    district: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'none' | 'success' | 'error'>('none');
  const [error, setError] = useState('');

  const handleGetLocation = async () => {
    setIsGettingLocation(true);
    setError('');

    if (!navigator.geolocation) {
      setError('위치 서비스가 지원되지 않는 브라우저입니다.');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Simulate reverse geocoding
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          setLocation({
            district: '강남구 역삼동'
          });
          setLocationStatus('success');
        } catch (err) {
          setLocationStatus('error');
          setError('위치 정보를 가져올 수 없습니다. 수동으로 입력해주세요.');
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setLocationStatus('error');
        setError('위치 권한이 거부되었습니다. 수동으로 입력하거나 설정에서 위치 권한을 허용해주세요.');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!location.district) {
      setError('거주 동네를 입력해주세요.');
      setIsLoading(false);
      return;
    }

    try {
      // Simulate location verification API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to profile setup
      router.push('/onboarding/profile');
    } catch (err) {
      setError('위치 인증 중 오류가 발생했습니다.');
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
            우리 동네 인증
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            실제 거주자만 참여할 수 있도록 동(洞) 단위로 위치를 인증합니다
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="mb-8">
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isGettingLocation}
              className="w-full flex items-center justify-center px-6 py-4 border-2 border-dashed border-gray-300 text-gray-700 font-medium rounded-xl hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer transition-all duration-200"
            >
              <div className="w-6 h-6 flex items-center justify-center mr-3">
                <i className="ri-map-pin-line text-xl text-gray-500"></i>
              </div>
              {isGettingLocation ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  위치 가져오는 중...
                </div>
              ) : (
                'GPS로 우리 동네 자동 인증'
              )}
            </button>
          </div>

          {locationStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
              <div className="flex items-center">
                <div className="w-5 h-5 flex items-center justify-center mr-3">
                  <i className="ri-check-circle-fill text-green-600"></i>
                </div>
                <span className="text-green-700 font-medium text-sm">동네 인증이 완료되었습니다!</span>
              </div>
            </div>
          )}

          {locationStatus === 'error' && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
              <div className="flex items-start">
                <div className="w-5 h-5 flex items-center justify-center mr-3 mt-0.5">
                  <i className="ri-error-warning-fill text-yellow-600"></i>
                </div>
                <div className="text-yellow-700">
                  <p className="font-medium mb-1 text-sm">자동 인증에 실패했습니다</p>
                  <p className="text-xs">아래에서 수동으로 입력해주세요</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="district" className="block text-sm font-semibold text-gray-700 mb-2">
                거주 동네 인증
              </label>
              <div>
                <label htmlFor="district" className="block text-xs text-gray-500 mb-1">
                  구/군 + 동(洞) 단위 *
                </label>
                <input
                  id="district"
                  name="district"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors duration-200"
                  placeholder="예: 마포구 망원동"
                  value={location.district}
                  onChange={(e) => setLocation({district: e.target.value})}
                />
                <p className="mt-2 text-xs text-gray-500">
                  동(洞) 단위까지만 입력하시면 됩니다. 상세 주소는 다음 단계에서 입력합니다.
                </p>
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
                disabled={isLoading}
                className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-sm font-semibold rounded-xl text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    인증 처리 중...
                  </div>
                ) : (
                  '동네 인증 완료'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-start text-xs text-gray-500">
              <div className="w-4 h-4 flex items-center justify-center mr-2 mt-0.5">
                <i className="ri-shield-check-line"></i>
              </div>
              <div>
                <p className="font-medium mb-1">실거주자 데이터 신뢰성</p>
                <p>동 단위 인증으로 실제 거주자만의 정확한 데이터를 수집하여 신뢰할 수 있는 분석 결과를 제공합니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
