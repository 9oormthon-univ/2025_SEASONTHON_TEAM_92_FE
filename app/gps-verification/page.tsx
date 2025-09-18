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

  const handleVerificationSuccess = async (updatedUser: User) => {
    console.log('위치 인증 성공:', updatedUser);
    
    try {
      // 백엔드에 GPS 인증 완료 상태 업데이트
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: JSON.stringify({
          gpsVerified: true,
          onboardingCompleted: true
        })
      });
      
      if (response.ok) {
        console.log('GPS 인증 상태 업데이트 완료');
        // localStorage에 상태 저장
        localStorage.setItem('gps_verified', 'true');
        localStorage.setItem('onboarding_completed', 'true');
      }
    } catch (error) {
      console.error('GPS 인증 상태 업데이트 실패:', error);
    }
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