'use client';

import { useState, useEffect } from 'react';
import { policyApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface PolicyDetail {
  policyId: number;
  policyName: string;
  category: string;
  summary: string;
  amountInfo: string;
  matchScore: number;
  eligibilityStatus: string;
  externalUrl: string;
  isBookmarked: boolean;
  tags: string[];
}

interface PersonalizedPolicies {
  recommendedPolicies: PolicyDetail[];
  totalCount: number;
  categories: Array<{
    categoryName: string;
    count: number;
  }>;
}

export default function PolicyInfo() {
  const [policies, setPolicies] = useState<PersonalizedPolicies | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPolicies();
  }, [selectedCategory]);

  const loadPolicies = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      let response;
      if (selectedCategory === 'all') {
        response = await policyApi.getPersonalizedPolicies();
      } else {
        response = await policyApi.getPoliciesByCategory(selectedCategory);
      }
      
      if (response && response.success) {
        setPolicies(response.data);
      } else {
        setError('정책 정보를 불러올 수 없습니다.');
      }
    } catch (err: any) {
      console.error('Policy load error:', err);
      setError('정책 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookmark = async (policyId: number, isBookmarked: boolean) => {
    try {
      if (isBookmarked) {
        await policyApi.unbookmarkPolicy(policyId);
        toast.success('북마크가 해제되었습니다.');
      } else {
        await policyApi.bookmarkPolicy(policyId);
        toast.success('북마크에 추가되었습니다.');
      }
      
      // 정책 목록 새로고침
      loadPolicies();
    } catch (err: any) {
      console.error('Bookmark error:', err);
      toast.error('북마크 처리 중 오류가 발생했습니다.');
    }
  };

  const handleApply = async (policyId: number) => {
    try {
      await policyApi.applyPolicy(policyId);
      toast.success('정책 신청이 완료되었습니다.');
    } catch (err: any) {
      console.error('Apply error:', err);
      toast.error('정책 신청 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">정책 정보를 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadPolicies}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 카테고리 필터 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">맞춤형 정책 정보</h2>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            전체 ({policies?.totalCount || 0})
          </button>
          {policies?.categories.map((category) => (
            <button
              key={category.categoryName}
              onClick={() => setSelectedCategory(category.categoryName)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.categoryName
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.categoryName} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* 정책 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {policies?.recommendedPolicies.map((policy) => (
          <div key={policy.policyId} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{policy.policyName}</h3>
                <p className="text-sm text-gray-600 mb-2">{policy.summary}</p>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {policy.category}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    policy.matchScore >= 90 ? 'bg-green-100 text-green-800' :
                    policy.matchScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {policy.matchScore}% 매칭
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleBookmark(policy.policyId, policy.isBookmarked)}
                className={`p-2 rounded-full transition-colors ${
                  policy.isBookmarked
                    ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">지원 금액:</span>
                <span className="font-semibold text-gray-900">{policy.amountInfo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">신청 상태:</span>
                <span className={`font-semibold ${
                  policy.eligibilityStatus === '자격 충족' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {policy.eligibilityStatus}
                </span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleApply(policy.policyId)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                신청하기
              </button>
              <a
                href={policy.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium text-center"
              >
                상세보기
              </a>
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {policy.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {policies?.recommendedPolicies.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">해당 카테고리에 정책이 없습니다</h3>
          <p className="text-gray-600">다른 카테고리를 선택해보세요.</p>
        </div>
      )}
    </div>
  );
}