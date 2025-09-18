import { useState } from 'react';
import { User } from '../types';
import MissionResult from './MissionResult';

interface WeeklyMissionProps {
  currentUser: User;
  onComplete?: () => void;
}

export default function WeeklyMission({ onComplete }: WeeklyMissionProps) {
  const [responses, setResponses] = useState<{[key: string]: number}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Mock weekly mission data
  const mission = {
    week: '2025년 1주차',
    theme: '방음 상태 점검',
    icon: 'ri-volume-down-line',
    description: '이번 주는 우리 집의 방음 상태를 점검해보세요',
    reward: '우리 건물 vs 동네 비교 분석',
    questions: [
      {
        id: 'neighbor_noise_frequency',
        type: 'scale',
        text: '옆집 생활 소음이 들리는 편인가요?',
        options: [
          { value: 1, label: '전혀 안 들림' },
          { value: 2, label: '거의 안 들림' },
          { value: 3, label: '가끔 들림' },
          { value: 4, label: '자주 들림' },
          { value: 5, label: '항상 들림' }
        ]
      },
      {
        id: 'floor_noise_experience',
        type: 'choice',
        text: '최근 1달 내 층간소음으로 불편을 겪은 적이 있나요?',
        options: [
          { value: 'none', label: '없음' },
          { value: 'once_twice', label: '1~2번' },
          { value: 'multiple', label: '3번 이상' }
        ]
      },
      {
        id: 'noise_time',
        type: 'multiple',
        text: '소음이 주로 발생하는 시간대는 언제인가요? (복수선택 가능)',
        options: [
          { value: 'morning', label: '오전 (6-12시)' },
          { value: 'afternoon', label: '오후 (12-18시)' },
          { value: 'evening', label: '저녁 (18-22시)' },
          { value: 'night', label: '밤 (22-6시)' }
        ]
      }
    ]
  };

  const handleScaleResponse = (questionId: string, value: number) => {
    setResponses({...responses, [questionId]: value});
  };

  const handleChoiceResponse = (questionId: string, value: string) => {
    setResponses({...responses, [questionId]: parseInt(value) || 0});
  };

  const handleMultipleResponse = (questionId: string, _value: string) => {
    const current = responses[questionId] || 0;
    setResponses({...responses, [questionId]: current + 1});
  };

  const isFormComplete = () => {
    return mission.questions.every(q => {
      const response = responses[q.id];
      return response !== undefined && response !== 0;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete()) return;

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowResult(true);
      onComplete?.();
    } catch (error) {
      console.error('미션 결과 저장 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToMain = () => {
    setShowResult(false);
    setResponses({});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">미션 결과 분석 중...</h2>
          <p className="text-gray-600">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  if (showResult) {
    // 미션 결과 계산 (간단한 로직)
    const userScore = 68; // 사용자 점수
    const buildingAverage = 72; // 건물 평균
    const neighborhoodAverage = 74; // 동네 평균
    
    return (
      <MissionResult
        userScore={userScore}
        buildingAverage={buildingAverage}
        neighborhoodAverage={neighborhoodAverage}
        buildingComparison={null}
        neighborhoodComparison={null}
        onBackToMain={handleBackToMain}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-[672px] flex flex-col justify-start items-center">
        <div className="w-full pb-8 flex flex-col items-center">
          <div className="w-full flex flex-col items-center">
            <div className="w-full pb-2 flex justify-center">
              <div className="h-9 flex justify-center items-center">
                <div className="text-center text-black text-3xl font-bold font-['Inter'] leading-9">월세의 정석</div>
              </div>
            </div>
            <div className="w-full pb-6 flex justify-center">
              <div className="w-16 h-1 bg-purple-600" />
            </div>
            <div className="w-full pb-4 flex justify-center">
              <div className="px-4 py-2 bg-purple-600 rounded-full flex items-center">
                <div className="pr-2 flex items-center">
                  <div className="w-3.5 h-5 relative flex justify-center items-center">
                    <div className="size-3.5 left-[0.01px] top-[3px] absolute overflow-hidden">
                      <div className="size-3 left-[1.46px] top-[1.17px] absolute bg-white" />
                    </div>
                  </div>
                </div>
                <div className="text-center text-white text-sm font-medium font-['Roboto'] leading-tight">{mission.week} 주간 미션</div>
              </div>
            </div>
            <div className="w-full pb-2 flex justify-center">
              <div className="h-8 flex justify-center items-center">
                <div className="text-center text-gray-900 text-2xl font-bold font-['Roboto'] leading-loose">{mission.theme}</div>
              </div>
            </div>
            <div className="w-full flex justify-center">
              <div className="h-6 flex justify-center items-center">
                <div className="text-center text-gray-600 text-base font-normal font-['Roboto'] leading-normal">{mission.description}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full bg-white rounded-2xl shadow-lg shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.10)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-center overflow-hidden">
          <div className="w-full p-6 bg-gradient-to-r from-purple-600 to-violet-600 flex flex-col justify-start items-center">
            <div className="w-full h-16 flex justify-center items-center">
              <div className="pr-4 flex items-center">
                <div className="size-12 bg-white/20 rounded-full flex justify-center items-center">
                  <div className="w-6 h-8 relative flex justify-center items-center">
                    <div className="size-6 left-0 top-[4px] absolute overflow-hidden">
                      <div className="size-4 left-[4px] top-[3.56px] absolute bg-white" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center items-start">
                <div className="h-7 flex items-center">
                  <div className="text-white text-lg font-bold font-['Roboto'] leading-7">미션 완료 보상</div>
                </div>
                <div className="flex flex-col justify-start items-start">
                  <div className="h-5 flex items-center">
                    <div className="text-purple-100 text-sm font-normal font-['Roboto'] leading-tight">참여 시간: 단 2분</div>
                  </div>
                  <div className="h-5 flex items-center">
                    <div className="text-purple-100 text-sm font-normal font-['Roboto'] leading-tight">즉시 보상: {mission.reward}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full p-8 flex flex-col justify-start items-center">
            <div className="w-full flex flex-col justify-start items-center">
              <form onSubmit={handleSubmit}>
                {(mission?.questions || []).map((question, index) => (
                  <div key={question.id} className="w-full mb-8 flex flex-col justify-start items-center">
                    <div className="w-full pb-4 flex justify-center">
                      <div className="w-full flex flex-col justify-start items-center">
                        <div className="w-full pb-4 flex justify-center">
                          <div className="w-full flex justify-center items-center">
                            <div className="text-center text-gray-800 text-lg font-semibold font-['Roboto'] leading-7">{index + 1}. {question.text}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full pt-4 flex justify-center">
                      <div className="w-full flex justify-center items-start flex-wrap content-start">
                        {(question?.options || []).map((option, optionIndex) => (
                          <div key={optionIndex} className={`w-full mb-3 p-4 rounded-lg outline outline-2 outline-offset-[-2px] ${responses[question.id] === option.value ? 'outline-purple-500 bg-purple-50' : 'outline-gray-200'} flex flex-col justify-start items-center`}>
                            <button
                              type="button"
                              onClick={() => {
                                if (question.type === 'scale') {
                                  handleScaleResponse(question.id, option.value as number);
                                } else if (question.type === 'choice') {
                                  handleChoiceResponse(question.id, option.value as string);
                                } else if (question.type === 'multiple') {
                                  handleMultipleResponse(question.id, option.value as string);
                                }
                              }}
                              className="w-full h-6 flex justify-start items-center"
                            >
                              <div className="pr-3 flex items-center">
                                <div className={`size-4 ${responses[question.id] === option.value ? 'bg-purple-600' : 'bg-gray-300'} ${question.type === 'multiple' ? 'rounded-xs' : 'rounded-full'}`} />
                              </div>
                              <div className="flex items-center">
                                <div className="text-black text-base font-medium font-['Roboto'] leading-normal">{option.label}</div>
                              </div>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="w-full pt-8 flex justify-center">
                  <div className="w-full pt-6 border-t border-gray-100 flex justify-center">
                    <button
                      type="submit"
                      disabled={!isFormComplete()}
                      className={`w-full h-14 px-6 py-4 ${isFormComplete() ? 'bg-purple-600' : 'opacity-50 bg-purple-600'} rounded-xl flex justify-center items-center`}
                    >
                      <div className={`${isFormComplete() ? 'opacity-100' : 'opacity-50'} text-center text-white text-base font-semibold font-['Roboto'] leading-normal`}>미션 완료하고 결과 보기</div>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="w-full pt-6 flex justify-center">
          <div className="w-full flex flex-col justify-start items-center">
            <div className="w-full flex justify-center items-center">
              <div className="text-center text-gray-500 text-sm font-normal font-['Roboto'] leading-tight">주간 미션 참여로 더 정확한 이웃 비교 데이터를 받아보세요!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}