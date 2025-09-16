'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { reportApi } from '../lib/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import MarketDataComparison from './MarketDataComparison';

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

export default function ComprehensiveReport({ reportId: initialReportId }: { reportId?: string }) {
  const searchParams = useSearchParams();
  const reportType = searchParams.get('type');
  const isPremium = reportType === 'premium';

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // initialReportId가 있으면 공유된 특정 리포트, 없으면 종합 리포트
        const response = initialReportId 
          ? await reportApi.getReport(initialReportId)
          : await reportApi.getComprehensiveReport();

        if (response && response.success) {
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

  const conditions = reportData.contractSummary.conditions || "";
  const monthlyRentMatch = conditions.match(/월세\s*(\d+)/);
  const userRent = monthlyRentMatch ? parseInt(monthlyRentMatch[1], 10) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-purple-200">
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
          body { background: white !important; }
        }
      `}</style>
      
      <div className="px-32 inline-flex justify-start items-start">
        <div className="w-[1152px] max-w-[1152px] inline-flex flex-col justify-start items-start">
          
          {/* 헤더 */}
          <div className="pb-8 inline-flex justify-start items-start">
            <div className="w-[1152px] h-32 inline-flex flex-col justify-start items-start">
              <div className="pb-2 inline-flex justify-start items-start">
                <div className="w-[1152px] h-9 flex justify-center items-center">
                  <div className="text-center justify-center text-violet-500 text-3xl font-normal font-['Pacifico'] leading-9">월세의 정석</div>
                </div>
              </div>
              <div className="px-[544px] pb-6 inline-flex justify-start items-start">
                <div className="w-16 h-1 bg-violet-500 rounded-full" />
              </div>
              <div className="pb-2 inline-flex justify-start items-start">
                <div className="w-[1152px] h-8 flex justify-center items-center">
                  <div className="text-center justify-center text-gray-800 text-2xl font-bold font-['Roboto'] leading-loose">생성된 협상 리포트</div>
                </div>
              </div>
              <div className="w-[1152px] h-6 inline-flex justify-center items-center">
                <div className="text-center justify-center text-gray-600 text-base font-normal font-['Roboto'] leading-normal">임대인과 공유할 수 있는 완전한 협상 리포트입니다</div>
              </div>
            </div>
          </div>

          {/* 공유 버튼 (인쇄용 숨김) */}
          <div className="no-print w-full mb-8 flex justify-center">
            <div className="flex space-x-4">
              <button onClick={copyShareUrl} className="bg-gradient-to-r from-[#9333EA] to-[#C084FC] text-white px-6 py-3 rounded-xl hover:from-[#7C3AED] hover:to-[#A855F7] transition-all flex items-center shadow-lg">
                <i className="ri-share-line mr-2"></i> 공유하기
              </button>
              <button onClick={printReport} className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-all flex items-center shadow-lg">
                <i className="ri-printer-line mr-2"></i> 인쇄하기
              </button>
            </div>
          </div>

          {/* 메인 카드 */}
          <div className="w-[1152px] p-px bg-white rounded-2xl shadow-xl shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.10)] outline outline-1 outline-offset-[-1px] outline-violet-200 flex flex-col justify-start items-start overflow-hidden">
            
            {/* 리포트 헤더 - 보라색 배경 */}
            <div className="w-[1150px] h-[500px] p-8 bg-purple-900/70 flex flex-col justify-start items-start">
              <div className="w-[1086px] h-96 flex flex-col justify-start items-start">
                <div className="px-[503px] pb-6 inline-flex justify-start items-start">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex justify-center items-center">
                    <i className="ri-file-chart-line text-4xl text-white"></i>
                  </div>
                </div>
                <div className="pb-8 inline-flex justify-start items-start">
                  <div className="w-[1086px] h-10 flex justify-center items-center">
                    <div className="text-center justify-center text-white text-4xl font-bold font-['Roboto'] leading-10">
                      {reportData.contractSummary.address} 임대차 협상 리포트
                      {isPremium && ' 💎'}
                    </div>
                  </div>
                </div>
                <div className="pb-6 inline-flex justify-start items-start">
                  <div className="w-[1086px] h-5 flex justify-center items-center">
                    <div className="w-36 h-5 flex justify-start items-center">
                      <div className="pr-2 flex justify-start items-start">
                        <i className="ri-calendar-line text-white/90 mr-2"></i>
                      </div>
                      <div className="text-center justify-center text-white/90 text-sm font-normal font-['Roboto'] leading-tight">생성일자: {reportData.header.generatedDate}</div>
                    </div>
                    <div className="pl-8 flex justify-start items-start">
                      <div className="w-40 h-5 flex justify-start items-center">
                        <div className="pr-2 flex justify-start items-start">
                          <i className="ri-time-line text-white/90 mr-2"></i>
                        </div>
                        <div className="text-center justify-center text-white/90 text-sm font-normal font-['Roboto'] leading-tight">데이터 기간: 최근 1개월</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-52 pb-8 inline-flex justify-start items-start">
                  <div className="w-[672px] h-5 max-w-[672px] flex justify-center items-center">
                    <div className="text-center justify-center text-white/80 text-sm font-normal font-['Roboto'] leading-tight">{reportData.header.dataPeriod}</div>
                  </div>
                </div>
                
                {/* 데이터 신뢰도 */}
                <div className="w-[1086px] h-40 p-6 bg-white/10 rounded-2xl backdrop-blur-[2px] flex flex-col justify-start items-start">
                  <div className="pb-6 inline-flex justify-start items-start">
                    <div className="w-[1038px] h-7 flex justify-center items-center">
                      <div className="pr-2 flex justify-start items-start">
                        <i className="ri-shield-check-line text-white text-xl mr-2"></i>
                      </div>
                      <div className="text-center justify-center text-white text-xl font-bold font-['Roboto'] leading-7">데이터 신뢰도</div>
                    </div>
                  </div>
                  <div className="w-[1038px] h-16 inline-flex justify-start items-start gap-8 flex-wrap content-start">
                    <div className="w-80 h-16 inline-flex flex-col justify-start items-start">
                      <div className="pb-2 inline-flex justify-start items-start">
                        <div className="w-80 h-9 flex justify-center items-center">
                          <div className="text-center justify-center text-white text-3xl font-bold font-['Roboto'] leading-9">{reportData.header.participantCount}명</div>
                        </div>
                      </div>
                      <div className="w-80 h-5 inline-flex justify-center items-center">
                        <div className="text-center justify-center text-white/80 text-sm font-normal font-['Roboto'] leading-tight">참여 인원 수</div>
                      </div>
                    </div>
                    <div className="w-80 h-16 px-4 border-l border-r border-white/30 inline-flex flex-col justify-start items-start">
                      <div className="pb-2 inline-flex justify-start items-start">
                        <div className="w-72 h-9 flex justify-center items-center">
                          <div className="text-center justify-center text-white text-3xl font-bold font-['Roboto'] leading-9">{reportData.header.dataRecency}</div>
                        </div>
                      </div>
                      <div className="w-72 h-5 inline-flex justify-center items-center">
                        <div className="text-center justify-center text-white/80 text-sm font-normal font-['Roboto'] leading-tight">평균 응답 시점</div>
                      </div>
                    </div>
                    <div className="w-80 h-16 inline-flex flex-col justify-start items-start">
                      <div className="pb-2 inline-flex justify-start items-start">
                        <div className="w-80 h-9 flex justify-center items-center">
                          <div className="text-center justify-center text-white text-3xl font-bold font-['Roboto'] leading-9">{reportData.header.reliabilityScore}/100</div>
                        </div>
                      </div>
                      <div className="w-80 h-5 inline-flex justify-center items-center">
                        <div className="text-center justify-center text-white/80 text-sm font-normal font-['Roboto'] leading-tight">신뢰도 점수</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 나의 계약 정보 요약 */}
            <div className="w-[1150px] h-72 px-8 py-8 border-b border-purple-100 flex flex-col justify-start items-start">
              <div className="pb-6 inline-flex justify-start items-start">
                <div className="w-[1086px] h-8 flex justify-start items-center">
                  <div className="justify-center text-gray-800 text-2xl font-bold font-['Roboto'] leading-loose">📋 나의 계약 정보 요약</div>
                </div>
              </div>
              <div className="w-[1086px] h-44 inline-flex justify-start items-start gap-6 flex-wrap content-start">
                <div className="w-[531px] h-44 inline-flex flex-col justify-start items-start">
                  <div className="w-[531px] h-11 inline-flex justify-start items-center">
                    <div className="pr-3 flex justify-start items-start">
                      <i className="ri-map-pin-line text-violet-500 text-xl mr-2"></i>
                    </div>
                    <div className="w-52 h-11 inline-flex flex-col justify-start items-start">
                      <div className="w-52 h-6 inline-flex justify-start items-center">
                        <div className="justify-center text-gray-800 text-base font-medium font-['Roboto'] leading-normal">주소</div>
                      </div>
                      <div className="w-52 h-5 inline-flex justify-start items-center">
                        <div className="justify-center text-gray-600 text-sm font-normal font-['Roboto'] leading-tight">{reportData.contractSummary.address}</div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 inline-flex justify-start items-start">
                    <div className="w-[531px] h-11 flex justify-start items-center">
                      <div className="pr-3 flex justify-start items-start">
                        <i className="ri-building-line text-violet-500 text-xl mr-2"></i>
                      </div>
                      <div className="w-24 h-11 inline-flex flex-col justify-start items-start">
                        <div className="w-24 h-6 inline-flex justify-start items-center">
                          <div className="justify-center text-gray-800 text-base font-medium font-['Roboto'] leading-normal">건물 유형</div>
                        </div>
                        <div className="w-24 h-5 inline-flex justify-start items-center">
                          <div className="justify-center text-gray-600 text-sm font-normal font-['Roboto'] leading-tight">{reportData.contractSummary.buildingType}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 inline-flex justify-start items-start">
                    <div className="w-[531px] h-11 flex justify-start items-center">
                      <div className="pr-3 flex justify-start items-start">
                        <i className="ri-contract-line text-violet-500 text-xl mr-2"></i>
                      </div>
                      <div className="w-16 h-11 inline-flex flex-col justify-start items-start">
                        <div className="w-16 h-6 inline-flex justify-start items-center">
                          <div className="justify-center text-gray-800 text-base font-medium font-['Roboto'] leading-normal">계약 유형</div>
                        </div>
                        <div className="w-16 h-5 inline-flex justify-start items-center">
                          <div className="justify-center text-gray-600 text-sm font-normal font-['Roboto'] leading-tight">{reportData.contractSummary.contractType}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 계약 조건 */}
                <div className="w-[531px] h-44 inline-flex flex-col justify-start items-start">
                  <div className="w-[531px] h-36 p-4 bg-purple-50 rounded-lg flex flex-col justify-start items-start">
                    <div className="pb-3 inline-flex justify-start items-start">
                      <div className="w-[499px] h-6 flex justify-start items-center">
                        <div className="justify-center text-gray-800 text-base font-bold font-['Roboto'] leading-normal">계약 조건</div>
                      </div>
                    </div>
                    <div className="w-[499px] h-20 flex flex-col justify-start items-start">
                      {reportData.contractSummary.conditions.split(' / ').map((condition, index) => (
                        <div key={index} className="w-[499px] h-5 inline-flex justify-between items-start mt-2">
                          <div className="flex justify-start items-center">
                            <div className="justify-center text-black text-sm font-normal font-['Roboto'] leading-tight">{condition.split(' ')[0]}</div>
                          </div>
                          <div className="flex justify-start items-center">
                            <div className="justify-center text-black text-sm font-medium font-['Roboto'] leading-tight">{condition.split(' ').slice(1).join(' ')}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 inline-flex justify-start items-start">
                    <div className="w-[531px] h-5 flex justify-start items-start">
                      {reportData.contractSummary.gpsVerified && (
                        <div className="w-36 h-5 flex justify-start items-center">
                          <div className="pr-2 flex justify-start items-start">
                            <i className="ri-checkbox-circle-line text-emerald-500 mr-2"></i>
                          </div>
                          <div className="justify-center text-emerald-500 text-sm font-normal font-['Roboto'] leading-tight">GPS 위치 인증 완료</div>
                        </div>
                      )}
                      {reportData.contractSummary.contractVerified && (
                        <div className="pl-4 flex justify-start items-start">
                          <div className="w-40 h-5 flex justify-start items-center">
                            <div className="pr-2 flex justify-start items-start">
                              <i className="ri-file-check-line text-emerald-500 mr-2"></i>
                            </div>
                            <div className="justify-center text-emerald-500 text-sm font-normal font-['Roboto'] leading-tight">계약서/고지서 인증 완료</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 주관적 지표 (커뮤니티 데이터 기반) */}
            <div className="w-[1150px] h-[1521px] px-8 py-8 border-b border-purple-100 flex flex-col justify-start items-start">
              <div className="pb-6 inline-flex justify-start items-start">
                <div className="w-[1086px] h-8 flex justify-start items-center">
                  <div className="justify-center text-gray-800 text-2xl font-bold font-['Roboto'] leading-loose">주관적 지표 (커뮤니티 데이터 기반)</div>
                </div>
              </div>
              
              {/* 종합 점수 차트 */}
              <div className="pb-8 inline-flex justify-start items-start">
                <div className="w-[1086px] h-[482px] p-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl inline-flex flex-col justify-start items-start">
                  <div className="pb-6 inline-flex justify-start items-start">
                    <div className="w-[1022px] h-7 flex justify-center items-center">
                      <div className="text-center justify-center text-gray-800 text-xl font-bold font-['Roboto'] leading-7">거주 환경 종합 점수</div>
                    </div>
                  </div>
                  
                  {/* 기존 차트 컴포넌트 유지 */}
                  <div className="w-full h-64 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: '내 점수', value: reportData.subjectiveMetrics.overallScore.myScore },
                        { name: '동네 평균', value: reportData.subjectiveMetrics.overallScore.neighborhoodAverage },
                        { name: '건물 평균', value: reportData.subjectiveMetrics.overallScore.buildingAverage }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#9333EA" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="pt-6 inline-flex justify-start items-start">
                    <div className="w-[1022px] h-10 flex justify-center items-start">
                      <div className="w-52 h-10 px-4 py-2 bg-red-100 rounded-full flex justify-start items-center">
                        <div className="pr-2 flex justify-start items-start">
                          <i className="ri-arrow-down-line text-red-800 mr-2"></i>
                        </div>
                        <div className="w-36 h-5 flex justify-center items-center">
                          <div className="text-center justify-center text-red-800 text-sm font-medium font-['Roboto'] leading-tight">
                            동네 평균보다 {(reportData.subjectiveMetrics.overallScore.neighborhoodAverage - reportData.subjectiveMetrics.overallScore.myScore).toFixed(1)}점 낮음
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 카테고리별 분석 */}
              <div className="pb-8 inline-flex justify-start items-start">
                <div className="w-[1086px] h-72 flex justify-start items-start gap-6 flex-wrap content-start">
                  <div className="w-[531px] h-72 inline-flex flex-col justify-start items-start">
                    {reportData.subjectiveMetrics.categoryScores.slice(0, 3).map((score, index) => {
                      const diff = score.neighborhoodAverage - score.myScore;
                      const isLower = diff > 0;
                      const cardColor = isLower ? 'red' : diff < -0.5 ? 'green' : 'yellow';
                      
                      return (
                        <div key={index} className={`w-[531px] h-20 p-4 bg-${cardColor}-50 rounded-xl outline outline-1 outline-offset-[-1px] outline-${cardColor}-200 ${index > 0 ? 'mt-4' : ''} flex flex-col justify-start items-start`}>
                          <div className="pb-2 inline-flex justify-start items-start">
                            <div className="w-[497px] h-6 flex justify-between items-center">
                              <div className="flex justify-start items-center">
                                <div className={`justify-center text-gray-800 text-base font-bold font-['Roboto'] leading-normal`}>{score.category}</div>
                              </div>
                              <div className="flex justify-start items-center">
                                <div className={`justify-center text-${cardColor}-600 text-base font-bold font-['Roboto'] leading-normal`}>{score.myScore.toFixed(1)}점</div>
                              </div>
                            </div>
                          </div>
                          <div className="w-[497px] h-5 inline-flex justify-start items-center">
                            <div className="justify-center text-gray-600 text-sm font-normal font-['Roboto'] leading-tight">
                              동네 평균 {score.neighborhoodAverage.toFixed(1)}점보다 {Math.abs(diff).toFixed(1)}점 {isLower ? '낮음' : '높음'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="w-[531px] h-72 inline-flex flex-col justify-start items-start">
                    {reportData.subjectiveMetrics.categoryScores.slice(3, 6).map((score, index) => {
                      const diff = score.neighborhoodAverage - score.myScore;
                      const isLower = diff > 0;
                      const cardColor = isLower ? 'red' : diff < -0.5 ? 'green' : 'yellow';
                      
                      return (
                        <div key={index} className={`w-[531px] h-20 p-4 bg-${cardColor}-50 rounded-xl outline outline-1 outline-offset-[-1px] outline-${cardColor}-200 ${index > 0 ? 'mt-4' : ''} flex flex-col justify-start items-start`}>
                          <div className="pb-2 inline-flex justify-start items-start">
                            <div className="w-[497px] h-6 flex justify-between items-center">
                              <div className="flex justify-start items-center">
                                <div className="justify-center text-gray-800 text-base font-bold font-['Roboto'] leading-normal">{score.category}</div>
                              </div>
                              <div className="flex justify-start items-center">
                                <div className={`justify-center text-${cardColor}-600 text-base font-bold font-['Roboto'] leading-normal`}>{score.myScore.toFixed(1)}점</div>
                              </div>
                            </div>
                          </div>
                          <div className="w-[497px] h-5 inline-flex justify-start items-center">
                            <div className="justify-center text-gray-600 text-sm font-normal font-['Roboto'] leading-tight">
                              동네 평균 {score.neighborhoodAverage.toFixed(1)}점보다 {Math.abs(diff).toFixed(1)}점 {isLower ? '낮음' : '높음'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 레이더 차트 */}
              <div className="w-[1086px] h-96 p-8 bg-white rounded-2xl outline outline-2 outline-offset-[-2px] outline-violet-200 flex flex-col justify-start items-start">
                <div className="pb-6 inline-flex justify-start items-start">
                  <div className="w-[1018px] h-7 flex justify-center items-center">
                    <div className="text-center justify-center text-gray-800 text-xl font-bold font-['Roboto'] leading-7">카테고리별 상세 분석</div>
                  </div>
                </div>
                
                {/* 기존 레이더 차트 유지 */}
                <div className="w-full h-64 flex justify-center items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={reportData.subjectiveMetrics.categoryScores.map(c => ({ 
                      category: c.category, 
                      myScore: c.myScore, 
                      neighborhoodAvg: c.neighborhoodAverage 
                    }))}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" />
                      <Radar name="내 점수" dataKey="myScore" stroke="#9333EA" fill="#9333EA" fillOpacity={0.3} />
                      <Radar name="동네 평균" dataKey="neighborhoodAvg" stroke="#C084FC" fill="#C084FC" fillOpacity={0.1} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="pt-6 inline-flex justify-start items-start">
                  <div className="w-[1018px] h-5 inline-flex flex-col justify-start items-start">
                    <div className="w-[1018px] h-5 inline-flex justify-center items-center">
                      <div className="w-16 h-5 flex justify-start items-center">
                        <div className="pr-2 flex justify-start items-start">
                          <div className="w-4 h-4 bg-violet-500 rounded-full" />
                        </div>
                        <div className="w-11 h-5 flex justify-center items-center">
                          <div className="text-center justify-center text-gray-600 text-sm font-normal font-['Roboto'] leading-tight">내 점수</div>
                        </div>
                      </div>
                      <div className="pl-8 flex justify-start items-start">
                        <div className="w-32 h-5 flex justify-center items-center">
                          <div className="text-center justify-center text-gray-600 text-sm font-medium font-['Roboto'] leading-tight">
                            평균: {reportData.subjectiveMetrics.overallScore.myScore.toFixed(1)}점 (5점 만점)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 객관적 지표 (공공 데이터 기반) */}
            <div className="w-[1150px] h-80 px-8 py-8 border-b border-purple-100 flex flex-col justify-start items-start">
              <div className="pb-6 inline-flex justify-start items-start">
                <div className="w-[1086px] h-8 flex justify-start items-center">
                  <div className="justify-center text-gray-800 text-2xl font-bold font-['Roboto'] leading-loose">객관적 지표 (공공 데이터 기반)</div>
                </div>
              </div>
              
              {/* 기존 MarketDataComparison 컴포넌트 유지 */}
              <MarketDataComparison userRent={userRent} userAddress={reportData.contractSummary.address} isPremium={isPremium} />
            </div>

            {/* 협상 카드 (자동 생성) */}
            <div className="w-[1150px] h-[875px] px-8 py-8 border-b border-purple-100 flex flex-col justify-start items-start">
              <div className="pb-6 inline-flex justify-start items-start">
                <div className="w-[1086px] h-8 flex justify-start items-center">
                  <div className="justify-center text-gray-800 text-2xl font-bold font-['Roboto'] leading-loose">협상 카드 (자동 생성)</div>
                </div>
              </div>
              <div className="w-[1086px] h-[754px] flex flex-col justify-start items-start">
                {reportData.negotiationCards.map((card, index) => {
                  const colors = ['pink', 'emerald', 'fuchsia'];
                  const color = colors[index % colors.length];
                  
                  return (
                    <div key={index} className={`w-[1086px] h-60 p-6 bg-${color}-50/50 rounded-xl outline outline-2 outline-offset-[-2px] outline-${color}-500/30 ${index > 0 ? 'mt-6' : ''} flex flex-col justify-start items-start`}>
                      <div className="pb-4 inline-flex justify-start items-start">
                        <div className="w-[1034px] h-8 flex justify-start items-start">
                          <div className="pr-3 flex justify-start items-start">
                            <div className={`w-8 h-8 bg-${color}-500/80 rounded-full flex justify-center items-center`}>
                              <div className="justify-center text-white text-base font-bold font-['Roboto'] leading-normal">{card.priority}</div>
                            </div>
                          </div>
                          <div className="w-44 h-7 flex justify-start items-center">
                            <div className="justify-center text-gray-800 text-xl font-bold font-['Roboto'] leading-7">{card.priority}순위: {card.title}</div>
                          </div>
                        </div>
                      </div>
                      <div className="pb-4 inline-flex justify-start items-start">
                        <div className={`w-[1034px] h-12 p-4 bg-${color}-600/80 rounded-lg inline-flex flex-col justify-start items-start`}>
                          <div className="w-[1002px] h-5 inline-flex justify-start items-center">
                            <div className="flex justify-start items-start">
                              <div className="justify-center text-white text-sm font-bold font-['Roboto'] leading-tight">{card.title}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={`w-[1034px] h-20 p-4 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-${color}-100 flex flex-col justify-start items-start`}>
                        <div className="w-[1000px] h-10 inline-flex justify-start items-start flex-wrap content-start">
                          <div className="w-[1000px] h-10 justify-center text-gray-700 text-sm font-normal font-['Roboto'] leading-tight">{card.recommendationScript}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 맞춤형 정책/지원 정보 */}
            <div className="w-[1150px] h-96 px-8 py-8 border-b border-purple-100 flex flex-col justify-start items-start">
              <div className="pb-6 inline-flex justify-start items-start">
                <div className="w-[1086px] h-8 flex justify-start items-center">
                  <div className="justify-center text-gray-800 text-2xl font-bold font-['Roboto'] leading-loose">맞춤형 정책/지원 정보</div>
                </div>
              </div>
              <div className="w-[1086px] h-80 flex flex-col justify-start items-start">
                {reportData.policyInfos.map((policy, index) => (
                  <div key={index} className={`w-[1086px] h-24 p-6 bg-purple-100 rounded-xl outline outline-1 outline-offset-[-1px] outline-violet-200 ${index > 0 ? 'mt-4' : ''} flex flex-col justify-start items-start`}>
                    <div className="w-[1036px] h-11 inline-flex justify-between items-center">
                      <div className="w-56 h-11 flex justify-start items-center">
                        <div className="pr-3 flex justify-start items-start">
                          <i className="ri-government-line text-violet-500 text-xl mr-2"></i>
                        </div>
                        <div className="w-48 h-11 inline-flex flex-col justify-start items-start">
                          <div className="w-48 h-6 inline-flex justify-start items-center">
                            <div className="justify-center text-gray-800 text-base font-bold font-['Roboto'] leading-normal">{policy.title}</div>
                          </div>
                          <div className="w-48 h-5 inline-flex justify-start items-center">
                            <div className="justify-center text-gray-600 text-sm font-normal font-['Roboto'] leading-tight">{policy.description}</div>
                          </div>
                        </div>
                      </div>
                      <div className="w-24 h-10 px-4 py-2 bg-violet-500 rounded-lg flex justify-center items-center">
                        <a href={policy.link} target="_blank" rel="noopener noreferrer" className="text-center justify-center text-white text-base font-normal font-['Roboto'] leading-normal">
                          신청하기
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 분쟁 해결 가이드 */}
            {reportData.disputeGuide && (
              <div className="w-[1150px] h-[843px] px-8 py-8 border-b border-purple-100 flex flex-col justify-start items-start">
                <div className="pb-6 inline-flex justify-start items-start">
                  <div className="w-[1086px] h-8 flex justify-start items-center">
                    <div className="justify-center text-gray-800 text-2xl font-bold font-['Roboto'] leading-loose">⚖️ 분쟁 해결 가이드</div>
                  </div>
                </div>
                <div className="w-[1086px] h-[722px] flex flex-col justify-start items-start">
                  <div className="w-[1086px] h-48 p-6 bg-yellow-50 rounded-xl outline outline-1 outline-offset-[-1px] outline-violet-200 flex flex-col justify-start items-start">
                    <div className="pb-4 inline-flex justify-start items-start">
                      <div className="w-[1036px] h-7 flex justify-start items-center">
                        <div className="pr-2 flex justify-start items-start">
                          <i className="ri-scales-line text-amber-500 text-xl mr-2"></i>
                        </div>
                        <div className="justify-center text-gray-800 text-lg font-bold font-['Roboto'] leading-7">관련 법령</div>
                      </div>
                    </div>
                    <div className="pb-4 inline-flex justify-start items-start">
                      <div className="w-[1036px] h-20 p-4 bg-white rounded-lg inline-flex flex-col justify-start items-start">
                        <div className="pb-2 inline-flex justify-start items-start">
                          <div className="w-[1004px] h-5 flex justify-start items-center">
                            <div className="justify-center text-gray-800 text-sm font-bold font-['Roboto'] leading-tight">{reportData.disputeGuide.relatedLaw}</div>
                          </div>
                        </div>
                        <div className="w-[1004px] h-5 inline-flex justify-start items-center">
                          <div className="justify-center text-gray-600 text-sm font-normal font-['Roboto'] leading-tight">임대인은 임대목적물을 임차인이 사용・수익하기에 필요한 상태를 유지하게 할 의무를 부담한다. 수압, 전기, 급수 등 기본 시설에 대한 수선 의무가 임대인에게 있습니다.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-6 inline-flex justify-start items-start">
                    <div className="w-[1086px] h-60 p-6 bg-sky-50 rounded-xl outline outline-1 outline-offset-[-1px] outline-violet-200 inline-flex flex-col justify-start items-start">
                      <div className="pb-4 inline-flex justify-start items-start">
                        <div className="w-[1036px] h-7 flex justify-start items-center">
                          <div className="pr-2 flex justify-start items-start">
                            <i className="ri-customer-service-line text-sky-500 text-xl mr-2"></i>
                          </div>
                          <div className="justify-center text-gray-800 text-lg font-bold font-['Roboto'] leading-7">분쟁조정위원회</div>
                        </div>
                      </div>
                      <div className="pb-4 inline-flex justify-start items-start">
                        <div className="w-[1036px] h-32 p-4 bg-white rounded-lg inline-flex flex-col justify-start items-start">
                          <div className="pb-2 inline-flex justify-start items-start">
                            <div className="w-[1004px] h-5 flex justify-start items-center">
                              <div className="justify-center text-gray-800 text-sm font-bold font-['Roboto'] leading-tight">{reportData.disputeGuide.committeeInfo}</div>
                            </div>
                          </div>
                          <div className="w-[1004px] h-16 flex flex-col justify-start items-start">
                            <div className="w-[1004px] h-5 inline-flex justify-start items-center">
                              <div className="pr-2 flex justify-start items-start">
                                <i className="ri-phone-line text-blue-500 mr-2"></i>
                              </div>
                              <div className="w-32 h-5 flex justify-start items-center">
                                <div className="justify-center text-gray-600 text-sm font-normal font-['Roboto'] leading-tight">연락처: 02-123-4567</div>
                              </div>
                            </div>
                            <div className="pt-1 inline-flex justify-start items-start">
                              <div className="w-[1004px] h-5 flex justify-start items-center">
                                <div className="pr-2 flex justify-start items-start">
                                  <i className="ri-map-pin-line text-blue-500 mr-2"></i>
                                </div>
                                <div className="w-52 h-5 flex justify-start items-center">
                                  <div className="justify-center text-gray-600 text-sm font-normal font-['Roboto'] leading-tight">서울시 마포구 공덕동 공덕빌딩 3층</div>
                                </div>
                              </div>
                            </div>
                            <div className="pt-1 inline-flex justify-start items-start">
                              <div className="w-[1004px] h-5 flex justify-start items-center">
                                <div className="pr-2 flex justify-start items-start">
                                  <i className="ri-time-line text-blue-500 mr-2"></i>
                                </div>
                                <div className="w-40 h-5 flex justify-start items-center">
                                  <div className="justify-center text-gray-600 text-sm font-normal font-['Roboto'] leading-tight">운영시간: 평일 09:00-18:00</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 리포트 공유 */}
            <div className="w-[1150px] h-80 p-8 flex flex-col justify-start items-start">
              <div className="pb-6 inline-flex justify-start items-start">
                <div className="w-[1086px] h-8 flex justify-start items-center">
                  <div className="justify-center text-gray-800 text-2xl font-bold font-['Roboto'] leading-loose">📤 리포트 공유</div>
                </div>
              </div>
              <div className="w-[1086px] h-52 p-6 bg-blue-50 rounded-xl outline outline-1 outline-offset-[-1px] outline-blue-200 flex flex-col justify-start items-start">
                <div className="pb-4 inline-flex justify-start items-start">
                  <div className="w-[1036px] h-36 inline-flex flex-col justify-start items-start">
                    <div className="pb-4 inline-flex justify-start items-start">
                      <div className="w-[1036px] h-5 flex justify-center items-center">
                        <div className="text-center justify-center text-gray-700 text-sm font-normal font-['Roboto'] leading-tight">💡 이 링크를 임대인에게 전달하면 회원가입 없이도 리포트를 확인할 수 있습니다.</div>
                      </div>
                    </div>
                    <div className="pb-4 inline-flex justify-start items-start">
                      <div className="w-[1036px] h-12 p-3 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-center items-center">
                        <div className="w-96 h-4 flex justify-center items-start">
                          <div className="text-center justify-center text-gray-600 text-sm font-normal font-['Roboto_Mono'] leading-tight">{shareUrl}</div>
                        </div>
                      </div>
                    </div>
                    <div className="self-stretch inline-flex justify-center items-start">
                      <div className="px-[453.62px] flex justify-start items-start">
                        <button 
                          onClick={copyShareUrl}
                          className="w-32 h-9 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex justify-center items-center transition-colors"
                        >
                          <div className="text-center justify-center text-white text-sm font-normal font-['Roboto'] leading-tight">링크 복사하기</div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}