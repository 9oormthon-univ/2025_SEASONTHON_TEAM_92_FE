
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
    }
    
    // Check if user just completed onboarding
    const onboardingCompleted = localStorage.getItem('onboarding_completed');
    if (onboardingCompleted === 'true') {
      setShowDiagnosisPrompt(true);
      localStorage.removeItem('onboarding_completed');
    }
    
    // Check if user just completed diagnosis
    const diagnosisCompleted = localStorage.getItem('diagnosis_completed');
    if (diagnosisCompleted === 'true') {
      setShowWeeklyMissionPrompt(true);
      localStorage.removeItem('diagnosis_completed');
    }

    // Check if user just logged in - show surprise weekly mission immediately
    const justLoggedIn = localStorage.getItem('just_logged_in');
    if (justLoggedIn === 'true') {
      setShowSurpriseWeeklyMission(true);
      localStorage.removeItem('just_logged_in');  
    }

    // Close user menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const userMenuElement = document.getElementById('user-menu');
      if (userMenuElement && !userMenuElement.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [lastScrollY]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
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

  // 빠른 페이지 이동을 위한 프리로드 함수
  const handleLoginClick = () => {
    try {
      router.push('/auth/login');
    } catch (error) {
      console.error('Navigation error:', error);
      // 페이지 새로고침으로 강제 이동
      window.location.href = '/auth/login';
    }
  };

  const handleRegisterClick = () => {
    try {
      router.push('/auth/register');
    } catch (error) {
      console.error('Navigation error:', error);
      // 페이지 새로고침으로 강제 이동
      window.location.href = '/auth/register';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav 
        className={`fixed w-full z-40 transition-all duration-300 ease-in-out ${
          isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        } ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={scrollToTop}>
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                  <i className="ri-home-heart-line text-white text-sm"></i>
                </div>
                <h1 className={`text-xl font-bold transition-colors ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                  월세의 정석
                </h1>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className={`font-medium transition-colors cursor-pointer hover:opacity-80 ${isScrolled ? 'text-gray-700' : 'text-white'}`}
              >
                기능
              </a>
              <div className={`w-px h-4 ${isScrolled ? 'bg-gray-300' : 'bg-white bg-opacity-50'}`}></div>
              <a
                href="#usage"
                className={`font-medium transition-colors cursor-pointer hover:opacity-80 ${isScrolled ? 'text-gray-700' : 'text-white'}`}
              >
                사용법
              </a>
            </div>
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <div className="relative" id="user-menu">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all cursor-pointer hover:opacity-80 bg-blue-50"
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-600">
                        <span className="text-white text-sm font-bold">
                          {userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-blue-800">
                        {userName}님
                      </span>
                      <i className={`ri-arrow-down-s-line ${showUserMenu ? 'rotate-180' : ''} transition-transform text-blue-800`}></i>
                    </button>

                    {/* User Dropdown Menu */}
                    {showUserMenu && (
                      <div className="absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg border border-blue-200 p-2 z-50 bg-white">
                        <Link 
                          href="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center px-4 py-2 rounded-lg hover:bg-blue-50 cursor-pointer text-gray-700"
                        >
                          <i className="ri-user-line mr-2"></i>
                          내 프로필
                        </Link>
                        <div className="border-t my-2 border-gray-200"></div>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 rounded-lg hover:bg-red-50 cursor-pointer text-red-600"
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
                    className={`px-4 py-2 font-medium rounded-lg transition-all cursor-pointer hover:opacity-80 ${isScrolled ? 'text-gray-700' : 'text-white'}`}
                  >
                    로그인
                  </Link>
                  <div className={`w-px h-4 ${isScrolled ? 'bg-gray-300' : 'bg-white bg-opacity-50'}`}></div>
                  <Link
                    href="/auth/register"
                    className="px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-all whitespace-nowrap cursor-pointer bg-blue-600 text-white"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Diagnosis Prompt Modal */}
      {showDiagnosisPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-home-heart-line text-3xl text-blue-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                환영합니다! 🎉
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                가입을 완료하셨네요! 이제 <strong>우리 집 종합 진단</strong>을 통해 
                이웃들과 비교한 결과를 바로 확인해보세요.
              </p>
              
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <div className="flex items-center text-blue-800 text-sm">
                  <i className="ri-time-line mr-2"></i>
                  <span>약 5분 소요</span>
                </div>
                <div className="flex items-center text-blue-800 text-sm mt-1">
                  <i className="ri-bar-chart-line mr-2"></i>
                  <span>즉시 이웃 비교 결과 제공</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleStartDiagnosis}
                  className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  지금 바로 진단 시작하기
                </button>
                <button
                  onClick={handleSkipDiagnosis}
                  className="w-full bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
                >
                  나중에 하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Mission Prompt Modal */}
      {showWeeklyMissionPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-task-line text-3xl text-green-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                진단 완료! 🎉
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                이제 <strong>주간 미션</strong>에 참여해서 이웃들과 함께 
                거주 환경을 개선해보세요!
              </p>
              
              <div className="bg-green-50 rounded-xl p-4 mb-6">
                <div className="flex items-center text-green-800 text-sm">
                  <i className="ri-group-line mr-2"></i>
                  <span>이웃들과 함께 참여</span>
                </div>
                <div className="flex items-center text-green-800 text-sm mt-1">
                  <i className="ri-trophy-line mr-2"></i>
                  <span>주간 리워드 획득 기회</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleStartWeeklyMission}
                  className="w-full bg-green-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  주간 미션 참여하기
                </button>
                <button
                  onClick={handleSkipWeeklyMission}
                  className="w-full bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
                >
                  나중에 하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Surprise Weekly Mission Modal */}
      {showSurpriseWeeklyMission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
            <div className="text-center">
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                <i className="ri-gift-line text-white text-xl"></i>
              </div>
              
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-flashlight-line text-4xl text-white"></i>
              </div>
              
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4 mb-4">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                  🎉 이번 주 특별 미션! 🎉
                </h3>
                <div className="text-sm font-medium text-green-800">
                  주간 거주환경 개선 프로젝트
                </div>
              </div>
              
              <div className="text-left mb-6">
                <div className="bg-white border-2 border-green-200 rounded-xl p-5 mb-4">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <i className="ri-volume-down-line text-green-600 text-lg"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">이번 주 테마</h4>
                      <p className="text-sm text-green-600">방음 상태 점검</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center">
                      <i className="ri-check-line text-green-500 mr-2"></i>
                      <span>참여 시간: 단 2분</span>
                    </div>
                    <div className="flex items-center">
                      <i className="ri-gift-line text-yellow-500 mr-2"></i>
                      <span>즉시 보상: 우리 건물 vs 동네 비교 분석</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center text-green-800 text-sm">
                    <i className="ri-lightbulb-line mr-2"></i>
                    <span className="font-medium">
                      "우리 건물은 동네 평균보다 옆집 소음이 2배 더 많이 들린다!" - 이런 실용적인 분석을 바로 확인하세요!
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleStartSurpriseWeeklyMission}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all cursor-pointer whitespace-nowrap shadow-lg"
                >
                  <div className="flex items-center justify-center">
                    <i className="ri-rocket-line mr-2"></i>
                    지금 바로 미션 참여하기
                  </div>
                </button>
                <button
                  onClick={handleSkipSurpriseWeeklyMission}
                  className="w-full bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
                >
                  다음에 참여할게요
                </button>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                ⏰ 이번 주 미션은 일요일까지 참여 가능합니다
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="min-h-screen flex items-center bg-gradient-to-br from-gray-800 to-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-left">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight text-white">
                공정한 <span className="text-blue-400">월세</span>,
                <br />
                함께 만들어요
              </h1>
              <p className="text-xl mb-8 leading-relaxed text-gray-300">
                AI 분석과 그룹 협상으로 합리적인 월세를 만들어가는
                <br />
                20대를 위한 스마트한 월세 협상 플랫폼
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {!isLoggedIn ? (
                  <>
                    <Link
                      href="/auth/register"
                      className="px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-all whitespace-nowrap cursor-pointer text-center bg-white text-gray-800"
                    >
                      등록하기
                    </Link>
                    <Link
                      href="/diagnosis"
                      className="border-2 border-white/50 px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-80 transition-all whitespace-nowrap cursor-pointer text-center text-white"
                    >
                      무료 진단 받기
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard"
                      className="px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-90 transition-all whitespace-nowrap cursor-pointer text-center bg-white text-gray-800"
                    >
                      리포트 생성하기
                    </Link>
                    <Link
                      href="/diagnosis"
                      className="border-2 border-white/50 px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-80 transition-all whitespace-nowrap cursor-pointer text-center text-white"
                    >
                      진단 다시 받기
                    </Link>
                  </>
                )}
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="relative">
                <img
                  src="https://readdy.ai/api/search-image?query=modern%20clean%20website%20interface%20mockup%20on%20laptop%20screen%20showing%20rental%20price%20analysis%20dashboard%20with%20gray%20and%20white%20color%2C%20professional%20minimal%20design%2C%20realistic%20device%20mockup%20against%20dark%20background&width=600&height=400&seq=rental-website-mockup-gray&orientation=landscape"
                  alt="월세 공동협약 네트워크 웹사이트"
                  className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t rounded-2xl" style={{ background: 'linear-gradient(to top, rgba(254,237,159,0.1), transparent)' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 로그인 사용자를 위한 협상 리포트 섹션 */}
      {isLoggedIn && (
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-file-text-line text-3xl text-white"></i>
              </div>
              
              <h2 className="text-3xl font-bold mb-4 text-gray-900">
                맞춤형 협상 리포트 생성
              </h2>
              <p className="text-lg mb-8 text-gray-600">
                수집된 데이터를 바탕으로 임대인과의 협상에 필요한<br />
                실질적인 자료를 생성해보세요
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-blue-100">
                    <i className="ri-bar-chart-line text-xl text-blue-600"></i>
                  </div>
                  <h3 className="font-bold mb-2 text-gray-900">데이터 분석</h3>
                  <p className="text-sm text-gray-600">이웃들과 비교한 상세 데이터</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="ri-lightbulb-line text-xl text-green-600"></i>
                  </div>
                  <h3 className="font-bold mb-2 text-gray-900">전략 제안</h3>
                  <p className="text-sm text-gray-600">구체적인 협상 전략 가이드</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="ri-share-line text-xl text-orange-600"></i>
                  </div>
                  <h3 className="font-bold mb-2 text-gray-900">간편 공유</h3>
                  <p className="text-sm text-gray-600">임대인에게 바로 전달</p>
                </div>
              </div>

              <Link
                href="/dashboard"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl text-lg font-bold hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer inline-block whitespace-nowrap shadow-lg"
              >
                <div className="flex items-center">
                  <i className="ri-rocket-line mr-3"></i>
                  협상 리포트 바로 생성하기
                </div>
              </Link>
              
              <div className="mt-4 text-sm text-gray-500">
                진단 데이터를 바탕으로 맞춤형 협상 자료를 생성합니다
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Start Section for New Users */}
      {!isLoggedIn && (
        <section className="py-16 bg-blue-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              지금 바로 시작해보세요
            </h2>
            <p className="text-lg mb-8 text-gray-600">
              3분만에 우리 집 거주 환경을 진단하고 이웃들과 비교해보세요
            </p>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-blue-100">
                    <i className="ri-user-add-line text-xl text-blue-600"></i>
                  </div>
                  <h3 className="font-bold mb-2 text-gray-900">1. 간편 가입</h3>
                  <p className="text-sm text-gray-600">위치 인증과 기본 정보만 입력</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-questionnaire-line text-xl text-blue-600"></i>
                  </div>
                  <h3 className="font-bold mb-2 text-gray-900">2. 환경 진단</h3>
                  <p className="text-sm text-gray-600">10개 카테고리 간단 평가</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-bar-chart-line text-xl text-blue-600"></i>
                  </div>
                  <h3 className="font-bold mb-2 text-gray-900">3. 즉시 결과</h3>
                  <p className="text-sm text-gray-600">이웃들과 비교 분석 결과</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all cursor-pointer text-center whitespace-nowrap"
              >
                가입하고 진단받기
              </Link>
              <Link
                href="/diagnosis"
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all cursor-pointer text-center whitespace-nowrap"
              >
                진단만 먼저 해보기
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              주요 기능
            </h2>
            <p className="text-xl max-w-3xl mx-auto text-gray-600">
              데이터 기반 분석과 협력을 통해 공정한 월세를 만들어갑니다
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 bg-blue-100">
                <i className="ri-bar-chart-line text-2xl text-blue-600"></i>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                데이터 분석
              </h3>
              <p className="leading-relaxed text-gray-600">
                주변 시세와 건물 정보를 종합적으로 분석하여 적정 월세를 제시합니다
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <i className="ri-team-line text-2xl text-gray-700"></i>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                그룹 협상
              </h3>
              <p className="leading-relaxed text-gray-600">
                같은 건물 거주자들과 함께 협상하여 더 나은 조건을 만들어갑니다
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                <i className="ri-file-text-line text-2xl text-gray-700"></i>
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">
                서류 지원
              </h3>
              <p className="leading-relaxed text-gray-600">
                협상에 필요한 각종 서류와 템플릿을 자동으로 생성해드립니다
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Usage Section */}
      <section id="usage" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              사용법
            </h2>
            <p className="text-xl text-gray-600">
              간단한 3단계로 월세 협상을 시작하세요
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">정보 입력</h3>
              <p className="text-gray-600">
                현재 거주 중인 건물과 월세 정보를 입력합니다
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">분석 결과</h3>
              <p className="text-gray-600">
                AI가 시장 데이터를 분석하여 적정 월세를 제시합니다
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">협상 진행</h3>
              <p className="text-gray-600">
                제공된 자료를 바탕으로 집주인과 협상을 진행합니다
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              후기
            </h2>
            <p className="text-xl text-gray-600">
              실제 사용자들의 성공 사례를 확인해보세요
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  김
                </div>  
                <div>
                  <div className="font-bold text-gray-900">김지원님</div>
                  <div className="text-gray-600 text-sm">강남구</div>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "데이터 분석 결과를 바탕으로 협상했더니 월세를 25만원이나 줄일 수 있었어요!"
              </p>
              <div className="text-green-600 font-bold">월 25만원 절약</div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  박
                </div>
                <div>
                  <div className="font-bold text-gray-900">박민수님</div>
                  <div className="text-gray-600 text-sm">마포구</div>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "같은 건물 주민들과 함께 그룹 협상을 진행해서 더 좋은 결과를 얻었습니다."
              </p>
              <div className="text-green-600 font-bold">월 18만원 절약</div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  이
                </div>
                <div>
                  <div className="font-bold text-gray-900">이서연님</div>
                  <div className="text-gray-600 text-sm">송파구</div>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                "처음엔 어려워 보였지만 단계별 가이드 덕분에 쉽게 협상할 수 있었어요."
              </p>
              <div className="text-green-600 font-bold">월 32만원 절약</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            공정한 월세를 위한 첫걸음을 내딛어보세요
          </p>
          {!isLoggedIn ? (
            <Link
              href="/auth/register"
              className="bg-white text-gray-800 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all cursor-pointer inline-block"
            >
              무료로 시작하기
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="bg-white text-gray-800 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all cursor-pointer inline-block"
            >
              리포트 생성하기
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                  <i className="ri-home-heart-line text-white text-sm"></i>
                </div>
                <h3 className="text-xl font-bold">월세의 정석</h3>
              </div>
              <p className="text-gray-400 mb-6">
                공정한 월세를 위한 스마트한 협상 플랫폼
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">서비스</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">데이터 분석</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">그룹 협상</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">서류 지원</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">고객지원</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">문의하기</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">이용약관</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400">&copy; 2024 월세의 정석. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">개인정보처리방침</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors cursor-pointer">서비스 이용약관</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
