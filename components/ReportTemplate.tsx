'use client';

import { useState, useEffect } from 'react';
import type { ReportTemplate } from '@/types';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
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
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{reportData?.header?.title || '리포트 제목'}</h1>
            {reportData?.reportType === 'premium' && (
              <div className="flex items-center space-x-2">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  💎 프리미엄
                </span>
                <span className="text-xs text-gray-500">실제 협상 무기 제공</span>
              </div>
            )}
            {reportData?.reportType === 'free' && (
              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                  📊 무료
                </span>
                <span className="text-xs text-gray-500">기본 정보 확인</span>
              </div>
            )}
          </div>
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
          buildingType={reportData.contractInfo?.buildingType}
        />

        {/* 5. 협상 카드 */}
        <section className="bg-yellow-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            협상 카드 (자동 생성)
            {reportData?.reportType === 'premium' && (
              <span className="ml-2 text-sm text-purple-600 font-normal">+ 성공 확률 & 전문가 팁</span>
            )}
          </h2>
          <div className="space-y-4">
            {(reportData.negotiationCards || []).map((card, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">{card.priority}순위: {card.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">우선순위 {card.priority}</span>
                    {reportData?.reportType === 'premium' && card.successProbability && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                        성공률 {card.successProbability}%
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{card.content}</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">추천 멘트:</span> {card.recommendedMent}
                  </p>
                </div>
                
                {/* 프리미엄 전용 기능들 */}
                {reportData?.reportType === 'premium' && (
                  <div className="space-y-3">
                    {card.alternativeStrategy && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-sm text-purple-800">
                          <span className="font-semibold">대체 전략:</span> {card.alternativeStrategy}
                        </p>
                      </div>
                    )}
                    {card.expertTip && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          <span className="font-semibold">💡 전문가 팁:</span> {card.expertTip}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 6. 맞춤형 정책/지원 정보 */}
        <section className="bg-purple-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            맞춤형 정책/지원 정보
            {reportData?.reportType === 'premium' && (
              <span className="ml-2 text-sm text-purple-600 font-normal">+ 자동 매칭 & 신청 가이드</span>
            )}
          </h2>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>팁:</strong> 아래 정책들은 실제 정부 지원 사이트로 연결됩니다. 
              신청 전 해당 사이트에서 최신 정보와 자격 요건을 확인하세요.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(reportData.policyInfo || []).map((policy, index) => (
              <div key={index} className="bg-white rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{policy.title}</h3>
                  {reportData?.reportType === 'premium' && policy.isEligible !== undefined && (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      policy.isEligible 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {policy.isEligible ? '✅ 대상자' : ''}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-3">{policy.description}</p>
                <div className="mb-3">
                  <span className="text-xs font-semibold text-gray-500">신청 조건:</span>
                  <p className="text-xs text-gray-600">{policy.eligibility || "상세 조건은 해당 사이트에서 확인하세요."}</p>
                </div>
                
                {/* 정책별 상세 정보 */}
                <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-gray-700">지원 내용:</span>
                    <span className="text-gray-600">
                      {policy.title.includes('청년 월세') ? '월세 일부 지원' : 
                       policy.title.includes('HUG') ? '전세보증금 보장' : '월세 지원금'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">대상:</span>
                    <span className="text-gray-600">
                      {policy.title.includes('청년') ? '청년층' : '전세 거주자'}
                    </span>
                  </div>
                </div>
                
                {/* 프리미엄 전용 정보 */}
                {reportData?.reportType === 'premium' && (
                  <div className="mb-3 space-y-2">
                    {policy.applicationDeadline && (
                      <div className="bg-blue-50 p-2 rounded">
                        <span className="text-xs font-semibold text-blue-800">신청 마감:</span>
                        <p className="text-xs text-blue-600">{policy.applicationDeadline}</p>
                      </div>
                    )}
                    {policy.requiredDocuments && (
                      <div className="bg-yellow-50 p-2 rounded">
                        <span className="text-xs font-semibold text-yellow-800">필요 서류:</span>
                        <ul className="text-xs text-yellow-600 mt-1">
                          {policy.requiredDocuments.map((doc, docIndex) => (
                            <li key={docIndex}>• {doc}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <a 
                    href={policy.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 flex items-center"
                  >
                    <span className="mr-1">🔗</span>
                    신청하기
                  </a>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(policy.link);
                      toast.success('링크가 클립보드에 복사되었습니다.');
                    }}
                    className="inline-block bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 flex items-center"
                  >
                    <span className="mr-1">📋</span>
                    링크 복사
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. 분쟁 해결 가이드 */}
        <section className="bg-red-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            분쟁 해결 가이드
            {reportData?.reportType === 'premium' && (
              <span className="ml-2 text-sm text-purple-600 font-normal">+ 로드맵 & 전문가 상담</span>
            )}
          </h2>
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
            
            {/* 프리미엄 전용 분쟁 해결 로드맵 */}
            {reportData?.reportType === 'premium' && reportData.disputeGuide?.disputeRoadmap && (
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">분쟁 해결 로드맵</h3>
                <div className="space-y-3">
                  {reportData.disputeGuide.disputeRoadmap.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{step.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                        <div className="flex space-x-4 text-xs text-gray-500">
                          <span>⏱️ {step.estimatedTime}</span>
                          <span>💰 {step.cost}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 프리미엄 전용 전문가 상담 */}
            {reportData?.reportType === 'premium' && reportData.disputeGuide?.expertConsultation && (
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">전문가 상담</h3>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">임대차 전문 변호사 상담</h4>
                      <p className="text-sm text-gray-600">15분 전화 상담</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600">{reportData.disputeGuide.expertConsultation.price.toLocaleString()}원</div>
                      <div className="text-xs text-gray-500">{reportData.disputeGuide.expertConsultation.duration}</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700">
                      상담 예약하기
                    </button>
                    <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-300">
                      자세히 보기
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 프리미엄 전용 기능들 */}
        {reportData?.reportType === 'premium' && reportData.premiumFeatures && (
          <>
            {/* 스마트 진단 데이터 */}
            {reportData.premiumFeatures.smartDiagnosis && (
              <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">🔬 스마트 진단 데이터</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {isNaN(reportData.premiumFeatures.smartDiagnosis.noiseLevel) ? '--' : reportData.premiumFeatures.smartDiagnosis.noiseLevel}dB
                    </div>
                    <div className="text-sm text-gray-600">소음 수준</div>
                    <div className="text-xs text-gray-500 mt-1">측정일: {reportData.premiumFeatures.smartDiagnosis.measuredAt}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">{reportData.premiumFeatures.smartDiagnosis.floorLevel}°</div>
                    <div className="text-sm text-gray-600">수평도</div>
                    <div className="text-xs text-gray-500 mt-1">건물 기울기 측정</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      {reportData.premiumFeatures.smartDiagnosis.internetSpeed ? `${reportData.premiumFeatures.smartDiagnosis.internetSpeed}Mbps` : '--'}
                    </div>
                    <div className="text-sm text-gray-600">인터넷 속도</div>
                    <div className="text-xs text-gray-500 mt-1">다운로드 속도</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600 mb-2">{reportData.premiumFeatures.smartDiagnosis.lightIntensity}lux</div>
                    <div className="text-sm text-gray-600">채광 강도</div>
                    <div className="text-xs text-gray-500 mt-1">자연광 측정</div>
                  </div>
                </div>
              </section>
            )}

            {/* 시계열 분석 */}
            {reportData.premiumFeatures.timeSeriesAnalysis && (
              <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">📈 시계열 분석 (최근 7개월)</h2>
                <div className="bg-white rounded-lg p-4 mb-4">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={reportData.premiumFeatures.timeSeriesAnalysis.rentTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="averageRent" stroke="#10B981" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">시장 변동성</h3>
                    <div className="text-2xl font-bold text-orange-600">{(reportData.premiumFeatures.timeSeriesAnalysis.marketVolatility * 100).toFixed(1)}%</div>
                    <p className="text-sm text-gray-600">월세 변동 폭</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">예측 신뢰도</h3>
                    <div className="text-2xl font-bold text-blue-600">{reportData.premiumFeatures.timeSeriesAnalysis.predictionConfidence}%</div>
                    <p className="text-sm text-gray-600">향후 시세 예측 정확도</p>
                  </div>
                </div>
              </section>
            )}

            {/* 문서 생성 및 전문가 상담 */}
            <section className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🛠️ 프리미엄 실행 도구</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 문서 생성 */}
                {reportData.premiumFeatures.documentGeneration && (
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">전자문서 자동 생성</h3>
                    <div className="space-y-3">
                      <button className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-between">
                        <span>수선 요구서 생성</span>
                        <span className="text-xs">무료</span>
                      </button>
                      <button className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center justify-between">
                        <span>내용증명 발송</span>
                        <span className="text-xs">3,000원</span>
                      </button>
                      <button className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center justify-between">
                        <span>법적 고지서 생성</span>
                        <span className="text-xs">5,000원</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 전문가 상담 */}
                {reportData.premiumFeatures.expertConsultation && (
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">👨‍💼 전문가 상담</h3>
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 mb-2">{reportData.premiumFeatures.expertConsultation.consultationFee.toLocaleString()}원</div>
                        <div className="text-sm text-gray-600 mb-2">15분 전화 상담</div>
                        <div className="text-xs text-gray-500">다음 가능 시간: {reportData.premiumFeatures.expertConsultation.nextAvailableSlot}</div>
                      </div>
                    </div>
                    <button className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                      전문가 상담 예약하기
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* 공유 및 다운로드 */}
            {reportData.premiumFeatures.sharingOptions && (
              <section className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">📤 공유 및 다운로드</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 flex flex-col items-center">
                    <span className="text-2xl mb-1">📄</span>
                    <span className="text-sm">PDF 다운로드</span>
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex flex-col items-center">
                    <span className="text-2xl mb-1">📧</span>
                    <span className="text-sm">이메일 공유</span>
                  </button>
                  <button className="bg-yellow-500 text-white px-4 py-3 rounded-lg hover:bg-yellow-600 flex flex-col items-center">
                    <span className="text-2xl mb-1">💬</span>
                    <span className="text-sm">카톡 공유</span>
                  </button>
                  <button className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 flex flex-col items-center">
                    <span className="text-2xl mb-1">🔗</span>
                    <span className="text-sm">링크 복사</span>
                  </button>
                </div>
                <div className="mt-4 text-center">
                  <span className="text-xs text-gray-500">💎 프리미엄 워터마크 포함</span>
                </div>
              </section>
            )}
          </>
        )}

        {/* 8. 푸시 알림/업데이트 요소 */}
        <section className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">업데이트 정보</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• 본 리포트는 새로운 참여자 데이터가 추가될 경우 자동 업데이트됩니다.</p>
            <p>• 이 리포트는 최근 {reportData?.reportType === 'premium' ? '3개월' : '1개월'} 내 데이터 기준으로 작성되었습니다.</p>
            <p>• 데이터 신뢰도: {reportData?.header?.trustMetrics?.trustScore || 0}/100점</p>
            {reportData?.reportType === 'free' && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 font-semibold mb-2">💎 프리미엄 리포트로 업그레이드하세요!</p>
                <p className="text-blue-700 text-sm mb-3">더 상세한 분석, 전문가 상담, 문서 생성 등 프리미엄 기능을 이용해보세요.</p>
                <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded hover:from-purple-600 hover:to-pink-600">
                  프리미엄으로 업그레이드
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}