import { useState } from 'react';
import { User } from '../types';

interface WeeklyMissionProps {
  currentUser: User;
  onComplete?: () => void;
}

export default function WeeklyMission({ onComplete }: WeeklyMissionProps) {
  const [responses, setResponses] = useState<{[key: string]: number}>({});
  const [isLoading, setIsLoading] = useState(false);

  // Mock weekly mission data
  const mission = {
    week: '2024년 1주차',
    theme: '방음 상태 점검',
    icon: 'ri-volume-down-line',
    description: '이번 주는 우리 집의 방음 상태를 점검해보세요',
    reward: '우리 건물 vs 우리 동네 방음 비교 분석',
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
      onComplete?.();
    } catch (error) {
      console.error('미션 결과 저장 실패:', error);
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 cursor-pointer mb-2">월세 공동협약</h1>
          <div className="w-16 h-1 bg-gray-700 mx-auto mb-6"></div>
          <div className="inline-flex items-center bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            <i className="ri-calendar-check-line mr-2"></i>
            {mission.week} 주간 미션
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{mission.theme}</h2>
          <p className="text-gray-600">{mission.description}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-6">
            <div className="flex items-center text-white">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                <i className={`${mission.icon} text-2xl`}></i>
              </div>
              <div>
                <h3 className="text-lg font-bold">미션 완료 보상</h3>
                <p className="text-green-100 text-sm">{mission.reward}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-8">
              {mission.questions.map((question, index) => (
                <div key={question.id} className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      {index + 1}. {question.text}
                    </h4>
                  </div>

                  {question.type === 'scale' && (
                    <div className="space-y-3">
                      {question.options.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleScaleResponse(question.id, option.value as number)}
                          className={`w-full p-4 text-left rounded-lg border-2 transition-all cursor-pointer ${
                            responses[question.id] === option.value
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded-full mr-3 ${
                              responses[question.id] === option.value
                                ? 'bg-green-500'
                                : 'bg-gray-300'
                            }`}></div>
                            <span className="font-medium">{option.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {question.type === 'choice' && (
                    <div className="space-y-3">
                      {question.options.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleChoiceResponse(question.id, option.value as string)}
                          className={`w-full p-4 text-left rounded-lg border-2 transition-all cursor-pointer ${
                            responses[question.id] === option.value
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded-full mr-3 ${
                              responses[question.id] === option.value
                                ? 'bg-green-500'
                                : 'bg-gray-300'
                            }`}></div>
                            <span className="font-medium">{option.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {question.type === 'multiple' && (
                    <div className="space-y-3">
                      {question.options.map((option) => {
                        const selectedCount = responses[question.id] || 0;
                        const isSelected = selectedCount > 0;
                        
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleMultipleResponse(question.id, option.value as string)}
                            className={`w-full p-4 text-left rounded-lg border-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`w-4 h-4 rounded-sm mr-3 flex items-center justify-center ${
                                isSelected
                                  ? 'bg-green-500'
                                  : 'bg-gray-300'
                              }`}>
                                {isSelected && (
                                  <i className="ri-check-line text-xs text-white"></i>
                                )}
                              </div>
                              <span className="font-medium">{option.label}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={!isFormComplete()}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
              >
                미션 완료하고 결과 보기
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            주간 미션 참여로 더 정확한 이웃 비교 데이터를 받아보세요!
          </p>
        </div>
      </div>
    </div>
  );
}