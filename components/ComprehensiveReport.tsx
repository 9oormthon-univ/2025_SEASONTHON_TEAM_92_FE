'use client';

import { useState, useEffect } from 'react';
import { reportApi, diagnosisApi, policyApi, disputeAgencyApi } from '../lib/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

interface ComprehensiveReportProps {
  reportId?: string;
  userId?: string;
}

interface ReportData {
  header: {
    title: string;
    generatedDate: string;
    dataPeriod: string;
    participantCount: number;
    dataRecency: string;
    reliabilityScore: number;
  };
  contractSummary: {
    address: string;
    buildingType: string;
    contractType: string;
    conditions: string;
    gpsVerified: boolean;
    contractVerified: boolean;
  };
  subjectiveMetrics: {
    overallScore: {
      category: string;
      myScore: number;
      buildingAverage: number;
      neighborhoodAverage: number;
    };
    categoryScores: Array<{
      category: string;
      myScore: number;
      buildingAverage: number;
      neighborhoodAverage: number;
    }>;
  };
  negotiationCards: Array<{
    priority: number;
    title: string;
    recommendationScript: string;
  }>;
  policyInfos: Array<{
    title: string;
    description: string;
    link: string;
  }>;
  disputeGuide?: {
    relatedLaw: string;
    committeeInfo: string;
    formDownloadLink: string;
  };
}

