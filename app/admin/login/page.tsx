'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    adminId: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 입력 검증
    if (!formData.adminId || !formData.password) {
      setError('관리자 ID와 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 관리자 로그인 처리 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 데모용 관리자 계정 체크
      if (formData.adminId === 'admin' && formData.password === 'admin123') {
        // 관리자 로그인 성공 처리
        localStorage.setItem('isAdminLoggedIn', 'true');
        localStorage.setItem('adminId', formData.adminId);
        
        // 관리자 대시보드로 이동
        router.push('/admin/dashboard');
      } else {
        setError('관리자 ID 또는 비밀번호가 일치하지 않습니다.');
      }
      
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="text-center">
            <Link href="/">
              <h1 className="text-3xl font-bold text-red-600 cursor-pointer">월세의 정석</h1>
            </Link>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              관리자 로그인
            </h2>
            <p className="mt-2 text-gray-600">
              관리자만 접근 수 있는 영역입니다
            </p>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="adminId" className="block text-sm font-medium text-gray-700 mb-1">
                관리자 ID
              </label>
              <input
                id="adminId"
                name="adminId"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                placeholder="관리자 ID를 입력하세요"
                value={formData.adminId}
                onChange={(e) => setFormData({...formData, adminId: e.target.value})}
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
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
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

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  로그인 중...
                </div>
              ) : (
                <div className="flex items-center">
                  <i className="ri-admin-line mr-2"></i>
                  관리자 로그인
                </div>
              )}
            </button>
          </div>

          <div className="text-center">
            <Link 
              href="/auth/login" 
              className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              ← 일반 사용자 로그인으로 돌아가기
            </Link>
          </div>

          {/* Demo Admin Account */}
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <h3 className="text-sm font-medium text-red-800 mb-2">데모 관리자 계정</h3>
            <div className="text-xs text-red-700 space-y-1">
              <p>관리자 ID: admin</p>
              <p>비밀번호: admin123</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}