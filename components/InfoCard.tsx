'use client';

import { useState, useEffect } from 'react';
import { infoCardApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface PolicySummary {
  policyId: number;
  policyName: string;
  summary: string;
  amountInfo: string;
  externalUrl: string;
}

interface LawArticleSummary {
  lawId: number;
  lawName: string;
  articleNumber: string;
  title: string;
  content: string;
}

interface AgencySummary {
  agencyId: number;
  agencyName: string;
  agencyType: string;
  contactInfo: {
    phone: string;
    website?: string;
  };
  reason: string;
}

interface SituationInfoCard {
  situationType: string;
  title: string;
  description: string;
  recommendedPolicies: PolicySummary[];
  relatedLawArticles: LawArticleSummary[];
  recommendedAgencies: AgencySummary[];
  actionSteps: string[];
}

export default function InfoCard() {
  const [infoCard, setInfoCard] = useState<SituationInfoCard | null>(null);
  const [situationType, setSituationType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const situationOptions = [
    { value: '', label: '상황 선택' },
    { value: 'mold', label: '곰팡이 문제' },
    { value: 'noise', label: '소음 문제' },
    { value: 'rent_increase', label: '월세 인상' },
    { value: 'deposit_return', label: '보증금 반환' },
    { value: 'contract_termination', label: '계약 해지' },
    { value: 'repair_request', label: '수리 요청' },
    { value: 'management_fee', label: '관리비 분쟁' },
    { value: 'renewal_refusal', label: '갱신 거부' }
  ];

  const loadInfoCard = async () => {
    if (!situationType) {
      toast.error('상황을 선택해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const response = await infoCardApi.getSituationInfoCard(situationType);
      
      if (response && response.success) {
        setInfoCard(response.data);
      } else {
        setError('정보 카드를 불러올 수 없습니다.');
      }
    } catch (err: any) {
      console.error('Info card load error:', err);
      setError('정보 카드를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSituationIcon = (type: string) => {
    switch (type) {
      case 'mold':
        return '🦠';
      case 'noise':
        return '🔊';
      case 'rent_increase':
        return '💰';
      case 'deposit_return':
        return '🏦';
      case 'contract_termination':
        return '📋';
      case 'repair_request':
        return '🔧';
      case 'management_fee':
        return '📊';
      case 'renewal_refusal':
        return '❌';
      default:
        return '📄';
    }
  };

  const getSituationColor = (type: string) => {
    switch (type) {
      case 'mold':
        return 'bg-green-50 border-green-200';
      case 'noise':
        return 'bg-red-50 border-red-200';
      case 'rent_increase':
        return 'bg-yellow-50 border-yellow-200';
      case 'deposit_return':
        return 'bg-blue-50 border-blue-200';
      case 'contract_termination':
        return 'bg-purple-50 border-purple-200';
      case 'repair_request':
        return 'bg-orange-50 border-orange-200';
      case 'management_fee':
        return 'bg-indigo-50 border-indigo-200';
      case 'renewal_refusal':
        return 'bg-pink-50 border-pink-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">상황별 맞춤 정보 카드</h2>
        <p className="text-gray-600 mb-4">
          현재 겪고 있는 상황에 맞는 정책, 법령, 해결 기관 정보를 한 번에 확인하세요.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">상황:</label>
            <select
              value={situationType}
              onChange={(e) => setSituationType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {situationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={loadInfoCard}
            disabled={isLoading || !situationType}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '로딩 중...' : '정보 카드 생성'}
          </button>
        </div>
      </div>

      {/* 결과 표시 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">정보 카드를 생성하는 중...</span>
        </div>
      ) : infoCard ? (
        <div className="space-y-6">
          {/* 상황 정보 헤더 */}
          <div className={`rounded-lg border-2 p-6 ${getSituationColor(infoCard.situationType)}`}>
            <div className="flex items-center space-x-3 mb-3">
              <span className="text-3xl">{getSituationIcon(infoCard.situationType)}</span>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{infoCard.title}</h3>
                <p className="text-gray-600">{infoCard.description}</p>
              </div>
            </div>
          </div>

          {/* 추천 정책 */}
          {infoCard.recommendedPolicies && infoCard.recommendedPolicies.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🏛️</span>
                추천 정책
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {infoCard.recommendedPolicies.map((policy) => (
                  <div key={policy.policyId} className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-2">{policy.policyName}</h5>
                    <p className="text-sm text-gray-600 mb-2">{policy.summary}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-600">{policy.amountInfo}</span>
                      <a
                        href={policy.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        신청하기
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 관련 법령 */}
          {infoCard.relatedLawArticles && infoCard.relatedLawArticles.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📚</span>
                관련 법령
              </h4>
              <div className="space-y-4">
                {infoCard.relatedLawArticles.map((law) => (
                  <div key={law.lawId} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <h5 className="font-semibold text-gray-900">{law.lawName}</h5>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        제{law.articleNumber}조
                      </span>
                    </div>
                    <h6 className="font-medium text-gray-800 mb-2">{law.title}</h6>
                    <p className="text-sm text-gray-700">{law.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 추천 기관 */}
          {infoCard.recommendedAgencies && infoCard.recommendedAgencies.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🏢</span>
                추천 해결 기관
              </h4>
              <div className="space-y-4">
                {infoCard.recommendedAgencies.map((agency) => (
                  <div key={agency.agencyId} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h5 className="font-semibold text-gray-900">{agency.agencyName}</h5>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {agency.agencyType}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{agency.reason}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{agency.contactInfo.phone}</span>
                      </div>
                      {agency.contactInfo.website && (
                        <a
                          href={agency.contactInfo.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          웹사이트 방문
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 행동 단계 */}
          {infoCard.actionSteps && infoCard.actionSteps.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📋</span>
                단계별 행동 가이드
              </h4>
              <div className="space-y-3">
                {infoCard.actionSteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}