export default function ComprehensiveReport({ reportId, userId }: ComprehensiveReportProps) {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (reportId) {
      loadReport();
    } else {
      // reportId가 없으면 종합 리포트 생성
      generateComprehensiveReport();
    }
  }, [reportId]);

  const loadReport = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await reportApi.getReport(reportId!);
      if (response && response.success) {
        setReportData(response.data);
        setShareUrl(`${window.location.origin}/report/${reportId}`);
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

  const generateComprehensiveReport = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      console.log('종합 리포트 생성 시작...');
      
      // 종합 리포트 생성
      const reportResponse = await reportApi.getComprehensiveReport();
      console.log('리포트 응답:', reportResponse);
      
      if (reportResponse && reportResponse.success) {
        setReportData(reportResponse.data);
        // 종합 리포트의 경우 공유 URL 생성
        const newReportId = Date.now().toString();
        setShareUrl(`${window.location.origin}/report/${newReportId}`);
        console.log('리포트 데이터 설정 완료:', reportResponse.data);
      } else {
        console.error('리포트 생성 실패:', reportResponse);
        setError('종합 리포트를 생성할 수 없습니다.');
      }
    } catch (err: any) {
      console.error('Comprehensive report generation error:', err);
      setError('종합 리포트 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('리포트 링크가 클립보드에 복사되었습니다!');
  };

  const printReport = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">리포트 생성 중...</h2>
          <p className="text-gray-600 mb-4">데이터를 분석하고 맞춤형 리포트를 만들고 있습니다</p>
          <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">예상 소요 시간: 2-3초</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-error-warning-line text-3xl text-red-600"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">오류가 발생했습니다</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">리포트 데이터가 없습니다</h2>
          <p className="text-gray-600">먼저 진단을 완료해주세요.</p>
        </div>
      </div>
    );
  }

  // 차트 데이터 준비
  const barChartData = [
    { name: '내 점수', value: reportData.subjectiveMetrics.overallScore.myScore },
    { name: '동네 평균', value: reportData.subjectiveMetrics.overallScore.neighborhoodAverage },
    { name: '건물 평균', value: reportData.subjectiveMetrics.overallScore.buildingAverage }
  ];

  const radarChartData = reportData.subjectiveMetrics.categoryScores.slice(0, 6).map(category => ({
    category: category.category,
    myScore: category.myScore,
    neighborhoodAvg: category.neighborhoodAverage,
    buildingAvg: category.buildingAverage
  }));

  return (
    <div className="min-h-screen bg-white">
      {/* 인쇄용 스타일 */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
          body { background: white !important; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto p-8 space-y-8">
        
        {/* 액션 버튼 (인쇄 시 숨김) */}
        <div className="no-print flex justify-between items-center mb-8">
          <div className="flex space-x-4">
            <button
              onClick={copyShareUrl}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <i className="ri-share-line mr-2"></i>
              공유하기
            </button>
            <button
              onClick={printReport}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              <i className="ri-printer-line mr-2"></i>
              인쇄하기
            </button>
          </div>
          <div className="text-sm text-gray-500">
            생성일: {reportData.header.generatedDate}
          </div>
        </div>

        {/* 1. 리포트 헤더 */}
        <section className="border-b-2 border-blue-200 pb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">{reportData.header.title}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <i className="ri-calendar-line text-blue-600 mr-2"></i>
                <span className="font-semibold text-blue-800">생성일자</span>
              </div>
              <span className="text-gray-700">{reportData.header.generatedDate}</span>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <i className="ri-group-line text-green-600 mr-2"></i>
                <span className="font-semibold text-green-800">참여 인원</span>
              </div>
              <span className="text-gray-700">{reportData.header.participantCount}명 참여</span>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <i className="ri-shield-check-line text-purple-600 mr-2"></i>
                <span className="font-semibold text-purple-800">신뢰도 점수</span>
              </div>
              <span className="text-gray-700">{reportData.header.reliabilityScore}/100</span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 mb-2">{reportData.header.dataPeriod}</p>
            <p className="text-sm text-gray-500">데이터 최신성: {reportData.header.dataRecency}</p>
          </div>
        </section>

        {/* 2. 나의 계약 정보 요약 */}
        <section className="print-break">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">📋 나의 계약 정보 요약</h2>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-semibold text-gray-700">주소/건물명</span>
                  <span className="text-gray-900">{reportData.contractSummary.address}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-semibold text-gray-700">건물 유형</span>
                  <span className="text-gray-900">{reportData.contractSummary.buildingType}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-semibold text-gray-700">계약 유형</span>
                  <span className="text-gray-900">{reportData.contractSummary.contractType}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-semibold text-gray-700">계약 조건</span>
                  <span className="text-gray-900">{reportData.contractSummary.conditions}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700 mb-3">인증 상태</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${reportData.contractSummary.gpsVerified ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-gray-700">GPS 위치 인증</span>
                    {reportData.contractSummary.gpsVerified && (
                      <i className="ri-check-line text-green-600 ml-2"></i>
                    )}
                  </div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${reportData.contractSummary.contractVerified ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-gray-700">계약서/고지서 인증</span>
                    {reportData.contractSummary.contractVerified && (
                      <i className="ri-check-line text-green-600 ml-2"></i>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. 주관적 지표 (커뮤니티 데이터 기반) */}
        <section className="print-break">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">📊 주관적 지표 (커뮤니티 데이터 기반)</h2>
          
          {/* 거주 환경 진단 요약 */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">거주 환경 진단 요약</h3>
            
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {reportData.subjectiveMetrics.overallScore.myScore.toFixed(1)}점
              </div>
              <div className="text-lg text-gray-600">
                동네 평균 {reportData.subjectiveMetrics.overallScore.neighborhoodAverage.toFixed(1)}점 / 
                같은 건물 평균 {reportData.subjectiveMetrics.overallScore.buildingAverage.toFixed(1)}점
              </div>
            </div>
            
            {/* 종합 점수 막대 그래프 */}
            <div className="h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
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
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">카테고리별 비교</h3>
            
            {/* 카테고리별 점수 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {reportData.subjectiveMetrics.categoryScores.slice(0, 6).map((category, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-800 mb-2">{category.category}</div>
                    <div className="text-3xl font-bold text-blue-600 mb-1">{category.myScore.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">
                      동네 평균 {category.neighborhoodAverage.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">
                      건물 평균 {category.buildingAverage.toFixed(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* 레이더 차트 */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarChartData}>
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

        {/* 4. 객관적 지표 (공공 데이터 기반) */}
        <section className="print-break">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">📈 객관적 지표 (공공 데이터 기반)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 시세 비교 */}
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">시세 비교</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">국토부 실거래가 평균</span>
                  <span className="font-semibold text-gray-900">62만원</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">내 계약</span>
                  <span className="font-semibold text-gray-900">60만원</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-green-600">동네 평균 대비 -3%</span>
                </div>
              </div>
            </div>

            {/* 관리비 비교 */}
            <div className="bg-orange-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">관리비 비교</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">공동주택 평균</span>
                  <span className="font-semibold text-gray-900">12만원</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">내 입력값</span>
                  <span className="font-semibold text-gray-900">10만원</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    정상 범위
                  </span>
                </div>
              </div>
            </div>

            {/* 소음/환경 */}
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">소음/환경</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">환경부 평균</span>
                  <span className="font-semibold text-gray-900">62dB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">사용자 응답</span>
                  <span className="font-semibold text-gray-900">68dB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    체감 불만이 실제 데이터와 일치
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. 협상 카드 (자동 생성) */}
        <section className="print-break">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">🎯 협상 카드 (자동 생성)</h2>
          
          <div className="space-y-6">
            {reportData.negotiationCards.map((card, index) => (
              <div key={index} className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {card.priority}순위: {card.title}
                  </h3>
                  <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                    우선순위 {card.priority}
                  </span>
                </div>
                
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="text-gray-700 leading-relaxed">{card.recommendationScript}</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">💡 추천 멘트:</span> "{card.recommendationScript}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. 맞춤형 정책/지원 정보 */}
        <section className="print-break">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">🏛️ 맞춤형 정책/지원 정보</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">청년 월세 특별지원</h3>
              <p className="text-gray-600 text-sm mb-4">국토부에서 제공하는 청년층 월세 지원 정책</p>
              <div className="mb-4">
                <span className="text-xs font-semibold text-gray-500">신청 조건:</span>
                <p className="text-xs text-gray-600">만 19-39세, 소득 기준 충족</p>
              </div>
              <a 
                href="https://www.molit.go.kr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition-colors"
              >
                신청하기
              </a>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">서울시 청년 월세 지원금</h3>
              <p className="text-gray-600 text-sm mb-4">서울 거주 청년을 위한 월세 지원금</p>
              <div className="mb-4">
                <span className="text-xs font-semibold text-gray-500">신청 조건:</span>
                <p className="text-xs text-gray-600">서울 거주, 만 19-34세</p>
              </div>
              <a 
                href="https://youth.seoul.go.kr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                신청하기
              </a>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">전세보증금 반환보증 (HUG)</h3>
              <p className="text-gray-600 text-sm mb-4">전세보증금 반환을 보장하는 제도</p>
              <div className="mb-4">
                <span className="text-xs font-semibold text-gray-500">관련 정보:</span>
                <p className="text-xs text-gray-600">국민주택기금에서 운영</p>
              </div>
              <a 
                href="https://www.hug.or.kr" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors"
              >
                자세히 보기
              </a>
            </div>
          </div>
        </section>

        {/* 7. 분쟁 해결 가이드 */}
        <section className="print-break">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">⚖️ 분쟁 해결 가이드</h2>
          
          <div className="space-y-6">
            <div className="bg-red-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">관련 법령</h3>
              <p className="text-gray-700">
                주택임대차보호법 제8조 (임대인 수선 의무)
              </p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">분쟁조정위원회</h3>
              <p className="text-gray-700 mb-2">
                서울서부 임대차분쟁조정위원회
              </p>
              <p className="text-gray-600 text-sm">
                연락처: 02-1234-5678 | 웹사이트: www.seoul-rental.go.kr
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">표준 양식</h3>
              <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
                수선 요구서 다운로드
              </button>
            </div>
          </div>
        </section>

        {/* 8. 푸시 알림/업데이트 요소 */}
        <section className="print-break">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">🔄 업데이트 정보</h2>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="space-y-3 text-gray-600">
              <p>• 본 리포트는 새로운 참여자 데이터가 추가될 경우 자동 업데이트됩니다.</p>
              <p>• 이 리포트는 최근 3개월 내 데이터 기준으로 작성되었습니다.</p>
              <p>• 데이터 신뢰도: {reportData.header.reliabilityScore}/100점</p>
              <p>• 참여자 수: {reportData.header.participantCount}명</p>
            </div>
          </div>
        </section>

        {/* 공유 정보 (인쇄 시 숨김) */}
        <div className="no-print mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">📤 리포트 공유</h3>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
            />
            <button
              onClick={copyShareUrl}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              복사
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            💡 이 링크를 임대인에게 전달하면 회원가입 없이도 리포트를 확인할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}