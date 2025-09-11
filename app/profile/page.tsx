'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, diagnosisApi } from '../../lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    email: '',
    nickname: '',
    location: '',
    buildingName: '',
    monthsLived: '',
    role: 'tenant',
    buildingType: '',
    contractType: '',
    security: '',
    rent: '',
    maintenanceFee: '',
    gpsVerified: false,
    contractVerified: false,
    diagnosisCompleted: false,
    diagnosisScore: null,
    lastDiagnosisDate: null
  });
  const [tempProfileData, setTempProfileData] = useState(profileData);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserProfile = async () => {
      try {
        // 로그인 체크
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
          router.push('/auth/login');
          return;
        }

        setIsLoading(true);

        // 백엔드에서 사용자 정보 가져오기
        const userProfile = await authApi.getCurrentUser();
        console.log('프로필 데이터:', userProfile);

        if (userProfile && userProfile.success) {
          const userData = userProfile.data;
          console.log('사용자 데이터 상세:', userData);
          
          const profileInfo = {
            email: userData.email || '',
            nickname: userData.name || userData.nickname || userData.email?.split('@')[0] || '',
            location: userData.dong || userData.location || '',
            buildingName: userData.building || userData.buildingName || '',
            monthsLived: userData.monthsLived?.toString() || '',
            role: userData.role || 'tenant',
            buildingType: userData.buildingType || '',
            contractType: userData.contractType || '',
            security: userData.security?.toString() || '',
            rent: userData.rent?.toString() || '',
            maintenanceFee: userData.maintenanceFee?.toString() || '',
            gpsVerified: userData.gpsVerified || false,
            contractVerified: userData.contractVerified || false
          };

          // 진단 정보도 함께 가져오기
          try {
            const diagnosisResult = await diagnosisApi.getResult();
            if (diagnosisResult && diagnosisResult.success && diagnosisResult.data) {
              profileInfo.diagnosisCompleted = true;
              profileInfo.diagnosisScore = diagnosisResult.data.totalScore || diagnosisResult.data.score;
              profileInfo.lastDiagnosisDate = diagnosisResult.data.createdAt || diagnosisResult.data.date;
              console.log('진단 결과:', diagnosisResult.data);
            }
          } catch (error) {
            console.log('진단 결과 없음 또는 오류:', error);
            // localStorage에서 진단 완료 여부 확인
            const diagnosisCompleted = localStorage.getItem('diagnosis_completed') === 'true';
            profileInfo.diagnosisCompleted = diagnosisCompleted;
          }

          setProfileData(profileInfo);
          setTempProfileData(profileInfo);
        } else {
          // 백엔드에서 데이터를 가져올 수 없는 경우 localStorage 사용
          const email = localStorage.getItem('userEmail') || '';
          const nickname = localStorage.getItem('userNickname') || email.split('@')[0];
          const location = localStorage.getItem('userLocation') || localStorage.getItem('userDong') || '';
          const buildingName = localStorage.getItem('userBuildingName') || localStorage.getItem('userBuilding') || '';
          const monthsLived = localStorage.getItem('userMonthsLived') || '';
          const role = localStorage.getItem('userRole') || 'tenant';
          const buildingType = localStorage.getItem('userBuildingType') || '';
          const contractType = localStorage.getItem('userContractType') || '';
          const security = localStorage.getItem('userSecurity') || '';
          const rent = localStorage.getItem('userRent') || '';
          const maintenanceFee = localStorage.getItem('userMaintenanceFee') || '';

          const diagnosisCompleted = localStorage.getItem('diagnosis_completed') === 'true';
          
          const fallbackData = {
            email,
            nickname,
            location,
            buildingName,
            monthsLived,
            role,
            buildingType,
            contractType,
            security,
            rent,
            maintenanceFee,
            gpsVerified: false,
            contractVerified: false,
            diagnosisCompleted,
            diagnosisScore: null,
            lastDiagnosisDate: null
          };

          setProfileData(fallbackData);
          setTempProfileData(fallbackData);
        }
      } catch (error) {
        console.error('프로필 로드 실패:', error);
        toast.error('프로필 정보를 불러오는데 실패했습니다.');
        
        // 에러 시 localStorage에서 기본 정보만 로드
        const email = localStorage.getItem('userEmail') || '';
        const nickname = localStorage.getItem('userNickname') || email.split('@')[0];
        
        const diagnosisCompleted = localStorage.getItem('diagnosis_completed') === 'true';
        
        const fallbackData = {
          email,
          nickname,
          location: '',
          buildingName: '',
          monthsLived: '',
          role: 'tenant',
          buildingType: '',
          contractType: '',
          security: '',
          rent: '',
          maintenanceFee: '',
          gpsVerified: false,
          contractVerified: false,
          diagnosisCompleted,
          diagnosisScore: null,
          lastDiagnosisDate: null
        };

        setProfileData(fallbackData);
        setTempProfileData(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [router]);

  // 페이지 포커스 시 데이터 새로고침
  useEffect(() => {
    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        loadUserProfile();
      }
    };

    document.addEventListener('visibilitychange', handleFocus);
    return () => document.removeEventListener('visibilitychange', handleFocus);
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setTempProfileData(profileData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempProfileData(profileData);
  };

  const handleSave = async () => {
    try {
      // 백엔드에 프로필 업데이트 요청
      const updateData = {
        name: tempProfileData.nickname,
        dong: tempProfileData.location,
        building: tempProfileData.buildingName,
        buildingType: tempProfileData.buildingType,
        contractType: tempProfileData.contractType,
        security: tempProfileData.security ? parseInt(tempProfileData.security) : null,
        rent: tempProfileData.rent ? parseInt(tempProfileData.rent) : null,
        maintenanceFee: tempProfileData.maintenanceFee ? parseInt(tempProfileData.maintenanceFee) : null
      };

      const response = await authApi.updateUser(updateData);
      
      if (response && response.success) {
        // 로컬 스토리지에도 저장
        localStorage.setItem('userNickname', tempProfileData.nickname);
        localStorage.setItem('userLocation', tempProfileData.location);
        localStorage.setItem('userDong', tempProfileData.location);
        localStorage.setItem('userBuildingName', tempProfileData.buildingName);
        localStorage.setItem('userBuilding', tempProfileData.buildingName);
        localStorage.setItem('userMonthsLived', tempProfileData.monthsLived);
        localStorage.setItem('userRole', tempProfileData.role);
        localStorage.setItem('userBuildingType', tempProfileData.buildingType);
        localStorage.setItem('userContractType', tempProfileData.contractType);
        localStorage.setItem('userSecurity', tempProfileData.security);
        localStorage.setItem('userRent', tempProfileData.rent);
        localStorage.setItem('userMaintenanceFee', tempProfileData.maintenanceFee);

        setProfileData(tempProfileData);
        setIsEditing(false);
        
        toast.success('프로필이 성공적으로 업데이트되었습니다!');
      } else {
        toast.error('프로필 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      toast.error('프로필 업데이트 중 오류가 발생했습니다.');
    }
  };

  const handleLogout = () => {
    if (confirm('정말 로그아웃하시겠습니까?')) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userNickname');
      localStorage.removeItem('userLocation');
      localStorage.removeItem('userBuildingName');
      localStorage.removeItem('userMonthsLived');
      localStorage.removeItem('userRole');
      router.push('/');
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('정말 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      if (confirm('모든 데이터가 삭제됩니다. 정말 계속하시겠습니까?')) {
        // 계정 삭제 처리
        localStorage.clear();
        alert('계정이 성공적으로 삭제되었습니다.');
        router.push('/');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-bold text-gray-800 cursor-pointer mb-2 font-['Pacifico']">월세 공동협약</h1>
          </Link>
          <div className="w-16 h-1 bg-gray-700 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900">내 프로필</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mr-6">
                <span className="text-3xl font-bold text-blue-600">
                  {profileData.nickname.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-1">{profileData.nickname}님</h3>
                <p className="text-blue-100">{profileData.email}</p>
                <p className="text-blue-200 text-sm mt-1">
                  {profileData.role === 'tenant' ? '임차인' : '임대인'}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xl font-bold text-gray-900">기본 정보</h4>
              <div className="flex space-x-3">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <div className="flex items-center">
                        <i className="ri-refresh-line mr-2"></i>
                        새로고침
                      </div>
                    </button>
                    <button
                      onClick={handleEdit}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <div className="flex items-center">
                        <i className="ri-edit-line mr-2"></i>
                        편집하기
                      </div>
                    </button>
                  </>
                ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    저장
                  </button>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  닉네임
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempProfileData.nickname}
                    onChange={(e) => setTempProfileData({...tempProfileData, nickname: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {profileData.nickname || '설정되지 않음'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500">
                  {profileData.email}
                  <span className="text-xs ml-2">(변경 불가)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  거주 지역
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempProfileData.location}
                    onChange={(e) => setTempProfileData({...tempProfileData, location: e.target.value})}
                    placeholder="예: 강남구 개포동"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {profileData.location || '설정되지 않음'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  건물명
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempProfileData.buildingName}
                    onChange={(e) => setTempProfileData({...tempProfileData, buildingName: e.target.value})}
                    placeholder="예: 래미안 아파트 101동"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {profileData.buildingName || '설정되지 않음'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  거주 기간 (개월)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={tempProfileData.monthsLived}
                    onChange={(e) => setTempProfileData({...tempProfileData, monthsLived: e.target.value})}
                    placeholder="예: 24"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {profileData.monthsLived ? `${profileData.monthsLived}개월` : '설정되지 않음'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  역할
                </label>
                {isEditing ? (
                  <div className="relative">
                    <select
                      value={tempProfileData.role}
                      onChange={(e) => setTempProfileData({...tempProfileData, role: e.target.value})}
                      className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-pointer"
                    >
                      <option value="tenant">임차인 (세입자)</option>
                      <option value="landlord">임대인 (집주인)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <i className="ri-arrow-down-s-line text-gray-400"></i>
                    </div>
                  </div>
                ) : (
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {profileData.role === 'tenant' ? '임차인 (세입자)' : '임대인 (집주인)'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  건물 유형
                </label>
                {isEditing ? (
                  <div className="relative">
                    <select
                      value={tempProfileData.buildingType}
                      onChange={(e) => setTempProfileData({...tempProfileData, buildingType: e.target.value})}
                      className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-pointer"
                    >
                      <option value="">선택하세요</option>
                      <option value="아파트">아파트</option>
                      <option value="빌라">빌라</option>
                      <option value="연립">연립</option>
                      <option value="원룸">원룸</option>
                      <option value="투룸">투룸</option>
                      <option value="오피스텔">오피스텔</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <i className="ri-arrow-down-s-line text-gray-400"></i>
                    </div>
                  </div>
                ) : (
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {profileData.buildingType || '설정되지 않음'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  계약 유형
                </label>
                {isEditing ? (
                  <div className="relative">
                    <select
                      value={tempProfileData.contractType}
                      onChange={(e) => setTempProfileData({...tempProfileData, contractType: e.target.value})}
                      className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm cursor-pointer"
                    >
                      <option value="">선택하세요</option>
                      <option value="월세">월세</option>
                      <option value="전세">전세</option>
                      <option value="반전세">반전세</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <i className="ri-arrow-down-s-line text-gray-400"></i>
                    </div>
                  </div>
                ) : (
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {profileData.contractType || '설정되지 않음'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  보증금 (만원)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={tempProfileData.security}
                    onChange={(e) => setTempProfileData({...tempProfileData, security: e.target.value})}
                    placeholder="예: 1000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {profileData.security ? `${profileData.security}만원` : '설정되지 않음'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  월세 (만원)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={tempProfileData.rent}
                    onChange={(e) => setTempProfileData({...tempProfileData, rent: e.target.value})}
                    placeholder="예: 60"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {profileData.rent ? `${profileData.rent}만원` : '설정되지 않음'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  관리비 (만원)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={tempProfileData.maintenanceFee}
                    onChange={(e) => setTempProfileData({...tempProfileData, maintenanceFee: e.target.value})}
                    placeholder="예: 10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                ) : (
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {profileData.maintenanceFee ? `${profileData.maintenanceFee}만원` : '설정되지 않음'}
                  </div>
                )}
              </div>
            </div>

            {/* 진단 정보 섹션 */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h4 className="text-xl font-bold text-gray-900 mb-4">진단 정보</h4>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    진단 완료 여부
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {profileData.diagnosisCompleted ? (
                      <div className="flex items-center text-green-600">
                        <i className="ri-check-circle-fill mr-2"></i>
                        완료됨
                      </div>
                    ) : (
                      <div className="flex items-center text-orange-600">
                        <i className="ri-time-line mr-2"></i>
                        미완료
                      </div>
                    )}
                  </div>
                </div>

                {profileData.diagnosisCompleted && (
                  <>
                    {profileData.diagnosisScore && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          진단 점수
                        </label>
                        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                          {profileData.diagnosisScore}점
                        </div>
                      </div>
                    )}
                    
                    {profileData.lastDiagnosisDate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          마지막 진단일
                        </label>
                        <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                          {new Date(profileData.lastDiagnosisDate).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {!profileData.diagnosisCompleted && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-blue-800">
                    <i className="ri-information-line mr-2"></i>
                    <span className="text-sm font-medium">아직 진단을 완료하지 않으셨습니다.</span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    정확한 분석을 위해 진단을 완료해주세요.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h4 className="text-xl font-bold text-gray-900 mb-4">바로가기</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/dashboard">
                  <div className="bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition-colors cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <i className="ri-dashboard-line text-blue-600"></i>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">대시보드</h5>
                        <p className="text-sm text-gray-600">리포트 및 분석</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/diagnosis">
                  <div className="bg-green-50 rounded-lg p-4 hover:bg-green-100 transition-colors cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <i className="ri-stethoscope-line text-green-600"></i>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">진단하기</h5>
                        <p className="text-sm text-gray-600">우리 집 상태 점검</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/weekly-mission">
                  <div className="bg-purple-50 rounded-lg p-4 hover:bg-purple-100 transition-colors cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <i className="ri-task-line text-purple-600"></i>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">주간 미션</h5>
                        <p className="text-sm text-gray-600">이웃과 함께 참여</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Account Actions */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h4 className="text-xl font-bold text-gray-900 mb-4">계정 관리</h4>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleLogout}
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <div className="flex items-center justify-center">
                    <i className="ri-logout-circle-line mr-2"></i>
                    로그아웃
                  </div>
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <div className="flex items-center justify-center">
                    <i className="ri-delete-bin-line mr-2"></i>
                    계정 삭제
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 뒤로가기 버튼 */}
        <div className="mt-8 text-center">
          <Link href="/">
            <button className="bg-gray-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap">
              <div className="flex items-center">
                <i className="ri-arrow-left-line mr-2"></i>
                메인으로 돌아가기
              </div>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}