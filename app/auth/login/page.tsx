
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '../../../lib/api';
import toast from 'react-hot-toast';
import { Button } from '../../../components/ui/button';

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
    setError('');

    if (!formData.email || !formData.password) {
      setError('이메일과 비밀번호를 모두 입력해주세요! 😊');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.login(formData);
      
      // 백엔드 응답 구조에 맞게 토큰 추출
      // 백엔드에서 { id: number, token: string } 형태로 직접 응답
      const token = (response as any)?.token;

      if (token) {
        // JWT 토큰을 localStorage에 저장
        localStorage.setItem('jwtToken', token);
        
        // 로그인 상태 표시
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', formData.email);
        
        toast.success('로그인 성공! 🎉 월세 협상 준비를 시작해볼까요?');
        
        // 온보딩 페이지로 이동
        router.push('/onboarding/location');
      } else {
        // 토큰이 없는 경우의 에러 처리
        const errorMessage = (response as any)?.message || '로그인에 실패했습니다. 응답에 토큰이 없습니다.';
        setError(errorMessage);
        toast.error(errorMessage);
      }
      
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || '로그인 중 오류가 발생했습니다.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="text-center">
            <Link href="/">
              <h1 className="text-3xl font-bold text-blue-600 cursor-pointer">월세의 정석</h1>
            </Link>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              안녕하세요! 👋
            </h2>
            <p className="mt-2 text-gray-600">
              월세 협상의 달인이 되어보세요
            </p>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일 주소
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="이메일을 입력하세요"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                로그인 상태 유지
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                비밀번호를 잊으셨나요?
              </a>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  로그인 중...
                </div>
              ) : (
                '로그인'
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                회원가입
              </Link>
            </p>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-indigo-100 text-gray-500">또는 소셜 계정으로 로그인</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              asChild
              variant="outline"
              className="w-full"
              size="lg"
            >
              <a href={`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/oauth2/authorization/google`}>
                <img className="h-5 w-5 mr-3" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" />
                Google 계정으로 로그인
              </a>
            </Button>
          </div>

          {/* Admin Login Button */}
          <div className="text-center mt-4">
            <Button
              asChild
              variant="ghost"
              className="w-full"
              size="lg"
            >
              <Link href="/admin/login">
                <i className="ri-admin-line mr-2"></i>
                관리자 로그인
              </Link>
            </Button>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">🚀 빠른 체험하기</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p>이메일: test@example.com</p>
              <p>비밀번호: 12345678</p>
              <p className="text-blue-600 font-medium mt-2">위 계정으로 바로 로그인해서 서비스를 체험해보세요!</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
