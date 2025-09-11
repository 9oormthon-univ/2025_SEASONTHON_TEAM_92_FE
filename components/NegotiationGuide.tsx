import React, { useState, useEffect } from 'react';
import { NegotiationCard } from '../types';
import { reportApi } from '../lib/api';

interface NegotiationGuideProps {
  userId?: string;
}

const NegotiationGuide: React.FC<NegotiationGuideProps> = ({ userId = 'user_123' }) => {
  const [negotiationCards, setNegotiationCards] = useState<NegotiationCard[]>([]);
  const [negotiationScenario, setNegotiationScenario] = useState<string>('');
  const [successRate, setSuccessRate] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNegotiationData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 종합 리포트에서 협상 카드 정보 가져오기
        const reportResponse = await reportApi.getComprehensiveReport();

        if (reportResponse.success) {
          setNegotiationCards(reportResponse.data?.negotiationCards || []);
          setNegotiationScenario("1단계: 문제 상황 정리 및 근거 수집\n2단계: 임대인과의 첫 접촉 및 대화\n3단계: 구체적인 개선 요구사항 제시\n4단계: 협상 및 타협점 찾기");
          setSuccessRate(75); // 기본 성공률
        }

      } catch (err) {
        console.error('Error fetching negotiation data:', err);
        setError('협상 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchNegotiationData();
  }, [userId]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'LEGAL_REPAIR':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'STRUCTURAL':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'GENERAL':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };


  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return '높음';
      case 2:
        return '보통';
      case 3:
        return '낮음';
      default:
        return '보통';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">협상 데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">데이터 로딩 실패</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          맞춤형 협상 가이드
        </h1>

        {/* 협상 성공 확률 및 시나리오 */}
        {successRate > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">📊 협상 성공 예측</h2>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium text-green-900">예상 성공 확률</h3>
                <div className="text-3xl font-bold text-green-600">
                  {Math.round(successRate * 100)}%
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${successRate * 100}%` }}
                ></div>
              </div>
              <p className="text-green-800 text-sm">
                {successRate >= 0.7 ? '높은 성공 가능성' : 
                 successRate >= 0.4 ? '보통 성공 가능성' : '신중한 접근 필요'}
              </p>
            </div>
          </div>
        )}

        {/* 맞춤형 협상 시나리오 */}
        {negotiationScenario && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">🎯 맞춤형 협상 시나리오</h2>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="prose prose-purple max-w-none">
                <p className="text-purple-800 leading-relaxed whitespace-pre-line">
                  {negotiationScenario}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 맞춤형 협상 카드 */}
        {negotiationCards.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">🎴 맞춤형 협상 카드</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {negotiationCards
                .sort((a, b) => a.priority - b.priority)
                .map((card) => (
                  <div key={card.priority} className={`border rounded-lg p-4 ${getCategoryColor('default')}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium">{card.title}</h3>
                      <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded-full">
                        우선순위: {getPriorityLabel(card.priority)}
                      </span>
                    </div>
                    <p className="text-sm mb-3 opacity-90">{card.content}</p>
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-medium text-sm mb-1">협상 전략:</h4>
                        <p className="text-sm opacity-90">{card.recommendedMent}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 법적 근거 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">📚 법적 근거</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">임차인 보호법</h3>
            <ul className="list-disc list-inside text-blue-800 space-y-1">
              <li>임차인 보호법 제3조: 임차인의 권리 보호</li>
              <li>주택임대차보호법: 월세 상한제 및 갱신 요구권</li>
              <li>상가건물 임대차보호법: 상가 임차인 보호</li>
            </ul>
          </div>
        </div>

        {/* 시장 데이터 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">📊 시장 데이터 활용</h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-green-900 mb-2">공공 데이터 활용</h3>
            <ul className="list-disc list-inside text-green-800 space-y-1">
              <li>국토교통부 실거래가 공개시스템 데이터</li>
              <li>한국부동산원 전월세 실거래가</li>
              <li>지역별 평균 임대료 비교</li>
              <li>인근 지역 임대료 동향 분석</li>
            </ul>
          </div>
        </div>

        {/* 협상 전략 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">💡 협상 전략</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-yellow-900 mb-2">준비 단계</h3>
              <ul className="list-disc list-inside text-yellow-800 space-y-1 text-sm">
                <li>시장 데이터 수집 및 분석</li>
                <li>같은 건물 세입자들과 연대</li>
                <li>합리적인 요구사항 정리</li>
                <li>대안 제시 준비</li>
              </ul>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-purple-900 mb-2">협상 단계</h3>
              <ul className="list-disc list-inside text-purple-800 space-y-1 text-sm">
                <li>정중하고 전문적인 태도</li>
                <li>구체적인 데이터 제시</li>
                <li>상호 이익이 되는 방안 제안</li>
                <li>서면으로 합의사항 정리</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 권리 정보 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">⚖️ 임차인 권리</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-900 mb-2">기본 권리</h3>
            <ul className="list-disc list-inside text-red-800 space-y-1">
              <li>갱신 요구권: 계약 갱신 시 우선권</li>
              <li>차임 증액 제한: 5% 상한 (주택임대차보호법)</li>
              <li>보증금 반환 청구권</li>
              <li>수선 의무 이행 요구권</li>
              <li>안전한 주거환경 보장권</li>
            </ul>
          </div>
        </div>

        {/* 협상 템플릿 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">📝 협상 템플릿</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">제안서 구성 요소</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start space-x-2">
                <span className="font-medium">1.</span>
                <span>인사말 및 협상 목적 명시</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-medium">2.</span>
                <span>현재 상황 및 문제점 제시</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-medium">3.</span>
                <span>시장 데이터 기반 합리적 요구사항</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-medium">4.</span>
                <span>상호 이익이 되는 대안 제시</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="font-medium">5.</span>
                <span>협력적 해결 방안 제안</span>
              </div>
            </div>
          </div>
        </div>

        {/* 유용한 링크 */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">🔗 유용한 링크</h2>
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <ul className="space-y-2 text-indigo-800">
              <li>
                <a 
                  href="https://rt.molit.go.kr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  국토교통부 실거래가 공개시스템
                </a>
              </li>
              <li>
                <a 
                  href="https://www.reb.or.kr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  한국부동산원
                </a>
              </li>
              <li>
                <a 
                  href="https://www.law.go.kr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  국가법령정보센터
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 주의사항 */}
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-900 mb-2">⚠️ 주의사항</h3>
          <ul className="list-disc list-inside text-yellow-800 space-y-1 text-sm">
            <li>모든 협상은 정중하고 합리적인 방식으로 진행하세요</li>
            <li>법적 근거는 정확한 정보를 바탕으로 제시하세요</li>
            <li>서면으로 합의사항을 정리하고 보관하세요</li>
            <li>필요시 전문가(변호사, 부동산 전문가) 상담을 받으세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NegotiationGuide;
