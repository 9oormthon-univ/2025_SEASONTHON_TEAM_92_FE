'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { missionApi } from '../../lib/api';
import toast from 'react-hot-toast';

export default function WeeklyMissionPage() {
  const router = useRouter();
  const [responses, setResponses] = useState<{[key: string]: number | string | string[]}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [mission, setMission] = useState<any>(null);
  const [error, setError] = useState('');

  // API에서 현재 미션 데이터 가져오기
  useEffect(() => {
    const fetchCurrentMission = async () => {
      try {
        const response = await missionApi.getCurrentMission();
        if (response.success && response.data) {
          setMission(response.data);
        } else {
          setError('미션을 불러올 수 없습니다.');
        }
      } catch (err) {
        console.error('미션 조회 실패:', err);
        setError('미션을 불러오는 중 오류가 발생했습니다.');
      }
    };

    fetchCurrentMission();
  }, []);

  const handleScaleResponse = (questionId: string, value: number | string) => {
    setResponses({...responses, [questionId]: value});
  };

  const handleChoiceResponse = (questionId: string, value: string | number) => {
    setResponses({...responses, [questionId]: value});
  };

  const handleMultipleResponse = (questionId: string, value: string | number) => {
    const stringValue = String(value);
    const current = Array.isArray(responses[questionId]) ? responses[questionId] as string[] : [];
    const updated = current.includes(stringValue) 
      ? current.filter(v => v !== stringValue)
      : [...current, stringValue];
    setResponses({...responses, [questionId]: updated});
  };

  const isFormComplete = () => {
    if (!mission || !mission.questions) return false;
    return mission.questions.every((q: any) => {
      const response = responses[q.questionId];
      return response !== undefined && response !== '';
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormComplete() || !mission) return;

    setIsLoading(true);
    
    try {
      // API 형식에 맞게 응답 데이터 변환
      const apiResponses = mission.questions.map((q: any) => ({
        questionId: q.questionId,
        answer: responses[q.questionId]?.toString() || '',
        score: typeof responses[q.questionId] === 'number' ? responses[q.questionId] : 1
      }));

      const response = await missionApi.participateInMission(mission.missionId, apiResponses);
      
      if (response.success) {
        toast.success('미션 참여가 완료되었습니다!');
        router.push(`/weekly-mission/results?missionId=${mission.missionId}`);
      } else {
        toast.error(response.message || '미션 참여에 실패했습니다.');
      }
    } catch (error) {
      console.error('미션 결과 저장 실패:', error);
      toast.error('미션 참여 중 오류가 발생했습니다.');
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
          <Link href="/">
            <h1 className="text-3xl font-bold text-gray-800 cursor-pointer mb-2">월세 공동협약</h1>
          </Link>
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
                          onClick={() => handleScaleResponse(question.id, option.value)}
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
                          onClick={() => handleChoiceResponse(question.id, option.value)}
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
                        const selectedOptions = responses[question.id] as string[] || [];
                        const isSelected = selectedOptions.includes(String(option.value));
                        
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleMultipleResponse(question.id, option.value)}
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