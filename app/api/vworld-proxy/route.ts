// ❌ Edge 런타임 사용 제거
// export const runtime = 'edge';

import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🌐 VWorld 프록시 요청 시작');
  const { searchParams } = new URL(request.url);
  const apiKey = process.env.VWORLD_API_KEY;

  console.log('📥 받은 파라미터들:', Object.fromEntries(searchParams.entries()));
  console.log('🔑 API 키 존재 여부:', !!apiKey);

  if (!apiKey) {
    console.error('❌ VWORLD_API_KEY가 설정되지 않음');
    return new Response('VWORLD_API_KEY missing', { status: 500 });
  }

  const vworldUrl = new URL('https://api.vworld.kr/req/address');
  searchParams.forEach((value, key) => vworldUrl.searchParams.append(key, value));
  vworldUrl.searchParams.set('key', apiKey);

  console.log('🔗 최종 VWorld API URL:', vworldUrl.toString());

  try {
    console.log('📡 VWorld API 호출 시작...');
    const res = await fetch(vworldUrl.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    console.log('📊 VWorld API 응답 상태:', res.status);
    const data = await res.text();
    console.log('📄 VWorld API 응답 데이터:', data);

    return new Response(data, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('❌ VWorld 프록시 오류:', err);
    return new Response(
      JSON.stringify({ error: 'VWorld API 호출 실패', details: err.message }),
      { status: 500 }
    );
  }
}
