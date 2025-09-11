'use client';

import { useState } from 'react';
import LocationVerifier from '@/components/LocationVerifier';
import { User } from '@/types';

export default function GPSVerificationPage() {
  // Mock user data for testing
  const currentUser: User = {
    id: '1',
    email: 'test@example.com',
    nickname: 'test',
    role: 'tenant',
    profileCompleted: false,
    diagnosisCompleted: false,
    onboardingCompleted: false
  };

  const handleVerificationSuccess = (updatedUser: User) => {
    console.log('위치 인증 성공:', updatedUser);
    // 여기서 사용자 정보 업데이트 로직 추가
  };

  const handleGoHome = () => {
    console.log('홈으로 이동');
    // 홈으로 이동하는 로직 추가
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <LocationVerifier
        currentUser={currentUser}
        onVerificationSuccess={handleVerificationSuccess}
        onGoHome={handleGoHome}
      />
    </div>
  );
}