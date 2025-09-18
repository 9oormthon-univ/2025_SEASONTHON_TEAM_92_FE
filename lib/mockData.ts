import { ReportTemplate } from '@/types';

export const mockReportData: ReportTemplate = {
  reportType: 'premium', // 프리미엄 리포트로 설정
  header: {
    title: "서울특별시 강남구 역삼동 임대차 협상 리포트 💎",
    createdAt: "2025.09.18",
    dataPeriod: "최근 1개월",
    trustMetrics: {
      participantCount: 78,
      averageResponseDays: 3,
      trustScore: 74
    }
  },
  
  contractInfo: {
    address: "서울특별시 강남구 역삼동 123-45",
    buildingName: "역삼빌라",
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
      recommendedMent: "수압 문제는 우리 건물 평균 대비 50% 낮습니다. 수선 의무가 있으니 보일러/배관 점검을 요구하세요.",
      successProbability: 85,
      alternativeStrategy: "수압 문제가 지속되면 주택임대차보호법 제8조에 따라 임대인에게 수선 의무가 있습니다. 내용증명으로 요구서를 보내세요.",
      expertTip: "수압 측정 데이터와 이전 세입자 증언을 함께 제시하면 성공 확률이 높아집니다."
    },
    {
      priority: 2,
      title: "월세 조정 요구",
      content: "방음·채광 낮음 → 구조적 문제, 월세 인상률 동결 요구 근거",
      recommendedMent: "채광이 동네 평균 대비 37% 낮습니다. 구조적 문제로 인한 불편함을 근거로 월세 인상률 동결을 요구하세요.",
      successProbability: 72,
      alternativeStrategy: "채광 부족은 건물 구조상 개선이 어려우므로, 월세 인상률 동결 또는 관리비 할인을 요구하세요.",
      expertTip: "채광 측정 앱으로 객관적 데이터를 수집하여 제시하면 설득력이 높아집니다."
    },
    {
      priority: 3,
      title: "관리비 검증",
      content: "동네 평균 대비 높다면 인하 요구 가능",
      recommendedMent: "현재 관리비는 동네 평균 대비 적정 수준입니다. 추가 인하 요구는 어려울 것으로 예상됩니다.",
      successProbability: 45,
      alternativeStrategy: "관리비 내역을 상세히 요구하고, 불필요한 항목이 있다면 제거를 요구하세요.",
      expertTip: "관리비 인하보다는 투명한 내역 공개를 먼저 요구하는 것이 현실적입니다."
    }
  ],
  
  policyInfo: [
    {
      title: "청년 월세 특별지원",
      description: "국토교통부에서 제공하는 청년 월세 지원금",
      eligibility: "만 19~34세, 소득 기준 충족",
      link: "https://www.molit.go.kr",
      isEligible: true,
      applicationDeadline: "2025.12.31",
      requiredDocuments: ["신분증", "소득증명서", "임대차계약서"]
    },
    {
      title: "청년 특별 월세 지원",
      description: "청년을 위한 특별 월세 지원금",
      eligibility: "만 19~34세 청년",
      link: "https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00004661",
      isEligible: true,
      applicationDeadline: "2025.12.31",
      requiredDocuments: ["신분증", "소득증명서", "임대차계약서", "통장사본"]
    },
    {
      title: "서울시 청년 월세 지원금",
      description: "서울시 거주 청년을 위한 월세 지원금",
      eligibility: "서울 거주, 만 19~34세",
      link: "https://housing.seoul.go.kr/site/main/content/sh01_060513",
      isEligible: true,
      applicationDeadline: "2025.11.30",
      requiredDocuments: ["주민등록등본", "소득증명서", "임대차계약서", "통장사본"]
    },
    {
      title: "전세보증금 반환보증 (HUG)",
      description: "전세보증금 반환보증 서비스",
      eligibility: "전세 계약자",
      link: "https://www.khug.or.kr/hug/web/ig/dr/igdr000001.jsp",
      isEligible: false,
      applicationDeadline: "상시",
      requiredDocuments: ["전세계약서", "신분증", "소득증명서"]
    }
  ],
  
  disputeGuide: {
    relatedLaw: "주택임대차보호법 제8조 (임대인 수선 의무)",
    committeeContact: "서울서부 임대차분쟁조정위원회: 02-1234-5678",
    templateDownload: "수선 요구서 템플릿 다운로드",
    disputeRoadmap: [
      {
        step: 1,
        title: "내용증명 발송",
        description: "임대인에게 수선 요구 내용증명 발송",
        estimatedTime: "1-2주",
        cost: "3,000원"
      },
      {
        step: 2,
        title: "분쟁조정위원회 신청",
        description: "내용증명 무응답 시 분쟁조정위원회 신청",
        estimatedTime: "2-4주",
        cost: "무료"
      },
      {
        step: 3,
        title: "소송 제기",
        description: "조정 실패 시 소송 제기 (최후 수단)",
        estimatedTime: "3-6개월",
        cost: "소송비용 별도"
      }
    ],
    expertConsultation: {
      available: true,
      price: 50000,
      duration: "15분",
      contactInfo: "02-1234-5678"
    }
  },
  
  updateInfo: {
    autoUpdate: true,
    dataValidityPeriod: "최근 3개월 내 데이터 기준"
  },
  
  premiumFeatures: {
    smartDiagnosis: {
      noiseLevel: 68,
      floorLevel: 0.2,
      lightIntensity: 320,
      internetSpeed: 45.2,
      measuredAt: "2025.09.08"
    },
    
    timeSeriesAnalysis: {
      rentTrend: [
        { month: "2025.03", averageRent: 58 },
        { month: "2025.04", averageRent: 59 },
        { month: "2025.05", averageRent: 60 },
        { month: "2025.06", averageRent: 61 },
        { month: "2025.07", averageRent: 60 },
        { month: "2025.08", averageRent: 62 },
        { month: "2025.09", averageRent: 60 }
      ],
      marketVolatility: 0.15,
      predictionConfidence: 87
    },
    
    documentGeneration: {
      demandLetter: true,
      certifiedMail: true,
      legalNotice: true
    },
    
    expertConsultation: {
      available: true,
      nextAvailableSlot: "2025.09.10 14:00",
      consultationFee: 50000
    },
    
    sharingOptions: {
      pdfDownload: true,
      emailShare: true,
      kakaoShare: true,
      watermark: true
    }
  }
};

