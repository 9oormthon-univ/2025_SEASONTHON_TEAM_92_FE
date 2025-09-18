import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User } from '../types';
import { locationApi } from '../lib/api';

interface LocationVerifierProps {
  currentUser: User;
  onVerificationSuccess: (updatedUser: User) => void;
  onGoHome?: () => void;
}

interface FormData {
    buildingName: string;
}

export default function LocationVerifier({ currentUser, onVerificationSuccess, onGoHome }: LocationVerifierProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [locationError, setLocationError] = useState<string>('');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locationInfo, setLocationInfo] = useState<{ address: string; dong: string } | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const handleGetLocation = async () => {
    setIsLoading(true);
    setLocationError('');
    setLocationInfo(null);

    try {
      if (!navigator.geolocation) {
        throw new Error('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lon: longitude });
          
          try {
            // 좌표를 주소로 변환
            const response = await fetch(`/api/vworld-proxy?coords=${longitude},${latitude}`);
            const data = await response.json();
            
            if (data.success && data.address) {
              setLocationInfo({
                address: data.address,
                dong: data.address.split(' ').pop() || ''
              });
              toast.success(`위치 확인: ${data.address}`);
            } else {
              throw new Error('주소 변환에 실패했습니다.');
            }
          } catch (err: any) {
            setLocationError('주소 조회에 실패했습니다. 다시 시도해주세요.');
            toast.error('주소 조회에 실패했습니다.');
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          setLocationError('위치 정보를 가져올 수 없습니다. 브라우저 설정을 확인해주세요.');
          toast.error('위치 정보를 가져올 수 없습니다.');
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } catch (err: any) {
      setLocationError('위치 서비스에 접근할 수 없습니다.');
      toast.error('위치 서비스에 접근할 수 없습니다.');
      setIsLoading(false);
    }

    // 실제 GPS 사용 시 (주석 처리)
    /*
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lon: longitude });

        try {
          const response = await locationApi.getAddressPreview(latitude, longitude);
          if (response.success && response.data) {
            setLocationInfo({
              address: response.data.address || '주소 정보 없음',
              dong: response.data.neighborhood || '동 정보 없음'
            });
            toast.success(`위치 확인: ${response.data.neighborhood}`);
          } else {
            setLocationError(response.message || '주소를 가져올 수 없습니다.');
            toast.error(response.message || '주소를 가져올 수 없습니다.');
          }
        } catch (error) {
          console.error('주소 변환 실패:', error);
          setLocationError('주소 변환 중 오류가 발생했습니다.');
          toast.error('주소 변환 중 오류가 발생했습니다.');
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('GPS Error:', error);
        setLocationError('GPS 위치를 가져올 수 없습니다. 브라우저 위치 접근 권한을 확인해주세요.');
        toast.error('GPS 위치를 가져올 수 없습니다.');
        setIsLoading(false);
      }
    );
    */
  };

  const onSubmit = async (data: FormData) => {
    console.log('🚀 LocationVerifier onSubmit 시작!');
    console.log('📍 coords:', coords);
    console.log('📍 locationInfo:', locationInfo);
    console.log('🏠 건물명:', data.buildingName);
    console.log('👤 사용자 ID:', currentUser.id);
    console.log('👤 currentUser 전체:', currentUser);

    if (!coords) {
      toast.error('먼저 GPS 위치를 가져와주세요.');
      console.log('❌ coords가 없음');
      return;
    }

    if (!currentUser.id) {
      toast.error('사용자 정보가 없습니다. 다시 로그인해주세요.');
      console.log('❌ currentUser.id가 없음');
      return;
    }

    setIsLoading(true);
    try {
        const payload = {
            userId: currentUser.id,
            latitude: coords.lat,
            longitude: coords.lon,
            buildingName: data.buildingName
        };
        
        console.log('📤 API 호출 시작:', payload);
        console.log('🌐 API URL:', `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/api/location/verify`);
        
        const response = await locationApi.verifyLocation(payload);
        console.log('📥 API 응답:', response);

        if (response.success && response.data) {
            toast.success(`${response.data.neighborhood} 인증 완료!`);
            onVerificationSuccess(response.data);
        } else {
            toast.error(response.message || '위치 인증에 실패했습니다.');
        }
    } catch (error: any) {
        console.error('❌ API 호출 에러:', error);
        console.error('❌ 에러 상세:', error.response);
        const message = error.response?.data?.message || '인증 중 오류가 발생했습니다.';
        toast.error(message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 cursor-pointer mb-2">월세 공동협약</h1>
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
              <div className="w-6 h-6 flex items-center justify-center mr-3">
                <i className="ri-map-pin-line text-xl text-gray-500"></i>
              </div>
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  위치 가져오는 중...
                </div>
              ) : (
                'GPS로 우리 동네 자동 인증'
              )}
            </button>
          </div>

          {coords && locationInfo && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
              <div className="flex items-center">
                <div className="w-5 h-5 flex items-center justify-center mr-3">
                  <i className="ri-check-circle-fill text-green-600"></i>
                </div>
                <span className="text-green-700 font-medium text-sm">위치 확인 완료!</span>
              </div>
              <div className="mt-3 text-sm text-green-700">
                <p><strong>주소:</strong> {locationInfo.address}</p>
                <p><strong>동:</strong> {locationInfo.dong}</p>
              </div>
            </div>
          )}

          {locationError && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
              <div className="flex items-start">
                <div className="w-5 h-5 flex items-center justify-center mr-3 mt-0.5">
                  <i className="ri-error-warning-fill text-yellow-600"></i>
                </div>
                <div className="text-yellow-700">
                  <p className="font-medium mb-1 text-sm">자동 인증에 실패했습니다</p>
                  <p className="text-xs">{locationError}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="buildingName" className="block text-sm font-semibold text-gray-700 mb-2">
                거주 동네 인증
              </label>
              <div>
                <label htmlFor="buildingName" className="block text-xs text-gray-500 mb-1">
                  건물명 *
                </label>
                <input 
                    {...register('buildingName', { required: '거주 중인 건물명을 입력해주세요.' })}
                    type="text"
                    placeholder="예: 역삼타워, 행복아파트"
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors duration-200"
                />
                {errors.buildingName && <p className="mt-2 text-sm text-red-500">{errors.buildingName.message as string}</p>}
                <p className="mt-2 text-xs text-gray-500">
                  정확한 분석을 위해 거주 중인 건물명을 입력해주세요.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading || !coords}
                onClick={() => console.log('🔘 인증 완료 버튼 클릭됨!', { isLoading, coords, currentUser: currentUser.id })}
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
                <p>행정구 단위 인증으로<br />실제 거주자만의 정확한 데이터를<br />수집하여 신뢰할 수 있는<br />분석 결과를 제공합니다.</p>
              </div>
            </div>
          </div>

          {onGoHome && (
            <div className="mt-4 text-center">
              <button 
                type="button" 
                onClick={onGoHome}
                className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <i className="ri-home-line mr-1"></i>
                홈으로 돌아가기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
