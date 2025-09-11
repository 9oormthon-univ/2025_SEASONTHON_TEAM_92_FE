'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, diagnosisApi } from '../../lib/api';
import toast from 'react-hot-toast';
import VerificationBadge from '@/components/VerificationBadge';

// 프로필 데이터 타입을 명확하게 정의
interface ProfileState {
  email: string;
  name: string;
  dong: string;
  building: string;
  buildingType: string;
  contractType: string;
  security: string;
  rent: string;
  maintenanceFee: string;
  gpsVerified: boolean;
  contractVerified: boolean;
  diagnosisCompleted: boolean;
  diagnosisScore: number | null;
  lastDiagnosisDate: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [tempProfile, setTempProfile] = useState<ProfileState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      // 로그인 체크 강화
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      const jwtToken = localStorage.getItem('jwtToken');
      
      if (!isLoggedIn || !jwtToken) {
        console.log('로그인 상태 없음 - 로그인 페이지로 리다이렉트');
        router.push('/auth/login');
        return;
      }

      // 두 API를 동시에 호출하여 효율성 증대
      const [userRes, diagnosisRes] = await Promise.allSettled([
        authApi.getCurrentUser(),
        diagnosisApi.getResult(),
      ]);

      let userProfile: Partial<ProfileState> = {};

      // 사용자 프로필 처리
      if (userRes.status === 'fulfilled' && userRes.value.success) {
        const userData = userRes.value.data;
        userProfile = {
          email: userData.email,
          name: userData.name,
          dong: userData.dong,
          building: userData.building,
          buildingType: userData.buildingType,
          contractType: userData.contractType,
          security: userData.security?.toString() ?? '',
          rent: userData.rent?.toString() ?? '',
          maintenanceFee: userData.maintenanceFee?.toString() ?? '',
          gpsVerified: userData.gpsVerified,
          contractVerified: userData.contractVerified,
        };
      } else {
        // 사용자 정보 로드 실패 시 로그인 페이지로 리디렉션
        toast.error('사용자 정보를 불러올 수 없습니다. 다시 로그인해주세요.');
        router.push('/auth/login');
        return;
      }

      // 진단 결과 처리
      if (diagnosisRes.status === 'fulfilled' && diagnosisRes.value.success) {
        const diagnosisData = diagnosisRes.value.data;
        userProfile.diagnosisCompleted = true;
        userProfile.diagnosisScore = diagnosisData.summary.totalScore;
        userProfile.lastDiagnosisDate = new Date().toISOString(); // 백엔드 응답에 날짜가 없으므로 현재 날짜 사용
      } else {
        userProfile.diagnosisCompleted = false;
      }

      setProfile(userProfile as ProfileState);
      setTempProfile(userProfile as ProfileState);

    } catch (error) {
      console.error('프로필 로드 실패:', error);
      toast.error('프로필 정보를 불러오는데 실패했습니다.');
      router.push('/'); // 에러 발생 시 홈으로 이동
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);


  const handleEdit = () => {
    if (!profile) return;
    setTempProfile(profile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!tempProfile) return;

    try {
      const payload = {
        name: tempProfile.name,
        dong: tempProfile.dong,
        building: tempProfile.building,
        buildingType: tempProfile.buildingType,
        contractType: tempProfile.contractType,
        security: tempProfile.security ? parseInt(tempProfile.security) : 0,
        rent: tempProfile.rent ? parseInt(tempProfile.rent) : 0,
        maintenanceFee: tempProfile.maintenanceFee ? parseInt(tempProfile.maintenanceFee) : 0,
      };

      const response = await authApi.updateUser(payload);
      
      if (response && response.success) {
        setProfile(tempProfile);
        setIsEditing(false);
        toast.success('프로필이 성공적으로 업데이트되었습니다!');
      } else {
        toast.error(response?.message || '프로필 업데이트에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('프로필 업데이트 실패:', error);
      toast.error(error.response?.data?.message || '프로필 업데이트 중 오류가 발생했습니다.');
    }
  };

  const handleLogout = () => {
    if (confirm('정말 로그아웃하시겠습니까?')) {
      localStorage.removeItem('jwtToken');
      toast.success('로그아웃 되었습니다.');
      router.push('/');
    }
  };

  if (isLoading || !profile) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/"><h1 className="text-3xl font-bold text-gray-800 cursor-pointer mb-2 font-['Pacifico']">월세의 정석</h1></Link>
          <div className="w-16 h-1 bg-gray-700 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900">내 프로필</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mr-6">
                <span className="text-3xl font-bold text-blue-600">{profile.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-1">{profile.name}님</h3>
                <p className="text-blue-100">{profile.email}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-bold text-gray-900">기본 정보</h4>
              <div className="flex space-x-3">
                {!isEditing ? (
                  <button onClick={handleEdit} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"><i className="ri-edit-line mr-2"></i>편집</button>
                ) : (
                  <div className="flex space-x-3">
                    <button onClick={handleCancel} className="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600">취소</button>
                    <button onClick={handleSave} className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700">저장</button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {Object.entries({
                    name: '이름', email: '이메일', dong: '거주 지역', building: '건물명',
                    buildingType: '건물 유형', contractType: '계약 유형', security: '보증금(만원)', rent: '월세(만원)', maintenanceFee: '관리비(만원)'
                }).map(([key, label]) => (
                    <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                        {isEditing && ['name', 'dong', 'building', 'buildingType', 'contractType', 'security', 'rent', 'maintenanceFee'].includes(key) ? (
                            <input
                                type={['security', 'rent', 'maintenanceFee'].includes(key) ? 'number' : 'text'}
                                value={String(tempProfile?.[key as keyof ProfileState] ?? '')}
                                onChange={(e) => setTempProfile(prev => prev ? {...prev, [key]: e.target.value} : null)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                                {profile[key as keyof ProfileState] || '설정되지 않음'}
                                {key === 'email' && <span className="text-xs ml-2">(변경 불가)</span>}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h4 className="text-xl font-bold text-gray-900 mb-4">인증 정보</h4>
              <div className="flex space-x-4 mb-4">
                <VerificationBadge gpsVerified={profile.gpsVerified} contractVerified={false} />
                <VerificationBadge gpsVerified={false} contractVerified={profile.contractVerified} />
              </div>
              <div className="flex space-x-3">
                <Link href="/gps-verification">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap">
                    <div className="flex items-center">
                      <i className="ri-map-pin-line mr-2"></i>
                      GPS 재인증
                    </div>
                  </button>
                </Link>
                <button 
                  onClick={() => {
                    if (confirm('온보딩을 다시 진행하시겠습니까? 기존 정보는 유지됩니다.')) {
                      localStorage.removeItem('onboarding_completed');
                      router.push('/onboarding/location');
                    }
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <div className="flex items-center">
                    <i className="ri-refresh-line mr-2"></i>
                    온보딩 다시하기
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h4 className="text-xl font-bold text-gray-900 mb-4">진단 정보</h4>
              {profile.diagnosisCompleted ? (
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">최근 진단 점수</label>
                        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-bold text-lg">{profile.diagnosisScore}점</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">마지막 진단일</label>
                        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">{profile.lastDiagnosisDate ? new Date(profile.lastDiagnosisDate).toLocaleDateString('ko-KR') : '-'}</div>
                    </div>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-sm text-blue-700">아직 진단을 완료하지 않으셨습니다.</p>
                  <Link href="/diagnosis"><button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">진단하러 가기</button></Link>
                </div>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h4 className="text-xl font-bold text-gray-900 mb-4">계정 관리</h4>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={handleLogout} className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"><i className="ri-logout-circle-line mr-2"></i>로그아웃</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