// 무료 리포트용 mock 데이터
export const mockFreeReportData: ReportTemplate = {
  reportType: 'free',
  header: {
    title: "서울특별시 강남구 역삼동 기본 리포트",
    createdAt: "2025.09.18",
    dataPeriod: "최근 1개월",
    trustMetrics: {
      participantCount: 78,
      averageResponseDays: 3,
      trustScore: 74
    }
  },
  
  contractInfo: {
    address: "서울특별시 강남구 역삼동 123-45",
    buildingName: "역삼빌라",
    buildingType: "빌라",
    contractType: "월세",
    deposit: 1000,
    monthlyRent: 60,
    managementFee: 10,
    gpsVerified: true,
    contractVerified: false
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
    }
  ],
  
  policyInfo: [
    {
      title: "청년 특별 월세 지원",
      description: "청년을 위한 특별 월세 지원금",
      eligibility: "만 19~34세 청년",
      link: "https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00004661"
    },
    {
      title: "서울시 청년 월세 지원금",
      description: "서울시 거주 청년을 위한 월세 지원금",
      eligibility: "서울 거주, 만 19~34세",
      link: "https://housing.seoul.go.kr/site/main/content/sh01_060513"
    },
    {
      title: "전세보증금 반환보증 (HUG)",
      description: "전세보증금 반환보증 서비스",
      eligibility: "전세 계약자",
      link: "https://www.khug.or.kr/hug/web/ig/dr/igdr000001.jsp"
    }
  ],
  
  disputeGuide: {
    relatedLaw: "주택임대차보호법 제8조 (임대인 수선 의무)",
    committeeContact: "서울서부 임대차분쟁조정위원회: 02-1234-5678",
    templateDownload: "수선 요구서 템플릿 다운로드"
  },
  
  updateInfo: {
    autoUpdate: true,
    dataValidityPeriod: "최근 1개월 내 데이터 기준"
  }
};