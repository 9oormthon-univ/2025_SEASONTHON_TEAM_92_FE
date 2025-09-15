'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '../../../lib/api';

function ProfileSetupComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [locationData, setLocationData] = useState({ lat: 0, lon: 0 });
  const [formData, setFormData] = useState({
    dong: '',
    detailAddress: '',
    building: '',
    buildingType: '',
    contractType: '월세', // 기본값
    security: '', // 보증금
    rent: '', // 월세
    maintenanceFee: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const dong = searchParams.get('dong');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const buildingName = searchParams.get('buildingName');

    if (dong && lat && lon) {
      // 새로운 온보딩인 경우
      setFormData(prev => ({ ...prev, dong, building: buildingName || '' }));
      setLocationData({ lat: parseFloat(lat), lon: parseFloat(lon) });
    } else {
      // 프로필 편집인 경우 - 기존 데이터 불러오기
      loadExistingProfile();
    }
  }, [searchParams, router]);

  const loadExistingProfile = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const userDong = localStorage.getItem('userDong');
      const userBuilding = localStorage.getItem('userBuilding');
      const userBuildingType = localStorage.getItem('userBuildingType');
      const userContractType = localStorage.getItem('userContractType');
      const userSecurity = localStorage.getItem('userSecurity');
      const userRent = localStorage.getItem('userRent');
      const userMaintenanceFee = localStorage.getItem('userMaintenanceFee');

      if (userDong) {
        setFormData({
          dong: userDong,
          detailAddress: '',
          building: userBuilding || '',
          buildingType: userBuildingType || '',
          contractType: userContractType || '월세',
          security: userSecurity || '',
          rent: userRent || '',
          maintenanceFee: userMaintenanceFee || ''
        });
        
        // 기본 위치 설정 (서울 강남구)
        setLocationData({ lat: 37.5665, lon: 126.9780 });
      } else {
        setError('기존 프로필 정보를 찾을 수 없습니다. 위치 인증부터 다시 진행해주세요.');
        router.push('/onboarding/location');
      }
    } catch (error) {
      console.error('기존 프로필 로드 실패:', error);
      setError('프로필 정보를 불러오는데 실패했습니다.');
      router.push('/onboarding/location');
    }
  };

  const buildingTypes = [
    { value: '아파트', label: '아파트' },
    { value: '오피스텔', label: '오피스텔' },
    { value: '빌라', label: '빌라/연립' }
  ];

  const contractTypes = [
    { value: '월세', label: '월세' },
    { value: '전세', label: '전세' },
  ];

  const parseNumber = (value: string) => {
    return parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
  };

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
    return formData.dong && 
           formData.building &&
           formData.buildingType && 
           formData.security && 
           (formData.contractType === '전세' || formData.rent);
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
      const profileData = {
        dong: formData.dong,
        building: formData.building,
        buildingType: formData.buildingType,
        contractType: formData.contractType,
        security: parseNumber(formData.security),
        rent: parseNumber(formData.rent),
        maintenanceFee: parseNumber(formData.maintenanceFee),
        latitude: locationData.lat,
        longitude: locationData.lon
      };

      await authApi.setProfileInfo(profileData);
      
      // 프로필 정보를 localStorage에 저장
      localStorage.setItem('userDong', formData.dong);
      localStorage.setItem('userBuilding', formData.building);
      localStorage.setItem('userBuildingType', formData.buildingType);
      localStorage.setItem('userContractType', formData.contractType);
      localStorage.setItem('userSecurity', formData.security);
      localStorage.setItem('userRent', formData.rent);
      localStorage.setItem('userMaintenanceFee', formData.maintenanceFee);
      
      // 온보딩 완료 플래그 설정
      localStorage.setItem('onboarding_completed', 'true');
      
      // 메인 페이지로 이동
      router.push('/');
    } catch (err: any) {
      console.error('Profile setup error:', err);
      const errorMessage = err.response?.data?.message || err.message || '프로필 설정 중 오류가 발생했습니다.';
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
        <div className="flex bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[800px] w-full max-w-5xl">
          
          {/* Left Side - Welcome Section */}
          <div className="flex-1 p-12 flex flex-col justify-center relative"
               style={{background: 'linear-gradient(135deg, #A855F7 0%, #9333EA 100%)'}}>
            <div className="text-white">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-8">
                <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center">
                  <i className="ri-user-settings-fill text-purple-700 text-lg"></i>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold mb-6 leading-tight">
                프로필 설정
              </h1>
              
              <p className="text-white/90 text-xl leading-relaxed mb-8 max-w-md">
                거주 정보와 계약 조건을<br />
                입력해서 맞춤 분석을 받아보세요
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center text-white/80">
                  <div className="w-5 h-5 flex items-center justify-center mr-3">
                    <i className="ri-shield-check-line text-purple-200"></i>
                  </div>
                  <span>개인정보는 암호화되어 보호됩니다</span>
                </div>
                <div className="flex items-center text-white/80">
                  <div className="w-5 h-5 flex items-center justify-center mr-3">
                    <i className="ri-bar-chart-line text-purple-200"></i>
                  </div>
                  <span>정확한 월세 비교 분석 제공</span>
                </div>
                <div className="flex items-center text-white/80">
                  <div className="w-5 h-5 flex items-center justify-center mr-3">
                    <i className="ri-lightbulb-line text-purple-200"></i>
                  </div>
                  <span>맞춤형 협상 전략 추천</span>
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

          {/* Right Side - Profile Form */}
          <div className="flex-1 p-12 flex flex-col justify-center bg-white overflow-y-auto">
            <div className="max-w-sm w-full mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">거주 정보 입력</h2>
                <p className="text-gray-600">계약 정보를 입력해주세요</p>
              </div>
              
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Address Display */}
                {formData.dong && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      <div className="flex items-center">
                        <div className="w-5 h-5 flex items-center justify-center mr-2">
                          <i className="ri-map-pin-line text-purple-500"></i>
                        </div>
                        현재 거주 지역
                      </div>
                    </label>
                    <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-700">
                      {formData.dong}
                    </div>
                  </div>
                )}

                {/* Building Name */}
                <div>
                  <label htmlFor="building" className="block text-sm font-medium mb-2 text-gray-700">
                    <div className="flex items-center">
                      <div className="w-5 h-5 flex items-center justify-center mr-2">
                        <i className="ri-building-line text-purple-500"></i>
                      </div>
                      건물명 *
                    </div>
                  </label>
                  <input
                    id="building"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
                    placeholder="예: OO아파트, OO빌딩"
                    value={formData.building}
                    onChange={(e) => setFormData({...formData, building: e.target.value})}
                  />
                </div>

                {/* Building Type */}
                <div>
                  <label htmlFor="buildingType" className="block text-sm font-medium mb-2 text-gray-700">
                    <div className="flex items-center">
                      <div className="w-5 h-5 flex items-center justify-center mr-2">
                        <i className="ri-home-line text-purple-500"></i>
                      </div>
                      건물 유형 *
                    </div>
                  </label>
                  <select
                    id="buildingType"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
                    value={formData.buildingType}
                    onChange={(e) => setFormData({...formData, buildingType: e.target.value})}
                  >
                    <option value="">선택해주세요</option>
                    {buildingTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Contract Type */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    <div className="flex items-center">
                      <div className="w-5 h-5 flex items-center justify-center mr-2">
                        <i className="ri-file-text-line text-purple-500"></i>
                      </div>
                      계약 유형 *
                    </div>
                  </label>
                  <div className="flex space-x-3">
                    {contractTypes.map(type => (
                      <label key={type.value} className="flex items-center">
                        <input
                          type="radio"
                          name="contractType"
                          value={type.value}
                          checked={formData.contractType === type.value}
                          onChange={(e) => setFormData({...formData, contractType: e.target.value})}
                          className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Security Deposit */}
                <div>
                  <label htmlFor="security" className="block text-sm font-medium mb-2 text-gray-700">
                    <div className="flex items-center">
                      <div className="w-5 h-5 flex items-center justify-center mr-2">
                        <i className="ri-safe-line text-purple-500"></i>
                      </div>
                      보증금 * (만원)
                    </div>
                  </label>
                  <input
                    id="security"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
                    placeholder="예: 1,000"
                    value={formData.security}
                    onChange={(e) => handleNumberChange('security', e.target.value)}
                  />
                </div>

                {/* Monthly Rent - Only for 월세 */}
                {formData.contractType === '월세' && (
                  <div>
                    <label htmlFor="rent" className="block text-sm font-medium mb-2 text-gray-700">
                      <div className="flex items-center">
                        <div className="w-5 h-5 flex items-center justify-center mr-2">
                          <i className="ri-money-dollar-circle-line text-purple-500"></i>
                        </div>
                        월세 * (만원)
                      </div>
                    </label>
                    <input
                      id="rent"
                      type="text"
                      required={formData.contractType === '월세'}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
                      placeholder="예: 50"
                      value={formData.rent}
                      onChange={(e) => handleNumberChange('rent', e.target.value)}
                    />
                  </div>
                )}

                {/* Maintenance Fee */}
                <div>
                  <label htmlFor="maintenanceFee" className="block text-sm font-medium mb-2 text-gray-700">
                    <div className="flex items-center">
                      <div className="w-5 h-5 flex items-center justify-center mr-2">
                        <i className="ri-tools-line text-purple-500"></i>
                      </div>
                      관리비 (만원, 선택)
                    </div>
                  </label>
                  <input
                    id="maintenanceFee"
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
                    placeholder="예: 10"
                    value={formData.maintenanceFee}
                    onChange={(e) => handleNumberChange('maintenanceFee', e.target.value)}
                  />
                </div>

                {error && (
                  <div className="rounded-xl p-3 bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading || !isFormValid()}
                    className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer transition-all"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        저장 중...
                      </div>
                    ) : (
                      '프로필 설정 완료'
                    )}
                  </button>
                </div>

                {/* Skip Option */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
                  >
                    나중에 설정하기
                  </button>
                </div>

                {/* Info */}
                <div className="mt-6 p-4 rounded-xl bg-purple-50 border border-purple-200">
                  <h3 className="text-sm font-medium mb-2 text-purple-800">입력한 정보는 어떻게 사용되나요?</h3>
                  <div className="text-xs space-y-1 text-purple-700">
                    <p>• 주변 지역 월세 시세와 비교 분석</p>
                    <p>• 맞춤형 협상 전략 및 리포트 제공</p>
                    <p>• 익명으로 처리되어 개인정보 보호</p>
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

export default function ProfileSetupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileSetupComponent />
    </Suspense>
  );
}