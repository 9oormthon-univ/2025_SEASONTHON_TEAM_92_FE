'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { locationApi } from '../../../lib/api';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface LocationData {
  district: string;
  latitude: number | null;
  longitude: number | null;
}

interface FormData {
    buildingName: string;
}

const extractDistrict = (fullAddress: string): string => {
    const addressParts = fullAddress.split(' ');
    let district = '';
    for (const part of addressParts) {
        if (part.endsWith('시') || part.endsWith('도') || part.endsWith('특별시') || part.endsWith('광역시')) {
            district += part + ' ';
            break;
        }
    }
    for (const part of addressParts) {
        if (part.endsWith('구') || part.endsWith('군')) {
            district += part + ' ';
            break;
        }
    }
    for (const part of addressParts) {
        if (part.endsWith('동') || part.endsWith('읍') || part.endsWith('면')) {
            district += part;
            break;
        }
    }
    return district.trim() || fullAddress;
};

export default function LocationVerificationPage() {
  const router = useRouter();
  const [location, setLocation] = useState<LocationData>({ district: '', latitude: null, longitude: null });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const handleGetLocation = async () => {
    setIsLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('위치 서비스가 지원되지 않는 브라우저입니다.');
      toast.error('위치 서비스가 지원되지 않는 브라우저입니다.');
      setIsLoading(false);
      return;
    }

    const loadingToast = toast.loading('현재 위치를 주소로 변환 중입니다...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await locationApi.getAddressPreview(latitude, longitude);
          toast.dismiss(loadingToast);
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
          const errorMessage = err.response?.data?.message || err.message || '주소 조회에 실패했습니다. 다시 시도해주세요.';
          setError(errorMessage);
          toast.error(errorMessage);
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        toast.dismiss(loadingToast);
        setError('위치 권한이 거부되었습니다. 설정에서 위치 권한을 허용해주세요.');
        toast.error('위치 권한이 거부되었습니다.');
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const onSubmit = async (data: FormData) => {
    setError('');

    if (location.latitude === null || location.longitude === null) {
      toast.error('먼저 GPS 위치를 가져와주세요.');
      return;
    }

    setIsLoading(true);
    try {
        const payload = {
            latitude: location.latitude,
            longitude: location.longitude,
            buildingName: data.buildingName
        };
        
        const response = await locationApi.verifyLocation(payload);

        if (response.success && response.data) {
            toast.success(`${response.data.neighborhood} 인증 완료!`);
            
            const query = new URLSearchParams({
                dong: response.data.neighborhood,
                lat: location.latitude.toString(),
                lon: location.longitude.toString(),
                buildingName: data.buildingName,
            }).toString();

            router.push(`/onboarding/profile?${query}`);
        } else {
            throw new Error(response.message || '위치 인증에 실패했습니다.');
        }
    } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || '인증 중 오류가 발생했습니다.';
        setError(errorMessage);
        toast.error(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          {/* Navigation can be added here if needed */}
          <Link href="/">
            <h1 className="text-4xl font-bold text-gray-800 cursor-pointer mb-2">월세의 정석</h1>
          </Link>
          <div className="w-16 h-1 bg-gray-700 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            우리 동네 인증
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            실제 거주자만 참여할 수 있도록 행정구 단위로 위치를 인증합니다
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="mb-8">
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-6 py-4 border-2 border-dashed border-gray-300 text-gray-700 font-medium rounded-xl hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer transition-all duration-200"
            >
              <i className="ri-map-pin-line text-xl text-gray-500 mr-3"></i>
              {isLoading && !location.district ? '위치 가져오는 중...' : 'GPS로 우리 동네 자동 인증'}
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="district" className="block text-sm font-semibold text-gray-700 mb-2">
                인증된 동네
              </label>
              <input
                id="district"
                type="text"
                readOnly
                className="appearance-none block w-full px-4 py-3 border border-gray-200 text-gray-500 rounded-lg bg-gray-100 text-sm cursor-not-allowed"
                placeholder="GPS 인증 버튼을 눌러주세요"
                value={location.district}
              />
            </div>

            <div>
              <label htmlFor="buildingName" className="block text-sm font-semibold text-gray-700 mb-2">
                거주 건물명
              </label>
              <input 
                  {...register('buildingName', { required: '거주 중인 건물명을 입력해주세요.' })}
                  type="text"
                  placeholder="예: 역삼타워, 행복아파트"
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm bg-gray-50 focus:bg-white transition-colors duration-200"
              />
              {errors.buildingName && <p className="mt-2 text-sm text-red-500">{errors.buildingName.message as string}</p>}
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
                className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-sm font-semibold rounded-xl text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? '인증 처리 중...' : '인증 완료 및 프로필 설정 계속하기'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}