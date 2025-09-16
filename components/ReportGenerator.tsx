import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User } from '../types';
import PaymentModal from './PaymentModal';
import PlanSelectionModal from './PlanSelectionModal'; // 플랜 선택 모달 임포트

interface ReportGeneratorProps {
  currentUser: User;
  diagnosisData: any;
  marketData: any;
  onReportGenerated: (report: any, isPremium: boolean) => void;
}

interface ReportFormData {
  title: string;
  summary: string;
}

export default function ReportGenerator({ 
  currentUser, 
  diagnosisData, 
  marketData, 
  onReportGenerated 
}: ReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);
  const [showPlanSelectionModal, setShowPlanSelectionModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { register, handleSubmit, getValues } = useForm<ReportFormData>();

  const generateReport = async (isPremium: boolean) => {
    const formData = getValues();
    if (!formData) return;

    setIsGenerating(true);
    setShowPlanSelectionModal(false); // 플랜 모달 닫기
    setShowPaymentModal(false); // 결제 모달 닫기

    try {
      const apiEndpoint = isPremium ? '/report/create-premium' : '/report/create';
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 
        (process.env.NODE_ENV === 'production' 
          ? 'https://2025seasonthonteam92be-production.up.railway.app' 
          : 'http://localhost:8080');
      
      const jwtToken = localStorage.getItem('jwtToken');
      
      const response = await fetch(`${baseURL}${apiEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          reportContent: formData.summary || generateSummary(diagnosisData),
          isPremium
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        let reportId = typeof result === 'number' ? result : result.reportId;
        if (!reportId) throw new Error('리포트 ID를 받지 못했습니다.');
        
        const report: any = {
          id: reportId.toString(),
          userId: currentUser.id || '',
          reportUrl: `${window.location.origin}/report/${reportId}${isPremium ? '?type=premium' : ''}`,
          title: formData.title || `${currentUser.nickname} 님의 ${isPremium ? '프리미엄' : '기본'} 리포트`,
          summary: formData.summary || generateSummary(diagnosisData),
          isPremium
        };

        setGeneratedReport(report);
        onReportGenerated(report, isPremium);
        toast.success(`🎉 ${isPremium ? '프리미엄' : '기본'} 리포트가 생성되었습니다!`)
      } else {
        toast.error(result.message || '리포트 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error('리포트 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const onFormSubmit = (data: ReportFormData) => {
    setShowPlanSelectionModal(true); // 폼 제출 시 플랜 선택 모달 열기
  };

  const handleSelectBasic = () => generateReport(false);
  
  const handleSelectPremium = () => {
    setShowPlanSelectionModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = () => generateReport(true);

  const generateSummary = (diagnosis: any): string => {
    return `이 리포트는 ${currentUser.nickname} 님의 거주 환경을 종합적으로 분석한 결과입니다. 전체 점수 ${diagnosis.overallScore}점으로, 동네 평균과 비교하여 객관적인 협상 근거를 제시합니다.`;
  };

  const copyReportUrl = () => {
    if (generatedReport) {
      navigator.clipboard.writeText(generatedReport.reportUrl);
      toast.success('리포트 URL이 클립보드에 복사되었습니다!');
    }
  };

  if (generatedReport) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{generatedReport.isPremium ? '프리미엄' : '기본'} 리포트 생성 완료!</h2>
            <p className="text-gray-600 mb-6">협상을 위한 상세한 리포트가 준비되었습니다.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={copyReportUrl} className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 font-medium">📋 링크 복사하기</button>
            <button onClick={() => window.open(generatedReport.reportUrl, '_blank')} className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 font-medium">👁️ 리포트 보기</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PlanSelectionModal
        isOpen={showPlanSelectionModal}
        onClose={() => setShowPlanSelectionModal(false)}
        onSelectBasic={handleSelectBasic}
        onSelectPremium={handleSelectPremium}
        isLoading={isGenerating}
      />
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentConfirm}
        price={5000}
        itemName="프리미엄 리포트"
      />
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">협상 리포트 생성</h2>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">리포트 제목</label>
              <input {...register('title')} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="예: 우리 집 거주 환경 분석 리포트" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">리포트 요약</label>
              <textarea {...register('summary')} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="리포트의 주요 내용을 요약해주세요..." />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">자동 생성될 내용</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 종합 진단 점수 및 카테고리별 분석</li>
                <li>• 시장 데이터 기반 객관적 근거</li>
                <li>• 프리미엄 플랜 선택 시 심층 분석 추가</li>
              </ul>
            </div>
            <button type="submit" disabled={isGenerating} className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-bold">
              {isGenerating ? '생성 중...' : '리포트 생성하기'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

