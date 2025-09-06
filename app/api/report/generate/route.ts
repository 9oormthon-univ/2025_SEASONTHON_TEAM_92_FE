import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { authApi, diagnosisApi, missionApi, reportApi } from '@/lib/api';
import { ReportResponse } from '@/types';

// OpenAI API 키는 환경 변수에서 로드합니다.
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { userId, jwtToken } = await request.json();

    if (!userId || !jwtToken) {
      return NextResponse.json({ success: false, message: 'User ID and JWT Token are required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ success: false, message: 'OpenAI API key is not configured' }, { status: 500 });
    }

    console.log('리포트 생성 시작 - 사용자 ID:', userId);

    // 1. 사용자 프로필 및 축적된 데이터 조회
    console.log('사용자 데이터 조회 중...');
    const currentUser = await authApi.getCurrentUser(jwtToken);
    console.log('사용자 프로필:', currentUser?.profileName);
    
    const diagnosisResult = await diagnosisApi.getDiagnosisResult(jwtToken);
    console.log('진단 결과:', diagnosisResult?.data?.summary?.totalScore);
    
    const missionResult = await missionApi.getCurrentMission(jwtToken);
    console.log('미션 결과:', missionResult?.data?.title);

    // 2. 진단 결과 분석 및 맞춤형 프롬프트 생성
    const diagnosisData = diagnosisResult?.data;
    const userProfile = currentUser;
    
    // 진단 결과에서 개선이 필요한 카테고리와 강점 카테고리 분석
    const improvements = diagnosisData?.analysis?.improvements || [];
    const strengths = diagnosisData?.analysis?.strengths || [];
    const categoryDetails = diagnosisData?.categoryDetails || [];
    const summary = diagnosisData?.summary || {};
    
    // 카테고리 이름 매핑
    const categoryNames = {
      1: "소음",
      2: "수압", 
      3: "채광",
      4: "주차",
      5: "난방",
      6: "환기",
      7: "보안",
      8: "관리",
      9: "편의성",
      10: "인터넷"
    };
    
    // 개선이 필요한 카테고리들
    const improvementCategories = improvements.map((imp: any) => categoryNames[imp.categoryId as keyof typeof categoryNames] || `카테고리 ${imp.categoryId}`).join(', ');
    const strengthCategories = strengths.map((str: any) => categoryNames[str.categoryId as keyof typeof categoryNames] || `카테고리 ${str.categoryId}`).join(', ');
    
    // 사용자 점수와 건물/지역 평균 비교
    const userScore = summary.totalScore || 0;
    const buildingAvg = summary.buildingAverage || 0;
    const neighborhoodAvg = summary.neighborhoodAverage || 0;
    
    // 협상 포인트 생성
    let negotiationPoints = [];
    if (userScore < buildingAvg) {
      negotiationPoints.push(`현재 점수(${userScore}점)가 건물 평균(${buildingAvg}점)보다 낮아 개선이 필요합니다.`);
    }
    if (improvementCategories) {
      negotiationPoints.push(`${improvementCategories} 분야에서 개선이 시급합니다.`);
    }
    
    // LLM 프롬프트 구성
    const prompt = `
당신은 임대차 협상 전문가입니다. 다음 사용자 데이터를 바탕으로 구체적이고 실용적인 협상 리포트를 생성해주세요.

**사용자 정보:**
- 이름: ${userProfile?.profileName || '사용자'}
- 거주지: ${userProfile?.profileDong || '알 수 없음'} ${userProfile?.profileBuilding || ''}
- 건물 유형: ${userProfile?.buildingType || '알 수 없음'}
- 계약 유형: ${userProfile?.contractType || '알 수 없음'}

**진단 결과:**
- 전체 점수: ${userScore}점 (건물 평균: ${buildingAvg}점, 지역 평균: ${neighborhoodAvg}점)
- 개선이 필요한 분야: ${improvementCategories || '없음'}
- 강점 분야: ${strengthCategories || '없음'}
- 협상 포인트: ${negotiationPoints.join(' ')}

**요청사항:**
위 정보를 바탕으로 다음 JSON 형식으로 구체적인 협상 리포트를 생성해주세요:

{
  "primaryNegotiationCard": "주요 협상 포인트를 담은 정중하고 설득력 있는 협상 카드 (200-300자)",
  "secondaryNegotiationCard": "보조 협상 포인트를 담은 추가 요청 카드 (200-300자)", 
  "step1": "1단계: 초기 접근 및 협상 준비 단계 (구체적인 행동 지침 포함)",
  "step2": "2단계: 본격적인 협상 및 후속 조치 단계 (구체적인 행동 지침 포함)"
}

**중요 지침:**
1. 사용자의 실제 점수와 개선이 필요한 분야를 반영한 구체적인 내용으로 작성
2. 정중하지만 단호한 톤으로 작성
3. 법적 근거나 시장 데이터를 언급하여 설득력 있게 작성
4. 각 단계는 실행 가능한 구체적인 행동 지침을 포함
5. 한국의 임대차 관련 법률과 관례를 고려하여 작성
    `;

    // 3. OpenAI API 호출
    console.log('OpenAI API 호출 시작...');
    console.log('프롬프트 길이:', prompt.length);
    
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: '당신은 한국의 임대차 협상 전문가입니다. 사용자의 실제 데이터를 바탕으로 구체적이고 실용적인 협상 전략을 제공합니다.'
      }, {
        role: 'user',
        content: prompt
      }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const llmResponseContent = chatCompletion.choices[0].message.content;
    if (!llmResponseContent) {
      throw new Error('OpenAI API가 응답을 반환하지 않았습니다.');
    }

    console.log('OpenAI API 응답 받음:', llmResponseContent.substring(0, 200) + '...');
    
    let generatedReport: ReportResponse;
    try {
      generatedReport = JSON.parse(llmResponseContent);
    } catch (parseError) {
      console.error('JSON 파싱 에러:', parseError);
      console.error('원본 응답:', llmResponseContent);
      throw new Error('OpenAI API 응답을 파싱할 수 없습니다.');
    }

    // 4. 생성된 리포트 내용을 데이터베이스에 저장
    console.log('리포트 저장 중...');
    const createReportResponse = await reportApi.createReport({
      reportContent: JSON.stringify(generatedReport)
    });

    if (!createReportResponse.reportId) {
      throw new Error('리포트 저장에 실패했습니다.');
    }

    console.log('리포트 생성 완료 - 리포트 ID:', createReportResponse.reportId);
    return NextResponse.json({ 
      success: true, 
      reportId: createReportResponse.reportId,
      reportContent: generatedReport,
      message: '리포트가 성공적으로 생성되었습니다.'
    });

  } catch (error: any) {
    console.error('리포트 생성 에러:', error);
    
    // OpenAI API 관련 에러 처리
    if (error.code === 'insufficient_quota') {
      return NextResponse.json({ 
        success: false, 
        message: 'OpenAI API 사용량이 초과되었습니다. 관리자에게 문의하세요.' 
      }, { status: 500 });
    }
    
    if (error.code === 'invalid_api_key') {
      return NextResponse.json({ 
        success: false, 
        message: 'OpenAI API 키가 유효하지 않습니다.' 
      }, { status: 500 });
    }
    
    if (error.message?.includes('rate_limit')) {
      return NextResponse.json({ 
        success: false, 
        message: 'API 호출 한도를 초과했습니다. 잠시 후 다시 시도해주세요.' 
      }, { status: 429 });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: error.message || '리포트 생성 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}
