'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../lib/api'; // authApi import

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
      setIsScrolled(currentScrollY > 50);
      if (currentScrollY < 100) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);

    const fetchAndSetUserData = async () => {
      if (loggedIn) {
        const userEmail = localStorage.getItem('userEmail') || '';
        const nickname = localStorage.getItem('userNickname');
        setUserName(nickname || userEmail.split('@')[0]);

        try {
          const profile = await authApi.getCurrentUser();
          
          const onboardingCompleted = localStorage.getItem('onboarding_completed');
          if (onboardingCompleted === 'true' && !profile.diagnosisCompleted) {
            setShowDiagnosisPrompt(true);
            localStorage.removeItem('onboarding_completed');
          }

          const diagnosisCompleted = localStorage.getItem('diagnosis_completed');
          if (diagnosisCompleted === 'true') {
            setShowWeeklyMissionPrompt(true);
            localStorage.removeItem('diagnosis_completed');
          }

          const justLoggedIn = localStorage.getItem('just_logged_in');
          if (justLoggedIn === 'true') {
            setShowSurpriseWeeklyMission(true);
            localStorage.removeItem('just_logged_in');
          }

        } catch (error) {
          console.error("Failed to fetch user profile for modal logic:", error);
        }
      }
    };

    fetchAndSetUserData();

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userNickname');
    setIsLoggedIn(false);
    setUserName('');
    setShowUserMenu(false);
    router.push('/');
  };

  // ... (rest of the handler functions are the same)
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
      {/* Navigation */}
      <nav 
        className={`fixed w-full z-40 transition-all duration-300 ease-in-out ${
          isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        } ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex items-center space-x-4 cursor-pointer" onClick={scrollToTop}>
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                  <i className="ri-home-heart-line text-white text-lg"></i>
                </div>
                <h1 className={`text-3xl font-bold transition-colors ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                  월세의 정석
                </h1>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className={`text-lg font-semibold transition-colors cursor-pointer hover:opacity-80 ${isScrolled ? 'text-gray-700' : 'text-white'}`}
              >
                기능
              </a>
              <div className={`w-px h-5 ${isScrolled ? 'bg-gray-300' : 'bg-white bg-opacity-50'}`}></div>
              <a
                href="#usage"
                className={`text-lg font-semibold transition-colors cursor-pointer hover:opacity-80 ${isScrolled ? 'text-gray-700' : 'text-white'}`}
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
                        {userName} 님
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
                <Link
                  href="/auth/login"
                  className="px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-all whitespace-nowrap cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                >
                  시작하기
                </Link>
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
                🎉 환영합니다! 🎉
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                가입을 완료하셨네요!<br />
                이제 <strong>우리 집 종합 진단</strong>을 통해<br />
                이웃들과 비교한 결과를 바로 확인해보세요.
              </p>
              
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <div className="flex items-center text-blue-800 text-sm">
                  <i className="ri-time-line mr-2"></i>
                  <span>약 5분 소요</span>
                </div>
                <div className="text-blue-800 text-sm mt-1">
                  <div className="flex items-center mb-1">
                    <i className="ri-bar-chart-line mr-2"></i>
                    <span className="text-left">곧바로 확인하는 우리 집 결과</span>
                  </div>
                  <div className="flex items-center">
                    <i className="ri-bar-chart-line mr-2"></i>
                    <span className="text-left">우리 집 vs 이웃 결과 확인</span>
                  </div>
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
        {/* ... rest of the page is the same */}
      </section>
    </div>
  );
}