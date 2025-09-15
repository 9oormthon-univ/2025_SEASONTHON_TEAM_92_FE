'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '../../lib/api';

interface UserProfile {
  name: string;
  email: string;
  dong: string;
  building: string;
  buildingType: string;
  contractType: string;
  residencePeriod: number;
  role: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // localStorage에서 기본 정보 가져오기
        const email = localStorage.getItem('userEmail') || '';
        const nickname = localStorage.getItem('userNickname') || email.split('@')[0];
        const dong = localStorage.getItem('userDong') || '';
        const building = localStorage.getItem('userBuilding') || '';
        const buildingType = localStorage.getItem('userBuildingType') || '';
        const contractType = localStorage.getItem('userContractType') || '';

        // API에서 최신 정보 가져오기
        const profile = await authApi.getCurrentUser();
        
        setUserProfile({
          name: nickname,
          email: email,
          dong: dong || profile?.dong || '정보 없음',
          building: building || profile?.building || '정보 없음',
          buildingType: buildingType || profile?.buildingType || '정보 없음',
          contractType: contractType || profile?.contractType || '정보 없음',
          residencePeriod: profile?.residencePeriod || 0,
          role: '임차인 (세입자)'
        });

      } catch (err: any) {
        console.error('프로필 로드 실패:', err);
        setError('프로필 정보를 불러오는데 실패했습니다.');
        
        // localStorage에서라도 기본 정보 표시
        const email = localStorage.getItem('userEmail') || '';
        const nickname = localStorage.getItem('userNickname') || email.split('@')[0];
        setUserProfile({
          name: nickname,
          email: email,
          dong: localStorage.getItem('userDong') || '정보 없음',
          building: localStorage.getItem('userBuilding') || '정보 없음',
          buildingType: localStorage.getItem('userBuildingType') || '정보 없음',
          contractType: localStorage.getItem('userContractType') || '정보 없음',
          residencePeriod: 0,
          role: '임차인 (세입자)'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleEdit = () => {
    router.push('/onboarding/profile');
  };

  const handleLogout = () => {
    if (confirm('정말 로그아웃하시겠습니까?')) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userNickname');
      localStorage.removeItem('userDong');
      localStorage.removeItem('userBuilding');
      localStorage.removeItem('userBuildingType');
      localStorage.removeItem('userContractType');
      router.push('/');
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('정말 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      // TODO: 실제 계정 삭제 API 구현
      alert('계정 삭제 기능은 추후 구현 예정입니다.');
    }
  };

  const handleBackToMain = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="flex items-center space-x-3 text-purple-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span>프로필 로딩 중...</span>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">프로필을 불러올 수 없습니다.</p>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 font-display mb-2">월세의 정석</h1>
          <div className="w-16 h-1 bg-purple-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900">내 프로필</h2>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-purple-200 overflow-hidden mb-8">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-8 py-6">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-white rounded-full flex justify-center items-center mr-6">
                <span className="text-purple-600 text-3xl font-bold">
                  {userProfile.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-white text-2xl font-bold mb-1">{userProfile.name}님</h3>
                <p className="text-purple-100 text-base mb-1">{userProfile.email}</p>
                <p className="text-purple-200 text-sm">{userProfile.role}</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            {/* 기본 정보 섹션 */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-bold text-gray-900">기본 정보</h4>
                <button
                  onClick={handleEdit}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <i className="ri-edit-line"></i>
                  <span>편집하기</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">닉네임</label>
                  <div className="px-4 py-3 bg-purple-50 rounded-lg border border-purple-200">
                    <span className="text-gray-900">{userProfile.name}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                  <div className="px-4 py-3 bg-purple-50 rounded-lg border border-purple-200 flex items-center justify-between">
                    <span className="text-gray-500">{userProfile.email}</span>
                    <span className="text-gray-500 text-xs">(변경 불가)</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">거주 지역</label>
                  <div className="px-4 py-3 bg-purple-50 rounded-lg border border-purple-200">
                    <span className="text-gray-900">{userProfile.dong}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">건물명</label>
                  <div className="px-4 py-3 bg-purple-50 rounded-lg border border-purple-200">
                    <span className="text-gray-900">{userProfile.building}</span>
                  </div>
                </div>
                
                {/* MVP에서는 거주 기간 제외 - 나중에 추가 예정 */}
                {/*
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">거주 기간 (개월)</label>
                  <div className="px-4 py-3 bg-purple-50 rounded-lg border border-purple-200">
                    <span className="text-gray-900">{userProfile.residencePeriod}개월</span>
                  </div>
                </div>
                */}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">역할</label>
                  <div className="px-4 py-3 bg-purple-50 rounded-lg border border-purple-200">
                    <span className="text-gray-900">{userProfile.role}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 바로가기 섹션 */}
            <div className="border-t border-purple-200 pt-8 mb-8">
              <h4 className="text-xl font-bold text-gray-900 mb-4">바로가기</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/dashboard"
                  className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex justify-center items-center mr-3">
                      <i className="ri-dashboard-line text-purple-600"></i>
                    </div>
                    <div>
                      <h5 className="text-gray-900 font-medium">대시보드</h5>
                      <p className="text-gray-600 text-sm">리포트 및 분석</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/diagnosis"
                  className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex justify-center items-center mr-3">
                      <i className="ri-stethoscope-line text-purple-600"></i>
                    </div>
                    <div>
                      <h5 className="text-gray-900 font-medium">진단하기</h5>
                      <p className="text-gray-600 text-sm">우리 집 상태 점검</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/weekly-mission"
                  className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex justify-center items-center mr-3">
                      <i className="ri-trophy-line text-purple-600"></i>
                    </div>
                    <div>
                      <h5 className="text-gray-900 font-medium">주간 미션</h5>
                      <p className="text-gray-600 text-sm">이웃과 함께 참여</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* 계정 관리 섹션 */}
            <div className="border-t border-purple-200 pt-8">
              <h4 className="text-xl font-bold text-gray-900 mb-4">계정 관리</h4>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                >
                  <i className="ri-logout-circle-line"></i>
                  <span>로그아웃</span>
                </button>
                
                <button
                  onClick={handleDeleteAccount}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <i className="ri-delete-bin-line"></i>
                  <span>계정 삭제</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 메인으로 돌아가기 버튼 */}
        <div className="text-center">
          <button
            onClick={handleBackToMain}
            className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <i className="ri-home-line"></i>
            <span>메인으로 돌아가기</span>
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}