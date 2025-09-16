'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { reportApi } from '../lib/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import MarketDataComparison from './MarketDataComparison';
import TimeSeriesChart from './TimeSeriesChart';
import DocumentGenerator from './DocumentGenerator';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- 프리미엄 리포트용 확장 인터페이스 정의 ---

// 스마트 진단 데이터 타입
interface SmartDiagnosisData {
  noise?: { value: number; average: number; };
  level?: { value: number; average: number; };
  lighting?: { value: number; average: number; };
}

// 유사 그룹 데이터 타입
interface PeerGroupData {
  id: string;
  rent: number;
  deposit: number;
  area: number;
  contractDate: string;
}

// 시계열 데이터 타입
interface TimeSeriesData {
  date: string; // 예: "2023-01"
  rentPrice: number;
}

// 기존 ReportData를 확장한 PremiumReportData
interface PremiumReportData {
  header: { 
    title: string; 
    generatedDate: string; 
    dataPeriod: string; 
    participantCount: number; 
    dataRecency: string; 
    reliabilityScore: number;
    verifiedUserRatio?: number; // 프리미엄 필드
  };
  contractSummary: { 
    address: string; 
    buildingType: string; 
    contractType: string; 
    conditions: string; 
    gpsVerified: boolean; 
    contractVerified: boolean;
    insight?: string; // 프리미엄 필드
  };
  subjectiveMetrics: { 
    overallScore: { category: string; myScore: number; buildingAverage: number; neighborhoodAverage: number; }; 
    categoryScores: Array<{ category: string; myScore: number; buildingAverage: number; neighborhoodAverage: number; }>; 
  };
  negotiationCards: Array<{ 
    priority: number; 
    title: string; 
    recommendationScript: string;
    successProbability?: string; // 프리미엄 필드
    strategy?: string; // 프리미엄 필드
  }>;
  policyInfos: Array<{ 
    title: string; 
    description: string; 
    link: string;
    isEligible?: boolean; // 프리미엄 필드
  }>;
  disputeGuide?: { 
    relatedLaw: string; 
    committeeInfo: string; 
    formDownloadLink: string;
    procedure?: { step: number; title: string; description: string; }[]; // 프리미엄 필드
  };

  // 프리미엄 전용 신규 데이터 필드
  smartDiagnosisData?: SmartDiagnosisData;
  peerGroupData?: PeerGroupData[];
  timeSeriesData?: TimeSeriesData[];
}

// ------------------------------------------


