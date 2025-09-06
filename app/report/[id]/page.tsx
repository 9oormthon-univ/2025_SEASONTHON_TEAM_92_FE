'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { reportApi } from '../../../lib/api';
import toast from 'react-hot-toast';

interface ReportPageProps {
  params: {
    id: string;
  };
}

export default function ReportDetailPage({ params }: ReportPageProps) {
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadReport();
  }, [params.id]);

  const loadReport = async () => {
    try {
      const reportId = parseInt(params.id);
      if (isNaN(reportId)) {
        setError('유효하지 않은 리포트 ID입니다.');
        setIsLoading(false);
        return;
      }

      const response = await reportApi.getReport(reportId);
      if (response) {
        setReportData({
          ...response,
          reportId: reportId,
          reportUrl: `${window.location.origin}/report/${reportId}`
        });
      } else {
        setError('리포트를 찾을 수 없습니다.');
      }
    } catch (err: any) {
      console.error('Report load error:', err);
      setError('리포트를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-4 mx-auto mb-4 border-blue-200 border-t-blue-600"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">리포트를 불러오는 중...</h2>
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">리포트를 불러올 수 없습니다</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/report')}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            새 리포트 생성하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">협상 리포트</h1>
          <p className="text-gray-600">리포트 ID: {reportData.reportId}</p>
        </div>

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
              onClick={() => router.push('/report')}
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
      </div>
    </div>
  );
}