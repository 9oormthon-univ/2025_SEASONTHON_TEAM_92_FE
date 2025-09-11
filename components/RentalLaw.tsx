'use client';

import { useState, useEffect } from 'react';
import { rentalLawApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface LawArticle {
  articleId: number;
  lawName: string;
  articleNumber: string;
  title: string;
  content: string;
  category: string;
  relatedSituations: string[];
  keyPoints: string[];
  applicationExamples: string[];
}

interface LawResponse {
  articles: LawArticle[];
  totalCount: number;
  searchKeyword?: string;
  situation?: string;
}

export default function RentalLaw() {
  const [laws, setLaws] = useState<LawResponse | null>(null);
  const [situation, setSituation] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'situation' | 'category' | 'search'>('situation');

  const situationOptions = [
    { value: '', label: '상황 선택' },
    { value: '월세인상', label: '월세 인상' },
    { value: '하자수리', label: '하자 수리' },
    { value: '보증금반환', label: '보증금 반환' },
    { value: '계약해지', label: '계약 해지' },
    { value: '소음분쟁', label: '소음 분쟁' },
    { value: '관리비', label: '관리비 분쟁' },
    { value: '갱신거부', label: '갱신 거부' },
    { value: '전입신고', label: '전입신고 거부' }
  ];

  const categoryOptions = [
    { value: '', label: '카테고리 선택' },
    { value: '임대인의무', label: '임대인의 의무' },
    { value: '임차인권리', label: '임차인의 권리' },
    { value: '계약관계', label: '계약 관계' },
    { value: '보증금', label: '보증금 관련' },
    { value: '차임', label: '차임(월세) 관련' },
    { value: '하자수리', label: '하자 수리' },
    { value: '갱신', label: '계약 갱신' },
    { value: '해지', label: '계약 해지' }
  ];

  const loadLawsBySituation = async () => {
    if (!situation) {
      toast.error('상황을 선택해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const response = await rentalLawApi.getLawArticles(situation, keyword);
      
      if (response && response.success) {
        setLaws(response.data);
      } else {
        setError('법령 정보를 불러올 수 없습니다.');
      }
    } catch (err: any) {
      console.error('Law load error:', err);
      setError('법령 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLawsByCategory = async () => {
    if (!selectedCategory) {
      toast.error('카테고리를 선택해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const response = await rentalLawApi.getLawByCategory(selectedCategory);
      
      if (response && response.success) {
        setLaws(response.data);
      } else {
        setError('법령 정보를 불러올 수 없습니다.');
      }
    } catch (err: any) {
      console.error('Law load error:', err);
      setError('법령 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLawsBySearch = async () => {
    if (!keyword.trim()) {
      toast.error('검색 키워드를 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const response = await rentalLawApi.getLawArticles('', keyword);
      
      if (response && response.success) {
        setLaws(response.data);
      } else {
        setError('법령 정보를 불러올 수 없습니다.');
      }
    } catch (err: any) {
      console.error('Law load error:', err);
      setError('법령 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '임대인의무':
        return 'bg-red-100 text-red-800';
      case '임차인권리':
        return 'bg-green-100 text-green-800';
      case '계약관계':
        return 'bg-blue-100 text-blue-800';
      case '보증금':
        return 'bg-yellow-100 text-yellow-800';
      case '차임':
        return 'bg-purple-100 text-purple-800';
      case '하자수리':
        return 'bg-orange-100 text-orange-800';
      case '갱신':
        return 'bg-indigo-100 text-indigo-800';
      case '해지':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">임대차 관련 법령 정보</h2>
        <p className="text-gray-600 mb-4">
          임대차 관련 법령과 조항을 상황별, 카테고리별로 검색해보세요.
        </p>

        {/* 탭 메뉴 */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('situation')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'situation'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              상황별 조회
            </button>
            <button
              onClick={() => setActiveTab('category')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'category'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              카테고리별 조회
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'search'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              키워드 검색
            </button>
          </nav>
        </div>

        {/* 상황별 조회 필터 */}
        {activeTab === 'situation' && (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">상황:</label>
              <select
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {situationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">키워드:</label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="추가 검색어 (선택사항)"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={loadLawsBySituation}
              disabled={isLoading || !situation}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '로딩 중...' : '조회'}
            </button>
          </div>
        )}

        {/* 카테고리별 조회 필터 */}
        {activeTab === 'category' && (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">카테고리:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={loadLawsByCategory}
              disabled={isLoading || !selectedCategory}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '로딩 중...' : '조회'}
            </button>
          </div>
        )}

        {/* 키워드 검색 필터 */}
        {activeTab === 'search' && (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">검색어:</label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="법령명, 조항, 키워드 입력"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={loadLawsBySearch}
              disabled={isLoading || !keyword.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '로딩 중...' : '검색'}
            </button>
          </div>
        )}
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
          <span className="ml-2 text-gray-600">법령 정보를 불러오는 중...</span>
        </div>
      ) : laws && laws.articles.length > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {activeTab === 'situation' && situation && `"${situation}" 관련 법령`}
              {activeTab === 'category' && selectedCategory && `"${selectedCategory}" 카테고리 법령`}
              {activeTab === 'search' && keyword && `"${keyword}" 검색 결과`}
            </h3>
            <span className="text-sm text-gray-500">총 {laws.totalCount}개 조항</span>
          </div>

          <div className="space-y-6">
            {laws.articles.map((article) => (
              <div key={article.articleId} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-lg font-bold text-gray-900">{article.lawName}</h4>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                        제{article.articleNumber}조
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                        {article.category}
                      </span>
                    </div>
                    <h5 className="text-md font-semibold text-gray-800 mb-3">{article.title}</h5>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* 법령 내용 */}
                  <div>
                    <h6 className="font-semibold text-gray-800 mb-2">법령 내용</h6>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed">{article.content}</p>
                    </div>
                  </div>

                  {/* 핵심 포인트 */}
                  {article.keyPoints && article.keyPoints.length > 0 && (
                    <div>
                      <h6 className="font-semibold text-gray-800 mb-2">핵심 포인트</h6>
                      <ul className="list-disc list-inside space-y-1">
                        {article.keyPoints.map((point, index) => (
                          <li key={index} className="text-gray-700">{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 적용 예시 */}
                  {article.applicationExamples && article.applicationExamples.length > 0 && (
                    <div>
                      <h6 className="font-semibold text-gray-800 mb-2">적용 예시</h6>
                      <ul className="list-disc list-inside space-y-1">
                        {article.applicationExamples.map((example, index) => (
                          <li key={index} className="text-gray-700">{example}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 관련 상황 */}
                  {article.relatedSituations && article.relatedSituations.length > 0 && (
                    <div>
                      <h6 className="font-semibold text-gray-800 mb-2">관련 상황</h6>
                      <div className="flex flex-wrap gap-2">
                        {article.relatedSituations.map((situation, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {situation}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : laws && laws.articles.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">해당 조건에 맞는 법령이 없습니다</h3>
          <p className="text-gray-600">다른 검색 조건을 시도해보세요.</p>
        </div>
      ) : null}
    </div>
  );
}