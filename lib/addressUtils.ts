// 카카오 주소 검색 API를 사용한 법정동코드 추출 유틸리티

// 카카오 주소 검색 API를 사용한 법정동코드 추출 함수
export const extractLawdCdFromAddress = async (address: string): Promise<string> => {
  if (!address || address === '주소 정보 없음') {
    return '11410'; // 기본값: 서대문구
  }
  
  const cleanAddress = address.trim();
  console.log('카카오 API로 주소 검색 시도:', cleanAddress);
  
  try {
    // 카카오 주소 검색 API 호출
    const response = await fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(cleanAddress)}`, {
      headers: {
        'Authorization': `KakaoAK ${process.env.NEXT_PUBLIC_KAKAO_API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`카카오 API 호출 실패: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.documents && data.documents.length > 0) {
      const firstResult = data.documents[0];
      
      // 법정동코드 추출
      if (firstResult.address && firstResult.address.b_code) {
        const lawdCd = firstResult.address.b_code.substring(0, 5); // 5자리 구/군 코드
        console.log('카카오 API 매칭 성공:', cleanAddress, '->', lawdCd);
        return lawdCd;
      }
    }
    
    console.log('카카오 API에서 매칭 실패, 기본값 사용:', cleanAddress);
    return '11410';
    
  } catch (error) {
    console.error('카카오 API 호출 오류:', error);
    
    // API 실패 시 기존 하드코딩 매핑으로 폴백
    return extractLawdCdFromAddressFallback(cleanAddress);
  }
};

// 카카오 API 실패 시 사용할 폴백 함수
export const extractLawdCdFromAddressFallback = (address: string): string => {
  // 기존 하드코딩 매핑 로직
  const guMappings: { [key: string]: string } = {
    '서대문구': '11410',
    '강남구': '11680',
    '서초구': '11650',
    '마포구': '11440',
    '용산구': '11170',
    '종로구': '11110',
    '중구': '11140',
    '성동구': '11200',
    '광진구': '11215',
    '동대문구': '11230',
    '중랑구': '11260',
    '성북구': '11290',
    '강북구': '11305',
    '도봉구': '11320',
    '노원구': '11350',
    '은평구': '11380',
    '양천구': '11470',
    '강서구': '11500',
    '구로구': '11530',
    '금천구': '11545',
    '영등포구': '11560',
    '동작구': '11590',
    '관악구': '11620',
    '송파구': '11710',
    '강동구': '11740'
  };
  
  // 구/군 매칭 시도
  for (const [guName, lawdCd] of Object.entries(guMappings)) {
    if (address.includes(guName)) {
      console.log('폴백 매칭 성공:', guName, '->', lawdCd);
      return lawdCd;
    }
  }
  
  console.log('폴백 매칭 실패, 기본값 사용:', address);
  return '11410'; // 기본값: 서대문구
};

// 동기 버전 (기존 코드와의 호환성을 위해)
export const extractLawdCdFromAddressSync = (address: string): string => {
  return extractLawdCdFromAddressFallback(address);
};