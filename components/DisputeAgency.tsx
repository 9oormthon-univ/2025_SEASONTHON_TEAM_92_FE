'use client';

import { useState, useEffect } from 'react';
import { disputeAgencyApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface AgencyDetail {
  agencyId: number;
  agencyName: string;
  agencyType: string;
  description: string;
  contactInfo: {
    phone: string;
    email?: string;
    website?: string;
    address?: string;
  };
  serviceTypes: string[];
  operatingHours?: string;
  eligibility?: string;
}

interface AgencyList {
  agencies: AgencyDetail[];
  totalCount: number;
  region: string;
}

export default function DisputeAgency() {
  const [agencies, setAgencies] = useState<AgencyList | null>(null);
  const [region, setRegion] = useState('마포구');
  const [agencyType, setAgencyType] = useState('');
  const [disputeType, setDisputeType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'region' | 'dispute'>('region');

  const regionOptions = [
    '마포구', '강남구', '강서구', '구로구', '금천구', '노원구', '도봉구',
    '동대문구', '동작구', '서초구', '성동구', '성북구', '송파구', '양천구',
    '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'
  ];

  const agencyTypeOptions = [
    { value: '', label: '전체' },
    { value: '조정위원회', label: '조정위원회' },
    { value: '법률지원기관', label: '법률지원기관' },
    { value: '청년지원기관', label: '청년지원기관' },
    { value: '주거상담센터', label: '주거상담센터' }
  ];

  const disputeTypeOptions = [
    { value: '', label: '분쟁 유형 선택' },
    { value: '월세인상', label: '월세 인상 분쟁' },
    { value: '하자수리', label: '하자 수리 분쟁' },
    { value: '보증금반환', label: '보증금 반환 분쟁' },
    { value: '계약해지', label: '계약 해지 분쟁' },
    { value: '소음분쟁', label: '소음 분쟁' },
    { value: '기타', label: '기타 분쟁' }
  ];

  const loadAgenciesByRegion = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await disputeAgencyApi.getAgenciesByRegion(region, agencyType);
      
      if (response && response.success) {
        setAgencies(response.data);
      } else {
        setError('분쟁 해결 기관 정보를 불러올 수 없습니다.');
      }
    } catch (err: any) {
      console.error('Agency load error:', err);
      setError('분쟁 해결 기관 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecommendedAgencies = async () => {
    if (!disputeType) {
      toast.error('분쟁 유형을 선택해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const response = await disputeAgencyApi.getRecommendedAgencies(disputeType);
      
      if (response && response.success) {
        setAgencies(response.data);
      } else {
        setError('추천 기관 정보를 불러올 수 없습니다.');
      }
    } catch (err: any) {
      console.error('Recommended agency load error:', err);
      setError('추천 기관 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'region') {
      loadAgenciesByRegion();
    }
  }, [region, agencyType, activeTab]);

  const getAgencyTypeColor = (type: string) => {
    switch (type) {
      case '조정위원회':
        return 'bg-blue-100 text-blue-800';
      case '법률지원기관':
        return 'bg-green-100 text-green-800';
      case '청년지원기관':
        return 'bg-purple-100 text-purple-800';
      case '주거상담센터':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">분쟁 해결 기관</h2>
        <p className="text-gray-600 mb-4">
          임대차 관련 분쟁이 발생했을 때 도움을 받을 수 있는 기관들을 찾아보세요.
        </p>

        {/* 탭 메뉴 */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('region')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'region'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              지역별 조회
            </button>
            <button
              onClick={() => setActiveTab('dispute')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dispute'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              분쟁 유형별 추천
            </button>
          </nav>
        </div>

        {/* 지역별 조회 필터 */}
        {activeTab === 'region' && (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">지역:</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {regionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">기관 유형:</label>
              <select
                value={agencyType}
                onChange={(e) => setAgencyType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {agencyTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={loadAgenciesByRegion}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '로딩 중...' : '조회'}
            </button>
          </div>
        )}

        {/* 분쟁 유형별 추천 필터 */}
        {activeTab === 'dispute' && (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">분쟁 유형:</label>
              <select
                value={disputeType}
                onChange={(e) => setDisputeType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {disputeTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={loadRecommendedAgencies}
              disabled={isLoading || !disputeType}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '로딩 중...' : '추천 기관 찾기'}
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
          <span className="ml-2 text-gray-600">기관 정보를 불러오는 중...</span>
        </div>
      ) : agencies && agencies.agencies.length > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {activeTab === 'region' ? `${region} 분쟁 해결 기관` : `${disputeType} 관련 추천 기관`}
            </h3>
            <span className="text-sm text-gray-500">총 {agencies.totalCount}개 기관</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {agencies.agencies.map((agency) => (
              <div key={agency.agencyId} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{agency.agencyName}</h4>
                    <p className="text-sm text-gray-600 mb-3">{agency.description}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getAgencyTypeColor(agency.agencyType)}`}>
                      {agency.agencyType}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* 연락처 정보 */}
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">연락처 정보</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{agency.contactInfo.phone}</span>
                      </div>
                      {agency.contactInfo.email && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{agency.contactInfo.email}</span>
                        </div>
                      )}
                      {agency.contactInfo.website && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                          </svg>
                          <a href={agency.contactInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            웹사이트 방문
                          </a>
                        </div>
                      )}
                      {agency.contactInfo.address && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{agency.contactInfo.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 서비스 유형 */}
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-2">제공 서비스</h5>
                    <div className="flex flex-wrap gap-1">
                      {agency.serviceTypes.map((service, index) => (
                        <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 운영시간 */}
                  {agency.operatingHours && (
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-1">운영시간</h5>
                      <p className="text-sm text-gray-600">{agency.operatingHours}</p>
                    </div>
                  )}

                  {/* 자격요건 */}
                  {agency.eligibility && (
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-1">이용 자격</h5>
                      <p className="text-sm text-gray-600">{agency.eligibility}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : agencies && agencies.agencies.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">해당 조건에 맞는 기관이 없습니다</h3>
          <p className="text-gray-600">다른 지역이나 기관 유형을 선택해보세요.</p>
        </div>
      ) : null}
    </div>
  );
}