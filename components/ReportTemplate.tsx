'use client';

import { useState, useEffect } from 'react';
import type { ReportTemplate } from '@/types';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { reportApi, policyApi, disputeAgencyApi, rentalLawApi } from '@/lib/api';
import MarketDataComparison from './MarketDataComparison';
import VerificationBadge from './VerificationBadge';
import toast from 'react-hot-toast';

interface ReportTemplateProps {
  data: ReportTemplate;
  reportId?: string;
}

export default function ReportTemplate({ data, reportId }: ReportTemplateProps) {
  const [reportData, setReportData] = useState<ReportTemplate>(data);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (reportId) {
      loadReportData();
    }
  }, [reportId]);

  const loadReportData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await reportApi.getReport(reportId!);
      if (response && response.success) {
        setReportData(response.data);
      } else {
        setError('리포트를 불러올 수 없습니다.');
      }
    } catch (err: any) {
      console.error('Report load error:', err);
      setError('리포트를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPolicyInfo = async () => {
    try {
      const response = await policyApi.getPersonalizedPolicies();
      if (response && response.success) {
        // 정책 정보를 리포트 데이터에 추가
        setReportData(prev => ({
          ...prev,
          policyInfo: response.data.recommendedPolicies.map((policy: any) => ({
            title: policy.policyName,
            description: policy.summary,
            eligibility: policy.eligibilityStatus,
            link: policy.externalUrl
          }))
        }));
      }
    } catch (err: any) {
      console.error('Policy load error:', err);
    }
  };

  const loadDisputeGuide = async () => {
    try {
      const response = await disputeAgencyApi.getRecommendedAgencies('general');
      if (response && response.success && response.data.agencies.length > 0) {
        const agency = response.data.agencies[0];
        setReportData(prev => ({
          ...prev,
          disputeGuide: {
            relatedLaw: "주택임대차보호법 제8조 (임대인 수선 의무)",
            committeeContact: `${agency.agencyName}: ${agency.contactInfo.phone}`,
            templateDownload: "수선 요구서 다운로드"
          }
        }));
      }
    } catch (err: any) {
      console.error('Dispute guide load error:', err);
    }
  };


  useEffect(() => {
    // 정책 정보와 분쟁 해결 가이드 로드
    loadPolicyInfo();
    loadDisputeGuide();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">리포트를 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadReportData}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 차트 데이터 준비 (안전한 접근)
  const radarData = [
    { 
      category: '채광', 
      myScore: reportData.subjectiveMetrics.categories?.lighting?.myScore || 0, 
      neighborhoodAvg: reportData.subjectiveMetrics.categories?.lighting?.neighborhoodAvg || 0, 
      buildingAvg: reportData.subjectiveMetrics.categories?.lighting?.buildingAvg || 0 
    },
    { 
      category: '방음', 
      myScore: reportData.subjectiveMetrics.categories?.soundproofing?.myScore || 0, 
      neighborhoodAvg: reportData.subjectiveMetrics.categories?.soundproofing?.neighborhoodAvg || 0, 
      buildingAvg: reportData.subjectiveMetrics.categories?.soundproofing?.buildingAvg || 0 
    },
    { 
      category: '주차', 
      myScore: reportData.subjectiveMetrics.categories?.parking?.myScore || 0, 
      neighborhoodAvg: reportData.subjectiveMetrics.categories?.parking?.neighborhoodAvg || 0, 
      buildingAvg: reportData.subjectiveMetrics.categories?.parking?.buildingAvg || 0 
    }
  ];

  const barData = [
    { name: '내 점수', value: reportData.subjectiveMetrics?.overallScore || 0 },
    { name: '동네 평균', value: reportData.subjectiveMetrics?.neighborhoodAverage || 0 },
    { name: '건물 평균', value: reportData.subjectiveMetrics?.buildingAverage || 0 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-8">
        
        {/* 1. 리포트 헤더 */}
        <section className="border-b-2 border-blue-200 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{reportData?.header?.title || '리포트 제목'}</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <span className="font-semibold text-blue-800">생성일자:</span>
              <span className="ml-2 text-gray-700">{reportData?.header?.createdAt || '알 수 없음'}</span>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <span className="font-semibold text-green-800">참여 인원:</span>
              <span className="ml-2 text-gray-700">{reportData?.header?.trustMetrics?.participantCount || 0}명</span>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <span className="font-semibold text-purple-800">신뢰도 점수:</span>
              <span className="ml-2 text-gray-700">{reportData?.header?.trustMetrics?.trustScore || 0}/100</span>
            </div>
          </div>
          <p className="text-gray-600 mt-4">{reportData?.header?.dataPeriod || '데이터 기간 정보 없음'}</p>
        </section>

        {/* 2. 나의 계약 정보 요약 */}
        <section className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">나의 계약 정보 요약</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">주소/건물명:</span>
                <span className="text-gray-900">{reportData.contractInfo?.address || '주소 정보 없음'} {reportData.contractInfo?.buildingName || ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">건물 유형:</span>
                <span className='text-gray-900'>{reportData.contractInfo?.buildingType || '정보 없음'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">계약 유형:</span>
                <span className='text-gray-900'>{reportData.contractInfo?.contractType || '정보 없음'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">조건:</span>
                <span className='text-gray-900'>보증금 {reportData.contractInfo?.deposit || '미입력'}만원 / 월세 {reportData.contractInfo?.monthlyRent || '미입력'}만원 / 관리비 {reportData.contractInfo?.managementFee || '미입력'}만원</span>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="font-semibold text-gray-700 block mb-2">인증 상태:</span>
                <VerificationBadge 
                  gpsVerified={reportData.contractInfo?.gpsVerified || false}
                  contractVerified={reportData.contractInfo?.contractVerified || false}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3. 주관적 지표 */}
        <section className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">주관적 지표 (커뮤니티 데이터 기반)</h2>
          
          {/* 종합 점수 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">거주 환경 진단 요약</h3>
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{reportData.subjectiveMetrics?.overallScore || 0}점</div>
                <div className="text-sm text-gray-600">
                  동네 평균 {reportData.subjectiveMetrics?.neighborhoodAverage || 0}점 / 같은 건물 평균 {reportData.subjectiveMetrics?.buildingAverage || 0}점
                </div>
              </div>
            </div>
            
            {/* 막대 그래프 */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 카테고리별 비교 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">카테고리별 비교</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-800 mb-2">채광</div>
                  <div className="text-2xl font-bold text-blue-600">{data.subjectiveMetrics.categories?.lighting?.myScore || 0}</div>
                  <div className="text-sm text-gray-600">동네 평균 {data.subjectiveMetrics.categories?.lighting?.neighborhoodAvg || 0}</div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-800 mb-2">방음</div>
                  <div className="text-2xl font-bold text-blue-600">{data.subjectiveMetrics.categories?.soundproofing?.myScore || 0}</div>
                  <div className="text-sm text-gray-600">건물 평균 {data.subjectiveMetrics.categories?.soundproofing?.buildingAvg || 0}</div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-800 mb-2">주차</div>
                  <div className="text-2xl font-bold text-blue-600">{data.subjectiveMetrics.categories?.parking?.myScore || 0}</div>
                  <div className="text-sm text-gray-600">동네 평균 {data.subjectiveMetrics.categories?.parking?.neighborhoodAvg || 0}</div>
                </div>
              </div>
            </div>
            
            {/* 레이더 차트 */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis domain={[0, 5]} />
                  <Radar name="내 점수" dataKey="myScore" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  <Radar name="동네 평균" dataKey="neighborhoodAvg" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  <Radar name="건물 평균" dataKey="buildingAvg" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* 4. 객관적 지표 - 실거래가 기반 시세 분석 */}
        <MarketDataComparison 
          userRent={reportData.contractInfo?.monthlyRent || 0}
          userAddress={reportData.contractInfo?.address}
        />

        {/* 5. 협상 카드 */}
        <section className="bg-yellow-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">협상 카드 (자동 생성)</h2>
          <div className="space-y-4">
            {reportData.negotiationCards.map((card, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">{card.priority}순위: {card.title}</h3>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">우선순위 {card.priority}</span>
                </div>
                <p className="text-gray-700 mb-3">{card.content}</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">추천 멘트:</span> {card.recommendedMent}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. 맞춤형 정책/지원 정보 */}
        <section className="bg-purple-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">맞춤형 정책/지원 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reportData.policyInfo.map((policy, index) => (
              <div key={index} className="bg-white rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{policy.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{policy.description}</p>
                <div className="mb-3">
                  <span className="text-xs font-semibold text-gray-500">신청 조건:</span>
                  <p className="text-xs text-gray-600">{policy.eligibility}</p>
                </div>
                <a 
                  href={policy.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                >
                  신청하기
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* 7. 분쟁 해결 가이드 */}
        <section className="bg-red-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">분쟁 해결 가이드</h2>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">관련 법령</h3>
              <p className="text-gray-700">{reportData.disputeGuide?.relatedLaw || "주택임대차보호법 제8조 (임대인 수선 의무)"}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">분쟁조정위원회</h3>
              <p className="text-gray-700">{reportData.disputeGuide?.committeeContact || "서울서부 임대차분쟁조정위원회: 02-1234-5678"}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">표준 양식</h3>
              <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                {reportData.disputeGuide?.templateDownload || "수선 요구서 다운로드"}
              </button>
            </div>
          </div>
        </section>

        {/* 8. 푸시 알림/업데이트 요소 */}
        <section className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">업데이트 정보</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• 본 리포트는 새로운 참여자 데이터가 추가될 경우 자동 업데이트됩니다.</p>
            <p>• 이 리포트는 최근 3개월 내 데이터 기준으로 작성되었습니다.</p>
            <p>• 데이터 신뢰도: {reportData.header.trustMetrics.trustScore}/100점</p>
          </div>
        </section>
      </div>
    </div>
  );
}