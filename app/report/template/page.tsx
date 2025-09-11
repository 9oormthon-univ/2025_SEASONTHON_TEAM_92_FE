
'use client';

import { useState, useEffect, Suspense } from 'react';
import { reportApi } from '@/lib/api';
import ReportTemplateComponent from '@/components/ReportTemplate';
import { ReportTemplate as ReportTemplateType } from '@/types';
import toast from 'react-hot-toast';

// 백엔드 DTO와 프론트엔드 타입 간의 데이터 변환 함수
const transformData = (backendData: any): ReportTemplateType => {
  // 계약 조건 문자열 파싱 (예: "보증금 1000 / 월세 60 / 관리비 10")
  const conditions = backendData.contractSummary.conditions || '';
  const depositMatch = conditions.match(/보증금 (\d+)/);
  const rentMatch = conditions.match(/월세 (\d+)/);
  const feeMatch = conditions.match(/관리비 (\d+)/);

  // 주관적 지표 데이터 재구성
  const subjectiveCategories: { [key: string]: { myScore: number; neighborhoodAvg: number; buildingAvg: number; } } = {};
  if (backendData.subjectiveMetrics && backendData.subjectiveMetrics.categoryScores) {
    backendData.subjectiveMetrics.categoryScores.forEach((cat: any) => {
      // 백엔드의 카테고리 이름(예: '소음')을 프론트엔드의 키(예: 'soundproofing')로 변환
      const key = Object.keys(categoryNameMapping).find(k => categoryNameMapping[k] === cat.category) || cat.category.toLowerCase();
      subjectiveCategories[key] = {
        myScore: cat.myScore,
        neighborhoodAvg: cat.neighborhoodAverage,
        buildingAvg: cat.buildingAverage,
      };
    });
  }

  return {
    header: {
      title: backendData.header.title,
      createdAt: backendData.header.generatedDate,
      dataPeriod: backendData.header.dataPeriod,
      trustMetrics: {
        participantCount: backendData.header.participantCount,
        averageResponseDays: parseInt(backendData.header.dataRecency.match(/\d+/)?.[0] || '0'),
        trustScore: backendData.header.reliabilityScore,
      },
    },
    contractInfo: {
      address: backendData.contractSummary.address,
      buildingName: '', // 백엔드 응답에 buildingName이 따로 없으므로 주소에서 파싱하거나 비워둠
      buildingType: backendData.contractSummary.buildingType,
      contractType: backendData.contractSummary.contractType,
      deposit: depositMatch ? parseInt(depositMatch[1]) : 0,
      monthlyRent: rentMatch ? parseInt(rentMatch[1]) : 0,
      managementFee: feeMatch ? parseInt(feeMatch[1]) : 0,
      gpsVerified: backendData.contractSummary.gpsVerified,
      contractVerified: backendData.contractSummary.contractVerified,
    },
    subjectiveMetrics: {
      overallScore: backendData.subjectiveMetrics.overallScore.myScore,
      neighborhoodAverage: backendData.subjectiveMetrics.overallScore.neighborhoodAverage,
      buildingAverage: backendData.subjectiveMetrics.overallScore.buildingAverage,
      categories: subjectiveCategories,
    },
    // 백엔드가 objectiveMetrics를 제공하지 않으므로 null 또는 빈 객체로 설정
    objectiveMetrics: null,
    negotiationCards: backendData.negotiationCards.map((card: any) => ({
      priority: card.priority,
      title: card.title,
      content: '', // 백엔드 DTO에 content 필드가 없으므로 비워둠
      recommendedMent: card.recommendationScript,
    })),
    // 이 정보들은 ReportTemplate 컴포넌트가 자체적으로 불러오므로 빈 배열로 전달
    policyInfo: [],
    disputeGuide: null,
    updateInfo: {
        autoUpdate: true,
        dataValidityPeriod: "최근 3개월 내 데이터 기준"
    }
  };
};

const categoryNameMapping: { [key: string]: string } = {
    lighting: '채광',
    soundproofing: '소음',
    parking: '주차/교통',
    // 나머지 매핑 추가 필요
};

function ReportPage() {
  const [reportData, setReportData] = useState<ReportTemplateType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const response = await reportApi.getComprehensiveReport();
        console.log('종합 리포트 응답:', response);
        
        if (response && response.data) {
          const transformed = transformData(response.data);
          setReportData(transformed);
        } else {
          throw new Error('리포트 데이터를 불러오는 데 실패했습니다.');
        }
      } catch (err: any) {
        setError(err.message || '리포트 데이터를 불러오는 중 오류가 발생했습니다.');
        toast.error(err.message || '리포트 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="mt-4 text-lg font-semibold text-gray-700">리포트를 생성 중입니다...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-8">오류: {error}</div>;
  }

  if (!reportData) {
    return <div className="p-8">리포트 데이터가 없습니다.</div>;
  }

  return <ReportTemplateComponent data={reportData} />;
}

export default function ReportTemplatePage() {
    return (
        <Suspense fallback={<div>리포트 로딩 중...</div>}>
            <ReportPage />
        </Suspense>
    )
}
