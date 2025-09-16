'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { reportApi, diagnosisApi, smartDiagnosisApi } from '../../lib/api';
import toast from 'react-hot-toast';
// import ComprehensiveReport from '@/components/ComprehensiveReport'; // 리포트 상세 페이지에서 사용

export default function ReportPage() {
  const [reportContent, setReportContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<{
    reportId: string;
    reportUrl: string;
    reportType?: string;
    [key: string]: any;
  } | null>(null);
  const [error, setError] = useState('');
  const [showComprehensiveReport, setShowComprehensiveReport] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<'comprehensive' | 'premium' | null>(null);
  const [smartDiagnosisSummary, setSmartDiagnosisSummary] = useState<any>(null);
  const router = useRouter();

  // 스마트 진단 종합 결과 가져오기
  const loadSmartDiagnosisSummary = async () => {
    try {
      const response = await smartDiagnosisApi.getSmartDiagnosisSummary();
      if (response.success) {
        setSmartDiagnosisSummary(response.data);
      }
    } catch (error) {
      console.error('스마트 진단 종합 결과 로드 실패:', error);
    }
  };

  useEffect(() => {
    loadSmartDiagnosisSummary();
  }, []);

  const handleGenerateComprehensiveReport = async () => {
    setIsLoading(true);
    setError('');
    setSelectedReportType('comprehensive');

    try {
      const diagnosisResponse = await diagnosisApi.getResult();
      if (!diagnosisResponse.success) {
        setError('먼저 진단을 완료해주세요.');
        toast.error('먼저 진단을 완료해주세요.');
        return;
      }

      // 무료 리포트 생성 (reportType: 'free'로 설정)
      const jwtToken = localStorage.getItem('jwtToken');
      const userId = localStorage.getItem('userId');
      
      if (!jwtToken || !userId) {
        setError('로그인이 필요합니다.');
        toast.error('로그인이 필요합니다.');
        router.push('/auth/login');
        return;
      }

      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 
        (process.env.NODE_ENV === 'production' 
          ? 'https://2025seasonthonteam92be-production.up.railway.app' 
          : 'http://localhost:8080');
      
      const response = await fetch(`${baseURL}/report/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          reportContent: reportContent || '',
          reportType: 'free' // 무료 리포트로 설정
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        let publicId;
        
        if (result.success && result.publicId) {
          publicId = result.publicId;
        } else {
          throw new Error('리포트 ID를 받지 못했습니다.');
        }
        
        toast.success('무료 리포트를 생성했습니다!');
        
        // ComprehensiveReport 컴포넌트로 이동 (무료 버전)
        router.push(`/report/${publicId}`);
      } else {
        const errorMessage = result.message || '무료 리포트 생성에 실패했습니다.';
        setError(errorMessage);
        toast.error(errorMessage);
      }
      
    } catch (err: any) {
      console.error('Comprehensive report generation error:', err);
      setError('종합 리포트 생성 중 오류가 발생했습니다.');
      toast.error('종합 리포트 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setSelectedReportType(null);
    }
  };

  const handleGeneratePremiumReport = async () => {
    // 협상 요구사항 필수 입력 제거
    // if (!reportContent.trim()) {
    //   setError('협상 요구사항을 입력해주세요.');
    //   toast.error('협상 요구사항을 입력해주세요.');
    //   return;
    // }

    setIsLoading(true);
    setError('');
    setSelectedReportType('premium');

    try {
      const jwtToken = localStorage.getItem('jwtToken');
      const userId = localStorage.getItem('userId');
      
      if (!jwtToken || !userId) {
        setError('로그인이 필요합니다.');
        toast.error('로그인이 필요합니다.');
        router.push('/auth/login');
        return;
      }

      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 
        (process.env.NODE_ENV === 'production' 
          ? 'https://2025seasonthonteam92be-production.up.railway.app' 
          : 'http://localhost:8080');
      
      const response = await fetch(`${baseURL}/report/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          reportContent: reportContent || '', // 빈 문자열로 전송
          reportType: 'premium'
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        let publicId;
        
        if (result.success && result.publicId) {
          publicId = result.publicId;
        } else {
          throw new Error('리포트 ID를 받지 못했습니다.');
        }
        
        toast.success('프리미엄 리포트를 생성했습니다!');
        
        // ComprehensiveReport 컴포넌트로 이동 (프리미엄 버전)
        router.push(`/report/${publicId}?type=premium`);
      } else {
        const errorMessage = result.message || '프리미엄 리포트 생성에 실패했습니다.';
        setError(errorMessage);
        toast.error(errorMessage);
      }
      
    } catch (err: any) {
      console.error('Premium report creation error:', err);
      const errorMessage = err.message || '프리미엄 리포트 생성 중 오류가 발생했습니다.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setSelectedReportType(null);
    }
  };

  // 리포트 생성 후 상세 페이지로 이동하므로 여기서는 렌더링하지 않음

  return (
    <div className="w-full px-4 py-8 bg-gradient-to-b from-purple-100 to-purple-200 flex flex-col justify-center items-center min-h-screen">
      <div className="w-full max-w-[1152px] mx-auto flex justify-start items-start">
        <div className="w-[1152px] h-[2263.75px] max-w-[1152px] inline-flex flex-col justify-start items-start">
          
          {/* 헤더 */}
          <div className=" pb-8 inline-flex justify-start items-start">
            <div className="w-[1152px] h-56 inline-flex flex-col justify-start items-start">
              <div className=" pb-2 inline-flex justify-start items-start">
                <div className="w-[1152px] h-9 flex justify-center items-center">
                  <div className="text-center justify-center text-violet-500 text-3xl font-normal font-['Pacifico'] leading-9">월세의 정석</div>
                </div>
              </div>
              <div className=" px-[544px] pb-6 inline-flex justify-start items-start">
                <div className="w-16 h-1 bg-violet-500 rounded-full" />
              </div>
              <div className=" pb-2 inline-flex justify-start items-start">
                <div className="w-[1152px] h-8 flex justify-center items-center">
                  <div className="text-center justify-center text-gray-800 text-2xl font-bold font-['Roboto'] leading-loose">AI 협상 리포트 생성</div>
                </div>
              </div>
              <div className="w-[1152px] h-6 inline-flex justify-center items-center">
                <div className="text-center justify-center text-gray-600 text-base font-normal font-['Roboto'] leading-normal">당신의 진단 결과와 요구사항을 바탕으로 AI가 맞춤형 협상 전략을 생성합니다</div>
              </div>
              <div className=" pt-4 inline-flex justify-start items-start">
                <div className="w-[1152px] h-16 flex justify-center items-start">
                  <div className="w-52 h-16 inline-flex flex-col justify-start items-start">
                    <div className="w-52 h-5 inline-flex justify-start items-center">
                      <div className=" pr-2 flex justify-start items-start">
                        <div className="w-3.5 h-5 relative flex justify-start items-center">
                          <div className="size-3.5 left-0 top-[3px] absolute overflow-hidden">
                            <div className="w-2.5 h-2 left-[2.34px] top-[3.49px] absolute bg-black" />
                          </div>
                        </div>
                      </div>
                      <div className="w-48 h-5 flex justify-start items-center">
                        <div className="justify-center text-black text-sm font-normal font-['Roboto'] leading-tight">진단 점수 기반 협상 포인트 분석</div>
                      </div>
                    </div>
                    <div className=" pt-1 inline-flex justify-start items-start">
                      <div className="w-52 h-5 flex justify-start items-center">
                        <div className=" pr-2 flex justify-start items-start">
                          <div className="w-3.5 h-5 relative flex justify-start items-center">
                            <div className="size-3.5 left-0 top-[3px] absolute overflow-hidden">
                              <div className="w-2.5 h-2 left-[2.34px] top-[3.49px] absolute bg-black" />
                            </div>
                          </div>
                        </div>
                        <div className="w-36 h-5 flex justify-start items-center">
                          <div className="justify-center text-black text-sm font-normal font-['Roboto'] leading-tight">개인화된 협상 카드 생성</div>
                        </div>
                      </div>
                    </div>
                    <div className=" pt-1 inline-flex justify-start items-start">
                      <div className="w-52 h-5 flex justify-start items-center">
                        <div className=" pr-2 flex justify-start items-start">
                          <div className="w-3.5 h-5 relative flex justify-start items-center">
                            <div className="size-3.5 left-0 top-[3px] absolute overflow-hidden">
                              <div className="w-2.5 h-2 left-[2.34px] top-[3.49px] absolute bg-black" />
                            </div>
                          </div>
                        </div>
                        <div className="w-36 h-5 flex justify-start items-center">
                          <div className="justify-center text-black text-sm font-normal font-['Roboto'] leading-tight">단계별 협상 가이드 제공</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 메인 컨텐트 카드 */}
          <div className="w-[1152px] min-h-[931.75px] p-px bg-white rounded-2xl shadow-xl shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.10)] outline outline-1 outline-offset-[-1px] outline-violet-200 flex flex-col justify-start items-start">
            <div className="w-[1150px] min-h-[929.75px] p-8 flex flex-col justify-start items-start">
              
              {/* 리포트 타입 선택 */}
              <div className=" pb-8 inline-flex justify-start items-start">
                <div className="w-[1086px] h-[458.75px] flex justify-start items-start gap-8 flex-wrap content-start">
                  
                  {/* 종합 협상 리포트 카드 */}
                  <div
                    onClick={() => setSelectedReportType('comprehensive')}
                    className={`w-[527px] h-[458.75px] p-8 rounded-xl outline outline-2 outline-offset-[-2px] inline-flex flex-col justify-start items-start cursor-pointer transition-all duration-200 transform hover:scale-[1.01] ${
                      selectedReportType === 'comprehensive'
                        ? 'bg-purple-100 outline-violet-500 shadow-lg'
                        : 'bg-white outline-gray-300'
                    }`}
                  >
                    <div className="w-[459px] h-96 flex flex-col justify-start items-start">
                      <div className=" px-48 pb-4 inline-flex justify-start items-start">
                        <div className="size-16 bg-purple-100 rounded-full flex justify-center items-center">
                          <div className="w-6 h-8 relative flex justify-center items-center">
                            <div className="size-6 left-0 top-[4px] absolute overflow-hidden">
                              <div className="w-4 h-5 left-[3.50px] top-[2px] absolute bg-violet-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className=" pb-3 inline-flex justify-start items-start">
                        <div className="w-[459px] h-7 flex justify-center items-center">
                          <div className="text-center justify-center text-gray-800 text-xl font-bold font-['Roboto'] leading-7">종합 협상 리포트</div>
                        </div>
                      </div>
                      <div className=" pb-2 inline-flex justify-start items-start">
                        <div className="w-[459px] h-6 flex justify-center items-center">
                          <div className="w-12 h-5 px-3 py-1 bg-emerald-500 rounded-full flex justify-center items-start">
                            <div className="text-center justify-center text-white text-xs font-bold font-['Roboto'] leading-none">무료</div>
                          </div>
                        </div>
                      </div>
                      <div className=" pb-6 inline-flex justify-start items-start">
                        <div className="w-[459px] h-6 flex justify-center items-center">
                          <div className="text-center justify-center text-gray-600 text-sm font-normal font-['Roboto'] leading-snug">진단 결과를 바탕으로 완전한 협상 전략과 리포트를 자동 생성</div>
                        </div>
                      </div>
                      <div className="w-[459px] h-40 flex flex-col justify-start items-start">
                        <div className="w-[459px] h-5 inline-flex justify-start items-start">
                          <div className=" pr-2 pt-0.5 flex justify-start items-start">
                            <div className="w-3.5 h-5 relative flex justify-start items-center">
                              <div className="size-3.5 left-0 top-[3px] absolute overflow-hidden">
                                <div className="w-2.5 h-2 left-[2.34px] top-[3.49px] absolute bg-emerald-500" />
                              </div>
                            </div>
                          </div>
                          <div className="w-52 h-5 flex justify-start items-center">
                            <div className="justify-center text-gray-700 text-sm font-normal font-['Roboto'] leading-tight">8개 섹션으로 구성된 완전한 리포트</div>
                          </div>
                        </div>
                        <div className=" pt-3 inline-flex justify-start items-start">
                          <div className="w-[459px] h-5 flex justify-start items-start">
                            <div className=" pr-2 pt-0.5 flex justify-start items-start">
                              <div className="w-3.5 h-5 relative flex justify-start items-center">
                                <div className="size-3.5 left-0 top-[3px] absolute overflow-hidden">
                                  <div className="w-2.5 h-2 left-[2.34px] top-[3.49px] absolute bg-emerald-500" />
                                </div>
                              </div>
                            </div>
                            <div className="w-60 h-5 flex justify-start items-center">
                              <div className="justify-center text-gray-700 text-sm font-normal font-['Roboto'] leading-tight">객관적 데이터와 수치로 명시된 근거 제공</div>
                            </div>
                          </div>
                        </div>
                        <div className=" pt-3 inline-flex justify-start items-start">
                          <div className="w-[459px] h-5 flex justify-start items-start">
                            <div className=" pr-2 pt-0.5 flex justify-start items-start">
                              <div className="w-3.5 h-5 relative flex justify-start items-center">
                                <div className="size-3.5 left-0 top-[3px] absolute overflow-hidden">
                                  <div className="w-2.5 h-2 left-[2.34px] top-[3.49px] absolute bg-emerald-500" />
                                </div>
                              </div>
                            </div>
                            <div className="w-44 h-5 flex justify-start items-center">
                              <div className="justify-center text-gray-700 text-sm font-normal font-['Roboto'] leading-tight">협상 카드 우선순위 자동 생성</div>
                            </div>
                          </div>
                        </div>
                        <div className=" pt-3 inline-flex justify-start items-start">
                          <div className="w-[459px] h-5 flex justify-start items-center">
                            <div className=" pr-2 pt-0.5 flex justify-start items-center">
                              <div className="w-3.5 h-5 relative flex justify-start items-center">
                                <div className="size-3.5 left-0 top-[3px] absolute overflow-hidden">
                                  <div className="w-2.5 h-2 left-[2.34px] top-[3.49px] absolute bg-emerald-500" />
                                </div>
                              </div>
                            </div>
                            <div className="w-40 h-5 flex justify-start items-center">
                              <div className="justify-center text-gray-700 text-sm font-normal font-['Roboto'] leading-tight">맞춤형 정책/지원 정보 포함</div>
                            </div>
                          </div>
                        </div>
                        <div className=" pt-3 inline-flex justify-start items-start">
                          <div className="w-[459px] h-5 flex justify-start items-center">
                            <div className=" pr-2 pt-0.5 flex justify-start items-center">
                              <div className="w-3.5 h-5 relative flex justify-start items-center">
                                <div className="size-3.5 left-0 top-[3px] absolute overflow-hidden">
                                  <div className="w-2.5 h-2 left-[2.34px] top-[3.49px] absolute bg-emerald-500" />
                                </div>
                              </div>
                            </div>
                            <div className="w-44 h-5 flex justify-start items-center">
                              <div className="justify-center text-gray-700 text-sm font-normal font-['Roboto'] leading-tight">분쟁 해결 가이드 및 법령 정보</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                  </div>

                  {/* 프리미엄 리포트 카드 */}
                  <div
                    onClick={() => setSelectedReportType('premium')}
                    className={`w-[527px] h-[458.75px] p-8 rounded-xl outline outline-2 outline-offset-[-2px] inline-flex flex-col justify-start items-start cursor-pointer transition-all duration-200 transform hover:scale-[1.01] ${
                      selectedReportType === 'premium'
                        ? 'bg-amber-100 outline-amber-500 shadow-lg'
                        : 'bg-white outline-gray-300'
                    }`}
                  >
                    <div className="w-[459px] h-96 flex flex-col justify-start items-start">
                      <div className=" px-48 pb-4 inline-flex justify-start items-start">
                        <div className="size-16 bg-amber-500 rounded-full flex justify-center items-center">
                          <div className="w-6 h-8 relative flex justify-center items-center">
                            <div className="size-6 left-0 top-[4px] absolute overflow-hidden">
                              <div className="size-5 left-[2.50px] top-[2.50px] absolute bg-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className=" pb-3 inline-flex justify-start items-start">
                        <div className="w-[459px] h-7 flex justify-center items-center">
                          <div className="text-center justify-center text-gray-800 text-xl font-bold font-['Roboto'] leading-7">프리미엄 리포트</div>
                        </div>
                      </div>
                      <div className=" pb-2 inline-flex justify-start items-start">
                        <div className="w-[459px] h-6 flex justify-center items-center">
                          <div className="w-20 h-5 px-3 py-1 bg-amber-500 rounded-full flex justify-center items-start">
                            <div className="text-center justify-center text-white text-xs font-bold font-['Roboto'] leading-none">유료 서비스</div>
                          </div>
                        </div>
                      </div>
                      <div className=" pb-6 inline-flex justify-start items-start">
                        <div className="w-[459px] h-6 flex justify-center items-center">
                          <div className="text-center justify-center text-gray-600 text-sm font-normal font-['Roboto'] leading-snug">고급 AI 분석과 스마트 보조 진단으로 더욱 정교한 협상 전략 제공</div>
                        </div>
                      </div>
                      <div className="w-[459px] h-48 flex flex-col justify-start items-start">
                        <div className="w-[459px] h-5 inline-flex justify-start items-start">
                          <div className=" pr-2 pt-0.5 flex justify-start items-center">
                            <div className="w-3.5 h-5 relative flex justify-start items-center">
                              <div className="size-3.5 left-0 top-[3px] absolute overflow-hidden">
                                <div className="w-2.5 h-2 left-[2.34px] top-[3.49px] absolute bg-amber-500" />
                              </div>
                            </div>
                          </div>
                          <div className="w-44 h-5 flex justify-start items-center">
                            <div className="justify-center text-gray-700 text-sm font-normal font-['Roboto'] leading-tight">종합 리포트의 모든 기능 포함</div>
                          </div>
                        </div>
                        <div className=" pt-3 inline-flex justify-start items-start">
                          <div className="w-[459px] h-5 flex justify-start items-center">
                            <div className=" pr-2 pt-0.5 flex justify-start items-center">
                              <div className="w-3.5 h-5 relative flex justify-start items-center">
                                <div className="size-3.5 left-0 top-[3px] absolute overflow-hidden">
                                  <div className="w-3.5 h-3 left-[0.63px] top-[0.66px] absolute bg-amber-500" />
                                </div>
                              </div>
                            </div>
                            <div className="w-48 h-5 flex justify-start items-center">
                              <div className="justify-center text-gray-700 text-sm font-normal font-['Roboto'] leading-tight">스마트 보조 진단 기능 사용 가능</div>
                            </div>
                          </div>
                        </div>
                        <div className=" pt-3 inline-flex justify-start items-start">
                          <div className="w-[459px] h-5 flex justify-start items-center">
                            <div className=" pr-2 pt-0.5 flex justify-start items-center">
                              <div className="w-3.5 h-5 relative flex justify-start items-center">
                                <div className="size-3.5 left-0 top-[3px] absolute overflow-hidden">
                                  <div className="w-2.5 h-2 left-[2.34px] top-[3.49px] absolute bg-amber-500" />
                                </div>
                              </div>
                            </div>
                            <div className="w-44 h-5 flex justify-start items-center">
                              <div className="justify-center text-gray-700 text-sm font-normal font-['Roboto'] leading-tight">AI 개인 맞춤형 협상 문구 생성</div>
                            </div>
                          </div>
                        </div>
                        <div className=" pt-3 inline-flex justify-start items-start">
                          <div className="w-[459px] h-5 flex justify-start items-center">
                            <div className=" pr-2 pt-0.5 flex justify-start items-center">
                              <div className="w-3.5 h-5 relative flex justify-start items-center">
                                <div className="size-3.5 left-0 top-[3px] absolute overflow-hidden">
                                  <div className="w-2.5 h-2 left-[2.34px] top-[3.49px] absolute bg-amber-500" />
                                </div>
                              </div>
                            </div>
                            <div className="w-36 h-5 flex justify-start items-center">
                              <div className="justify-center text-gray-700 text-sm font-normal font-['Roboto'] leading-tight">실시간 시장 데이터 분석</div>
                            </div>
                          </div>
                        </div>
                        <div className=" pt-3 inline-flex justify-start items-start">
                          <div className="w-[459px] h-5 flex justify-start items-center">
                            <div className=" pr-2 pt-0.5 flex justify-start items-center">
                              <div className="w-3.5 h-5 relative flex justify-start items-center">
                                <div className="size-3.5 left-0 top-[3px] absolute overflow-hidden">
                                  <div className="w-2.5 h-2 left-[2.34px] top-[3.49px] absolute bg-amber-500" />
                                </div>
                              </div>
                            </div>
                            <div className="w-32 h-5 flex justify-start items-center">
                              <div className="justify-center text-gray-700 text-sm font-normal font-['Roboto'] leading-tight">전문가 검토 의견 포함</div>
                            </div>
                          </div>
                        </div>
                        <div className=" pt-3 inline-flex justify-start items-start">
                          <div className="w-[459px] h-5 flex justify-start items-center">
                            <div className=" pr-2 pt-0.5 flex justify-start items-center">
                              <div className="w-3.5 h-5 relative flex justify-start items-center">
                                <div className="size-3.5 left-0 top-[3px] absolute overflow-hidden">
                                  <div className="w-2.5 h-2 left-[2.34px] top-[3.49px] absolute bg-amber-500" />
                                </div>
                              </div>
                            </div>
                            <div className="w-40 h-5 flex justify-start items-center">
                              <div className="justify-center text-gray-700 text-sm font-normal font-['Roboto'] leading-tight">30일 무제한 업데이트 지원</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-24 h-8 left-[211.96px] top-[-10px] absolute flex flex-col justify-start items-start">
                      <div className="w-24 h-8 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full inline-flex justify-start items-center">
                        <div className=" pr-1 flex justify-start items-start">
                          <div className="size-3 relative overflow-hidden">
                            <div className="size-2.5 left-[1.25px] top-[1.25px] absolute bg-white" />
                          </div>
                        </div>
                        <div className="justify-center text-white text-xs font-bold font-['Roboto'] leading-none">PREMIUM</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-[1086px] h-14 inline-flex justify-center items-start">
                <button
                  onClick={
                    selectedReportType === 'comprehensive'
                      ? handleGenerateComprehensiveReport
                      : handleGeneratePremiumReport
                  }
                  disabled={isLoading || !selectedReportType}
                  className={`w-52 h-14 px-8 py-4 rounded-xl shadow-lg shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.10)] flex justify-center items-center overflow-hidden transition-all duration-200 transform ${
                    selectedReportType && !isLoading
                      ? (selectedReportType === 'comprehensive'
                          ? 'bg-violet-500 hover:bg-violet-600 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                          : 'bg-amber-500 hover:bg-amber-600 hover:scale-[1.02] active:scale-[0.98] cursor-pointer')
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  <div className={`text-center justify-center text-lg font-bold font-['Roboto'] leading-7 ${
                    selectedReportType && !isLoading
                      ? 'text-white'
                      : 'text-gray-500'
                  }`}>
                    {isLoading ? '생성 중...' : 'AI 리포트 생성하기'}
                  </div>
                </button>
              </div>

              {/* 협상 요구사항 입력 */}
              <div className=" pb-8 inline-flex justify-start items-start">
                <div className="w-[1086px] h-52 inline-flex flex-col justify-start items-start">
                  <div className=" pb-4 inline-flex justify-start items-start">
                    <div className="w-[1086px] h-7 flex justify-start items-center">
                      <div className="justify-center text-gray-800 text-xl font-semibold font-['Roboto'] leading-7">협상 요구사항을 입력해주세요. (선택사항)</div>
                    </div>
                  </div>
                  <div className="w-[1086px] h-32 px-4 py-3 relative bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-300 inline-flex justify-start items-start overflow-hidden">
                    <textarea
                      value={reportContent}
                      onChange={(e) => setReportContent(e.target.value)}
                      className="w-full h-full resize-none outline-none text-base font-medium font-['Inter'] leading-normal text-gray-700 placeholder-gray-400"
                      placeholder="예: 월세가 너무 비싸서 조금 낮춰달라고 요청하고 싶어요. 주변 시세보다 20만원 정도 더 비싸고 방음도 안좋아요."
                      maxLength={500}
                    />
                  </div>
                  <div className=" pt-2 inline-flex justify-start items-start">
                    <div className="w-[1086px] h-5 flex justify-end items-center">
                      <div className={`text-right justify-center text-sm font-normal font-['Roboto'] leading-tight ${
                        reportContent.length > 450 ? 'text-red-500' : 'text-gray-500'
                      }`}>
                        {reportContent.length}/500자
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              {/* 에러 메시지 표시 */}
              {error && (
                <div className="w-[1086px] mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <div className="flex items-center">
                    <div className="size-4 mr-2 text-red-500">⚠️</div>
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                </div>
              )}

              <div className=" pt-6 inline-flex justify-start items-start">
                <div className="w-[1086px] h-12 p-4 bg-purple-100 rounded-lg inline-flex flex-col justify-start items-start">
                  <div className="w-[1054px] h-5 inline-flex justify-center items-center">
                    <div className=" pr-2 flex justify-start items-start">
                      <div className="size-3.5 relative overflow-hidden">
                        <div className="size-3 left-[1.46px] top-[1.17px] absolute bg-violet-500" />
                      </div>
                    </div>
                    <div className="text-center justify-center text-violet-500 text-sm font-medium font-['Roboto'] leading-tight">생성된 리포트는 임대인과 공유할 수 있는 링크로 제공됩니다</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {selectedReportType === 'premium' && (
            <>
              {/* 스마트 보조 진단 기능 */}
              <div className=" pt-8 inline-flex justify-start items-start">
                <div className="w-[1152px] h-96 p-px bg-white rounded-2xl shadow-xl shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.10)] outline outline-1 outline-offset-[-1px] outline-amber-100 inline-flex flex-col justify-start items-start overflow-hidden">
                  <div className="w-[1150px] h-14 px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 flex flex-col justify-start items-start">
                    <div className="w-[1102px] h-7 inline-flex justify-start items-center">
                      <div className=" pr-2 flex justify-start items-start">
                        <div className="w-5 h-7 relative flex justify-start items-center">
                          <div className="size-5 left-0 top-[4px] absolute overflow-hidden">
                            <div className="size-5 left-[0.90px] top-[0.95px] absolute bg-white" />
                          </div>
                        </div>
                      </div>
                      <div className="justify-center text-white text-xl font-bold font-['Roboto'] leading-7">스마트 보조 진단 기능</div>
                    </div>
                  </div>
                  <div className="w-[1150px] h-96 p-6 flex flex-col justify-start items-start">
                    <div className="w-[1102px] h-60 inline-flex justify-start items-start gap-6 flex-wrap content-start">
                      <div className="w-[539px] h-60 inline-flex flex-col justify-start items-start">
                        <div className="w-[539px] h-16 p-3.5 bg-amber-100 rounded-lg outline outline-2 outline-offset-[-2px] outline-amber-500 inline-flex justify-start items-center">
                          <div className=" pr-3 flex justify-start items-start">
                            <div className="size-8 bg-amber-500 rounded-full flex justify-center items-center">
                              <div className="w-3.5 h-5 relative flex justify-start items-center">
                                <div className="size-3.5 left-0 top-[3px] absolute overflow-hidden">
                                  <div className="w-2.5 h-3 left-[2.04px] top-[0.88px] absolute bg-white" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="w-40 h-10 inline-flex flex-col justify-start items-start">
                            <div className="w-40 h-6 inline-flex justify-start items-center">
                              <div className="justify-center text-gray-800 text-base font-semibold font-['Roboto'] leading-normal">AI 상황 분석</div>
                            </div>
                            <div className="w-40 h-4 inline-flex justify-start items-center">
                              <div className="justify-center text-gray-600 text-xs font-normal font-['Roboto'] leading-none">복잡한 상황도 AI가 정확히 파악</div>
                            </div>
                          </div>
                        </div>
                        <div className=" pt-4 inline-flex justify-start items-start">
                          <div className="w-[539px] h-16 p-3.5 bg-amber-100 rounded-lg outline outline-2 outline-offset-[-2px] outline-amber-500 flex justify-start items-center">
                            <div className=" pr-3 flex justify-start items-start">
                              <div className="size-8 bg-amber-500 rounded-full flex justify-center items-center">
                                <div className="w-3.5 h-5 relative flex justify-start items-center">
                                  <div className="size-3.5 left-0 top-[3px] absolute overflow-hidden">
                                    <div className="size-3 left-[1.46px] top-[1.31px] absolute bg-white" />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="w-36 h-10 inline-flex flex-col justify-start items-start">
                              <div className="w-36 h-6 inline-flex justify-start items-center">
                                <div className="justify-center text-gray-800 text-base font-semibold font-['Roboto'] leading-normal">맞춤형 협상 문구</div>
                              </div>
                              <div className="w-36 h-4 inline-flex justify-start items-center">
                                <div className="justify-center text-gray-600 text-xs font-normal font-['Roboto'] leading-none">상황에 맞는 협상 대화 템플릿</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className=" pt-4 inline-flex justify-start items-start">
                          <div className="w-[539px] h-16 p-3.5 bg-amber-100 rounded-lg outline outline-2 outline-offset-[-2px] outline-amber-500 flex justify-start items-center">
                            <div className=" pr-3 flex justify-start items-start">
                              <div className="size-8 bg-amber-500 rounded-full flex justify-center items-center">
                                <div className="w-3.5 h-5 relative flex justify-start items-center">
                                  <div className="size-3.5 left-0 top-[3px] absolute overflow-hidden">
                                    <div className="w-2.5 h-3 left-[2.62px] top-[0.88px] absolute bg-white" />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="w-28 h-10 inline-flex flex-col justify-start items-start">
                              <div className="w-28 h-6 inline-flex justify-start items-center">
                                <div className="justify-center text-gray-800 text-base font-semibold font-['Roboto'] leading-normal">실시간 조언</div>
                              </div>
                              <div className="w-28 h-4 inline-flex justify-start items-center">
                                <div className="justify-center text-gray-600 text-xs font-normal font-['Roboto'] leading-none">협상 과정에서 즉시 도움</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="w-[539px] h-60 inline-flex flex-col justify-start items-start">
                        <div className="w-[539px] h-16 p-3.5 bg-amber-100 rounded-lg outline outline-2 outline-offset-[-2px] outline-amber-500 inline-flex justify-start items-center">
                          <div className=" pr-3 flex justify-start items-start">
                            <div className="size-8 bg-amber-500 rounded-full flex justify-center items-center">
                              <div className="w-3.5 h-5 relative flex justify-start items-center">
                                <div className="size-3.5 left-0 top-[3px] absolute overflow-hidden">
                                  <div className="w-2.5 h-2 left-[1.83px] top-[1.75px] absolute bg-white" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="w-32 h-10 inline-flex flex-col justify-start items-start">
                            <div className="w-32 h-6 inline-flex justify-start items-center">
                              <div className="justify-center text-gray-800 text-base font-semibold font-['Roboto'] leading-normal">성공률 예측</div>
                            </div>
                            <div className="w-32 h-4 inline-flex justify-start items-center">
                              <div className="justify-center text-gray-600 text-xs font-normal font-['Roboto'] leading-none">각 협상 전략의 성공 가능성</div>
                            </div>
                          </div>
                        </div>
                        <div className=" pt-4 inline-flex justify-start items-start">
                          <div className="w-[539px] h-16 p-3.5 bg-amber-100 rounded-lg outline outline-2 outline-offset-[-2px] outline-amber-500 flex justify-start items-center">
                            <div className=" pr-3 flex justify-start items-start">
                              <div className="size-8 bg-amber-500 rounded-full flex justify-center items-center">
                                <div className="w-3.5 h-5 relative flex justify-start items-center">
                                  <div className="size-3.5 left-0 top-[3px] absolute overflow-hidden">
                                    <div className="size-3 left-[1.46px] top-[1.17px] absolute bg-white" />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="w-36 h-10 inline-flex flex-col justify-start items-start">
                              <div className="w-36 h-6 inline-flex justify-start items-center">
                                <div className="justify-center text-gray-800 text-base font-semibold font-['Roboto'] leading-normal">타이밍 분석</div>
                              </div>
                              <div className="w-36 h-4 inline-flex justify-start items-center">
                                <div className="justify-center text-gray-600 text-xs font-normal font-['Roboto'] leading-none">협상하기 가장 좋은 시점 안내</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className=" pt-4 inline-flex justify-start items-start">
                          <div className="w-[539px] h-16 p-3.5 bg-amber-100 rounded-lg outline outline-2 outline-offset-[-2px] outline-amber-500 flex justify-start items-center">
                            <div className=" pr-3 flex justify-start items-start">
                              <div className="size-8 bg-amber-500 rounded-full flex justify-center items-center">
                                <div className="w-3.5 h-5 relative flex justify-start items-center">
                                  <div className="size-3.5 left-0 top-[3px] absolute overflow-hidden">
                                    <div className="size-3 left-[1.46px] top-[0.91px] absolute bg-white" />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="w-28 h-10 inline-flex flex-col justify-start items-start">
                              <div className="w-28 h-6 inline-flex justify-start items-center">
                                <div className="justify-center text-gray-800 text-base font-semibold font-['Roboto'] leading-normal">전문가 지원</div>
                              </div>
                              <div className="w-28 h-4 inline-flex justify-start items-center">
                                <div className="justify-center text-gray-600 text-xs font-normal font-['Roboto'] leading-none">필요시 전문가 상담 연결</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className=" pt-6 inline-flex justify-start items-start">
                      <div className="w-[1102px] h-14 p-4 bg-amber-100 rounded-lg inline-flex flex-col justify-start items-start">
                        <div className="w-[1070px] h-6 inline-flex justify-center items-center">
                          <div className=" pr-2 flex justify-start items-start">
                            <div className="w-4 h-6 relative flex justify-start items-center">
                              <div className="size-4 left-0 top-[4px] absolute overflow-hidden">
                                <div className="w-3.5 h-3 left-[1.67px] top-[1.67px] absolute bg-amber-500" />
                              </div>
                            </div>
                          </div>
                          <div className="w-96 h-5 flex justify-start items-center">
                            <div className="justify-center text-amber-500 text-sm font-medium font-['Roboto'] leading-tight">스마트 보조 진단은 프리미엄 리포트 이용자만 사용할 수 있는 독점 기능입니다</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 생성될 리포트 구성 */}
          <div className=" pt-8 inline-flex justify-start items-start">
            <div className="w-[1152px] h-[510px] p-px bg-white rounded-2xl shadow-xl shadow-[0px_8px_10px_-6px_rgba(0,0,0,0.10)] outline outline-1 outline-offset-[-1px] outline-violet-200 inline-flex flex-col justify-start items-start overflow-hidden">
              <div className="w-[1150px] h-14 px-6 py-4 bg-gradient-to-r from-violet-500 to-violet-600 flex flex-col justify-start items-start">
                <div className="w-[1102px] h-7 inline-flex justify-start items-center">
                  <div className="justify-center text-white text-xl font-bold font-['Roboto'] leading-7">📋 생성될 리포트 구성</div>
                </div>
              </div>
              <div className="w-[1150px] h-96 p-6 flex flex-col justify-start items-start">
                <div className="w-[1102px] h-80 inline-flex justify-start items-start gap-6 flex-wrap content-start">
                  <div className="w-[539px] h-80 inline-flex flex-col justify-start items-start">
                    {[
                      { num: "1", title: "리포트 헤더", desc: "생성일자, 데이터 신뢰도 표시" },
                      { num: "2", title: "계약 정보 요약", desc: "주소, 계약 조건, 인증 여부" },
                      { num: "3", title: "주관적 지표", desc: "커뮤니티 데이터 기반 비교" },
                      { num: "4", title: "객관적 지표", desc: "공공 데이터 기반 시세 비교" }
                    ].map((item, index) => (
                      <div key={index} className={`w-[539px] h-16 p-3.5 bg-purple-100 rounded-lg outline outline-2 outline-offset-[-2px] outline-violet-200 inline-flex justify-start items-center ${index > 0 ? 'mt-4' : ''}`}>
                        <div className=" pr-3 flex justify-start items-start">
                          <div className="size-8 bg-violet-500 rounded-full flex justify-center items-center">
                            <div className="w-2 h-5 flex justify-start items-center">
                              <div className="justify-center text-white text-sm font-bold font-['Roboto'] leading-tight">{item.num}</div>
                            </div>
                          </div>
                        </div>
                        <div className="w-36 h-10 inline-flex flex-col justify-start items-start">
                          <div className="w-36 h-6 inline-flex justify-start items-center">
                            <div className="justify-center text-gray-800 text-base font-semibold font-['Roboto'] leading-normal">{item.title}</div>
                          </div>
                          <div className="w-36 h-4 inline-flex justify-start items-center">
                            <div className="justify-center text-gray-600 text-xs font-normal font-['Roboto'] leading-none">{item.desc}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="w-[539px] h-80 inline-flex flex-col justify-start items-start">
                    {[
                      { num: "5", title: "협상 카드", desc: "우선순위별 자동 생성" },
                      { num: "6", title: "정책/지원 정보", desc: "맞춤형 지원금 및 혜택" },
                      { num: "7", title: "분쟁 해결 가이드", desc: "관련 법령 및 조정위원회" },
                      { num: "8", title: "업데이트 알림", desc: "지속적인 데이터 업데이트" }
                    ].map((item, index) => (
                      <div key={index} className={`w-[539px] h-16 p-3.5 bg-purple-100 rounded-lg outline outline-2 outline-offset-[-2px] outline-violet-200 inline-flex justify-start items-center ${index > 0 ? 'mt-4' : ''}`}>
                        <div className=" pr-3 flex justify-start items-start">
                          <div className="size-8 bg-violet-500 rounded-full flex justify-center items-center">
                            <div className="w-2 h-5 flex justify-start items-center">
                              <div className="justify-center text-white text-sm font-bold font-['Roboto'] leading-tight">{item.num}</div>
                            </div>
                          </div>
                        </div>
                        <div className="w-28 h-10 inline-flex flex-col justify-start items-start">
                          <div className="w-28 h-6 inline-flex justify-start items-center">
                            <div className="justify-center text-gray-800 text-base font-semibold font-['Roboto'] leading-normal">{item.title}</div>
                          </div>
                          <div className="w-28 h-4 inline-flex justify-start items-center">
                            <div className="justify-center text-gray-600 text-xs font-normal font-['Roboto'] leading-none">{item.desc}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className=" pt-6 inline-flex justify-start items-start">
                  <div className="w-[1102px] h-14 p-4 bg-purple-100 rounded-lg inline-flex flex-col justify-start items-start">
                    <div className="w-[1070px] h-6 inline-flex justify-center items-center">
                      <div className=" pr-2 flex justify-start items-start">
                        <div className="w-4 h-6 relative flex justify-start items-center">
                          <div className="size-4 left-0 top-[4px] absolute overflow-hidden">
                            <div className="w-2.5 h-3.5 left-[3px] top-[1px] absolute bg-violet-500" />
                          </div>
                        </div>
                      </div>
                      <div className="w-96 h-5 flex justify-start items-center">
                        <div className="justify-center text-violet-500 text-sm font-medium font-['Roboto'] leading-tight">모든 리포트는 최신 공공 데이터와 87명의 이웃 데이터를 기반으로 생성됩니다</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 메인으로 돌아가기 버튼 */}
          <div className=" pt-8 inline-flex justify-start items-start">
            <div className="w-[1152px] h-12 flex justify-center items-start">
              <div className=" pt-3.5 flex justify-start items-start">
                <div className="w-52 h-5 flex justify-center items-start">
                  <button
                    onClick={() => router.push('/')}
                    className="w-52 h-12 px-8 py-3 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors inline-flex flex-col justify-start items-start"
                  >
                    <div className="w-36 h-6 inline-flex justify-start items-center">
                      <div className=" pr-2 flex justify-start items-start">
                        <div className="w-4 h-6 relative flex justify-center items-center">
                          <div className="size-4 left-[0.01px] top-[4px] absolute overflow-hidden">
                            <div className="size-2.5 left-[3px] top-[2.81px] absolute bg-white" />
                          </div>
                        </div>
                      </div>
                      <div className="text-center justify-center text-white text-base font-medium font-['Roboto'] leading-normal">메인으로 돌아가기</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}