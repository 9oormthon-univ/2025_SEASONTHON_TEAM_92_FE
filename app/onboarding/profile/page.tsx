
'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '../../../lib/api';
import toast from 'react-hot-toast';

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
        toast.error('기존 프로필 정보를 찾을 수 없습니다. 위치 인증부터 다시 진행해주세요.');
        router.push('/onboarding/location');
      }
    } catch (error) {
      console.error('기존 프로필 로드 실패:', error);
      toast.error('프로필 정보를 불러오는데 실패했습니다.');
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

  const handleNumberChange = (field: keyof typeof formData, value: string) => {
    const formatted = formatNumber(value);
    setFormData(prev => ({ ...prev, [field]: formatted }));
  };

  const isFormValid = () => {
    return formData.dong && formData.building && formData.buildingType && formData.contractType && formData.security;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      setError('필수 필드를 모두 입력해주세요.');
      toast.error('필수 필드를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        security: parseNumber(formData.security),
        rent: parseNumber(formData.rent),
        maintenanceFee: parseNumber(formData.maintenanceFee),
        latitude: locationData.lat,
        longitude: locationData.lon,
      };

      const response = await authApi.setProfileInfo(payload);
      console.log('프로필 업데이트 응답:', response);
      
      // localStorage에도 저장하여 프로필 페이지에서 사용할 수 있도록 함
      localStorage.setItem('userDong', formData.dong);
      localStorage.setItem('userBuilding', formData.building);
      localStorage.setItem('userBuildingType', formData.buildingType);
      localStorage.setItem('userContractType', formData.contractType);
      localStorage.setItem('userSecurity', formData.security);
      localStorage.setItem('userRent', formData.rent);
      localStorage.setItem('userMaintenanceFee', formData.maintenanceFee);
      
      // 온보딩 완료 플래그 설정 (로컬)
      localStorage.setItem('onboarding_completed', 'true');
      
      // 백엔드에 온보딩 완료 상태 저장
      try {
        await authApi.updateUser({ onboardingCompleted: true });
        console.log('온보딩 완료 상태가 백엔드에 저장되었습니다.');
      } catch (error) {
        console.error('온보딩 완료 상태 저장 실패:', error);
        // 백엔드 저장 실패해도 로컬은 저장되어 있으므로 계속 진행
      }
      
      toast.success('프로필이 성공적으로 저장되었습니다!');
      
      // 진단 페이지로 이동
      router.push('/diagnosis');

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || '프로필 설정 중 오류가 발생했습니다.';
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
          <Link href="/">
            <h1 className="text-4xl font-bold text-gray-800 cursor-pointer mb-2">월세의 정석</h1>
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
              <label className="block text-sm font-semibold text-gray-700 mb-3">거주지 정보</label>
              <div className="space-y-3">
                <div>
                  <label htmlFor="dong" className="block text-xs text-gray-500 mb-1">구/동 (GPS 인증 완료)</label>
                  <input id="dong" name="dong" type="text" readOnly value={formData.dong} className="appearance-none block w-full px-4 py-3 border border-gray-200 text-gray-500 rounded-lg bg-gray-100 text-sm cursor-not-allowed" />
                </div>
                <div>
                  <label htmlFor="building" className="block text-xs text-gray-500 mb-1">건물명 *</label>
                  <input id="building" name="building" type="text" required value={formData.building} onChange={(e) => setFormData({...formData, building: e.target.value})} className="appearance-none block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm bg-gray-50 focus:bg-white" placeholder="예: OO빌라, XX아파트" />
                </div>
                 <div>
                  <label htmlFor="detailAddress" className="block text-xs text-gray-500 mb-1">상세 주소 (선택)</label>
                  <input id="detailAddress" name="detailAddress" type="text" value={formData.detailAddress} onChange={(e) => setFormData({...formData, detailAddress: e.target.value})} className="appearance-none block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm bg-gray-50 focus:bg-white" placeholder="예: 101동 202호" />
                </div>
              </div>
            </div>

            {/* 건물 유형 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">건물 유형 *</label>
              <div className="grid grid-cols-3 gap-3">
                {buildingTypes.map((type) => (
                  <button key={type.value} type="button" onClick={() => setFormData({...formData, buildingType: type.value})} className={`px-3 py-3 text-sm font-medium rounded-lg border-2 transition-colors whitespace-nowrap cursor-pointer ${formData.buildingType === type.value ? 'border-gray-500 bg-gray-50 text-gray-800 font-bold' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 계약 유형 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">계약 유형 *</label>
              <div className="grid grid-cols-3 gap-3">
                {contractTypes.map((type) => (
                  <button key={type.value} type="button" onClick={() => setFormData({...formData, contractType: type.value})} className={`px-3 py-3 text-sm font-medium rounded-lg border-2 transition-colors whitespace-nowrap cursor-pointer ${formData.contractType === type.value ? 'border-gray-500 bg-gray-50 text-gray-800 font-bold' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 계약 조건 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">계약 조건 *</label>
              <div className="space-y-4">
                <div>
                  <label htmlFor="security" className="block text-xs text-gray-500 mb-1">보증금 (만원)</label>
                  <div className="relative"><input id="security" name="security" type="text" required value={formData.security} onChange={(e) => handleNumberChange('security', e.target.value)} className="appearance-none block w-full px-4 py-3 pr-12 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm bg-gray-50 focus:bg-white" placeholder="예: 500" /><span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">만원</span></div>
                </div>
                {formData.contractType === '월세' && (
                  <div>
                    <label htmlFor="rent" className="block text-xs text-gray-500 mb-1">월세 (만원)</label>
                    <div className="relative"><input id="rent" name="rent" type="text" required={formData.contractType === '월세'} value={formData.rent} onChange={(e) => handleNumberChange('rent', e.target.value)} className="appearance-none block w-full px-4 py-3 pr-12 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm bg-gray-50 focus:bg-white" placeholder="예: 50" /><span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">만원</span></div>
                  </div>
                )}
                <div>
                  <label htmlFor="maintenanceFee" className="block text-xs text-gray-500 mb-1">관리비 (만원, 선택)</label>
                  <div className="relative"><input id="maintenanceFee" name="maintenanceFee" type="text" value={formData.maintenanceFee} onChange={(e) => handleNumberChange('maintenanceFee', e.target.value)} className="appearance-none block w-full px-4 py-3 pr-12 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm bg-gray-50 focus:bg-white" placeholder="예: 5" /><span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">만원</span></div>
                </div>
              </div>
            </div>

            {error && <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4"><p className="text-red-600 text-sm font-medium">{error}</p></div>}

            <div className="pt-4">
              <button type="submit" disabled={isLoading || !isFormValid()} className="group w-full flex justify-center py-4 px-6 border border-transparent text-sm font-semibold rounded-xl text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {isLoading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> 저장 중...</> : '프로필 저장 및 서비스 시작'}
              </button>
            </div>
          </form>
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
    )
}
