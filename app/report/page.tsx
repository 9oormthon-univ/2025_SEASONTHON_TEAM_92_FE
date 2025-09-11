'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { reportApi, diagnosisApi } from '../../lib/api';
import toast from 'react-hot-toast';
import ComprehensiveReport from '../../components/ComprehensiveReport';

export default function ReportPage() {
  const [reportContent, setReportContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [error, setError] = useState('');
  const [showComprehensiveReport, setShowComprehensiveReport] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportContent.trim()) {
      setError('리포트 내용을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // JWT 토큰 가져오기
      const jwtToken = localStorage.getItem('jwtToken');
      const userId = localStorage.getItem('userId');
      
      if (!jwtToken || !userId) {
        setError('로그인이 필요합니다.');
        router.push('/auth/login');
        return;
      }

      // 백엔드 API를 활용한 리포트 생성
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 
        (process.env.NODE_ENV === 'production' 
          ? 'https://2025seasonthonteam92be-production.up.railway.app' 
          : 'http://localhost:8080');
      
      const response = await fetch(`${baseURL}/report/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          reportContent: reportContent
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        // 백엔드에서 반환하는 reportId 처리
        let reportId;
        
        if (typeof result === 'number') {
          reportId = result;
        } else if (result.reportId) {
          reportId = result.reportId;
        } else {
          throw new Error('리포트 ID를 받지 못했습니다.');
        }
        
        toast.success('AI가 맞춤형 리포트를 생성했습니다!');
        
        // 생성된 리포트 조회
        const reportResponse = await reportApi.getReport(reportId.toString());
        setReportData({
          ...reportResponse.data,
          reportId: reportId,
          reportUrl: `${window.location.origin}/report/${reportId}`
        });
      } else {
        setError(result.message || '리포트 생성에 실패했습니다.');
      }
      
    } catch (err: any) {
      console.error('Report creation error:', err);
      setError(err.message || '리포트 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateComprehensiveReport = async () => {
    setIsLoading(true);
    setError('');

    try {
      // 진단 결과가 있는지 확인
      const diagnosisResponse = await diagnosisApi.getResult();
      if (!diagnosisResponse.success) {
        setError('먼저 진단을 완료해주세요.');
        return;
      }

      setShowComprehensiveReport(true);
      toast.success('종합 리포트를 생성했습니다!');
      
    } catch (err: any) {
      console.error('Comprehensive report generation error:', err);
      setError('종합 리포트 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 종합 리포트가 표시되는 경우
  if (showComprehensiveReport) {
    return <ComprehensiveReport />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AI 협상 리포트 생성</h1>
          <p className="text-gray-600 mb-2">당신의 진단 결과와 요구사항을 바탕으로 AI가 맞춤형 협상 전략을 생성합니다</p>
          <p className="text-sm text-gray-500">• 진단 점수 기반 협상 포인트 분석</p>
          <p className="text-sm text-gray-500">• 개인화된 협상 카드 생성</p>
          <p className="text-sm text-gray-500">• 단계별 협상 가이드 제공</p>
        </div>

        {/* 리포트 타입 선택 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 종합 리포트 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-file-chart-line text-2xl text-blue-600"></i>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">종합 협상 리포트</h2>
              <p className="text-gray-600 mb-4">진단 결과를 바탕으로 완전한 협상 리포트를 자동 생성합니다</p>
              <ul className="text-sm text-gray-500 text-left mb-6 space-y-1">
                <li>• 8개 섹션으로 구성된 완전한 리포트</li>
                <li>• 객관적 데이터와 주관적 평가 통합</li>
                <li>• 협상 카드 자동 생성</li>
                <li>• 정책 정보 및 분쟁 해결 가이드</li>
                <li>• 인쇄 및 공유 기능</li>
              </ul>
              <button
                onClick={handleGenerateComprehensiveReport}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    생성 중...
                  </div>
                ) : (
                  '종합 리포트 생성하기'
                )}
              </button>
            </div>
          </div>

          {/* 맞춤형 리포트 */}
          <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-edit-line text-2xl text-green-600"></i>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">맞춤형 협상 리포트</h2>
              <p className="text-gray-600 mb-4">직접 입력한 요구사항을 바탕으로 개인화된 리포트를 생성합니다</p>
              <ul className="text-sm text-gray-500 text-left mb-6 space-y-1">
                <li>• 사용자 입력 기반 맞춤형 내용</li>
                <li>• AI가 생성한 협상 전략</li>
                <li>• 단계별 협상 가이드</li>
                <li>• 즉시 공유 가능한 링크</li>
              </ul>
              <button
                onClick={() => setReportData(null)}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                맞춤형 리포트 만들기
              </button>
            </div>
          </div>
        </div>

        {!reportData ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="reportContent" className="block text-sm font-medium text-gray-700 mb-2">
                  협상 요구사항을 자세히 설명해주세요
                </label>
                <textarea
                  id="reportContent"
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="예: 월세가 너무 비싸서 조금 낮춰달라고 요청하고 싶어요. 주변 시세보다 20만원 정도 비싸고, 방음도 안 좋아서..."
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    AI가 맞춤형 리포트를 생성 중...
                  </div>
                ) : (
                  'AI 리포트 생성하기'
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 리포트 URL 표시 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">리포트 URL</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">이 리포트를 공유하거나 나중에 다시 보려면 아래 URL을 사용하세요:</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={reportData.reportUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(reportData.reportUrl);
                      toast.success('URL이 클립보드에 복사되었습니다!');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    복사
                  </button>
                </div>
              </div>
            </div>

            {/* 월세 조정 요청 카드 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">월세 조정 요청 카드</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-800 whitespace-pre-line">
                  {reportData.primaryNegotiationCard || '월세 조정 요청 카드가 생성되지 않았습니다.'}
                </p>
              </div>
            </div>

            {/* 하자 수리 요청 카드 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">하자 수리 요청 카드</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-gray-800 whitespace-pre-line">
                  {reportData.secondaryNegotiationCard || '하자 수리 요청 카드가 생성되지 않았습니다.'}
                </p>
              </div>
            </div>

            {/* 협상 단계별 가이드 */}
            {(reportData.step1 || reportData.step2) && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">협상 단계별 가이드</h2>
                <div className="space-y-4">
                  {reportData.step1 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">1단계</h3>
                      <p className="text-gray-800 whitespace-pre-line">{reportData.step1}</p>
                    </div>
                  )}
                  {reportData.step2 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">2단계</h3>
                      <p className="text-gray-800 whitespace-pre-line">{reportData.step2}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setReportData(null);
                  setReportContent('');
                }}
                className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                새로운 리포트 생성
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}