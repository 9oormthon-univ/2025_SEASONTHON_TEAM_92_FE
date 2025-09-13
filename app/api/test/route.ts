import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'API 라우트가 정상적으로 작동합니다!',
    timestamp: new Date().toISOString(),
    url: request.url
  });
}