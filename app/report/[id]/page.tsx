'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { reportApi } from '@/lib/api';
import { ReportResponse } from '@/types';

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

export default function ReportPage({ params }: ReportPageProps) {
  const [reportId, setReportId] = useState<string | null>(null);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      const id = resolvedParams.id;
      
        if (id) {
          const fetchReport = async () => {
            try {
              setLoading(true);
              const response = await reportApi.getReport(Number(id));
              if (response && response.data && response.data.reportContent) {
                // Assuming reportContent is a stringified ReportResponse
                const parsedReport: ReportResponse = JSON.parse(response.data.reportContent);
                setReport(parsedReport);
              } else {
                setError('Report data not found.');
              }
            } catch (err: any) {
              console.error('Failed to fetch report:', err);
              setError(err.message || 'Failed to load report.');
            } finally {
              setLoading(false);
            }
          };
          fetchReport();
        }
      };
      
      getParams();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-700">리포트를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-6 rounded-lg shadow-md bg-white">
          <h2 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h2>
          <p className="text-gray-700">{error}</p>
          <p className="text-gray-500 mt-2">리포트를 불러오지 못했습니다. 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-6 rounded-lg shadow-md bg-white">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">리포트 없음</h2>
          <p className="text-gray-600">요청하신 리포트를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-8">맞춤형 재계약 협상 리포트</h1>

        {/* Primary Negotiation Card */}
        <section className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold text-blue-800 mb-3">주요 협상 카드</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{report.primaryNegotiationCard}</p>
        </section>

        {/* Secondary Negotiation Card */}
        <section className="bg-indigo-50 border-l-4 border-indigo-500 rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold text-indigo-800 mb-3">보조 협상 카드</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{report.secondaryNegotiationCard}</p>
        </section>

        {/* Negotiation Steps */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">협상 전략 단계</h2>
          
          <div className="bg-gray-50 rounded-lg p-6 shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-3">1단계</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{report.step1}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-3">2단계</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{report.step2}</p>
          </div>
        </section>

        <div className="text-center mt-10">
          <p className="text-gray-500 text-sm">본 리포트는 LLM을 통해 생성되었으며, 참고 자료로 활용하시기 바랍니다.</p>
        </div>
      </div>
    </div>
  );
}
