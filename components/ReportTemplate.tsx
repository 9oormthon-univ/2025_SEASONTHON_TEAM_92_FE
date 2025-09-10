'use client';

import { ReportTemplate } from '@/types';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import VerificationBadge from './VerificationBadge';

interface ReportTemplateProps {
  data: ReportTemplate;
}

export default function ReportTemplate({ data }: ReportTemplateProps) {
  // 차트 데이터 준비
  const radarData = [
    { category: '채광', myScore: data.subjectiveMetrics.categories.lighting.myScore, neighborhoodAvg: data.subjectiveMetrics.categories.lighting.neighborhoodAvg, buildingAvg: data.subjectiveMetrics.categories.lighting.buildingAvg },
    { category: '방음', myScore: data.subjectiveMetrics.categories.soundproofing.myScore, neighborhoodAvg: data.subjectiveMetrics.categories.soundproofing.neighborhoodAvg, buildingAvg: data.subjectiveMetrics.categories.soundproofing.buildingAvg },
    { category: '주차', myScore: data.subjectiveMetrics.categories.parking.myScore, neighborhoodAvg: data.subjectiveMetrics.categories.parking.neighborhoodAvg, buildingAvg: data.subjectiveMetrics.categories.parking.buildingAvg }
  ];

  const barData = [
    { name: '내 점수', value: data.subjectiveMetrics.overallScore },
    { name: '동네 평균', value: data.subjectiveMetrics.neighborhoodAverage },
    { name: '건물 평균', value: data.subjectiveMetrics.buildingAverage }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-8">
        
        {/* 1. 리포트 헤더 */}
        <section className="border-b-2 border-blue-200 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{data.header.title}</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <span className="font-semibold text-blue-800">생성일자:</span>
              <span className="ml-2 text-gray-700">{data.header.createdAt}</span>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <span className="font-semibold text-green-800">참여 인원:</span>
              <span className="ml-2 text-gray-700">{data.header.trustMetrics.participantCount}명</span>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <span className="font-semibold text-purple-800">신뢰도 점수:</span>
              <span className="ml-2 text-gray-700">{data.header.trustMetrics.trustScore}/100</span>
            </div>
          </div>
          <p className="text-gray-600 mt-4">{data.header.dataPeriod}</p>
        </section>

        {/* 2. 나의 계약 정보 요약 */}
        <section className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">나의 계약 정보 요약</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">주소/건물명:</span>
                <span className="text-gray-900">{data.contractInfo.address} {data.contractInfo.buildingName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">건물 유형:</span>
                <span className="text-gray-900">{data.contractInfo.buildingType}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">계약 유형:</span>
                <span className="text-gray-900">{data.contractInfo.contractType}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">조건:</span>
                <span className="text-gray-900">보증금 {data.contractInfo.deposit}만원 / 월세 {data.contractInfo.monthlyRent}만원 / 관리비 {data.contractInfo.managementFee}만원</span>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="font-semibold text-gray-700 block mb-2">인증 상태:</span>
                <VerificationBadge 
                  gpsVerified={data.contractInfo.gpsVerified}
                  contractVerified={data.contractInfo.contractVerified}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3. 주관적 지표 */}
        <section className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">주관적 지표 (커뮤니티 데이터 기반)</h2>
          
          {/* 종합 점수 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">거주 환경 진단 요약</h3>
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{data.subjectiveMetrics.overallScore}점</div>
                <div className="text-sm text-gray-600">
                  동네 평균 {data.subjectiveMetrics.neighborhoodAverage}점 / 같은 건물 평균 {data.subjectiveMetrics.buildingAverage}점
                </div>
              </div>
            </div>
            
            {/* 막대 그래프 */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 카테고리별 비교 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">카테고리별 비교</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-800 mb-2">채광</div>
                  <div className="text-2xl font-bold text-blue-600">{data.subjectiveMetrics.categories.lighting.myScore}</div>
                  <div className="text-sm text-gray-600">동네 평균 {data.subjectiveMetrics.categories.lighting.neighborhoodAvg}</div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-800 mb-2">방음</div>
                  <div className="text-2xl font-bold text-blue-600">{data.subjectiveMetrics.categories.soundproofing.myScore}</div>
                  <div className="text-sm text-gray-600">건물 평균 {data.subjectiveMetrics.categories.soundproofing.buildingAvg}</div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-800 mb-2">주차</div>
                  <div className="text-2xl font-bold text-blue-600">{data.subjectiveMetrics.categories.parking.myScore}</div>
                  <div className="text-sm text-gray-600">동네 평균 {data.subjectiveMetrics.categories.parking.neighborhoodAvg}</div>
                </div>
              </div>
            </div>
            
            {/* 레이더 차트 */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis domain={[0, 5]} />
                  <Radar name="내 점수" dataKey="myScore" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  <Radar name="동네 평균" dataKey="neighborhoodAvg" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  <Radar name="건물 평균" dataKey="buildingAvg" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* 4. 객관적 지표 */}
        <section className="bg-green-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">객관적 지표 (공공 데이터 기반)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 시세 비교 */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">시세 비교</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">국토부 실거래가 평균:</span>
                  <span className="font-semibold">{data.objectiveMetrics.marketPrice.nationalAverage}만원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">내 계약:</span>
                  <span className="font-semibold">{data.objectiveMetrics.marketPrice.myContract}만원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">차이:</span>
                  <span className={`font-semibold ${data.objectiveMetrics.marketPrice.differencePercent < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.objectiveMetrics.marketPrice.differencePercent > 0 ? '+' : ''}{data.objectiveMetrics.marketPrice.differencePercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* 관리비 비교 */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">관리비 비교</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">공동주택 평균:</span>
                  <span className="font-semibold">{data.objectiveMetrics.managementFee.nationalAverage}만원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">내 입력값:</span>
                  <span className="font-semibold">{data.objectiveMetrics.managementFee.myContract}만원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">상태:</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    data.objectiveMetrics.managementFee.status === 'normal' ? 'bg-green-100 text-green-800' :
                    data.objectiveMetrics.managementFee.status === 'high' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {data.objectiveMetrics.managementFee.status === 'normal' ? '정상 범위' :
                     data.objectiveMetrics.managementFee.status === 'high' ? '높음' : '낮음'}
                  </span>
                </div>
              </div>
            </div>

            {/* 소음/환경 */}
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">소음/환경</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">환경부 평균:</span>
                  <span className="font-semibold">{data.objectiveMetrics.noise.nationalAverage}dB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">사용자 응답:</span>
                  <span className="font-semibold">{data.objectiveMetrics.noise.userReported}dB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">일치 여부:</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    data.objectiveMetrics.noise.match ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {data.objectiveMetrics.noise.match ? '일치' : '불일치'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. 협상 카드 */}
        <section className="bg-yellow-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">협상 카드 (자동 생성)</h2>
          <div className="space-y-4">
            {data.negotiationCards.map((card, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">{card.priority}순위: {card.title}</h3>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">우선순위 {card.priority}</span>
                </div>
                <p className="text-gray-700 mb-3">{card.content}</p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">추천 멘트:</span> {card.recommendedMent}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. 맞춤형 정책/지원 정보 */}
        <section className="bg-purple-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">맞춤형 정책/지원 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.policyInfo.map((policy, index) => (
              <div key={index} className="bg-white rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{policy.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{policy.description}</p>
                <div className="mb-3">
                  <span className="text-xs font-semibold text-gray-500">신청 조건:</span>
                  <p className="text-xs text-gray-600">{policy.eligibility}</p>
                </div>
                <a 
                  href={policy.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                >
                  신청하기
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* 7. 분쟁 해결 가이드 */}
        <section className="bg-red-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">분쟁 해결 가이드</h2>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">관련 법령</h3>
              <p className="text-gray-700">{data.disputeGuide.relatedLaw}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">분쟁조정위원회</h3>
              <p className="text-gray-700">{data.disputeGuide.committeeContact}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">표준 양식</h3>
              <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                {data.disputeGuide.templateDownload}
              </button>
            </div>
          </div>
        </section>

        {/* 8. 푸시 알림/업데이트 요소 */}
        <section className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">업데이트 정보</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• 본 리포트는 새로운 참여자 데이터가 추가될 경우 자동 업데이트됩니다.</p>
            <p>• 이 리포트는 {data.updateInfo.dataValidityPeriod}으로 작성되었습니다.</p>
            <p>• 데이터 신뢰도: {data.header.trustMetrics.trustScore}/100점</p>
          </div>
        </section>
      </div>
    </div>
  );
}