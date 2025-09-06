'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { reportApi } from '../../lib/api';
import toast from 'react-hot-toast';

export default function ReportPage() {
  const [reportContent, setReportContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [error, setError] = useState('');
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
      const response = await reportApi.createReport({
        reportContent: reportContent
      });
      
      if (response && typeof response === 'number') {
        // 리포트 생성 성공
        toast.success('리포트가 생성되었습니다!');
        
        // 생성된 리포트 조회
        const reportResponse = await reportApi.getReport(response);
        setReportData({
          ...reportResponse,
          reportId: response,
          reportUrl: `${window.location.origin}/report/${response}`
        });
      } else {
        setError('리포트 생성에 실패했습니다.');
      }
      
    } catch (err: any) {
      console.error('Report creation error:', err);
      setError(err.response?.data?.message || '리포트 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">협상 리포트 생성</h1>
          <p className="text-gray-600">AI가 당신을 위한 맞춤형 협상 카드를 생성해드립니다</p>
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
                {isLoading ? '리포트 생성 중...' : '리포트 생성하기'}
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