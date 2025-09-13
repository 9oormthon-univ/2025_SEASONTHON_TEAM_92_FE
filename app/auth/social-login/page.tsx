'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

function SocialLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const isNewUser = searchParams.get('isNewUser') === 'true';

    if (token) {
      // JWT 토큰과 로그인 상태를 localStorage에 저장
      localStorage.setItem('jwtToken', token);
      localStorage.setItem('isLoggedIn', 'true');
      // 소셜 로그인이므로, 이메일/닉네임은 프로필 조회 API를 통해 얻는 것이 더 정확합니다.
      // 우선 임시로 just_logged_in 플래그를 설정하여 랜딩페이지에서 활용할 수 있습니다.
      localStorage.setItem('just_logged_in', 'true');

      if (isNewUser) {
        toast.success('구글 계정으로 가입 완료! 온보딩을 시작합니다.');
        router.push('/onboarding/location');
      } else {
        toast.success('구글 계정으로 로그인했습니다.');
        router.push('/'); // 기존 사용자는 메인 페이지로 이동
      }
    } else {
      toast.error('소셜 로그인 처리 중 오류가 발생했습니다.');
      router.push('/auth/login'); // 실패 시 로그인 페이지로 이동
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">소셜 로그인 정보를 처리 중입니다. 잠시만 기다려주세요...</p>
    </div>
  );
}

export default function SocialLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">로딩 중...</p>
      </div>
    }>
      <SocialLoginContent />
    </Suspense>
  );
}
