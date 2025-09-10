import { ReportTemplate } from '@/types';

export const mockReportData: ReportTemplate = {
  header: {
    title: "망원동 ○○빌라 임대차 협상 리포트",
    createdAt: "2025.09.08",
    dataPeriod: "본 리포트는 최근 1개월 내 참여자 데이터와 공공 데이터를 기반으로 생성되었습니다.",
    trustMetrics: {
      participantCount: 15,
      averageResponseDays: 23,
      trustScore: 87
    }
  },
  
  contractInfo: {
    address: "서울시 마포구 망원동 123-45",
    buildingName: "○○빌라",
    buildingType: "빌라",
    contractType: "월세",
    deposit: 1000,
    monthlyRent: 60,
    managementFee: 10,
    gpsVerified: true,
    contractVerified: true
  },
  
  subjectiveMetrics: {
    overallScore: 3.5,
    neighborhoodAverage: 4.1,
    buildingAverage: 3.8,
    categories: {
      lighting: { myScore: 2.5, neighborhoodAvg: 4.0, buildingAvg: 3.2 },
      soundproofing: { myScore: 2.0, neighborhoodAvg: 3.5, buildingAvg: 3.2 },
      parking: { myScore: 3.0, neighborhoodAvg: 3.5, buildingAvg: 3.8 }
    }
  },
  
  objectiveMetrics: {
    marketPrice: {
      nationalAverage: 62,
      myContract: 60,
      difference: -2,
      differencePercent: -3
    },
    managementFee: {
      nationalAverage: 12,
      myContract: 10,
      status: 'normal'
    },
    noise: {
      nationalAverage: 62,
      userReported: 68,
      match: true
    }
  },
  
  negotiationCards: [
    {
      priority: 1,
      title: "시설 개선 요구",
      content: "곰팡이, 수압 문제 → 임대인 법적 수선 의무",
      recommendedMent: "수압 문제는 우리 건물 평균 대비 50% 낮습니다. 수선 의무가 있으니 보일러/배관 점검을 요구하세요."
    },
    {
      priority: 2,
      title: "월세 조정 요구",
      content: "방음·채광 낮음 → 구조적 문제, 월세 인상률 동결 요구 근거",
      recommendedMent: "채광이 동네 평균 대비 37% 낮습니다. 구조적 문제로 인한 불편함을 근거로 월세 인상률 동결을 요구하세요."
    },
    {
      priority: 3,
      title: "관리비 검증",
      content: "동네 평균 대비 높다면 인하 요구 가능",
      recommendedMent: "현재 관리비는 동네 평균 대비 적정 수준입니다. 추가 인하 요구는 어려울 것으로 예상됩니다."
    }
  ],
  
  policyInfo: [
    {
      title: "청년 월세 특별지원",
      description: "국토교통부에서 제공하는 청년 월세 지원금",
      eligibility: "만 19~34세, 소득 기준 충족",
      link: "https://www.molit.go.kr"
    },
    {
      title: "서울시 청년 월세 지원금",
      description: "서울시 거주 청년을 위한 월세 지원금",
      eligibility: "서울 거주, 만 19~34세",
      link: "https://www.seoul.go.kr"
    },
    {
      title: "전세보증금 반환보증 (HUG)",
      description: "전세보증금 반환보증 서비스",
      eligibility: "전세 계약자",
      link: "https://www.hug.or.kr"
    }
  ],
  
  disputeGuide: {
    relatedLaw: "주택임대차보호법 제8조 (임대인 수선 의무)",
    committeeContact: "서울서부 임대차분쟁조정위원회: 02-1234-5678",
    templateDownload: "수선 요구서 템플릿 다운로드"
  },
  
  updateInfo: {
    autoUpdate: true,
    dataValidityPeriod: "최근 3개월 내 데이터 기준"
  }
};