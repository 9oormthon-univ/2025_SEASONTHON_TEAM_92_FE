import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // 현재 서버의 위치 정보를 가져오기 위해 IP 기반 위치 서비스 사용
    const ipInfoResponse = await fetch('https://ipapi.co/json/', {
      headers: {
        'User-Agent': 'Vercel-Location-Checker/1.0'
      }
    });
    
    const ipInfo = await ipInfoResponse.json();
    
    // 추가로 다른 IP 위치 서비스도 확인
    const ipifyResponse = await fetch('https://api.ipify.org?format=json');
    const ipifyData = await ipifyResponse.json();
    
    return NextResponse.json({
      message: 'Vercel 서버 위치 정보',
      timestamp: new Date().toISOString(),
      serverInfo: {
        ip: ipifyData.ip,
        country: ipInfo.country_name,
        countryCode: ipInfo.country_code,
        region: ipInfo.region,
        city: ipInfo.city,
        timezone: ipInfo.timezone,
        isKorea: ipInfo.country_code === 'KR',
        // Vercel 환경 정보
        vercelRegion: process.env.VERCEL_REGION || 'unknown',
        vercelEnv: process.env.VERCEL_ENV || 'unknown'
      },
      requestInfo: {
        userAgent: request.headers.get('user-agent'),
        forwardedFor: request.headers.get('x-forwarded-for'),
        realIp: request.headers.get('x-real-ip')
      }
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json(
      { 
        error: '위치 정보를 가져오는 중 오류가 발생했습니다.', 
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}