// ❌ Edge 런타임 사용 제거
// export const runtime = 'edge';

import type { NextRequest } from 'next/server';

// 주소를 동/리까지만 간소화하는 함수
function simplifyAddress(fullAddress: string): string {
  if (!fullAddress) return '';
  
  // 주소를 공백으로 분리
  const addressParts = fullAddress.split(' ');
  let simplifiedParts: string[] = [];
  
  // 시/도, 구/군, 동/리까지만 포함
  for (const part of addressParts) {
    simplifiedParts.push(part);
    
    // 동이나 리로 끝나면 여기서 중단
    if (part.endsWith('동') || part.endsWith('리') || part.endsWith('읍') || part.endsWith('면')) {
      break;
    }
  }
  
  return simplifiedParts.join(' ');
}

export async function GET(request: NextRequest) {
  console.log('🌐 VWorld 프록시 요청 시작');
  const { searchParams } = new URL(request.url);
  const apiKey = process.env.VWORLD_API_KEY;
  const coords = searchParams.get('coords');

  console.log('📥 받은 파라미터들:', Object.fromEntries(searchParams.entries()));
  console.log('🔑 API 키 존재 여부:', !!apiKey);
  console.log('📍 좌표:', coords);

  if (!apiKey) {
    console.error('❌ VWORLD_API_KEY가 설정되지 않음');
    return new Response('VWORLD_API_KEY missing', { status: 500 });
  }

  if (!coords) {
    console.error('❌ coords 파라미터가 없음');
    return new Response('coords parameter missing', { status: 400 });
  }

  // VWorld API의 올바른 파라미터 형식으로 구성
  const vworldUrl = new URL('https://api.vworld.kr/req/address');
  vworldUrl.searchParams.set('service', 'address');
  vworldUrl.searchParams.set('request', 'GetAddress');
  vworldUrl.searchParams.set('version', '2.0');
  vworldUrl.searchParams.set('crs', 'epsg:4326');
  vworldUrl.searchParams.set('point', coords);
  vworldUrl.searchParams.set('format', 'json');
  vworldUrl.searchParams.set('type', 'both');
  vworldUrl.searchParams.set('zipcode', 'true');
  vworldUrl.searchParams.set('simple', 'false');
  vworldUrl.searchParams.set('key', apiKey);

  console.log('🔗 최종 VWorld API URL:', vworldUrl.toString());

  try {
    console.log('📡 VWorld API 호출 시작...');
    const res = await fetch(vworldUrl.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    console.log('📊 VWorld API 응답 상태:', res.status);
    const data = await res.json();
    console.log('📄 VWorld API 응답 데이터:', data);

    // VWorld API 응답을 프론트엔드 형식으로 변환
    if (data.response && data.response.status === 'OK' && data.response.result) {
      const result = data.response.result[0];
      const fullAddress = result.text || '';
      
      // 주소를 동/리까지만 간소화
      const simplifiedAddress = simplifyAddress(fullAddress);
      
      return new Response(JSON.stringify({
        success: true,
        address: simplifiedAddress,
        coords: coords
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      console.error('❌ VWorld API 오류 응답:', data);
      return new Response(JSON.stringify({
        success: false,
        error: data.response?.error?.text || '주소 변환 실패'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (err: any) {
    console.error('❌ VWorld 프록시 오류:', err);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'VWorld API 호출 실패', 
        details: err.message 
      }),
      { status: 500 }
    );
  }
}
