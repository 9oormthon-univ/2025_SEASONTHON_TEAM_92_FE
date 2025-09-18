'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '../../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 입력 검증
    if (!formData.email || !formData.name || !formData.password || !formData.confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }
    
    // MVP 버전에서는 이용약관 검증 생략
    /*
    if (!termsAgreed) {
      setError('이용약관 및 개인정보처리방침에 동의해주세요.');
      return;
    }
    */
    
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    if (formData.password.length < 8 || formData.password.length > 20) {
      setError('비밀번호는 8-20자여야 합니다.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // API 호출 시 DTO에 맞게 name 필드 사용
      await authApi.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      // 자동 로그인 시도
      const loginResponse = await authApi.login({
        email: formData.email,
        password: formData.password
      });
      
      if (loginResponse.token) {
        // 로그인 성공 시 토큰과 사용자 정보 저장
        localStorage.setItem('jwtToken', loginResponse.token);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', formData.email);
        localStorage.setItem('userNickname', formData.name);
        localStorage.setItem('userId', loginResponse.id.toString());
        localStorage.setItem('onboarding_completed', 'true');
        localStorage.setItem('show_diagnosis_prompt', 'true'); // 진단 프롬프트 표시 플래그
        
        // 진단 페이지로 바로 이동 (시연용)
        router.push('/diagnosis');
      } else {
        // 자동 로그인 실패 시 로그인 페이지로 이동
        router.push('/auth/login');
      }
      
    } catch (err: any) {
      console.error('Register error:', err);
      const errorMessage = err.response?.data?.message || '회원가입 중 오류가 발생했습니다.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleKakaoRegister = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // 카카오 OAuth 회원가입으로 리다이렉트
      window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/oauth2/authorization/kakao`;
      
    } catch (err) {
      setError('소셜 회원가입 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Google OAuth 회원가입으로 리다이렉트
      window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/oauth2/authorization/google`;
      
    } catch (err) {
      setError('소셜 회원가입 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden" 
         style={{background: 'linear-gradient(135deg, #E9D5FF 0%, #C084FC 50%, #9333EA 100%)'}}>
      
      {/* Background Decorative Cloud-like Elements - Same as login page */}
      <div className="absolute inset-0">
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
        <div className="flex bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[700px] w-full max-w-5xl">
          
          {/* Left Side - Welcome Section */}
          <div className="flex-1 p-12 flex flex-col justify-center relative"
               style={{background: 'linear-gradient(135deg, #A855F7 0%, #9333EA 100%)'}}>
            <div className="text-white">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-8">
                <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center">
                  <i className="ri-user-add-fill text-purple-700 text-lg"></i>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold mb-6 leading-tight">
                환영합니다!
              </h1>
              
              <p className="text-white/90 text-xl leading-relaxed mb-8 max-w-md">
                월세의 정석과 함께<br />
                스마트한 월세 협상을 시작하세요
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center text-white/80">
                  <div className="w-5 h-5 flex items-center justify-center mr-3">
                    <i className="ri-shield-check-line text-purple-200"></i>
                  </div>
                  <span>안전한 개인정보 보호</span>
                </div>
                <div className="flex items-center text-white/80">
                  <div className="w-5 h-5 flex items-center justify-center mr-3">
                    <i className="ri-group-line text-purple-200"></i>
                  </div>
                  <span>이웃들과 함께하는 협상</span>
                </div>
                <div className="flex items-center text-white/80">
                  <div className="w-5 h-5 flex items-center justify-center mr-3">
                    <i className="ri-bar-chart-line text-purple-200"></i>
                  </div>
                  <span>데이터 기반 정확한 분석</span>
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

          {/* Right Side - Register Form */}
          <div className="flex-1 p-12 flex flex-col justify-center bg-white">
            <div className="max-w-sm w-full mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">SIGN UP</h2>
                <p className="text-gray-600">새로운 계정을 만들어 서비스를 시작하세요</p>
              </div>
              
              <form className="space-y-4" onSubmit={handleSubmit}>
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
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-700">
                    <div className="flex items-center">
                      <div className="w-5 h-5 flex items-center justify-center mr-2">
                        <i className="ri-user-line text-purple-500"></i>
                      </div>
                      Name
                    </div>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
                    placeholder="이름을 입력하세요"
                    value={formData.name}
                    onChange={handleInputChange}
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
                    placeholder="비밀번호를 입력하세요 (8-20자)"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-gray-700">
                    <div className="flex items-center">
                      <div className="w-5 h-5 flex items-center justify-center mr-2">
                        <i className="ri-lock-unlock-line text-purple-500"></i>
                      </div>
                      Confirm Password
                    </div>
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-colors"
                    placeholder="비밀번호를 다시 입력하세요"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                </div>

                {/* MVP 버전에서는 이용약관 동의 비활성화 */}
                {/*
                <div className="flex items-start">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-1"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 leading-relaxed">
                    <span className="font-medium text-purple-600">이용약관</span> 및 <span className="font-medium text-purple-600">개인정보처리방침</span>에 동의합니다
                  </label>
                </div>
                */}

                {error && (
                  <div className="rounded-xl p-3 bg-red-50 border border-red-200">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer transition-all"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        가입 중...
                      </div>
                    ) : (
                      'SIGN UP'
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

                {/* Kakao Register */}
                <div>
                  <button
                    type="button"
                    onClick={handleKakaoRegister}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center py-3 px-4 text-sm font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer transition-all bg-yellow-400 hover:bg-yellow-500 text-black"
                  >
                    <div className="flex items-center">
                      <div className="w-5 h-5 mr-3 rounded-sm bg-black flex items-center justify-center">
                        <span className="text-yellow-400 text-xs font-bold">K</span>
                      </div>
                      {isLoading ? '가입 중...' : '카카오로 간편 회원가입'}
                    </div>
                  </button>
                </div>

                {/* Google Register */}
                <div>
                  <button
                    type="button"
                    onClick={handleGoogleRegister}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center py-3 px-4 border border-gray-200 text-sm font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer transition-all bg-white hover:bg-gray-50"
                  >
                    <div className="flex items-center">
                      <img className="h-5 w-5 mr-3" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" />
                      {isLoading ? '가입 중...' : 'Google로 간편 회원가입'}
                    </div>
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    이미 계정이 있으신가요?{' '}
                    <Link href="/auth/login" className="font-medium text-purple-600 hover:text-purple-500 cursor-pointer">
                      로그인
                    </Link>
                  </p>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}