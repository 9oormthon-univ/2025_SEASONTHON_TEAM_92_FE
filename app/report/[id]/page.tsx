'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { reportApi } from '@/lib/api';
import { ReportResponse } from '@/types';
import ReportTemplate from '@/components/ReportTemplate';
import { mockReportData } from '@/lib/mockData';

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

export default function ReportPage({ params }: ReportPageProps) {
  const [reportId, setReportId] = useState<string | null>(null);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [reportTemplate, setReportTemplate] = useState<any | null>(null);
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
              const response = await reportApi.getReport(id);
              console.log('리포트 상세 응답:', response);
              
              if (response && response.data) {
                // 백엔드 응답 구조에 맞게 수정
                setReport(response.data);
                
                // 계약 조건 문자열 파싱 (예: "보증금 1000 / 월세 60 / 관리비 10")
                const conditions = response.data.contractSummary?.conditions || '';
                const depositMatch = conditions.match(/보증금 (\d+)/);
                const rentMatch = conditions.match(/월세 (\d+)/);
                const feeMatch = conditions.match(/관리비 (\d+)/);
                
                // 백엔드 데이터를 템플릿 형태로 변환 (contractSummary -> contractInfo)
                const transformedData = {
                  ...response.data,
                  contractInfo: {
                    address: response.data.contractSummary?.address || '주소 정보 없음',
                    buildingName: '',
                    buildingType: response.data.contractSummary?.buildingType || '정보 없음',
                    contractType: response.data.contractSummary?.contractType || '정보 없음',
                    deposit: depositMatch ? parseInt(depositMatch[1]) : 0,
                    monthlyRent: rentMatch ? parseInt(rentMatch[1]) : 0,
                    managementFee: feeMatch ? parseInt(feeMatch[1]) : 0,
                    gpsVerified: response.data.contractSummary?.gpsVerified || false,
                    contractVerified: response.data.contractSummary?.contractVerified || false,
                  },
                  subjectiveMetrics: {
                    overallScore: response.data.subjectiveMetrics?.overallScore?.myScore || 0,
                    neighborhoodAverage: response.data.subjectiveMetrics?.overallScore?.neighborhoodAverage || 0,
                    buildingAverage: response.data.subjectiveMetrics?.overallScore?.buildingAverage || 0,
                    categories: {
                      lighting: { myScore: 0, neighborhoodAvg: 0, buildingAvg: 0 },
                      soundproofing: { myScore: 0, neighborhoodAvg: 0, buildingAvg: 0 },
                      parking: { myScore: 0, neighborhoodAvg: 0, buildingAvg: 0 }
                    }
                  },
                  negotiationCards: response.data.negotiationCards || [],
                  policyInfo: response.data.policyInfos || [],
                  header: {
                    ...response.data.header,
                    trustMetrics: {
                      participantCount: response.data.header?.participantCount || 0,
                      averageResponseDays: parseInt(response.data.header?.dataRecency?.match(/\d+/)?.[0] || '0'),
                      trustScore: response.data.header?.reliabilityScore || 0
                    }
                  }
                };
                
                // categoryScores 배열을 categories 객체로 변환하고 원본 제거
                if (response.data.subjectiveMetrics?.categoryScores) {
                  response.data.subjectiveMetrics.categoryScores.forEach((cat: any) => {
                    const categoryKey = cat.category === '채광' ? 'lighting' : 
                                      cat.category === '소음' ? 'soundproofing' : 
                                      cat.category === '주차' ? 'parking' : null;
                    if (categoryKey) {
                      transformedData.subjectiveMetrics.categories[categoryKey] = {
                        myScore: cat.myScore || 0,
                        neighborhoodAvg: cat.neighborhoodAverage || 0,
                        buildingAvg: cat.buildingAverage || 0
                      };
                    }
                  });
                  // 원본 categoryScores 배열 제거
                  delete transformedData.subjectiveMetrics.categoryScores;
                }
                setReportTemplate(transformedData);
              } else {
                setError('Report data not found.');
              }
            } catch (err: any) {
              console.error('Failed to fetch report:', err);
              setError(err.message || 'Failed to load report.');
              // Even if API fails, show mock template for demonstration
              setReportTemplate(mockReportData);
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

  if (!reportTemplate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-6 rounded-lg shadow-md bg-white">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">리포트 없음</h2>
          <p className="text-gray-600">요청하신 리포트를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return <ReportTemplate data={reportTemplate} />;
}
