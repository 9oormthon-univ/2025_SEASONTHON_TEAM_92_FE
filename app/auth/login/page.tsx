
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '../../../lib/api';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 입력 검증
    if (!formData.email || !formData.password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    if (formData.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authApi.login(formData);
      
      // 백엔드 응답 구조에 맞게 토큰 추출
      const token = (response as any)?.token;

      if (token) {
        // JWT 토큰을 localStorage에 저장
        localStorage.setItem('jwtToken', token);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', formData.email);
        localStorage.setItem('just_logged_in', 'true');
        
        // 온보딩 페이지로 이동
        router.push('/onboarding/location');
      } else {
        const errorMessage = (response as any)?.message || '로그인에 실패했습니다.';
        setError(errorMessage);
      }
      
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || '로그인 중 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Google OAuth 로그인으로 리다이렉트 (실제 구현에서는 카카오 대신 Google OAuth 사용)
      window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/oauth2/authorization/google`;
      
    } catch (err) {
      setError('소셜 로그인 중 오류가 발생했습니다.');
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
        <div className="flex bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[600px] w-full max-w-5xl">
          
          {/* Left Side - Welcome Section */}
          <div className="flex-1 p-12 flex flex-col justify-center relative"
               style={{background: 'linear-gradient(135deg, #A855F7 0%, #9333EA 100%)'}}>
            <div className="text-white">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-8">
                <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center">
                  <i className="ri-crown-fill text-purple-700 text-lg"></i>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold mb-6 leading-tight">
                월세의 정석
              </h1>
              
              <p className="text-white/90 text-xl leading-relaxed mb-8 max-w-md">
                AI 분석과 그룹 협상으로 합리적인 월세를 만들어가는<br />
                20대를 위한 스마트한 월세 협상 플랫폼
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center text-white/80">
                  <div className="w-5 h-5 flex items-center justify-center mr-3">
                    <i className="ri-check-line text-purple-200"></i>
                  </div>
                  <span>실거주자 기반 신뢰할 수 있는 데이터</span>
                </div>
                <div className="flex items-center text-white/80">
                  <div className="w-5 h-5 flex items-center justify-center mr-3">
                    <i className="ri-check-line text-purple-200"></i>
                  </div>
                  <span>동네별 맞춤 분석 리포트</span>
                </div>
                <div className="flex items-center text-white/80">
                  <div className="w-5 h-5 flex items-center justify-center mr-3">
                    <i className="ri-check-line text-purple-200"></i>
                  </div>
                  <span>주간 미션으로 더 나은 주거 환경</span>
                </div>
              </div>
            </div>
            
            {/* Decorative white cloud shapes on the left panel */}
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

          {/* Right Side - Log In Form */}
          <div className="flex-1 p-12 flex flex-col justify-center bg-white">
            <div className="max-w-sm w-full mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">LOG IN</h2>
                <p className="text-gray-600">계정에 로그인하여 서비스를 이용하세요</p>
              </div>
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700">
                    <div className="flex items-center">
                      <div className="w-5 h-5 flex items-center justify-center mr-2">
                        <i className="ri-mail-line text-purple-500"></i>
                      </div>
                      E-mail
                    </div>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
                    placeholder="이메일을 입력하세요"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-700">
                    <div className="flex items-center">
                      <div className="w-5 h-5 flex items-center justify-center mr-2">
                        <i className="ri-lock-line text-purple-500"></i>
                      </div>
                      Password
                    </div>
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
                    placeholder="비밀번호를 입력하세요"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember
                    </label>
                  </div>
                  <div className="text-sm">
                    <a href="#" className="font-medium text-purple-600 hover:text-purple-500 cursor-pointer">
                      Forgot Password?
                    </a>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl p-3 bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer transition-all"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        로그인 중...
                      </div>
                    ) : (
                      'LOGIN'
                    )}
                  </button>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 text-sm bg-white text-gray-500">또는</span>
                  </div>
                </div>

                {/* Google Login */}
                <div>
                  <button
                    type="button"
                    onClick={handleKakaoLogin}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center py-3 px-4 border border-gray-200 text-sm font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer transition-all bg-white hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <img className="h-5 w-5 mr-3" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" />
                      {isLoading ? '로그인 중...' : 'Google로 간편 로그인'}
                    </div>
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    계정이 없으신가요?{' '}
                    <Link href="/auth/register" className="font-medium text-purple-600 hover:text-purple-500 cursor-pointer">
                      회원가입
                    </Link>
                  </p>
                </div>

                {/* Admin Login */}
                <div className="text-center">
                  <Link
                    href="/admin/login"
                    className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium bg-white hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap text-gray-600"
                  >
                    <i className="ri-admin-line mr-2"></i>
                    관리자 로그인
                  </Link>
                </div>

                {/* Demo Account Info */}
                <div className="mt-6 p-4 rounded-xl bg-purple-50 border border-purple-200">
                  <h3 className="text-sm font-medium mb-2 text-purple-800">데모 계정</h3>
                  <div className="text-xs space-y-1 text-purple-700">
                    <p>이메일: test@example.com</p>
                    <p>비밀번호: 12345678</p>
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
