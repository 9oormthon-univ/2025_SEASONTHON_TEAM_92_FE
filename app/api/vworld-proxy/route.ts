// ❌ Edge 런타임 사용 제거
// export const runtime = 'edge';

import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const apiKey = process.env.VWORLD_API_KEY;

  if (!apiKey) {
    return new Response('VWORLD_API_KEY missing', { status: 500 });
  }

  const vworldUrl = new URL('https://api.vworld.kr/req/address');
  searchParams.forEach((value, key) => vworldUrl.searchParams.append(key, value));
  vworldUrl.searchParams.set('key', apiKey);

  try {
    const res = await fetch(vworldUrl.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    const data = await res.text();
    return new Response(data, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('VWorld 프록시 오류:', err);
    return new Response(
      JSON.stringify({ error: 'VWorld API 호출 실패', details: err.message }),
      { status: 500 }
    );
  }
}
