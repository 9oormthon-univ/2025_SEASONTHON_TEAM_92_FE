
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
    name: '', // 'nickname'에서 'name'으로 변경
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 입력 검증
    if (!formData.email || !formData.name || !formData.password || !formData.confirmPassword) {
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
      // API 호출 시 DTO에 맞게 name 필드 사용
      await authApi.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      // 회원가입 성공 후 자동 로그인 처리
      toast.success('회원가입 성공! 자동으로 로그인합니다.');
      
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
        
        toast.success('로그인 완료! 온보딩을 시작합니다.');
        
        // 온보딩 페이지로 이동
        router.push('/onboarding/location');
      } else {
        // 자동 로그인 실패 시 로그인 페이지로 이동
        toast.error('자동 로그인에 실패했습니다. 수동으로 로그인해주세요.');
        router.push('/auth/login');
      }
      
    } catch (err: any) {
      console.error('Register error:', err);
      const errorMessage = err.response?.data?.message || '회원가입 중 오류가 발생했습니다.';
      setError(errorMessage);
      toast.error(errorMessage); // 에러 발생 시에도 토스트 메시지 표시
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
          <p className="text-gray-600">회원가입 후 자동으로 로그인됩니다</p>
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
              이름 * 
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
              placeholder="이름을 입력하세요"
              value={formData.name} // value와 onChange를 name으로 변경
              onChange={(e) => setFormData({...formData, name: e.target.value})}
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
