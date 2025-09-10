'use client';

import { GPSVerificationResult } from '@/types';

interface VerificationBadgeProps {
  gpsVerified: boolean;
  contractVerified: boolean;
  verificationResult?: GPSVerificationResult;
}

export default function VerificationBadge({ 
  gpsVerified, 
  contractVerified, 
  verificationResult 
}: VerificationBadgeProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {/* GPS 인증 배지 */}
      <div className={`flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
        gpsVerified 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-600'
      }`}>
        {gpsVerified ? (
          <>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            GPS 인증됨
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            GPS 미인증
          </>
        )}
      </div>

      {/* 계약서 인증 배지 */}
      <div className={`flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
        contractVerified 
          ? 'bg-blue-100 text-blue-800' 
          : 'bg-gray-100 text-gray-600'
      }`}>
        {contractVerified ? (
          <>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            계약서 인증됨
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            계약서 미인증
          </>
        )}
      </div>

      {/* 신뢰도 점수 배지 */}
      {verificationResult && (
        <div className={`flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
          verificationResult.confidence >= 90 ? 'bg-purple-100 text-purple-800' :
          verificationResult.confidence >= 70 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          신뢰도 {verificationResult.confidence}%
        </div>
      )}
    </div>
  );
}