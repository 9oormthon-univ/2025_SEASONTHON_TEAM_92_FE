import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    console.log('VWorld 프록시 요청 시작:', request.url);
    
    const { searchParams } = new URL(request.url);
    console.log('받은 파라미터:', Object.fromEntries(searchParams));

    const apiKey = process.env.VWORLD_API_KEY;
    if (!apiKey) {
      console.error('VWORLD_API_KEY 환경변수가 설정되지 않음');
      return NextResponse.json(
        { error: 'Vercel 환경변수 VWORLD_API_KEY가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const vworldUrl = new URL('https://api.vworld.kr/req/address');
    
    // 백엔드가 보낸 모든 파라미터를 VWorld URL에 추가
    searchParams.forEach((value, key) => {
      vworldUrl.searchParams.append(key, value);
    });
    
    // API 키는 마지막에 설정 (덮어쓰기 방지)
    vworldUrl.searchParams.set('key', apiKey);

    console.log('VWorld API 요청 URL:', vworldUrl.toString());

    const response = await fetch(vworldUrl.toString(), {
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; Vercel-Proxy/1.0)'
      },
    });

    if (!response.ok) {
      console.error('VWorld API 오류:', response.status, response.statusText);
      return NextResponse.json(
        { error: `VWorld API 오류: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.text();
    console.log('VWorld API 응답 길이:', data.length);

    // CORS 헤더 추가
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('VWorld 프록시 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json(
      { error: 'VWorld API 호출 중 프록시 서버에서 오류가 발생했습니다.', details: errorMessage },
      { status: 500 }
    );
  }
}

// CORS preflight 요청 처리
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
