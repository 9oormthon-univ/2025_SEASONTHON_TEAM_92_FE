'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { reportApi } from '@/lib/api';
import { ReportResponse } from '@/types';
import ReportTemplate from '@/components/ReportTemplate';
import { mockReportData, mockFreeReportData } from '@/lib/mockData';

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

export default function ReportPage({ params }: ReportPageProps) {
  const [reportId, setReportId] = useState<string | null>(null);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [reportTemplate, setReportTemplate] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      const id = resolvedParams.id;
      
        if (id) {
          // URL에서 프리미엄 타입 확인
          const isPremiumReport = id.includes('premium') || 
                                 (typeof window !== 'undefined' && window.location.search.includes('type=premium'));
          setIsPremium(isPremiumReport);
          
          const fetchReport = async () => {
            try {
              setLoading(true);
              
              // 프리미엄 리포트인 경우 프리미엄 API 호출
              const response = isPremiumReport 
                ? await reportApi.getPremiumReport(id)
                : await reportApi.getReport(id);
              
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
                  reportType: isPremiumReport ? 'premium' : 'free', // 프리미엄 타입 설정
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
                  negotiationCards: (response.data.negotiationCards || []).map((card: any) => ({
                    ...card,
                    // 프리미엄 리포트인 경우 추가 필드 설정
                    ...(isPremiumReport && {
                      successProbability: card.successProbability || Math.floor(Math.random() * 40) + 50, // 50-90%
                      alternativeStrategy: card.alternativeStrategy || "법적 근거를 바탕으로 단계적 접근을 권장합니다.",
                      expertTip: card.expertTip || "객관적 데이터와 함께 제시하면 성공 확률이 높아집니다."
                    })
                  })),
                  policyInfo: (response.data.policyInfos || []).map((policy: any) => ({
                    ...policy,
                    // 프리미엄 리포트인 경우 추가 필드 설정
                    ...(isPremiumReport && {
                      isEligible: policy.isEligible !== undefined ? policy.isEligible : Math.random() > 0.3, // 70% 확률로 대상자
                      applicationDeadline: policy.applicationDeadline || "2025.12.31",
                      requiredDocuments: policy.requiredDocuments || ["신분증", "소득증명서", "임대차계약서"]
                    })
                  })),
                  header: {
                    ...response.data.header,
                    trustMetrics: {
                      participantCount: response.data.header?.participantCount || 0,
                      averageResponseDays: parseInt(response.data.header?.dataRecency?.match(/\d+/)?.[0] || '0'),
                      trustScore: response.data.header?.reliabilityScore || 0
                    }
                  },
                  // 프리미엄 리포트인 경우 분쟁 해결 가이드 확장
                  ...(isPremiumReport && {
                    disputeGuide: {
                      ...response.data.disputeGuide,
                      disputeRoadmap: response.data.disputeGuide?.disputeRoadmap || [
                        {
                          step: 1,
                          title: "내용증명 발송",
                          description: "임대인에게 수선 요구 내용증명 발송",
                          estimatedTime: "1-2주",
                          cost: "3,000원"
                        },
                        {
                          step: 2,
                          title: "분쟁조정위원회 신청",
                          description: "내용증명 무응답 시 분쟁조정위원회 신청",
                          estimatedTime: "2-4주",
                          cost: "무료"
                        },
                        {
                          step: 3,
                          title: "소송 제기",
                          description: "조정 실패 시 소송 제기 (최후 수단)",
                          estimatedTime: "3-6개월",
                          cost: "소송비용 별도"
                        }
                      ],
                      expertConsultation: {
                        available: true,
                        price: 50000,
                        duration: "15분",
                        contactInfo: "02-1234-5678"
                      }
                    }
                  })
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
                // 프리미엄 리포트인 경우 프리미엄 전용 데이터 추가
                if (isPremiumReport) {
                  transformedData.premiumFeatures = {
                    smartDiagnosis: {
                      noiseLevel: response.data.smartDiagnosis?.noiseLevel || 68,
                      floorLevel: response.data.smartDiagnosis?.floorLevel || 0.2,
                      lightIntensity: response.data.smartDiagnosis?.lightIntensity || 320,
                      measuredAt: response.data.smartDiagnosis?.measuredAt || "2025.09.08"
                    },
                    timeSeriesAnalysis: {
                      rentTrend: response.data.timeSeriesAnalysis?.rentTrend || [
                        { month: "2025.03", averageRent: 58 },
                        { month: "2025.04", averageRent: 59 },
                        { month: "2025.05", averageRent: 60 },
                        { month: "2025.06", averageRent: 61 },
                        { month: "2025.07", averageRent: 60 },
                        { month: "2025.08", averageRent: 62 },
                        { month: "2025.09", averageRent: 60 }
                      ],
                      marketVolatility: response.data.timeSeriesAnalysis?.marketVolatility || 0.15,
                      predictionConfidence: response.data.timeSeriesAnalysis?.predictionConfidence || 87
                    },
                    documentGeneration: {
                      demandLetter: true,
                      certifiedMail: true,
                      legalNotice: true
                    },
                    expertConsultation: {
                      available: true,
                      nextAvailableSlot: "2025.09.10 14:00",
                      consultationFee: 50000
                    },
                    sharingOptions: {
                      pdfDownload: true,
                      emailShare: true,
                      kakaoShare: true,
                      watermark: true
                    }
                  };
                }
                
                setReportTemplate(transformedData);
              } else {
                setError('Report data not found.');
              }
            } catch (err: any) {
              console.error('Failed to fetch report:', err);
              setError(err.message || 'Failed to load report.');
              // Even if API fails, show mock template for demonstration
              // ID에 따라 프리미엄 또는 무료 리포트 표시
              const isPremiumReport = id.includes('premium') || 
                                     (typeof window !== 'undefined' && window.location.search.includes('type=premium'));
              setReportTemplate(isPremiumReport ? mockReportData : mockFreeReportData);
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
