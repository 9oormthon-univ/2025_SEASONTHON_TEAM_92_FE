'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // useSearchParams 임포트
import { reportApi } from '../lib/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import MarketDataComparison from './MarketDataComparison';
import AutomatedDocsMock from './AutomatedDocsMock'; // 목업 컴포넌트 임포트
import ExpertConsultingMock from './ExpertConsultingMock'; // 목업 컴포넌트 임포트

// 프리미엄 기능을 포함한 확장된 데이터 인터페이스
interface PremiumReportData {
  header: { title: string; generatedDate: string; dataPeriod: string; participantCount: number; dataRecency: string; reliabilityScore: number; verifiedUserRatio?: number; };
  contractSummary: { address: string; buildingType: string; contractType: string; conditions: string; gpsVerified: boolean; contractVerified: boolean; insight?: string; };
  subjectiveMetrics: { overallScore: { category: string; myScore: number; buildingAverage: number; neighborhoodAverage: number; }; categoryScores: Array<{ category: string; myScore: number; buildingAverage: number; neighborhoodAverage: number; }>; };
  negotiationCards: Array<{ priority: number; title: string; recommendationScript: string; successProbability?: string; strategy?: string; }>;
  policyInfos: Array<{ title: string; description: string; link: string; isEligible?: boolean; }>;
  disputeGuide?: { relatedLaw: string; committeeInfo: string; formDownloadLink: string; procedure?: { step: number; title: string; description: string; }[]; };
}

