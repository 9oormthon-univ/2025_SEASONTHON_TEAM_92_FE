'use client';

import { useState, useEffect } from 'react';
import { LocationData, GPSVerificationResult, AddressInfo } from '@/types';
import { gpsApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface GPSVerificationProps {
  targetAddress: string;
  onVerificationComplete: (result: GPSVerificationResult) => void;
  onVerificationFailed: (error: string) => void;
}

export default function GPSVerification({ 
  targetAddress, 
  onVerificationComplete, 
  onVerificationFailed 
}: GPSVerificationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [verificationResult, setVerificationResult] = useState<GPSVerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);

  // 위치 정보 가져오기
  const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('이 브라우저는 위치 서비스를 지원하지 않습니다.'));
        return;
      }

      const options = {
        enableHighAccuracy: true, // 높은 정확도 요청
        timeout: 10000, // 10초 타임아웃
        maximumAge: 30000 // 30초 캐시
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy || 0,
            timestamp: Date.now()
          };
          resolve(locationData);
        },
        (error) => {
          let errorMessage = '';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = '위치 접근 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = '위치 정보를 사용할 수 없습니다. GPS가 켜져 있는지 확인해주세요.';
              break;
            case error.TIMEOUT:
              errorMessage = '위치 정보 요청 시간이 초과되었습니다. 다시 시도해주세요.';
              break;
            default:
              errorMessage = '위치 정보를 가져오는 중 오류가 발생했습니다.';
              break;
          }
          reject(new Error(errorMessage));
        },
        options
      );
    });
  };

  // 주소 정보 가져오기 (역지오코딩)
  const getAddressFromCoordinates = async (lat: number, lng: number): Promise<AddressInfo> => {
    try {
      // 실제로는 Google Maps API나 카카오맵 API를 사용해야 합니다
      // 여기서는 Mock 데이터를 사용합니다
      const mockAddressInfo: AddressInfo = {
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        dong: '망원동',
        gu: '마포구',
        si: '서울시'
      };
      return mockAddressInfo;
    } catch (error) {
      throw new Error('주소 정보를 가져올 수 없습니다.');
    }
  };

  // 거리 계산 (Haversine 공식)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // 지구 반지름 (미터)
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // 미터 단위
  };

  // GPS 인증 수행
  const performGPSVerification = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. 현재 위치 가져오기
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      setAccuracy(location.accuracy);

      // 2. 백엔드 API를 통한 GPS 인증
      const verificationData = {
        userLocation: location,
        targetAddress: targetAddress,
        toleranceRadius: 100 // 100미터 허용 오차
      };

      const apiResponse = await gpsApi.verifyLocation(verificationData);
      
      if (apiResponse.success && apiResponse.data) {
        const result: GPSVerificationResult = apiResponse.data;
        setVerificationResult(result);

        if (result.isVerified) {
          toast.success('GPS 인증이 완료되었습니다!');
          onVerificationComplete(result);
        } else {
          toast.error('GPS 정확도가 낮아 인증에 실패했습니다. 다시 시도해주세요.');
          onVerificationFailed('GPS 정확도 부족');
        }
      } else {
        throw new Error(apiResponse.message || 'GPS 인증에 실패했습니다.');
      }

    } catch (err: any) {
      const errorMessage = err.message || 'GPS 인증 중 오류가 발생했습니다.';
      setError(errorMessage);
      toast.error(errorMessage);
      onVerificationFailed(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 정확도 개선을 위한 추가 측정
  const improveAccuracy = async () => {
    setIsLoading(true);
    try {
      // 여러 번 측정하여 평균 정확도 향상
      const measurements: LocationData[] = [];
      
      for (let i = 0; i < 3; i++) {
        const location = await getCurrentLocation();
        measurements.push(location);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
      }

      // 평균 위치 계산
      const avgLat = measurements.reduce((sum, loc) => sum + loc.latitude, 0) / measurements.length;
      const avgLng = measurements.reduce((sum, loc) => sum + loc.longitude, 0) / measurements.length;
      const avgAccuracy = measurements.reduce((sum, loc) => sum + loc.accuracy, 0) / measurements.length;

      const improvedLocation: LocationData = {
        latitude: avgLat,
        longitude: avgLng,
        accuracy: avgAccuracy,
        timestamp: Date.now()
      };

      // 백엔드 API를 통한 정확도 개선 확인
      const accuracyResponse = await gpsApi.getLocationAccuracy(improvedLocation);
      
      if (accuracyResponse.success && accuracyResponse.data) {
        const improvedData = accuracyResponse.data;
        setCurrentLocation(improvedLocation);
        setAccuracy(improvedData.accuracy);
        toast.success(`정확도가 개선되었습니다! (${improvedData.confidence}%)`);
      } else {
        setCurrentLocation(improvedLocation);
        setAccuracy(avgAccuracy);
        toast.success('정확도가 개선되었습니다!');
      }
    } catch (err: any) {
      toast.error('정확도 개선에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">GPS 위치 인증</h2>
        <p className="text-gray-600 mb-4">현재 위치를 기반으로 동네 인증을 진행합니다</p>
        <p className="text-sm text-gray-500">대상 주소: {targetAddress}</p>
      </div>

      {!verificationResult && (
        <div className="space-y-4">
          <button
            onClick={performGPSVerification}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                위치 정보 확인 중...
              </div>
            ) : (
              'GPS 위치 인증 시작'
            )}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>
      )}

      {currentLocation && !verificationResult && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">현재 위치 정보</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>위도: {currentLocation.latitude.toFixed(6)}</p>
            <p>경도: {currentLocation.longitude.toFixed(6)}</p>
            <p>정확도: {accuracy.toFixed(1)}m</p>
          </div>
          
          {accuracy > 50 && (
            <div className="mt-3">
              <p className="text-sm text-orange-600 mb-2">정확도가 낮습니다. 정확도를 개선하시겠습니까?</p>
              <button
                onClick={improveAccuracy}
                disabled={isLoading}
                className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded hover:bg-orange-200 disabled:opacity-50"
              >
                정확도 개선
              </button>
            </div>
          )}
        </div>
      )}

      {verificationResult && (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${
            verificationResult.isVerified 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center mb-2">
              {verificationResult.isVerified ? (
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className={`font-semibold ${
                verificationResult.isVerified ? 'text-green-800' : 'text-red-800'
              }`}>
                {verificationResult.isVerified ? '인증 성공' : '인증 실패'}
              </span>
            </div>
            
            <div className="text-sm space-y-1">
              <p className="text-gray-700">
                <span className="font-semibold">신뢰도:</span> {verificationResult.confidence}%
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">인증 방법:</span> {verificationResult.verificationMethod}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">인증 시간:</span> {new Date(verificationResult.verifiedAt).toLocaleString()}
              </p>
            </div>
          </div>

          {verificationResult.isVerified && (
            <div className="flex items-center justify-center space-x-2">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                ✓ GPS 인증됨
              </span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                📍 위치 확인됨
              </span>
            </div>
          )}

          <button
            onClick={() => {
              setVerificationResult(null);
              setCurrentLocation(null);
              setError(null);
            }}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
          >
            다시 인증하기
          </button>
        </div>
      )}
    </div>
  );
}