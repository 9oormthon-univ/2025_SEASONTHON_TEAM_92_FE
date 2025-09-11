
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { locationApi } from '../../../lib/api';
import toast from 'react-hot-toast';

interface LocationData {
  district: string;
  latitude: number | null;
  longitude: number | null;
}

const extractDistrict = (fullAddress: string): string => {
    const addressParts = fullAddress.split(' ');
    if (addressParts.length >= 2) {
        // 시/도 다음 구/군, 그 다음 동/읍/면을 찾는 로직
        let district = '';
        for (let i = 1; i < addressParts.length; i++) {
            const part = addressParts[i];
            if (part.endsWith('구') || part.endsWith('군')) {
                district += part + ' ';
            } else if (part.endsWith('동') || part.endsWith('읍') || part.endsWith('면')) {
                district += part;
                return district.trim();
            }
        }
    }
    return fullAddress; // 패턴을 못찾으면 전체 주소 반환
};

export default function LocationVerificationPage() {
  const router = useRouter();
  const [location, setLocation] = useState<LocationData>({ district: '', latitude: null, longitude: null });
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState('');

  const handleGetLocation = async () => {
    setIsGettingLocation(true);
    setError('');

    if (!navigator.geolocation) {
      setError('위치 서비스가 지원되지 않는 브라우저입니다.');
      toast.error('위치 서비스가 지원되지 않는 브라우저입니다.');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const loadingToast = toast.loading('현재 위치를 주소로 변환 중입니다...');

        try {
          const response = await locationApi.getAddressPreview(latitude, longitude);
          toast.dismiss(loadingToast);

          // 실제 응답 구조인 response.data.address를 사용하도록 수정
          if (response && response.data && response.data.address) {
            const fullAddress = response.data.address;
            const district = extractDistrict(fullAddress);
            setLocation({ district: district, latitude, longitude });
            toast.success(`현재 위치: ${district}`);
          } else {
            throw new Error(response?.message || '주소 조회에 실패했습니다.');
          }
        } catch (err: any) {
          toast.dismiss(loadingToast);
          const errorMessage = err.response?.data?.message || '위치 정보를 주소로 변환하는데 실패했습니다.';
          setError(errorMessage);
          toast.error(errorMessage);
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setError('위치 권한이 거부되었습니다. 설정에서 위치 권한을 허용해주세요.');
        toast.error('위치 권한이 거부되었습니다.');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!location.district || location.latitude === null || location.longitude === null) {
      setError('먼저 GPS로 우리 동네를 인증해주세요.');
      toast.error('먼저 GPS로 우리 동네를 인증해주세요.');
      return;
    }

    setIsLoading(true);
    
    // 다음 페이지로 위치 정보를 쿼리 파라미터로 넘겨줍니다.
    const query = new URLSearchParams({
        dong: location.district,
        lat: location.latitude.toString(),
        lon: location.longitude.toString(),
    }).toString();

    router.push(`/onboarding/profile?${query}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <Link href="/">
            <h1 className="text-3xl font-bold text-gray-800 cursor-pointer mb-2">월세의 정석</h1>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="district" className="block text-sm font-semibold text-gray-700 mb-2">
                인증된 동네
              </label>
              <input
                id="district"
                name="district"
                type="text"
                required
                readOnly
                className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm bg-gray-100 cursor-not-allowed"
                placeholder="GPS 인증 버튼을 눌러주세요"
                value={location.district}
              />
              <p className="mt-2 text-xs text-gray-500">
                GPS 인증이 완료되면 다음 단계로 진행할 수 있습니다.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || !location.district}
                className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-sm font-semibold rounded-xl text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    이동 중...
                  </div>
                ) : (
                  '프로필 설정 계속하기'
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
