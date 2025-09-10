'use client';

import { useState } from 'react';
import GPSVerification from '@/components/GPSVerification';
import { GPSVerificationResult } from '@/types';

export default function GPSVerificationPage() {
  const [verificationResults, setVerificationResults] = useState<GPSVerificationResult[]>([]);
  const [targetAddress, setTargetAddress] = useState('서울시 마포구 망원동 123-45');

  const handleVerificationComplete = (result: GPSVerificationResult) => {
    setVerificationResults(prev => [result, ...prev]);
  };

  const handleVerificationFailed = (error: string) => {
    console.error('GPS 인증 실패:', error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">GPS 위치 인증 시스템</h1>
          <p className="text-gray-600 mb-2">현재 위치를 기반으로 동네 인증을 진행합니다</p>
          <p className="text-sm text-gray-500">• 높은 정확도 GPS 위치 확인</p>
          <p className="text-sm text-gray-500">• 자동 정확도 개선 기능</p>
          <p className="text-sm text-gray-500">• 인증 성공 시 뱃지 표시</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* GPS 인증 컴포넌트 */}
          <div>
            <div className="mb-4">
              <label htmlFor="targetAddress" className="block text-sm font-medium text-gray-700 mb-2">
                대상 주소
              </label>
              <input
                id="targetAddress"
                type="text"
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="인증할 주소를 입력하세요"
              />
            </div>
            
            <GPSVerification
              targetAddress={targetAddress}
              onVerificationComplete={handleVerificationComplete}
              onVerificationFailed={handleVerificationFailed}
            />
          </div>

          {/* 인증 결과 히스토리 */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">인증 결과 히스토리</h2>
            {verificationResults.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <p className="text-gray-500">아직 인증 기록이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {verificationResults.map((result, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    result.isVerified 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {result.isVerified ? (
                          <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        <span className={`font-semibold ${
                          result.isVerified ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {result.isVerified ? '인증 성공' : '인증 실패'}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        result.confidence >= 90 ? 'bg-green-100 text-green-800' :
                        result.confidence >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.confidence}%
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-semibold">위치:</span> {result.locationData.latitude.toFixed(6)}, {result.locationData.longitude.toFixed(6)}</p>
                      <p><span className="font-semibold">정확도:</span> {result.locationData.accuracy.toFixed(1)}m</p>
                      <p><span className="font-semibold">인증 시간:</span> {new Date(result.verifiedAt).toLocaleString()}</p>
                      <p><span className="font-semibold">방법:</span> {result.verificationMethod}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* GPS 정확도 향상 가이드 */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">GPS 정확도 향상 가이드</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">정확도 향상 방법</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 실외에서 측정하기</li>
                <li>• 건물이나 나무에서 멀리 떨어지기</li>
                <li>• GPS 신호가 강한 곳에서 측정</li>
                <li>• 여러 번 측정하여 평균값 사용</li>
                <li>• WiFi와 모바일 데이터 모두 켜두기</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">정확도 기준</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 10m 이하: 매우 높음 (95%)</li>
                <li>• 10-50m: 높음 (85%)</li>
                <li>• 50-100m: 보통 (70%)</li>
                <li>• 100m 초과: 낮음 (50%)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}