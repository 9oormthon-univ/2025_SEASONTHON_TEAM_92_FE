'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { locationApi } from '../../../lib/api';
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
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'none' | 'success' | 'error'>('none');
  const [error, setError] = useState('');

  const { register, handleSubmit: hookFormSubmit, formState: { errors } } = useForm<FormData>();

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
        const { latitude, longitude } = position.coords;
        try {
          const response = await locationApi.getAddressPreview(latitude, longitude);
          if (response && response.data && response.data.address) {
            const fullAddress = response.data.address;
            const district = extractDistrict(fullAddress);
            setLocation({ district: district, latitude, longitude });
            setLocationStatus('success');
          } else {
            throw new Error(response?.message || '주소 조회에 실패했습니다.');
          }
        } catch (err: any) {
          setLocationStatus('error');
          const errorMessage = err.response?.data?.message || err.message || '주소 조회에 실패했습니다. 다시 시도해주세요.';
          setError(errorMessage);
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

  const onSubmit = async (data: FormData) => {
    setError('');

    if (location.latitude === null || location.longitude === null) {
      setError('위치 정보가 필요합니다. GPS 인증을 먼저 완료해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const verificationData = {
        buildingName: data.buildingName,
        latitude: location.latitude,
        longitude: location.longitude,
        district: location.district
      };

      await locationApi.verifyLocation(verificationData);
      router.push('/onboarding/profile');
    } catch (err: any) {
      console.error('Location verification error:', err);
      const errorMessage = err.response?.data?.message || err.message || '위치 인증 중 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden" 
         style={{background: 'linear-gradient(135deg, #E9D5FF 0%, #C084FC 50%, #9333EA 100%)'}}>
      
      {/* Background Decorative Cloud-like Elements */}
      <div className="absolute inset-0">
        {/* Large cloud shapes with more natural cloud-like appearance */}
        <div className="absolute top-10 left-10" style={{
          width: '220px',
          height: '140px',
          background: 'linear-gradient(135deg, #9333EA 0%, #C084FC 100%)',
          borderRadius: '120px 80px 100px 60px / 80px 120px 60px 100px',
          opacity: 0.6,
          transform: 'rotate(-8deg)'
        }}></div>
        
        <div className="absolute top-40 right-20" style={{
          width: '180px',
          height: '120px',
          background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
          borderRadius: '90px 120px 70px 110px / 60px 80px 90px 70px',
          opacity: 0.4,
          transform: 'rotate(15deg)'
        }}></div>

        <div className="absolute bottom-20 left-20" style={{
          width: '200px',
          height: '130px',
          background: 'linear-gradient(135deg, #C084FC 0%, #DDD6FE 100%)',
          borderRadius: '100px 80px 120px 90px / 70px 100px 50px 90px',
          opacity: 0.5,
          transform: 'rotate(-12deg)'
        }}></div>

        <div className="absolute bottom-40 right-10" style={{
          width: '160px',
          height: '100px',
          background: 'linear-gradient(135deg, #9333EA 0%, #E9D5FF 100%)',
          borderRadius: '80px 60px 90px 70px / 50px 80px 40px 70px',
          opacity: 0.3,
          transform: 'rotate(18deg)'
        }}></div>

        {/* Medium sized cloud elements */}
        <div className="absolute top-60 left-40" style={{
          width: '130px',
          height: '80px',
          background: 'white',
          borderRadius: '65px 40px 70px 50px / 40px 65px 30px 50px',
          opacity: 0.7,
          transform: 'rotate(-5deg)'
        }}></div>

        <div className="absolute top-80 right-60" style={{
          width: '140px',
          height: '90px',
          background: 'linear-gradient(135deg, #DDD6FE 0%, white 100%)',
          borderRadius: '70px 50px 80px 60px / 45px 70px 35px 60px',
          opacity: 0.6,
          transform: 'rotate(12deg)'
        }}></div>

        {/* Small cloud details */}
        <div className="absolute top-32 right-40" style={{
          width: '90px',
          height: '55px',
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '45px 25px 40px 30px / 28px 45px 20px 35px',
          opacity: 0.8,
          transform: 'rotate(-10deg)'
        }}></div>

        <div className="absolute bottom-60 left-60" style={{
          width: '110px',
          height: '70px',
          background: 'linear-gradient(135deg, #A855F7 0%, #DDD6FE 100%)',
          borderRadius: '55px 35px 60px 40px / 35px 55px 25px 45px',
          opacity: 0.4,
          transform: 'rotate(20deg)'
        }}></div>
      </div>

      <div className="max-w-6xl w-full flex items-center justify-center relative z-10">
        <div className="flex bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[700px] w-full max-w-5xl">
          
          {/* Left Side - Welcome Section */}
          <div className="flex-1 p-12 flex flex-col justify-center relative"
               style={{background: 'linear-gradient(135deg, #A855F7 0%, #9333EA 100%)'}}>
            <div className="text-white">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-8">
                <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center">
                  <i className="ri-map-pin-fill text-purple-700 text-lg"></i>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold mb-6 leading-tight">
                위치 인증
              </h1>
              
              <p className="text-white/90 text-xl leading-relaxed mb-8 max-w-md">
                정확한 분석을 위해<br />
                현재 거주 위치를 확인해주세요
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center text-white/80">
                  <div className="w-5 h-5 flex items-center justify-center mr-3">
                    <i className="ri-shield-check-line text-purple-200"></i>
                  </div>
                  <span>위치 정보는 안전하게 보호됩니다</span>
                </div>
                <div className="flex items-center text-white/80">
                  <div className="w-5 h-5 flex items-center justify-center mr-3">
                    <i className="ri-bar-chart-line text-purple-200"></i>
                  </div>
                  <span>지역별 정확한 데이터 분석</span>
                </div>
                <div className="flex items-center text-white/80">
                  <div className="w-5 h-5 flex items-center justify-center mr-3">
                    <i className="ri-group-line text-purple-200"></i>
                  </div>
                  <span>주변 이웃들과의 비교 분석</span>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-10 -left-10" style={{
              width: '150px',
              height: '90px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '75px 50px 80px 60px / 45px 75px 35px 65px',
              filter: 'blur(20px)',
              transform: 'rotate(-8deg)'
            }}></div>
            <div className="absolute -top-5 -right-5" style={{
              width: '120px',
              height: '70px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '60px 40px 70px 45px / 35px 60px 25px 50px',
              filter: 'blur(15px)',
              transform: 'rotate(12deg)'
            }}></div>
          </div>

          {/* Right Side - Location Form */}
          <div className="flex-1 p-12 flex flex-col justify-center bg-white">
            <div className="max-w-sm w-full mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">GPS 인증</h2>
                <p className="text-gray-600">현재 위치를 확인하고 건물 정보를 입력해주세요</p>
              </div>
              
              <form className="space-y-6" onSubmit={hookFormSubmit(onSubmit)}>
                {/* GPS Location Section */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isGettingLocation}
                    className="w-full flex items-center justify-center py-4 px-6 border-2 border-dashed border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-colors hover:border-purple-400 hover:bg-purple-50 disabled:opacity-50"
                  >
                    {isGettingLocation ? (
                      <div className="flex items-center text-purple-600">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mr-3"></div>
                        위치 정보 가져오는 중...
                      </div>
                    ) : (
                      <div className="flex items-center text-purple-600">
                        <i className="ri-gps-line text-xl mr-3"></i>
                        현재 위치 가져오기
                      </div>
                    )}
                  </button>

                  {locationStatus === 'success' && location.district && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center text-green-700">
                        <i className="ri-map-pin-line mr-2"></i>
                        <span className="text-sm font-medium">위치 확인됨: {location.district}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Manual Location Input */}
                {locationStatus === 'error' && (
                  <div>
                    <label htmlFor="district" className="block text-sm font-medium mb-2 text-gray-700">
                      <div className="flex items-center">
                        <div className="w-5 h-5 flex items-center justify-center mr-2">
                          <i className="ri-map-line text-purple-500"></i>
                        </div>
                        거주 지역 (수동 입력)
                      </div>
                    </label>
                    <input
                      type="text"
                      placeholder="예: 서울특별시 강남구 역삼동"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
                      value={location.district}
                      onChange={(e) => setLocation({ ...location, district: e.target.value })}
                    />
                  </div>
                )}

                {/* Building Name Input */}
                {locationStatus === 'success' && (
                  <div>
                    <label htmlFor="buildingName" className="block text-sm font-medium mb-2 text-gray-700">
                      <div className="flex items-center">
                        <div className="w-5 h-5 flex items-center justify-center mr-2">
                          <i className="ri-building-line text-purple-500"></i>
                        </div>
                        건물명 또는 아파트명
                      </div>
                    </label>
                    <input
                      id="buildingName"
                      type="text"
                      {...register('buildingName', { required: '건물명을 입력해주세요.' })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
                      placeholder="예: OO아파트, OO빌딩"
                    />
                    {errors.buildingName && (
                      <p className="mt-1 text-sm text-red-600">{errors.buildingName.message}</p>
                    )}
                  </div>
                )}

                {error && (
                  <div className="rounded-xl p-3 bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                {(locationStatus === 'success' || locationStatus === 'error') && (
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer transition-all"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          인증 중...
                        </div>
                      ) : (
                        '위치 인증 완료'
                      )}
                    </button>
                  </div>
                )}

                {/* Skip Option */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => router.push('/onboarding/profile')}
                    className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
                  >
                    나중에 인증하기
                  </button>
                </div>

                {/* Info */}
                <div className="mt-6 p-4 rounded-xl bg-purple-50 border border-purple-200">
                  <h3 className="text-sm font-medium mb-2 text-purple-800">왜 위치 인증이 필요한가요?</h3>
                  <div className="text-xs space-y-1 text-purple-700">
                    <p>• 해당 지역의 정확한 월세 데이터 분석</p>
                    <p>• 주변 이웃들과의 비교 리포트 제공</p>
                    <p>• 지역별 맞춤 정책 정보 안내</p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}