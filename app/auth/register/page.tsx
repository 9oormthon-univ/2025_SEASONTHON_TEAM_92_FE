
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '../../../lib/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    nickname: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 입력 검증
    if (!formData.email || !formData.nickname || !formData.password || !formData.confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    
    if (formData.password.length < 6 || formData.password.length > 20) {
      setError('비밀번호는 6-20자여야 합니다.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 실제 API 호출
      const response = await authApi.register({
        name: formData.nickname,
        email: formData.email,
        password: formData.password
      });
      
      if (response.success && response.data) {
        // 회원가입 성공 처리
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', formData.email);
        localStorage.setItem('userNickname', formData.nickname);
        localStorage.setItem('userId', response.data.data.toString());
        localStorage.setItem('onboarding_completed', 'true');
        
        toast.success('회원가입 성공!');
        
        // 온보딩 페이지로 이동
        router.push('/onboarding/location');
      } else {
        setError(response.data.message || '회원가입에 실패했습니다.');
      }
      
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-4 mx-auto mb-4 border-blue-200 border-t-blue-600"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">계정을 생성하고 있습니다...</h2>
          <p className="text-gray-600">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/">
            <h1 className="text-3xl font-bold text-gray-800 cursor-pointer font-['Pacifico'] mb-6">월세의 정석</h1>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            회원가입
          </h2>
          <p className="mb-8 text-gray-600">
            공정한 임대료 협상을 위한 첫 걸음을 시작하세요
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
              이메일 주소 *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
              placeholder="이메일을 입력하세요"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-900 mb-2">
              닉네임 *
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              required
              className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
              placeholder="닉네임을 입력하세요"
              value={formData.nickname}
              onChange={(e) => setFormData({...formData, nickname: e.target.value})}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
              비밀번호 *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
              placeholder="6-20자 비밀번호를 입력하세요"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-2">
              비밀번호 확인 *
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
          >
            회원가입
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                로그인
              </Link>
            </p>
          </div>

          <div className="text-center text-xs leading-relaxed text-gray-600">
            회원가입 시{' '}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
              이용약관
            </a>
            {' '}및{' '}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
              개인정보처리방침
            </a>
            에 동의한 것으로 간주됩니다.
          </div>
        </form>
      </div>
    </div>
  );
}
