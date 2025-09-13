import { type NextRequest } from 'next/server';

// Vercel의 빠른 Edge 런타임 사용
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // 백엔드에서 보낸 요청의 URL에서 파라미터를 그대로 가져옵니다.
  const { searchParams } = new URL(request.url);

  // Vercel에 설정할 VWorld API 키를 가져옵니다.
  const apiKey = process.env.VWORLD_API_KEY;

  if (!apiKey) {
    return new Response('Vercel 환경변수에 VWORLD_API_KEY가 설정되지 않았습니다.', {
      status: 500 });
  }

  // 실제 VWorld API의 주소
  const vworldUrl = new URL('https://api.vworld.kr/req/address');

  // 백엔드가 보낸 모든 파라미터를 VWorld URL에 그대로 추가합니다.
  searchParams.forEach((value, key) => {
    vworldUrl.searchParams.append(key, value);
  });

  // 환경변수에서 가져온 진짜 API 키를 추가합니다.
  vworldUrl.searchParams.append('key', apiKey);

  try {
    // Vercel 서버(서울)에서 실제 VWorld API로 요청을 보냅니다.
    const response = await fetch(vworldUrl.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    // VWorld로부터 받은 응답을 그대로 우리 백엔드 서버로 전달합니다.
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });

  } catch (error) {
    console.error('VWorld 프록시 오류:', error);
    return new Response('VWorld API 호출 중 프록시 서버에서 오류가 발생했습니다.', {
      status: 500 });
  }
}