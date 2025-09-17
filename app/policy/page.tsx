'use client';

import Link from 'next/link';

export default function PolicyPage() {
  const policies = [
    {
      id: 1,
      title: "청년 주거 지원 정책",
      description: "청년층의 주거 안정을 위한 다양한 지원 정책",
      category: "청년 주거",
      amount: "월 최대 30만원",
      eligibility: "만 19~39세 청년",
      url: "https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00005696",
      icon: "🏠"
    },
    {
      id: 2,
      title: "서울시 청년 주거 지원",
      description: "서울시 청년을 위한 맞춤형 주거 지원 프로그램",
      category: "지역 지원",
      amount: "월 최대 50만원",
      eligibility: "서울 거주 청년",
      url: "https://housing.seoul.go.kr/site/main/content/sh01_070400#non",
      icon: "🏙️"
    },
    {
      id: 3,
      title: "국민주택기금 청년 지원",
      description: "국민주택기금을 통한 청년 주거 지원 사업",
      category: "국가 지원",
      amount: "월 최대 40만원",
      eligibility: "만 19~34세 청년",
      url: "https://nhuf.molit.go.kr/FP/FP05/FP0502/FP05020701.jsp",
      icon: "🏘️"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">청년 주거 지원 정책</h1>
          <p className="text-gray-600 mb-2">청년층을 위한 다양한 주거 지원 정책을 확인하세요</p>
          <p className="text-sm text-gray-500">• 청년 주거 지원 정책</p>
          <p className="text-sm text-gray-500">• 지역별 지원사업</p>
          <p className="text-sm text-gray-500">• 신청 조건 및 방법 안내</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((policy) => (
            <div key={policy.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3">{policy.icon}</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{policy.title}</h3>
                  <p className="text-sm text-gray-600">{policy.description}</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">카테고리:</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {policy.category}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">지원 금액:</span>
                  <span className="font-semibold text-gray-900">{policy.amount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">신청 자격:</span>
                  <span className="font-semibold text-green-600">{policy.eligibility}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <a
                  href={policy.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium text-center"
                >
                  정책 신청하기
                </a>
                <a
                  href={policy.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium text-center"
                >
                  상세보기
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* 추가 안내 */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📋 정책 신청 안내</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">신청 전 확인사항</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 본인의 연령과 거주지 확인</li>
                <li>• 소득 기준 및 자산 기준 확인</li>
                <li>• 필요한 서류 준비 (신분증, 소득증명서 등)</li>
                <li>• 신청 기간 및 마감일 확인</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">신청 절차</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 1단계: 정책 사이트 방문</li>
                <li>• 2단계: 온라인 신청서 작성</li>
                <li>• 3단계: 서류 제출</li>
                <li>• 4단계: 심사 및 결과 통보</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}