export default function ComprehensiveReport({ reportId: initialReportId }: { reportId?: string }) {
  const searchParams = useSearchParams();
  const reportType = searchParams.get('type');
  const isPremium = reportType === 'premium';

  const [reportId, setReportId] = useState(initialReportId);
  const [reportData, setReportData] = useState<PremiumReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    const urlReportId = window.location.pathname.split('/').pop();
    if (urlReportId && !initialReportId) {
      setReportId(urlReportId);
    }

    const fetchData = async () => {
      if (!reportId) return;

      try {
        setIsLoading(true);
        setError('');
        
        const response = isPremium
          ? await reportApi.getPremiumReport(reportId) // 프리미엄 API 호출
          : await reportApi.getReport(reportId); // 기본 API 호출

        if (response && response.success) {
          setReportData(response.data);
          const url = `${window.location.origin}/report/${reportId}${isPremium ? '?type=premium' : ''}`;
          setShareUrl(url);
        } else {
          setError(response?.message || '리포트를 불러올 수 없습니다.');
        }
      } catch (err: any) {
        // 프리미엄 리포트 실패 시 기본 리포트로 재시도 (목업용)
        if (isPremium && err.response?.status === 404) {
          console.warn('프리미엄 리포트 API 없음. 기본 리포트로 대체합니다.');
          const fallbackResponse = await reportApi.getReport(reportId);
          if (fallbackResponse && fallbackResponse.success) {
            setReportData(fallbackResponse.data);
          } else {
            setError('리포트 로딩 중 오류 발생: ' + err.message);
          }
        } else {
          setError('리포트 로딩 중 오류 발생: ' + err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [reportId, isPremium, initialReportId]);

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('리포트 링크가 클립보드에 복사되었습니다!');
  };

  const printReport = () => window.print();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!reportData) return <div>리포트 데이터가 없습니다.</div>;

  const conditions = reportData.contractSummary.conditions || "";
  const monthlyRentMatch = conditions.match(/월세\s*(\d+)/);
  const userRent = monthlyRentMatch ? parseInt(monthlyRentMatch[1], 10) : 0;

  return (
    <div className="min-h-screen bg-white">
      <style jsx global>{`
        @media print { .no-print { display: none !important; } .print-break { page-break-before: always; } body { background: white !important; } }
      `}</style>
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        <div className="no-print flex justify-between items-center mb-8">
          <div className="flex space-x-4">
            <button onClick={copyShareUrl} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"><i className="ri-share-line mr-2"></i> 공유하기</button>
            <button onClick={printReport} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"><i className="ri-printer-line mr-2"></i> 인쇄하기</button>
          </div>
          <div className="text-sm text-gray-500">생성일: {reportData.header.generatedDate}</div>
        </div>

        {/* 1. 리포트 헤더 (프리미엄 강화) */}
        <section className="border-b-2 border-blue-200 pb-8">
          <div className="flex justify-between items-start">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">{isPremium ? `${reportData.header.title} 💎` : reportData.header.title}</h1>
            {isPremium && <span className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full">PREMIUM</span>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg"><div className="font-semibold text-blue-800 mb-2">참여 인원</div><span className="text-gray-700">{reportData.header.participantCount}명</span></div>
            <div className="bg-green-50 p-4 rounded-lg"><div className="font-semibold text-green-800 mb-2">인증 계정 비율</div><span className="text-gray-700">{isPremium ? `${reportData.header.verifiedUserRatio || 35}%` : '프리미엄 전용'}</span></div>
            <div className="bg-purple-50 p-4 rounded-lg"><div className="font-semibold text-purple-800 mb-2">데이터 최신성</div><span className="text-gray-700">{reportData.header.dataRecency}</span></div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">데이터 범위: {isPremium ? "최근 3개월 간 참여자 + 국토부 실거래가 + 환경부 데이터 반영" : "최근 3개월 간 참여자 데이터 반영"}</div>
        </section>

        {/* 2. 나의 계약 정보 요약 (프리미엄 강화) */}
        <section className="print-break">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">📋 나의 계약 정보 요약</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* ... 기존 계약 정보 ... */}
            </div>
            {isPremium && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-center font-semibold text-blue-800">{reportData.contractSummary.insight || "내 계약이 유사 그룹 대비 상위 20% 비싼 편입니다."}</p>
              </div>
            )}
          </div>
        </section>

        {/* 3. 주관적 + 객관적 지표 통합 (프리미엄) */}
        {isPremium && (
          <section className="print-break">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">🔬 주관적·객관적 지표 통합 분석</h2>
            {/* ... 게이지 차트 등 통합 시각화 UI ... */}
            <div className="text-center text-gray-500 p-8">[프리미엄] 체감 불만 vs 실제 측정값 비교 차트 영역</div>
          </section>
        )}

        {/* 4. 시세 분석 (기본/프리미엄 분리) */}
        <section className="print-break">
          <MarketDataComparison userRent={userRent} userAddress={reportData.contractSummary.address} isPremium={isPremium} />
        </section>

        {/* 5. 협상 카드 (프리미엄 강화) */}
        <section className="print-break">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">🎯 협상 카드</h2>
          <div className="space-y-6">
            {reportData.negotiationCards.map((card, index) => (
              <div key={index} className={`border-l-4 rounded-lg p-6 ${isPremium ? 'bg-yellow-50 border-yellow-500' : 'bg-gray-50 border-gray-300'}`}>
                <h3 className="text-xl font-semibold text-gray-800">{card.priority}순위: {card.title}</h3>
                <p className="text-gray-700 my-2">{card.recommendationScript}</p>
                {isPremium && (
                  <div className="mt-4 text-sm">
                    <p><span className="font-semibold">📈 성공 확률:</span> <span className="text-green-600">{card.successProbability || '높음'}</span></p>
                    <p><span className="font-semibold">💡 추천 전략:</span> {card.strategy || '법적 근거(주택임대차보호법)를 강조하며 정중하게 요구하세요.'}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 6. 전자문서 자동 작성 (프리미엄 목업) */}
        {isPremium && <AutomatedDocsMock />}

        {/* 7. 전문가 컨설팅 연결 (프리미엄 목업) */}
        {isPremium && <ExpertConsultingMock />}

        {/* 8. 맞춤형 정책/지원 정보 (프리미엄 강화) */}
        <section className="print-break">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">🏛️ 맞춤형 정책/지원 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportData.policyInfos.map((policy, index) => (
              <div key={index} className="bg-purple-50 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">{policy.title}</h3>
                  {isPremium && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${policy.isEligible ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                      {policy.isEligible ? '✅ 해당' : '❌ 미해당'}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-4">{policy.description}</p>
                <a href={policy.link} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">자세히 보기 →</a>
              </div>
            ))}
          </div>
        </section>

        {/* ... 기존 나머지 섹션들 ... */}
      </div>
    </div>
  );
}
