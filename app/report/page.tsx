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
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-12">
        
        {/* --- Header Section --- */}
        <div className="w-full flex flex-col items-center text-center">
          <div className="text-purple-600 text-3xl md:text-4xl font-normal font-['Pacifico'] leading-10">월세의 정석</div>
          <div className="w-20 h-2 bg-purple-600 rounded-full my-4" />
          <div className="text-gray-900 text-3xl md:text-4xl font-bold font-['Roboto'] leading-10">협상 리포트 생성</div>
          <p className="max-w-2xl mt-4 text-gray-700 text-lg md:text-xl font-normal font-['Roboto'] leading-loose">
            당신의 진단 결과와 요구사항를 바탕으로 맞춤형 협상 전략을 생성합니다
          </p>
          <div className="mt-8 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 max-w-3xl">
            {[
              "진단 점수 기반 협상 포인트 분석",
              "개인화된 협상 카드 생성",
              "단계별 협상 가이드 제공"
            ].map((text, index) => (
              <div key={index} className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span className="text-gray-800 text-base font-normal font-['Roboto'] leading-normal">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* --- Single Main Content Card --- */}
        <div className="w-full p-1 md:p-2 bg-white rounded-3xl shadow-2xl outline outline-2 outline-offset-[-2px] outline-purple-400 flex flex-col items-center">
          <div className="w-full p-4 md:p-8 lg:p-12 flex flex-col items-center gap-10">
            
            {/* --- Report Type Selection --- */}
            <div className="w-full flex flex-col lg:flex-row justify-center items-stretch gap-6 md:gap-10">
              {/* Comprehensive Report Card */}
              <div
                onClick={() => setSelectedReportType('comprehensive')}
                className={`w-full lg:w-1/2 p-6 md:p-8 flex flex-col items-start rounded-2xl shadow-lg outline outline-[3px] outline-offset-[-3px] cursor-pointer transition-all duration-200 transform hover:scale-[1.01] ${
                  selectedReportType === 'comprehensive'
                    ? 'bg-purple-50 outline-purple-500 shadow-xl'
                    : 'bg-white outline-purple-400'
                }`}
              >
                <div className="flex items-center gap-4 pb-4">
                  <div className="size-16 bg-purple-100 rounded-2xl flex justify-center items-center">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </div>
                  <div>
                    <div className="text-gray-900 text-2xl font-bold font-['Roboto']">종합 협상 리포트</div>
                    <div className="mt-1 px-4 py-1 bg-gray-500 rounded-full inline-block">
                      <div className="text-white text-sm font-bold font-['Roboto']">무료</div>
                    </div>
                  </div>
                </div>
                <p className="pb-6 text-gray-700 text-base md:text-lg font-normal font-['Roboto'] leading-7">
                  진단 결과를 바탕으로 완전한 협상 전략과 리포트를 자동 생성합니다.
                </p>
                <div className="space-y-2">
                  {[
                    "8개 섹션으로 구성된 완전한 리포트",
                    "객관적 데이터와 수치로 명시된 근거 제공",
                    "협상 카드 우선순위 자동 생성",
                    "맞춤형 정책/지원 정보 포함",
                    "분쟁 해결 가이드 및 법령 정보"
                  ].map((text, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      <span className="text-gray-700 text-sm font-normal font-['Roboto'] leading-tight">{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Premium Report Card */}
              <div
                onClick={() => setSelectedReportType('premium')}
                className={`w-full lg:w-1/2 p-6 md:p-8 relative flex flex-col items-start rounded-2xl shadow-2xl outline outline-[3px] outline-offset-[-3px] cursor-pointer transition-all duration-200 transform hover:scale-[1.01] ${
                  selectedReportType === 'premium'
                    ? 'bg-purple-100 outline-purple-700 shadow-2xl'
                    : 'bg-purple-50 outline-purple-600'
                }`}
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full shadow-lg flex items-center gap-2">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <span className="text-white text-base font-bold font-['Roboto']">PREMIUM</span>
                </div>
                
                <div className="flex items-center gap-4 pb-4 mt-6">
                  <div className="size-16 bg-amber-500 rounded-2xl flex justify-center items-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M15 3v4M13 5h4M9 17v4M7 19h4M12 3c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8z"></path></svg>
                  </div>
                  <div>
                    <div className="text-gray-900 text-2xl font-bold font-['Roboto']">프리미엄 리포트</div>
                     <div className="mt-1 px-4 py-1 bg-amber-500 rounded-full inline-block">
                      <div className="text-white text-sm font-bold font-['Roboto']">유료 서비스</div>
                    </div>
                  </div>
                </div>
                <p className="pb-6 text-gray-700 text-base md:text-lg font-normal font-['Roboto'] leading-7">
                  고급 분석과 스마트 보조 진단으로 더욱 정교한 협상 전략을 제공합니다.
                </p>
                <div className="space-y-2">
                  {[
                    "종합 리포트의 모든 기능 포함",
                    "스마트 보조 진단 기능 사용 가능",
                    "개인 맞춤형 협상 문구 생성",
                    "실시간 시장 데이터 분석",
                    "전문가 검토 의견 포함",
                    "30일 무제한 업데이트 지원"
                  ].map((text, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      <span className="text-gray-700 text-sm font-normal font-['Roboto'] leading-tight">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* --- Generate Button --- */}
            <div className="w-full flex justify-center">
              <button
                onClick={
                  selectedReportType === 'comprehensive'
                    ? handleGenerateComprehensiveReport
                    : handleGeneratePremiumReport
                }
                disabled={isLoading || !selectedReportType}
                className={`w-full sm:w-96 h-16 px-12 py-5 rounded-2xl shadow-lg flex justify-center items-center gap-3 transition-all duration-200 transform ${
                  selectedReportType && !isLoading
                    ? (selectedReportType === 'comprehensive'
                        ? 'bg-purple-500 hover:bg-purple-600 text-white hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                        : 'bg-amber-500 hover:bg-amber-600 text-white hover:scale-[1.02] active:scale-[0.98] cursor-pointer')
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm3.5 4.5a.5.5 0 000 1h5a.5.5 0 000-1h-5zM7 9a.5.5 0 000 1h5a.5.5 0 000-1H7zm0 2.5a.5.5 0 000 1h2a.5.5 0 000-1h-2z" clipRule="evenodd" /></svg>
                <span className="text-xl font-bold font-['Roboto'] leading-7">
                  {isLoading
                    ? '생성 중...'
                    : !selectedReportType
                      ? '리포트 유형을 선택해주세요'
                      : selectedReportType === 'comprehensive'
                        ? '종합 협상 리포트 생성하기'
                        : '프리미엄 리포트 생성하기'}
                </span>
              </button>
            </div>

            {/* --- Error Message --- */}
            {error && (
              <div className="w-full max-w-4xl p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* --- Info Box --- */}
            <div className="w-full max-w-4xl p-6 bg-purple-100 rounded-2xl outline outline-2 outline-offset-[-2px] outline-purple-400 flex items-center gap-3">
              <svg className="w-5 h-5 text-purple-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
              <span className="text-purple-600 text-base md:text-lg font-medium font-['Roboto']">
                생성된 리포트는 임대인와 공유할 수 있는 링크로 제공됩니다.
              </span>
            </div>

            {/* --- Premium Features Section (Conditionally Rendered) --- */}
            {selectedReportType === 'premium' && (
              <div className="w-full max-w-7xl flex flex-col items-center gap-8 pt-10 border-t-2 border-gray-100">
                <div className="w-full p-1 md:p-2 bg-white rounded-3xl shadow-xl outline outline-2 outline-offset-[-2px] outline-purple-400 flex flex-col items-center">
                  <div className="w-full h-20 px-4 sm:px-8 py-6 bg-gradient-to-r from-amber-500 to-amber-600 flex items-center gap-3 rounded-t-3xl">
                    <svg className="w-8 h-8 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707.707M12 21v-1m0-16a8 8 0 100 16 8 8 0 000-16z"></path></svg>
                    <h2 className="text-white text-xl md:text-2xl font-bold font-['Roboto']">프리미엄 기능</h2>
                  </div>
                  <div className="w-full p-4 md:p-8 flex flex-col items-center gap-8">
                    <div className="w-full flex flex-col lg:flex-row justify-center gap-8">
                      {/* Left Column */}
                      <div className="w-full lg:w-1/2 space-y-4">
                        <div className="p-3.5 bg-amber-100 rounded-lg outline outline-2 outline-offset-[-2px] outline-amber-500 flex items-center gap-3">
                          <div className="size-8 bg-amber-500 rounded-full flex justify-center items-center flex-shrink-0">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"></path></svg>
                          </div>
                          <div>
                            <div className="text-gray-800 text-base font-semibold">맞춤형 협상 문구</div>
                            <div className="text-gray-600 text-xs">상황에 맞는 협상 대화 템플릿</div>
                          </div>
                        </div>
                        <div className="p-3.5 bg-amber-100 rounded-lg outline outline-2 outline-offset-[-2px] outline-amber-500 flex items-center gap-3">
                          <div className="size-8 bg-amber-500 rounded-full flex justify-center items-center flex-shrink-0">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                          </div>
                          <div>
                            <div className="text-gray-800 text-base font-semibold">실시간 조언</div>
                            <div className="text-gray-600 text-xs">협상 과정에서 즉시 도움</div>
                          </div>
                        </div>
                      </div>
                      {/* Right Column */}
                      <div className="w-full lg:w-1/2 space-y-4">
                        <div className="p-3.5 bg-amber-100 rounded-lg outline outline-2 outline-offset-[-2px] outline-amber-500 flex items-center gap-3">
                          <div className="size-8 bg-amber-500 rounded-full flex justify-center items-center flex-shrink-0">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                          </div>
                          <div>
                            <div className="text-gray-800 text-base font-semibold">성공률 예측</div>
                            <div className="text-gray-600 text-xs">각 협상 전략의 성공 가능성</div>
                          </div>
                        </div>
                        <div className="p-3.5 bg-amber-100 rounded-lg outline outline-2 outline-offset-[-2px] outline-amber-500 flex items-center gap-3">
                          <div className="size-8 bg-amber-500 rounded-full flex justify-center items-center flex-shrink-0">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          </div>
                          <div>
                            <div className="text-gray-800 text-base font-semibold">타이밍 분석</div>
                            <div className="text-gray-600 text-xs">협상하기 가장 좋은 시점 안내</div>
                          </div>
                        </div>
                        <div className="p-3.5 bg-amber-100 rounded-lg outline outline-2 outline-offset-[-2px] outline-amber-500 flex items-center gap-3">
                          <div className="size-8 bg-amber-500 rounded-full flex justify-center items-center flex-shrink-0">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                          </div>
                          <div>
                            <div className="text-gray-800 text-base font-semibold">전문가 지원</div>
                            <div className="text-gray-600 text-xs">필요시 전문가 상담 연결</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full max-w-6xl p-6 bg-amber-100 rounded-2xl outline outline-2 outline-offset-[-2px] outline-amber-400 flex items-center gap-3">
                      <svg className="w-6 h-6 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      <span className="text-amber-600 text-base md:text-lg font-bold font-['Roboto']">
                        프리미엄 리포트 이용자만 사용할 수 있는 독점 기능입니다.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- Report Structure Section --- */}
            <div className="w-full max-w-7xl flex flex-col items-center gap-6 pt-10 border-t-2 border-gray-100">
              <div className="w-full flex items-center gap-4">
                <div className="size-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex justify-center items-center flex-shrink-0">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <div>
                  <h2 className="text-gray-900 text-xl md:text-2xl font-bold font-['Roboto']">생성될 리포트 구성</h2>
                  <p className="text-gray-600 text-base">맞춤형 협상 리포트</p>
                </div>
              </div>
              <div className="w-full p-2 md:p-6">
                <div className="w-full flex flex-col lg:flex-row justify-center gap-6">
                  {/* Left Column */}
                  <div className="w-full lg:w-1/2 space-y-4">
                    {[
                      { num: "1", title: "리포트 헤더", desc: "생성일자, 데이터 신뢰도 표시" },
                      { num: "2", title: "계약 정보 요약", desc: "주소, 계약 조건, 인증 여부" },
                      { num: "3", title: "주관적 지표", desc: "커뮤니티 데이터 기반 비교" },
                      { num: "4", title: "객관적 지표", desc: "공공 데이터 기반 시세 비교" }
                    ].map((item, index) => (
                      <div key={index} className="w-full p-3.5 bg-purple-100 rounded-lg outline outline-2 outline-offset-[-2px] outline-violet-200 flex items-center gap-3">
                        <div className="size-8 bg-violet-500 rounded-full flex justify-center items-center flex-shrink-0">
                          <span className="text-white text-sm font-bold">{item.num}</span>
                        </div>
                        <div>
                          <div className="text-gray-800 text-base font-semibold">{item.title}</div>
                          <div className="text-gray-600 text-xs">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Right Column */}
                  <div className="w-full lg:w-1/2 space-y-4">
                    {[
                      { num: "5", title: "협상 카드", desc: "우선순위별 자동 생성" },
                      { num: "6", title: "정책/지원 정보", desc: "맞춤형 지원금 및 혜택" },
                      { num: "7", title: "분쟁 해결 가이드", desc: "관련 법령 및 조정위원회" },
                      { num: "8", title: "업데이트 알림", desc: "지속적인 데이터 업데이트" }
                    ].map((item, index) => (
                      <div key={index} className="w-full p-3.5 bg-purple-100 rounded-lg outline outline-2 outline-offset-[-2px] outline-violet-200 flex items-center gap-3">
                        <div className="size-8 bg-violet-500 rounded-full flex justify-center items-center flex-shrink-0">
                          <span className="text-white text-sm font-bold">{item.num}</span>
                        </div>
                        <div>
                          <div className="text-gray-800 text-base font-semibold">{item.title}</div>
                          <div className="text-gray-600 text-xs">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* --- Back to Main Button --- */}
            <div className="w-full flex justify-center pt-10 border-t-2 border-gray-100">
              <button
                onClick={() => router.push('/')}
                className="w-full sm:w-64 h-14 px-10 py-4 bg-gray-600 rounded-2xl shadow-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                <span className="text-white text-lg font-bold">메인으로 돌아가기</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}