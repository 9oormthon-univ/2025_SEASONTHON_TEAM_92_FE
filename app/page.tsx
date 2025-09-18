'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, diagnosisApi } from '../lib/api';

export default function HomePage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showDiagnosisPrompt, setShowDiagnosisPrompt] = useState(false);
  const [showWeeklyMissionPrompt, setShowWeeklyMissionPrompt] = useState(false);
  const [showSurpriseWeeklyMission, setShowSurpriseWeeklyMission] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // 스크롤 이벤트 처리 (API 호출과 분리)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // 스크롤 상태 체크 (50px 이상 스크롤시 배경 변경)
      setIsScrolled(currentScrollY > 50);

      // 헤더 표시/숨김 로직
      if (currentScrollY < 100) {
        // 페이지 상단 근처에서는 항상 헤더 표시
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 200) {
        // 아래로 스크롤하고 200px 이상일 때 헤더 숨김
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // 위로 스크롤할 때 헤더 표시
        setIsHeaderVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // 사용자 메뉴 외부 클릭 이벤트 처리
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const userMenuElement = document.getElementById('user-menu');
      const mobileMenuElement = document.getElementById('mobile-menu');
      
      if (userMenuElement && !userMenuElement.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      
      if (mobileMenuElement && !mobileMenuElement.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 초기 로딩 시 한 번만 실행되는 사용자 데이터 로딩
  useEffect(() => {
    const initializeUserData = async () => {
      // Check login status
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const userEmail = localStorage.getItem('userEmail') || '';
      
      setIsLoggedIn(loggedIn);
      
      if (loggedIn && userEmail) {
        // Extract name from email or use nickname if available
        const nickname = localStorage.getItem('userNickname');
        if (nickname) {
          setUserName(nickname);
        } else {
          const emailName = userEmail.split('@')[0];
          setUserName(emailName);
        }

        try {
          // API로 사용자 프로필 정보 가져오기
          const profile = await authApi.getCurrentUser();
          console.log('사용자 프로필:', profile);
          
          // 백엔드에서 받은 실제 상태 정보로 모달 표시 결정
          if (profile && profile.data) {
            const userData = profile.data;
            
            // 1. 온보딩 완료 여부 체크
            if (!userData.onboardingCompleted) {
              // GPS 인증이 완료된 사용자는 온보딩을 건너뛰고 메인 페이지로
              if (userData.gpsVerified) {
                console.log('GPS 인증 완료된 사용자 - 온보딩 건너뛰기');
                // 백엔드에 온보딩 완료 상태 업데이트
                try {
                  await authApi.updateUserProfile({ onboardingCompleted: true });
                  console.log('온보딩 완료 상태 업데이트됨');
                } catch (error) {
                  console.error('온보딩 상태 업데이트 실패:', error);
                }
              } else {
                // 온보딩이 완료되지 않았다면 온보딩으로 리다이렉트
                router.push('/onboarding/location');
                return;
              }
            }
            
            // 2. 진단 완료 여부 체크 (localStorage 일시적 플래그도 함께 확인)
            const justCompletedDiagnosis = localStorage.getItem('diagnosis_completed') === 'true';
            if (justCompletedDiagnosis) {
              setShowWeeklyMissionPrompt(true);
              localStorage.removeItem('diagnosis_completed');
            } else if (!userData.diagnosisCompleted) {
              // 진단을 완료하지 않은 사용자에게 진단 프롬프트 표시 (단, 온보딩 직후가 아닌 경우)
              const justCompletedOnboarding = localStorage.getItem('onboarding_completed') === 'true';
              if (justCompletedOnboarding) {
                setShowDiagnosisPrompt(true);
                localStorage.removeItem('onboarding_completed');
              }
            }
            
            // 3. 로그인 직후 서프라이즈 미션 (진단 완료한 사용자에게만)
            const justLoggedIn = localStorage.getItem('just_logged_in');
            if (justLoggedIn === 'true' && userData.diagnosisCompleted) {
              setShowSurpriseWeeklyMission(true);
              localStorage.removeItem('just_logged_in');
            } else if (justLoggedIn === 'true') {
              // 진단 완료하지 않은 사용자는 just_logged_in 플래그만 제거
              localStorage.removeItem('just_logged_in');
            }
          }

        } catch (error) {
          console.error("Failed to fetch user profile for modal logic:", error);
        }
      }
    };

    // 컴포넌트 마운트 시 한 번만 실행
    initializeUserData();
  }, []); // 빈 의존성 배열로 한 번만 실행

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userNickname');
    setIsLoggedIn(false);
    setUserName('');
    setShowUserMenu(false);
  };

  const handleStartDiagnosis = () => {
    setShowDiagnosisPrompt(false);
    router.push('/diagnosis');
  };

  const handleSkipDiagnosis = () => {
    setShowDiagnosisPrompt(false);
  };

  const handleStartWeeklyMission = () => {
    setShowWeeklyMissionPrompt(false);
    router.push('/weekly-mission');
  };

  const handleSkipWeeklyMission = () => {
    setShowWeeklyMissionPrompt(false);
  };

  const handleStartSurpriseWeeklyMission = () => {
    setShowSurpriseWeeklyMission(false);
    router.push('/weekly-mission');
  };

  const handleSkipSurpriseWeeklyMission = () => {
    setShowSurpriseWeeklyMission(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Weekly Mission Popup - 로그인 직후 표시 */}
      {showSurpriseWeeklyMission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-mx-4 p-0 text-center overflow-hidden">
            {/* 연한 보라색 배경 헤더 */}
            <div className="bg-[#F3E8FF] px-6 pt-8 pb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#9333EA]">
                <i className="ri-flashlight-line text-3xl text-white"></i>
              </div>
              <h2 className="text-xl font-bold mb-1 text-black">🎉 이번 주 특별 미션! 🎉</h2>
              <p className="text-sm text-black font-medium">주간 거주환경 개선 프로젝트</p>
            </div>

            <div className="px-6 pb-6">
              {/* 미션 카드 */}
              <div className="bg-white border-2 border-[#9333EA] rounded-xl p-4 mb-4 -mt-2">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 flex items-center justify-center mr-3">
                    <i className="ri-volume-down-line text-2xl text-[#9333EA]"></i>
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-black">이번 주 테마</h3>
                    <p className="text-sm text-black">방음 상태 점검</p>
                  </div>
                </div>

                <div className="text-xs text-left space-y-1 text-black">
                  <div className="flex items-center">
                    <i className="ri-time-line mr-2 text-[#9333EA]"></i>
                    <span>참여 시간: 단 2분<br />즉시 보상: 우리 건물 vs 동네 비교 분석</span>
                  </div>
                </div>
              </div>

              {/* 즉시 보상 설명 */}
              <div className="bg-[#F3E8FF] rounded-lg p-4 mb-6">
                <p className="text-sm text-black font-medium">
                  "우리 건물은 동네 평균보다 옆집 소음이 2배 더 많이 들린다!"<br />
                  -이런 실용적인 분석을 바로 확인하세요!
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleStartSurpriseWeeklyMission}
                  className="w-full px-6 py-3 rounded-lg font-medium hover:bg-[#7C3AED] transition-colors cursor-pointer whitespace-nowrap bg-[#9333EA] text-white"
                >
                  <i className="ri-calendar-check-line mr-2"></i>
                  지금 바로 미션 참여하기
                </button>
                <button
                  onClick={handleSkipSurpriseWeeklyMission}
                  className="w-full px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors cursor-pointer text-gray-600 border border-gray-300"
                >
                  다음에 참여할게요
                </button>
              </div>

              <div className="mt-4 text-xs text-black">
                <i className="ri-group-line mr-1"></i>
                이번 주 미션는 참여하지 않으셔도 기능 이용에 지장이 없습니다
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diagnosis Prompt Popup */}
      {showDiagnosisPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-mx-4 p-8 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-[#9333EA]">
              <i className="ri-home-heart-line text-3xl text-white"></i>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-black">환영합니다! 🎉</h2>
            <p className="text-black mb-6 leading-relaxed">
              가입을 완료하셨네요! 이제 <span className="font-semibold text-[#9333EA]">우리 집 종합 진단</span>을 통해<br />
              이웃들과 비교한 결과를 바로 확인해보세요.
            </p>
            <div className="bg-[#F3E8FF] rounded-lg p-4 mb-6 text-left">
              <div className="flex items-center mb-2">
                <i className="ri-time-line mr-2 text-[#9333EA]"></i>
                <span className="text-sm text-[#9333EA] font-medium">약 3분 소요</span>
              </div>
              <div className="flex items-center">
                <i className="ri-bar-chart-line mr-2 text-[#9333EA]"></i>
                <span className="text-sm text-[#9333EA] font-medium">바로 이웃과의 비교 결과 확인</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSkipDiagnosis}
                className="flex-1 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors cursor-pointer text-gray-600 border border-gray-300"
              >
                나중에 하기
              </button>
              <button
                onClick={handleStartDiagnosis}
                className="flex-1 px-6 py-3 rounded-lg font-medium hover:bg-[#7C3AED] transition-colors cursor-pointer whitespace-nowrap bg-[#9333EA] text-white"
              >
                지금 바로 진단 시작하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Mission Prompt Popup - 진단 완료 후 표시 */}
      {showWeeklyMissionPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-mx-4 p-8 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-[#9333EA]">
              <i className="ri-trophy-line text-3xl text-white"></i>
            </div>
            <h2 className="text-2xl font-bold mb-4 text-black">🎯 주간 미션 도전!</h2>
            <p className="text-black mb-6 leading-relaxed">
              진단이 완료되었습니다!<br />
              이제 주간 미션에 참여해보세요
            </p>
            <div className="bg-[#F0E1FD] rounded-lg p-4 mb-6">
              <p className="text-sm text-[#9333EA]">
                ✓ 이웃들과 함께 데이터 수집<br />
                ✓ 건물 환경 개선 기여<br />
                ✓ 포인트 및 보상 획득
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSkipWeeklyMission}
                className="flex-1 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors cursor-pointer text-gray-600 border border-gray-300"
              >
                나중에
              </button>
              <button
                onClick={handleStartWeeklyMission}
                className="flex-1 px-6 py-3 rounded-lg font-medium hover:bg-[#7C3AED] transition-colors cursor-pointer whitespace-nowrap bg-[#9333EA] text-white"
              >
                미션 참여하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav
        className={`fixed w-full z-40 transition-all duration-300 ease-in-out bg-white ${
          isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={scrollToTop}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#9333EA]">
                  <i className="ri-home-line text-white text-xl"></i>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 font-display whitespace-nowrap">
                  월세의 정석
                </h1>
              </div>
            </div>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="font-medium transition-colors cursor-pointer hover:text-[#9333EA] text-gray-700"
              >
                기능
              </a>
              <div className="w-px h-4 bg-[#9333EA]"></div>
              <Link
                href="/diagnosis"
                className="font-medium transition-colors cursor-pointer hover:text-[#9333EA] text-gray-700"
              >
                스마트 진단
              </Link>
              <div className="w-px h-4 bg-[#9333EA]"></div>
              <a
                href="#usage"
                className="font-medium transition-colors cursor-pointer hover:text-[#9333EA] text-gray-700"
              >
                사용법
              </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-3 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="메뉴 열기"
              >
                <i className={`ri-menu-line text-2xl text-gray-700 ${showMobileMenu ? 'hidden' : 'block'}`}></i>
                <i className={`ri-close-line text-2xl text-gray-700 ${showMobileMenu ? 'block' : 'hidden'}`}></i>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <div className="relative" id="user-menu">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg transition-all cursor-pointer hover:opacity-80 bg-[#9333EA]"
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white">
                        <span className="text-[#9333EA] text-sm font-bold">
                          {userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span
                        className="font-medium text-white hidden sm:block"
                      >
                        {userName.length > 6 ? `${userName.substring(0, 6)}...` : userName} 님
                      </span>
                      <span
                        className="font-medium text-white sm:hidden"
                      >
                        {userName.charAt(0).toUpperCase()}님
                      </span>
                      <i
                        className={`ri-arrow-down-s-line ${showUserMenu ? 'rotate-180' : ''} transition-transform text-white`}
                      ></i>
                    </button>

                    {/* User Dropdown Menu */}
                    {showUserMenu && (
                      <div className="absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg border border-gray-200 p-2 z-50 bg-white">
                        <Link
                          href="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-100 cursor-pointer text-gray-700"
                          style={{
                            fontFamily:
                              'Pretendard, -apple-system, BlinkMacSystemFile, system-ui, Roboto, "Helvetica Neue", "Segue UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segue UI Emoji", "Segue UI Symbol", sans-serif',
                          }}
                        >
                          <i className="ri-user-line mr-2"></i>
                          마이페이지
                        </Link>
                        <div className="border-t my-2 border-gray-200"></div>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 rounded-lg hover:bg-gray-100 cursor-pointer text-[#9333EA]"
                          style={{
                            fontFamily:
                              'Pretendard, -apple-system, BlinkMacSystemFile, system-ui, Roboto, "Helvetica Neue", "Segue UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segue UI Emoji", "Segue UI Symbol", sans-serif',
                          }}
                        >
                          <i className="ri-logout-circle-line mr-2"></i>
                          로그아웃
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 font-medium rounded-lg transition-all cursor-pointer hover:text-[#9333EA] text-gray-700"
                  >
                    로그인
                  </Link>
                  <div className="w-px h-4 bg-[#9333EA]"></div>
                  <Link
                    href="/auth/register"
                    className="px-6 py-2 rounded-lg font-medium hover:bg-[#7C3AED] transition-all whitespace-nowrap cursor-pointer bg-[#9333EA] text-white"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Header와 Main 사이 구분선 */}
        <div className="w-full h-px bg-[#9333EA]"></div>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg" id="mobile-menu">
            <div className="px-4 py-4 space-y-4">
              <a
                href="#features"
                onClick={() => setShowMobileMenu(false)}
                className="block py-4 px-4 rounded-lg font-medium transition-colors hover:bg-gray-100 text-gray-700 min-h-[44px] flex items-center"
              >
                기능
              </a>
              <Link
                href="/diagnosis"
                onClick={() => setShowMobileMenu(false)}
                className="block py-4 px-4 rounded-lg font-medium transition-colors hover:bg-gray-100 text-gray-700 min-h-[44px] flex items-center"
              >
                스마트 진단
              </Link>
              <a
                href="#usage"
                onClick={() => setShowMobileMenu(false)}
                className="block py-4 px-4 rounded-lg font-medium transition-colors hover:bg-gray-100 text-gray-700 min-h-[44px] flex items-center"
              >
                사용법
              </a>
              
              {/* Mobile Auth Buttons */}
              {!isLoggedIn && (
                <>
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <Link
                      href="/auth/login"
                      onClick={() => setShowMobileMenu(false)}
                      className="block py-4 px-4 rounded-lg font-medium transition-colors hover:bg-gray-100 text-gray-700 mb-2 min-h-[44px] flex items-center"
                    >
                      로그인
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setShowMobileMenu(false)}
                      className="block py-4 px-4 rounded-lg font-medium transition-colors bg-[#9333EA] text-white text-center min-h-[44px] flex items-center justify-center"
                    >
                      회원가입
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center bg-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-8 bg-purple-50 text-[#9333EA] border border-purple-200">
                <i className="ri-shield-check-line mr-2 text-[#9333EA]"></i>
                <span
                  style={{
                    fontFamily:
                      'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segue UI Emoji", "Segue UI Symbol", sans-serif',
                  }}
                >
                  데이터 기반 월세 협상 플랫폼
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-6 md:mb-10 leading-tight md:leading-[1.8] text-gray-900 font-display">
                혹시 나만<br />
                <span className="text-[#9333EA]">월세를 비싸게</span><br />
                내고 있나요?
              </h1>

              <p className="text-lg sm:text-xl mb-8 md:mb-12 leading-relaxed text-gray-600">
                AI 분석과 그룹 협상으로 합리적인 월세를 만들어가는<br className="hidden sm:block" />
                <span className="font-semibold text-[#9333EA]">20대를 위한 스마트한 월세 협상 플랫폼</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-6 mb-12">
                {!isLoggedIn ? (
                  <>
                    <Link
                      href="/auth/register"
                      className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-[#7C3AED] transition-all whitespace-nowrap cursor-pointer text-center bg-[#9333EA] text-white shadow-lg"
                      style={{
                        fontFamily:
                          'Pretendard, -apple-system, BlinkMacSystemFile, system-ui, Roboto, "Helvetica Neue", "Segue UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segue UI Emoji", "Segue UI Symbol", sans-serif',
                      }}
                    >
                      <div className="flex items-center justify-center">등록하기</div>
                    </Link>
                    <Link
                      href="/diagnosis"
                      className="border-2 border-[#9333EA] px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-purple-50 transition-all whitespace-nowrap cursor-pointer text-[#9333EA]"
                      style={{
                        fontFamily:
                          'Pretendard, -apple-system, BlinkMacSystemFile, system-ui, Roboto, "Helvetica Neue", "Segue UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segue UI Emoji", "Segue UI Symbol", sans-serif',
                      }}
                    >
                      <div className="flex items-center justify-center">무료 진단 받기</div>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/report"
                      className="px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[#7C3AED] transition-all whitespace-nowrap cursor-pointer text-center bg-[#9333EA] text-white shadow-lg"
                      style={{
                        fontFamily:
                          'Pretendard, -apple-system, BlinkMacSystemFile, system-ui, Roboto, "Helvetica Neue", "Segue UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segue UI Emoji", "Segue UI Symbol", sans-serif',
                      }}
                    >
                      <div className="flex items-center justify-center">
                        <i className="ri-file-text-line mr-2"></i>
                        리포트 생성하기
                      </div>
                    </Link>
                    <Link
                      href="/diagnosis"
                      className="border-2 border-[#9333EA] px-8 py-4 rounded-xl text-lg font-semibold hover:bg-purple-50 transition-all whitespace-nowrap cursor-pointer text-[#9333EA]"
                      style={{
                        fontFamily:
                          'Pretendard, -apple-system, BlinkMacSystemFile, system-ui, Roboto, "Helvetica Neue", "Segue UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segue UI Emoji", "Segue UI Symbol", sans-serif',
                      }}
                    >
                      <div className="flex items-center justify-center">
                        <i className="ri-refresh-line mr-2"></i>
                        진단 다시 받기
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* 캐릭터 이미지 - 반응형으로 표시 */}
            <div className="relative z-10 flex justify-center">
              <div className="relative flex items-center justify-center">
                {/* 첨부된 3D 집 캐릭터 이미지 */}
                <div className="relative">
                  <img
                    src="https://static.readdy.ai/image/2dfa5ef9c47e931f2509d723fd78fa10/ea608ef62217d53f35f9cb117a596557.png"
                    alt="월세 진단 캐릭터"
                    className="object-contain w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-none"
                    style={{ 
                      width: 'clamp(300px, 50vw, 800px)', 
                      height: 'clamp(300px, 50vw, 780px)' 
                    }}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 스크롤 유도 화살표 */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <button
            onClick={() => {
              const nextSection = document.querySelector('#features, section:nth-of-type(2)');
              if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="flex flex-col items-center text-[#9333EA] hover:text-[#7C3AED] transition-colors cursor-pointer group"
          >
            <div className="text-sm font-medium mb-2 opacity-80">더 많은 정보 보기</div>
            <div className="animate-bounce">
              <i className="ri-arrow-down-line text-2xl group-hover:scale-110 transition-transform"></i>
            </div>
          </button>
        </div>
      </section>

      {/* 로그인 사용자를 위한 협상 리포트 섹션 */}
      {isLoggedIn && (
        <section className="py-20 bg-[#9333EA]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-[#9333EA]">
                <i className="ri-file-text-line text-3xl text-white"></i>
              </div>

              <h2 className="text-3xl font-bold mb-4 text-black">맞춤형 협상 리포트 생성</h2>
              <p className="text-lg mb-8 text-black">
                수집된 데이터를 바탕으로 임대인과의 협상에 필요한
                <br />
                실질적인 자료를 생성해보세요
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#F0E1FD]">
                    <i className="ri-bar-chart-line text-xl text-[#9333EA]"></i>
                  </div>
                  <h3 className="font-bold mb-2 text-black">데이터 분석</h3>
                  <p className="text-sm text-black">이웃들과 비교한 상세 데이터</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#9333EA]">
                    <i className="ri-lightbulb-line text-xl text-white"></i>
                  </div>
                  <h3 className="font-bold mb-2 text-black">전략 제안</h3>
                  <p className="text-sm text-black">구체적인 협상 전략 가이드</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#61229A]">
                    <i className="ri-share-line text-xl text-white"></i>
                  </div>
                  <h3 className="font-bold mb-2 text-black">간편 공유</h3>
                  <p className="text-sm text-black">임대인에게 바로 전달</p>
                </div>
              </div>

              <Link
                href="/report"
                className="px-10 py-4 rounded-xl text-lg font-bold hover:opacity-90 transition-all cursor-pointer inline-block whitespace-nowrap shadow-lg bg-[#9333EA] text-white"
              >
                <div className="flex items-center">
                  <i className="ri-rocket-line mr-3"></i>
                  협상 리포트 바로 생성하기
                </div>
              </Link>

              <div className="mt-4 text-sm text-black">
                진단 데이터를 바탕으로 맞춤형 협상 자료를 생성합니다
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Start Section for New Users */}
      {!isLoggedIn && (
        <section className="py-16 bg-[#F0E1FD]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4 text-black">지금 바로 시작해보세요</h2>
            <p className="text-lg mb-8 text-black">
              3분만에 우리 집 거주 환경을 진단하고 이웃들과 비교해보세요
            </p>

            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#9333EA]">
                    <i className="ri-user-add-line text-xl text-white"></i>
                  </div>
                  <h3 className="font-bold mb-2 text-black">1. 간편 가입</h3>
                  <p className="text-sm text-black">위치 인증과 기본 정보만 입력</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#C99AF3]">
                    <i className="ri-questionnaire-line text-xl text-white"></i>
                  </div>
                  <h3 className="font-bold mb-2 text-black">2. 환경 진단</h3>
                  <p className="text-sm text-black">10개 카테고리 간단 평가</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#61229A]">
                    <i className="ri-bar-chart-line text-xl text-white"></i>
                  </div>
                  <h3 className="font-bold mb-2 text-black">3. 즉시 결과</h3>
                  <p className="text-sm text-black">이웃들과 비교 분석 결과</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Link
                href="/auth/register"
                className="px-8 py-4 rounded-xl font-semibold hover:bg-[#61229A] transition-all cursor-pointer text-center whitespace-nowrap bg-[#9333EA] text-white"
              >
                지금 시작하기
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-black">주요 기능</h2>
            <p className="text-xl max-w-3xl mx-auto text-black">
              데이터 기반 분석과 실시간 정보로 올바른 주거생활을 지원합니다
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 주간 미션 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F0E1FD] hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto bg-[#F0E1FD]">
                <i className="ri-trophy-line text-2xl text-[#C99AF3]"></i>
              </div>
              <h3 className="text-lg font-bold mb-2 text-center text-black">주간 미션</h3>
              <p className="text-sm text-center text-black leading-relaxed">
                매주 새로운 미션에 참여하여 건물 환경을 개선하고 포인트를 획득하세요
              </p>
              <div className="mt-4 text-center">
                <Link href="/weekly-mission" className="text-xs text-[#C99AF3] font-medium hover:opacity-80">
                  미션 참여하기 →
                </Link>
              </div>
            </div>

            {/* 건물 진단 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F0E1FD] hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto bg-[#F0E1FD]">
                <i className="ri-building-line text-2xl text-[#61229A]"></i>
              </div>
              <h3 className="text-lg font-bold mb-2 text-center text-black">건물 진단</h3>
              <p className="text-sm text-center text-black leading-relaxed">
                현재 거주하고 있는 건물의 상태를 체계적으로 진단하고 개선점을 찾아보세요
              </p>
              <div className="mt-4 text-center">
                <Link href="/diagnosis" className="text-xs text-[#61229A] font-medium hover:opacity-80">
                  진단 시작하기 →
                </Link>
              </div>
            </div>

            {/* 스마트 보조진단 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F0E1FD] hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto bg-[#F0E1FD]">
                <i className="ri-brain-line text-2xl text-[#9333EA]"></i>
              </div>
              <h3 className="text-lg font-bold mb-2 text-center text-black">스마트 보조진단</h3>
              <p className="text-sm text-center text-black leading-relaxed">
                AI가 복잡한 상황을 정확히 파악하고 맞춤형 협상 전략을 제공합니다
              </p>
              <div className="mt-4 text-center">
                <Link href="/report" className="text-xs text-[#9333EA] font-medium hover:opacity-80">
                  보조진단 시작하기 →
                </Link>
              </div>
            </div>

            {/* 리포트 생성 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#F0E1FD] hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto bg-[#F0E1FD]">
                <i className="ri-file-text-line text-2xl text-[#61229A]"></i>
              </div>
              <h3 className="text-lg font-bold mb-2 text-center text-black">리포트 생성</h3>
              <p className="text-sm text-center text-black leading-relaxed">
                진단 결과를 바탕으로 임대인과의 협상에 필요한 맞춤형 리포트를 생성합니다
              </p>
              <div className="mt-4 text-center">
                <Link href="/report" className="text-xs text-[#61229A] font-medium hover:opacity-80">
                  리포트 생성하기 →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-[#F0E1FD]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-black">실제 이용 후기</h2>
            <p className="text-xl text-black">월세의 정석으로 성공적인 협상을 경험한 이웃들의 이야기</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* 후기 1 */}
            <div className="bg-white rounded-2xl shadow-lg border border-[#C99AF3] p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#F0E1FD] rounded-full flex items-center justify-center mr-4">
                  <span className="text-[#9333EA] font-bold text-lg">김</span>
                </div>
                <div>
                  <h4 className="font-bold text-black">김○○님</h4>
                  <p className="text-sm text-black">강남구 역삼동 거주</p>
                </div>
              </div>
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i key={star} className="ri-star-fill text-[#C99AF3] text-lg"></i>
                ))}
                <span className="ml-2 text-sm text-black">5.0</span>
              </div>
              <p className="text-black leading-relaxed mb-4">
                "진단 결과를 보고 충격받았어요. 우리 건물 주차가 이렇게 나쁜 줄 몰랐거든요.
                데이터 자료로 집주인한테 협상했더니 월세 10만원 깎아주셨어요!"
              </p>
              <div className="text-sm text-black">
                <span className="bg-[#F0E1FD] px-3 py-1 rounded-full">월세 10만원 절약</span>
              </div>
            </div>

            {/* 후기 2 */}
            <div className="bg-white rounded-2xl shadow-lg border border-[#C99AF3] p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#F0E1FD] rounded-full flex items-center justify-center mr-4">
                  <span className="text-[#C99AF3] font-bold text-lg">박</span>
                </div>
                <div>
                  <h4 className="font-bold text-black">박○○님</h4>
                  <p className="text-sm text-black">마포구 홍대입구 거주</p>
                </div>
              </div>
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i key={star} className="ri-star-fill text-[#C99AF3] text-lg"></i>
                ))}
                <span className="ml-2 text-sm text-black">5.0</span>
              </div>
              <p className="text-black leading-relaxed mb-4">
                "주간 미션 참여하면서 우리 건물 이웃들과 소통하게 돼요.
                함께 관리비 문제도 해결하고, 진짜 커뮤니티가 생긴 느낌이에요."
              </p>
              <div className="text-sm text-black">
                <span className="bg-[#F0E1FD] px-3 py-1 rounded-full">이웃 커뮤니티 형성</span>
              </div>
            </div>

            {/* 후기 3 */}
            <div className="bg-white rounded-2xl shadow-lg border border-[#C99AF3] p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[#F0E1FD] rounded-full flex items-center justify-center mr-4">
                  <span className="text-[#61229A] font-bold text-lg">이</span>
                </div>
                <div>
                  <h4 className="font-bold text-black">이○○님</h4>
                  <p className="text-sm text-black">송파구 잠실동 거주</p>
                </div>
              </div>
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i key={star} className="ri-star-fill text-[#C99AF3] text-lg"></i>
                ))}
                <span className="ml-2 text-sm text-black">5.0</span>
              </div>
              <p className="text-black leading-relaxed mb-4">
                "AI 리포트가 정말 도움됐어요! 법적 근거까지 정리해줘서
                집주인이 수긍하고 보일러 교체해주셨어요. 이제 난방비 절반 줄었어요."
              </p>
              <div className="text-sm text-black">
                <span className="bg-[#F0E1FD] px-3 py-1 rounded-full">난방비 50% 절약</span>
              </div>
            </div>
          </div>

          {/* 통계 정보 */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#9333EA] mb-2">1,247</div>
              <div className="text-sm text-black">성공적인 협상</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#9333EA] mb-2">평균 8만원</div>
              <div className="text-sm text-black">월세 절약 금액</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#61229A] mb-2">96%</div>
              <div className="text-sm text-black">이용자 만족도</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#9333EA] mb-2">3,842</div>
              <div className="text-sm text-black">누적 진단 완료</div>
            </div>
          </div>
        </div>
      </section>

      {/* Usage Section */}
      <section id="usage" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-black">어떻게 작동하나요?</h2>
            <p className="text-xl text-black">
              복잡한 설명 대신, 간단한 3단계로 시작하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-6 bg-[#9333EA] text-white">
                1
              </div>
              <h3 className="text-xl font-bold mb-4 text-black">정보 입력</h3>
              <p className="text-black">
                3분만에 내 계약 정보와
                <br />
                거주 환경을 간단히 입력해요.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-6 bg-[#C99AF3] text-white">
                2
              </div>
              <h3 className="text-xl font-bold mb-4 text-black">데이터 분석</h3>
              <p className="text-black">
                내 데이터와 이웃, 공공 데이터를
                <br />
                실시간으로 비교 분석해요.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6 bg-[#61229A]">
                3
              </div>
              <h3 className="text-xl font-bold mb-4 text-black">리포트 확인</h3>
              <p className="text-black">
                월세 협상에 바로 활용할 수 있는
                <br />
                맞춤형 리포트를 받아요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-20 bg-[#F0E1FD]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-black leading-tight">
                깜깜이 월세 계약,
                <br />
                혼자서는 막막하셨죠?
              </h2>
              <p className="text-xl mb-8 text-black leading-relaxed">
                정보 비대칭으로 인한 불안감, 혼자서는 막막한 협상...
                <br />
                이런 문제들을 해결해드립니다.
              </p>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center mr-4 mt-1 bg-[#C99AF3]">
                    <i className="ri-close-line text-white text-sm"></i>
                  </div>
                  <span className="text-lg text-black">정보 부족으로 비싸게 월세를 내고 있나요?</span>
                </div>

                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center mr-4 mt-1 bg-[#C99AF3]">
                    <i className="ri-close-line text-white text-sm"></i>
                  </div>
                  <span className="text-lg text-black">혼자서는 협상이 어렵다고 느끼시나요?</span>
                </div>

                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center mr-4 mt-1 bg-[#C99AF3]">
                    <i className="ri-close-line text-white text-sm"></i>
                  </div>
                  <span className="text-lg text-black">객관적인 근거 없이 협상하고 계신가요?</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative max-w-md">
                <img
                  src="https://readdy.ai/api/search-image?query=professional%20real%20estate%20rental%20analysis%20dashboard%20showing%20detailed%20apartment%20market%20data%20with%20charts%20graphs%20and%20statistics%2C%20modern%20business%20person%20analyzing%20rental%20contracts%20with%20tablet%20and%20documents%2C%20sophisticated%20data%20visualization%20interface%20with%20purple%20gradient%20tones%2C%20clean%20minimal%20design%20highlighting%20rental%20market%20transparency%20and%20professional%20negotiation%20tools&width=500&height=400&seq=rental-analysis-professional-purple&orientation=portrait"
                  alt="데이터가 당신의 협상 무기가 됩니다"
                  className="w-full rounded-2xl shadow-lg object-cover object-top"
                />
                <div className="absolute top-4 right-4 bg-[#9333EA] rounded-lg px-4 py-2 shadow-md">
                  <div className="text-sm font-medium text-white">데이터가 당신의 협상 무기가 됩니다</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16" style={{ backgroundColor: '#6C369C' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#9333EA]">
                  <i className="ri-home-line text-white text-xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-white">월세의 정석</h3>
              </div>
              <p className="mb-6 text-[#C99AF3]">공정한 월세를 위한 스마트한 협상 플랫폼</p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-white">빠른 링크</h4>
              <ul className="space-y-2 text-[#C99AF3]">
                <li>
                  <a
                    href="https://readdy.ai/?origin=logo"
                    className="hover:opacity-80 transition-colors cursor-pointer"
                  >
                    Made with Readdy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#9333EA] pt-8 mt-8">
            <div className="flex justify-center">
              <p className="text-[#C99AF3]">&copy; 2025 월세의 정석. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}