export default function ComprehensiveReport({ 
  reportId: initialReportId, 
  smartDiagnosisData 
}: { 
  reportId?: string;
  smartDiagnosisData?: any;
}) {
  const searchParams = useSearchParams();
  const reportType = searchParams.get('type');
  const isPremium = reportType === 'premium';

  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [showDocumentGenerator, setShowDocumentGenerator] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const response = initialReportId 
          ? await reportApi.getReport(initialReportId)
          : await reportApi.getComprehensiveReport();

        if (response && response.success) {
          console.log('API Response:', response);
          console.log('Report Data:', response.data);
          setReportData(response.data);
          const url = initialReportId 
            ? `${window.location.origin}/report/${initialReportId}${isPremium ? '?type=premium' : ''}`
            : window.location.href;
          setShareUrl(url);
        } else {
          setError(response?.message || '리포트를 불러올 수 없습니다.');
        }
      } catch (err: any) {
        console.error('Report loading error:', err);
        setError('리포트 로딩 중 오류 발생: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [initialReportId, isPremium]);

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('리포트 링크가 클립보드에 복사되었습니다!');
  };

  const printReport = () => window.print();

  const downloadPDF = async () => {
    try {
      toast.loading('PDF를 생성하는 중입니다...', { id: 'pdf-loading' });
      
      // PDF 생성을 위해 print 스타일 적용
      const printElements = document.querySelectorAll('.no-print');
      printElements.forEach(el => (el as HTMLElement).style.display = 'none');
      
      // 컨테이너 요소 가져오기
      const element = document.querySelector('.pdf-container') as HTMLElement;
      if (!element) {
        throw new Error('PDF 생성할 요소를 찾을 수 없습니다.');
      }

      // html2canvas로 이미지 생성 (고해상도)
      const canvas = await html2canvas(element, {
        scale: 2, // 고해상도
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        height: element.scrollHeight,
        width: element.scrollWidth,
      });

      // PDF 생성
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // PDF 크기 계산
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      // 여러 페이지 처리
      let heightLeft = imgHeight * ratio;
      let position = 0;

      // 첫 페이지 추가
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      heightLeft -= pdfHeight;

      // 추가 페이지들
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight * ratio;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio);
        heightLeft -= pdfHeight;
      }

      // PDF 다운로드
      const fileName = `${reportData?.contractSummary?.address || '월세협상리포트'}_${reportData?.header?.generatedDate || new Date().toLocaleDateString()}.pdf`;
      pdf.save(fileName);

      // print 스타일 복원
      printElements.forEach(el => (el as HTMLElement).style.display = '');
      
      toast.success('PDF 다운로드가 완료되었습니다!', { id: 'pdf-loading' });
      
    } catch (error) {
      console.error('PDF 생성 실패:', error);
      toast.error('PDF 생성 중 오류가 발생했습니다.', { id: 'pdf-loading' });
      
      // print 스타일 복원
      const printElements = document.querySelectorAll('.no-print');
      printElements.forEach(el => (el as HTMLElement).style.display = '');
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 to-purple-200">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-purple-700">리포트를 생성하는 중입니다...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 to-purple-200">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h2>
        <p className="text-gray-700">{error}</p>
      </div>
    </div>
  );
  
  if (!reportData) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 to-purple-200">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">리포트 없음</h2>
        <p className="text-gray-600">요청하신 리포트를 찾을 수 없습니다.</p>
      </div>
    </div>
  );

  // 리포트 데이터 구조 안전성 강화
  if (!reportData.contractSummary) {
    console.error('Report data missing contractSummary:', reportData);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 to-purple-200">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">데이터 오류</h2>
          <p className="text-gray-600">리포트 데이터 구조에 문제가 있습니다.</p>
          <p className="text-sm text-gray-500 mt-2">contractSummary 정보가 누락되었습니다.</p>
        </div>
      </div>
    );
  }

  const conditions = reportData?.contractSummary?.conditions || "";
  const monthlyRentMatch = conditions.match(/월세\s*(\d+)/);
  const userRent = monthlyRentMatch ? parseInt(monthlyRentMatch[1], 10) : 0;
  
  // 리포트 데이터 구조 안전성 확인
  console.log('Report Data Structure:', {
    reportData: reportData,
    contractSummary: reportData?.contractSummary,
    address: reportData?.contractSummary?.address,
    buildingType: reportData?.contractSummary?.buildingType
  });

  // 디버깅을 위한 로그
  console.log('Report Data Structure:', {
    reportData,
    header: reportData?.header,
    participantCount: reportData?.header?.participantCount
  });

  const barChartData = [
    { name: '내 점수', value: reportData?.subjectiveMetrics?.overallScore?.myScore || 0 },
    { name: '동네 평균', value: reportData?.subjectiveMetrics?.overallScore?.neighborhoodAverage || 0 },
    { name: '건물 평균', value: reportData?.subjectiveMetrics?.overallScore?.buildingAverage || 0 }
  ];

  const radarChartData = (reportData?.subjectiveMetrics?.categoryScores || []).map((c: any) => ({ 
    category: c.category || '알 수 없음', 
    myScore: c.myScore || 0, 
    neighborhoodAvg: c.neighborhoodAverage || 0 
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-purple-200">
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
          body { background: white !important; }
        }
      `}</style>

      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="text-violet-500 text-3xl font-normal mb-4">월세의 정석</div>
          <div className="w-16 h-1 bg-violet-500 rounded-full mx-auto mb-6"></div>
          <h1 className="text-gray-800 text-2xl md:text-3xl font-bold mb-2">생성된 협상 리포트</h1>
          <p className="text-gray-600 text-base">임대인과 공유할 수 있는 완전한 협상 리포트입니다</p>
        </div>

        {/* 공유 버튼 */}
        <div className="no-print flex justify-center mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={copyShareUrl} className="bg-gradient-to-r from-[#9333EA] to-[#C084FC] text-white px-6 py-3 rounded-xl hover:from-[#7C3AED] hover:to-[#A855F7] transition-all flex items-center justify-center shadow-lg">
              <i className="ri-share-line mr-2"></i> 링크 공유
            </button>
            <button onClick={downloadPDF} className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center shadow-lg">
              <i className="ri-download-line mr-2"></i> PDF 다운로드
            </button>
            {isPremium && (
              <button 
                onClick={() => setShowDocumentGenerator(true)}
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all flex items-center justify-center shadow-lg"
              >
                <i className="ri-file-text-line mr-2"></i> 법적 문서 생성
              </button>
            )}
            <button onClick={printReport} className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-all flex items-center justify-center shadow-lg">
              <i className="ri-printer-line mr-2"></i> 브라우저 인쇄
            </button>
          </div>
        </div>

        {/* 메인 카드 */}
        <div className="pdf-container bg-white rounded-2xl shadow-xl border border-violet-200 overflow-hidden">
          
          {/* 1. 리포트 헤더 - 보라색 배경 */}
          <section className="bg-gradient-to-r from-purple-900 to-purple-800 text-white p-6 md:p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-file-chart-line text-4xl text-white"></i>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold mb-4">
                {reportData?.contractSummary?.address || '주소 정보 없음'} 임대차 협상 리포트
                {isPremium && ' 💎'}
              </h1>
              
              <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-6 text-sm">
                <div className="flex items-center">
                  <i className="ri-calendar-line mr-2"></i>
                  생성일자: {reportData?.header?.generatedDate || '알 수 없음'}
                </div>
                <div className="flex items-center">
                  <i className="ri-time-line mr-2"></i>
                  데이터 기간: 최근 1개월
                </div>
              </div>
              
              <p className="text-white/80 text-sm max-w-2xl mx-auto mb-8">{reportData?.header?.dataPeriod || '데이터 기간 정보가 없습니다.'}</p>
            </div>
            
            {/* 데이터 신뢰도 */}
            <div className="bg-white/10 rounded-2xl backdrop-blur-sm p-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center mb-2">
                  <i className="ri-shield-check-line text-white text-xl mr-2"></i>
                  <h2 className="text-white text-xl font-bold">데이터 신뢰도</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold mb-2">{reportData?.header?.participantCount || 0}명</div>
                  <div className="text-white/80 text-sm">참여 인원 수</div>
                </div>
                <div className="border-l border-r border-white/30 px-4">
                  <div className="text-3xl font-bold mb-2">{reportData?.header?.dataRecency || '알 수 없음'}</div>
                  <div className="text-white/80 text-sm">평균 응답 시점</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">{reportData?.header?.reliabilityScore || 0}/100</div>
                  <div className="text-white/80 text-sm">신뢰도 점수</div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. 나의 계약 정보 요약 */}
          <section className="p-6 md:p-8 border-b border-purple-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📋 나의 계약 정보 요약</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 기본 정보 */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <i className="ri-map-pin-line text-violet-500 text-xl mr-3"></i>
                  <div>
                    <div className="text-gray-800 font-medium">주소</div>
                    <div className="text-gray-600 text-sm">{reportData?.contractSummary?.address || '주소 정보 없음'}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <i className="ri-building-line text-violet-500 text-xl mr-3"></i>
                  <div>
                    <div className="text-gray-800 font-medium">건물 유형</div>
                    <div className="text-gray-600 text-sm">{reportData?.contractSummary?.buildingType || '정보 없음'}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <i className="ri-contract-line text-violet-500 text-xl mr-3"></i>
                  <div>
                    <div className="text-gray-800 font-medium">계약 유형</div>
                    <div className="text-gray-600 text-sm">{reportData?.contractSummary?.contractType || '정보 없음'}</div>
                  </div>
                </div>
              </div>
              
              {/* 계약 조건 */}
              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="text-gray-800 font-bold mb-4">계약 조건</h3>
                <div className="space-y-2">
                  {(reportData?.contractSummary?.conditions || '정보 없음').split(' / ').map((condition: string, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-700">{condition.split(' ')[0] || '항목'}</span>
                      <span className="text-gray-900 font-medium">{condition.split(' ').slice(1).join(' ') || '정보 없음'}</span>
                    </div>
                  ))}
                </div>
                
                {/* 인증 상태 */}
                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                  {reportData?.contractSummary?.gpsVerified && (
                    <div className="flex items-center text-emerald-600">
                      <i className="ri-checkbox-circle-line mr-2"></i>
                      GPS 위치 인증 완료
                    </div>
                  )}
                  {reportData?.contractSummary?.contractVerified && (
                    <div className="flex items-center text-emerald-600">
                      <i className="ri-file-check-line mr-2"></i>
                      계약서/고지서 인증 완료
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 3. 주관적 지표 */}
          <section className="p-6 md:p-8 border-b border-purple-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">주관적 지표 (커뮤니티 데이터 기반)</h2>
            
            {/* 종합 점수 차트 */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-800 text-center mb-6">거주 환경 종합 점수</h3>
              <div className="h-64 mb-4" style={{ width: '100%', height: '256px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#9333EA" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center px-4 py-2 bg-red-100 rounded-full">
                  <i className="ri-arrow-down-line text-red-800 mr-2"></i>
                  <span className="text-red-800 text-sm font-medium">
                    동네 평균보다 {((reportData?.subjectiveMetrics?.overallScore?.neighborhoodAverage || 0) - (reportData?.subjectiveMetrics?.overallScore?.myScore || 0)).toFixed(1)}점 낮음
                  </span>
                </div>
              </div>
            </div>

            {/* 카테고리별 상세 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {(reportData?.subjectiveMetrics?.categoryScores || []).map((score: any, index: number) => {
                const diff = score.neighborhoodAverage - score.myScore;
                const isLower = diff > 0;
                const cardColor = isLower ? 'red' : diff < -0.5 ? 'green' : 'yellow';
                
                return (
                  <div key={index} className={`p-4 bg-${cardColor}-50 rounded-xl border border-${cardColor}-200`}>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-gray-800 font-bold">{score.category}</h4>
                      <span className={`text-${cardColor}-600 font-bold`}>{score.myScore.toFixed(1)}점</span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      동네 평균 {score.neighborhoodAverage.toFixed(1)}점보다 {Math.abs(diff).toFixed(1)}점 {isLower ? '낮음' : '높음'}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* 레이더 차트 */}
            <div className="bg-white rounded-2xl border-2 border-violet-200 p-6">
              <h3 className="text-xl font-bold text-gray-800 text-center mb-6">카테고리별 상세 분석</h3>
              <div className="h-80" style={{ width: '100%', height: '320px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarChartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <Radar name="내 점수" dataKey="myScore" stroke="#9333EA" fill="#9333EA" fillOpacity={0.3} />
                    <Radar name="동네 평균" dataKey="neighborhoodAvg" stroke="#C084FC" fill="#C084FC" fillOpacity={0.1} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center items-center mt-4 text-sm text-gray-600">
                <div className="flex items-center mr-6">
                  <div className="w-4 h-4 bg-violet-500 rounded-full mr-2"></div>
                  내 점수
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-300 rounded-full mr-2"></div>
                  동네 평균
                </div>
                <div className="ml-6 text-gray-600">
                  평균: {(reportData?.subjectiveMetrics?.overallScore?.myScore || 0).toFixed(1)}점 (5점 만점)
                </div>
              </div>
            </div>
          </section>

          {/* 4. 시세 분석 */}
          <section className="p-6 md:p-8 border-b border-purple-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">객관적 지표 (공공 데이터 기반)</h2>
            <MarketDataComparison userRent={userRent} userAddress={reportData?.contractSummary?.address || '주소 정보 없음'} isPremium={isPremium} />
            
            {/* 시계열 추이 분석 (프리미엄 기능) */}
            {isPremium && (
              <div className="mt-8">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                    <i className="ri-crown-line text-white"></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">📈 시장 트렌드 분석 (프리미엄 전용)</h3>
                  <div className="ml-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                    PREMIUM
                  </div>
                </div>
                
                <TimeSeriesChart 
                  buildingType={reportData?.contractSummary?.buildingType || '빌라'}
                  lawdCd="11410" // TODO: 사용자 실제 법정동코드로 변경
                  months={24}
                />
              </div>
            )}
          </section>

          {/* 5. 스마트 진단 종합 분석 (프리미엄) */}
          {smartDiagnosisData && (
            <section className="p-6 md:p-8 border-b border-purple-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">🔬 스마트 진단 종합 분석</h2>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    종합 점수: {smartDiagnosisData.overallScore || 85}점
                  </div>
                  <p className="text-blue-700 text-lg">
                    {smartDiagnosisData.insights || "소음 환경이 매우 좋고 인터넷 속도가 우수합니다."}
                  </p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full bg-white rounded-lg shadow-sm">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-blue-800 font-semibold">항목</th>
                        <th className="px-4 py-3 text-left text-blue-800 font-semibold">측정 결과</th>
                        <th className="px-4 py-3 text-left text-blue-800 font-semibold">등급</th>
                        <th className="px-4 py-3 text-left text-blue-800 font-semibold">전국 평균 대비</th>
                      </tr>
                    </thead>
                    <tbody>
                      {smartDiagnosisData.noise && (
                        <tr className="border-b border-gray-100">
                          <td className="px-4 py-3 font-medium">🔊 소음</td>
                          <td className="px-4 py-3">{smartDiagnosisData.noise.value}dB</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              우수
                            </span>
                          </td>
                          <td className="px-4 py-3 text-green-600">15% 조용함</td>
                        </tr>
                      )}
                      {smartDiagnosisData.level && (
                        <tr className="border-b border-gray-100">
                          <td className="px-4 py-3 font-medium">📐 수평</td>
                          <td className="px-4 py-3">{smartDiagnosisData.level.value}°</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              우수
                            </span>
                          </td>
                          <td className="px-4 py-3 text-green-600">상위 10% 수준</td>
                        </tr>
                      )}
                      {smartDiagnosisData.internet && (
                        <tr>
                          <td className="px-4 py-3 font-medium">🚀 인터넷</td>
                          <td className="px-4 py-3">{smartDiagnosisData.internet.downloadSpeed}Mbps</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              매우 빠름
                            </span>
                          </td>
                          <td className="px-4 py-3 text-blue-600">25% 빠름</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">💡 전문가 분석</h4>
                  <p className="text-blue-700 text-sm">
                    측정된 객관적 데이터를 바탕으로 한 전문가 분석 결과입니다. 
                    이 데이터는 임대료 협상 시 강력한 근거 자료로 활용할 수 있습니다.
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* 6. 협상 카드 */}
          <section className="p-6 md:p-8 border-b border-purple-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">협상 카드 (자동 생성)</h2>
            <div className="space-y-6">
              {(reportData?.negotiationCards || []).map((card: any, index: number) => {
                const colors = [
                  { bg: 'bg-pink-50', border: 'border-pink-200', accent: 'bg-pink-500', text: 'text-pink-800' },
                  { bg: 'bg-emerald-50', border: 'border-emerald-200', accent: 'bg-emerald-500', text: 'text-emerald-800' },
                  { bg: 'bg-purple-50', border: 'border-purple-200', accent: 'bg-purple-500', text: 'text-purple-800' }
                ];
                const color = colors[index % colors.length];
                
                return (
                  <div key={index} className={`${color.bg} ${color.border} border-2 rounded-xl p-6`}>
                    <div className="flex items-center mb-4">
                      <div className={`w-8 h-8 ${color.accent} rounded-full flex items-center justify-center text-white font-bold mr-3`}>
                        {card.priority}
                      </div>
                      <h3 className={`text-xl font-bold ${color.text}`}>{card.priority}순위: {card.title}</h3>
                    </div>
                    <div className={`${color.accent} text-white p-4 rounded-lg mb-4`}>
                      <p className="font-bold text-sm">{card.title}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-700 text-sm leading-relaxed">{card.recommendationScript}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 7. 정책 정보 */}
          <section className="p-6 md:p-8 border-b border-purple-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">맞춤형 정책/지원 정보</h2>
            <div className="space-y-4">
              {(reportData?.policyInfos || []).map((policy: any, index: number) => (
                <div key={index} className="bg-purple-100 border border-violet-200 rounded-xl p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center">
                      <i className="ri-government-line text-violet-500 text-xl mr-3"></i>
                      <div>
                        <h3 className="text-gray-800 font-bold">{policy.title}</h3>
                        <p className="text-gray-600 text-sm">{policy.description}</p>
                      </div>
                    </div>
                    <a 
                      href={policy.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-lg transition-colors text-center"
                    >
                      신청하기
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 8. 분쟁 해결 가이드 */}
          {reportData?.disputeGuide && (
            <section className="p-6 md:p-8 border-b border-purple-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">⚖️ 분쟁 해결 가이드</h2>
              
              {/* 관련 법령 */}
              <div className="bg-yellow-50 border border-violet-200 rounded-xl p-6 mb-6">
                <div className="flex items-center mb-4">
                  <i className="ri-scales-line text-amber-500 text-xl mr-3"></i>
                  <h3 className="text-gray-800 font-bold">관련 법령</h3>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="text-gray-800 font-bold text-sm mb-2">{reportData?.disputeGuide?.relatedLaw}</h4>
                  <p className="text-gray-600 text-sm">
                    임대인은 임대목적물을 임차인이 사용・수익하기에 필요한 상태를 유지하게 할 의무를 부담한다. 
                    수압, 전기, 급수 등 기본 시설에 대한 수선 의무가 임대인에게 있습니다.
                  </p>
                </div>
              </div>
              
              {/* 분쟁조정위원회 */}
              <div className="bg-sky-50 border border-violet-200 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <i className="ri-customer-service-line text-sky-500 text-xl mr-3"></i>
                  <h3 className="text-gray-800 font-bold">분쟁조정위원회</h3>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h4 className="text-gray-800 font-bold text-sm mb-4">{reportData?.disputeGuide?.committeeInfo}</h4>
                  <div className="space-y-2 text-gray-600 text-sm">
                    <div className="flex items-center">
                      <i className="ri-phone-line text-blue-500 mr-2"></i>
                      연락처: 02-123-4567
                    </div>
                    <div className="flex items-center">
                      <i className="ri-map-pin-line text-blue-500 mr-2"></i>
                      서울시 마포구 공덕동 공덕빌딩 3층
                    </div>
                    <div className="flex items-center">
                      <i className="ri-time-line text-blue-500 mr-2"></i>
                      운영시간: 평일 09:00-18:00
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 9. 리포트 공유 */}
          <section className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📤 리포트 공유</h2>
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
              <div className="text-center">
                <p className="text-gray-700 text-sm mb-4">
                  💡 이 링크를 임대인에게 전달하면 회원가입 없이도 리포트를 확인할 수 있습니다.
                </p>
                <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
                  <p className="text-gray-600 text-sm font-mono break-all">{shareUrl}</p>
                </div>
                <button 
                  onClick={copyShareUrl}
                  className="bg-gradient-to-r from-[#9333EA] to-[#C084FC] hover:from-[#7C3AED] hover:to-[#A855F7] text-white px-6 py-2 rounded-lg transition-all"
                >
                  링크 복사하기
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* 문서 생성 모달 */}
      <DocumentGenerator 
        reportData={reportData}
        isVisible={showDocumentGenerator}
        onClose={() => setShowDocumentGenerator(false)}
      />
    </div>
  );
}