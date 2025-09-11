import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ComprehensiveDiagnosis, MarketData, NegotiationReport, User } from '../types';
import ReportSharing from './ReportSharing';

interface ReportGeneratorProps {
  currentUser: User;
  diagnosisData: ComprehensiveDiagnosis;
  marketData: MarketData;
  onReportGenerated: (report: NegotiationReport) => void;
}

interface ReportFormData {
  title: string;
  summary: string;
  keyFindings: string[];
  recommendations: string[];
}

export default function ReportGenerator({ 
  currentUser, 
  diagnosisData, 
  marketData, 
  onReportGenerated 
}: ReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<NegotiationReport | null>(null);
  const [showSharing, setShowSharing] = useState(false);

  const { register, handleSubmit } = useForm<ReportFormData>();

  const generateReport = async (data: ReportFormData) => {
    setIsGenerating(true);
    try {
      // 백엔드에서 공유 리포트 생성
      const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 
        (process.env.NODE_ENV === 'production' 
          ? 'https://2025seasonthonteam92be-production.up.railway.app' 
          : 'http://localhost:8080');
      
      const jwtToken = localStorage.getItem('jwtToken');
      
      const response = await fetch(`${baseURL}/report/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          reportContent: data.summary || generateSummary(diagnosisData)
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        // 백엔드에서 반환하는 reportId 처리
        let reportId;
        
        if (typeof result === 'number') {
          reportId = result;
        } else if (result.reportId) {
          reportId = result.reportId;
        } else {
          throw new Error('리포트 ID를 받지 못했습니다.');
        }
        
        // 키 포인트 자동 생성
        const keyFindings = generateKeyFindings(diagnosisData);
        
        // 추천사항 자동 생성
        const recommendations = generateRecommendations(diagnosisData);

        const report: NegotiationReport = {
          id: reportId.toString(),
          userId: currentUser.id || '',
          reportUrl: `${window.location.origin}/report/${reportId}`,
          shareToken: '', // 백엔드에서 제공하지 않음
          title: data.title || `${currentUser.nickname}님의 거주 환경 분석 리포트`,
          summary: data.summary || generateSummary(diagnosisData),
          keyFindings,
          recommendations,
          marketData,
          diagnosisData,
          createdAt: new Date().toISOString(),
          isShared: true
        };

        setGeneratedReport(report);
        onReportGenerated(report);
        toast.success('리포트가 성공적으로 생성되었습니다!');
        setShowSharing(true);
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

  const generateKeyFindings = (diagnosis: ComprehensiveDiagnosis): string[] => {
    const findings: string[] = [];

    // 진단 점수 기반 포인트
    if (diagnosis.overallScore >= 80) {
      findings.push('전반적으로 우수한 거주 환경을 보유하고 있습니다.');
    } else if (diagnosis.overallScore >= 60) {
      findings.push('보통 수준의 거주 환경입니다.');
    } else {
      findings.push('거주 환경 개선이 필요한 상태입니다.');
    }

    // 카테고리별 포인트
    Object.entries(diagnosis.categoryScores).forEach(([category, score]) => {
      if (score < 60) {
        const categoryLabels: { [key: string]: string } = {
          'noise': '소음',
          'water_pressure': '수압',
          'lighting': '채광',
          'parking': '주차',
          'heating': '난방',
          'security': '보안',
          'elevator': '엘리베이터',
          'facilities': '기타 시설'
        };
        findings.push(`${categoryLabels[category]} 문제가 심각합니다.`);
      }
    });

    // 시장 데이터 기반 포인트는 generateRecommendations에서 처리

    return findings;
  };

  const generateRecommendations = (diagnosis: ComprehensiveDiagnosis): string[] => {
    const recommendations: string[] = [];

    // 진단 기반 추천
    recommendations.push(...diagnosis.recommendations);

    // 시장 데이터 기반 추천
    recommendations.push('동네 평균 시세를 참고하여 합리적인 협상을 진행하세요.');

    recommendations.push('데이터 기반의 객관적 근거를 제시하여 협상력을 높이세요.');

    return recommendations;
  };

  const generateSummary = (diagnosis: ComprehensiveDiagnosis): string => {
    return `이 리포트는 ${currentUser.nickname}님의 거주 환경을 종합적으로 분석한 결과입니다. 
    전체 점수 ${diagnosis.overallScore}점으로, 같은 건물 내 ${diagnosis.buildingComparison.percentile}% 상위에 위치하고 있습니다. 
    동네 평균과 비교하여 객관적인 협상 근거를 제시합니다.`;
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
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">리포트 생성 완료!</h2>
            <p className="text-gray-600 mb-6">협상을 위한 상세한 리포트가 준비되었습니다.</p>
          </div>

          {/* 리포트 미리보기 */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">리포트 미리보기</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800">제목</h4>
                <p className="text-gray-600">{generatedReport.title}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">요약</h4>
                <p className="text-gray-600">{generatedReport.summary}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">주요 발견사항</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {generatedReport.keyFindings.map((finding, index) => (
                    <li key={index}>{finding}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">추천사항</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {generatedReport.recommendations.map((recommendation, index) => (
                    <li key={index}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 공유 버튼 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={copyReportUrl}
              className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 font-medium"
            >
              📋 링크 복사하기
            </button>
            <button
              onClick={() => window.open(generatedReport.reportUrl, '_blank')}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 font-medium"
            >
              👁️ 리포트 보기
            </button>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>팁:</strong> 복사한 링크를 카톡이나 문자로 임대인에게 전달하세요. 
              임대인은 회원가입 없이도 리포트를 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">협상 리포트 생성</h2>
        
        <form onSubmit={handleSubmit(generateReport)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              리포트 제목
            </label>
            <input
              {...register('title')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="예: 우리 집 거주 환경 분석 리포트"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              리포트 요약
            </label>
            <textarea
              {...register('summary')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="리포트의 주요 내용을 요약해주세요..."
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">자동 생성될 내용</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 종합 진단 점수 및 카테고리별 분석</li>
              <li>• 같은 건물/동네 비교 데이터</li>
              <li>• 시장 데이터 기반 객관적 근거</li>
              <li>• 구체적인 개선 추천사항</li>
              <li>• 협상 전략 가이드</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 font-medium"
          >
            {isGenerating ? '리포트 생성 중...' : '리포트 생성하기'}
          </button>
        </form>
      </div>
      
      {/* 리포트 공유 모달 */}
      {showSharing && generatedReport && (
        <ReportSharing 
          report={generatedReport} 
          onClose={() => setShowSharing(false)} 
        />
      )}
    </div>
  );
}