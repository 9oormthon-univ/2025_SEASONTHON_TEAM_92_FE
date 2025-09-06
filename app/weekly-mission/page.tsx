'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { missionApi } from '../../lib/api';
import toast from 'react-hot-toast';

interface MissionQuestion {
  question_id: number;
  question_text: string;
  question_type: 'select';
  options: string[];
  order_number: number;
}

interface CurrentMission {
  mission_id: number;
  category: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  participation_count: number;
  user_participated: boolean;
  questions: MissionQuestion[];
}

export default function WeeklyMissionPage() {
  const [currentMission, setCurrentMission] = useState<CurrentMission | null>(null);
  const [responses, setResponses] = useState<{[key: number]: number}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingResult, setIsLoadingResult] = useState(false);
  const [error, setError] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [missionResult, setMissionResult] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    loadCurrentMission();
  }, []);

  const loadCurrentMission = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await missionApi.getCurrentMission();
      if (response && response.success && response.data) {
        setCurrentMission(response.data);
        if (response.data.user_participated) {
          loadMissionResult(response.data.mission_id);
        }
      } else {
        setError('현재 활성화된 미션이 없습니다.');
      }
    } catch (err: any) {
      console.error('Mission load error:', err);
      if (err.response?.status === 404) {
        setError('현재 활성화된 미션이 없습니다.');
      } else if (err.response?.status === 401) {
        setError('로그인이 필요합니다.');
        router.push('/login');
      } else {
        setError('미션을 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadMissionResult = async (missionId: number) => {
    try {
      setIsLoadingResult(true);
      setError('');
      const response = await missionApi.getMissionResult(missionId);
      if (response && response.success && response.data) {
        setMissionResult(response.data);
        setShowResult(true);
      } else {
        setError('미션 결과를 불러올 수 없습니다.');
      }
    } catch (err: any) {
      console.error('Mission result error:', err);
      if (err.response?.status === 404) {
        setError('미션 결과를 찾을 수 없습니다.');
      } else if (err.response?.status === 401) {
        setError('로그인이 필요합니다.');
        router.push('/login');
      } else {
        setError('미션 결과를 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoadingResult(false);
    }
  };

  const handleResponseChange = (questionId: number, answer: string, score: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: { answer, score }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMission) return;

    // 모든 질문에 답변했는지 확인
    const unansweredQuestions = currentMission.questions.filter(
      q => responses[q.question_id] === undefined
    );
    
    if (unansweredQuestions.length > 0) {
      setError('모든 질문에 답변해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const responseData = {
        responses: currentMission.questions.map(q => ({
          question_id: q.question_id,
          answer: responses[q.question_id].answer,
          score: responses[q.question_id].score
        }))
      };

      const response = await missionApi.participateInMission(currentMission.mission_id, responseData);
      
      if (response && response.success) {
        toast.success('미션 참여가 완료되었습니다!');
        setCurrentMission(prev => prev ? { ...prev, user_participated: true } : null);
        loadMissionResult(currentMission.mission_id);
      } else {
        setError('미션 참여에 실패했습니다.');
      }
      
    } catch (err: any) {
      console.error('Mission participation error:', err);
      if (err.response?.status === 400) {
        setError('잘못된 요청입니다. 모든 질문에 답변해주세요.');
      } else if (err.response?.status === 401) {
        setError('로그인이 필요합니다.');
        router.push('/login');
      } else if (err.response?.status === 409) {
        setError('이미 참여한 미션입니다.');
      } else {
        setError(err.response?.data?.message || '미션 참여 중 오류가 발생했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-4 mx-auto mb-4 border-blue-200 border-t-blue-600"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">미션을 불러오는 중...</h2>
        </div>
      </div>
    );
  }

  if (error && !currentMission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">미션을 불러올 수 없습니다</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {currentMission && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">주간 미션</h1>
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-blue-600 mb-2">{currentMission.title}</h2>
                <p className="text-gray-600 mb-4">{currentMission.description}</p>
                <div className="flex justify-center space-x-6 text-sm text-gray-500">
                  <span>카테고리: {currentMission.category}</span>
                  <span>참여자: {currentMission.participation_count}명</span>
                </div>
              </div>
            </div>

            {showResult && missionResult ? (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">미션 결과</h2>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-green-800 font-semibold">미션을 완료하셨습니다!</p>
                    <p className="text-green-700">점수: {missionResult.user_score}점</p>
                  </div>
                  
                  {missionResult.building_comparison && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">건물 비교</h3>
                      <p className="text-gray-700">{missionResult.building_comparison.comparison_text}</p>
                    </div>
                  )}
                  
                  {missionResult.neighborhood_comparison && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">지역 비교</h3>
                      <p className="text-gray-700">{missionResult.neighborhood_comparison.comparison_text}</p>
                    </div>
                  )}
                  
                  {missionResult.insights && missionResult.insights.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">인사이트</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {missionResult.insights.map((insight: string, index: number) => (
                          <li key={index} className="text-gray-700">{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setShowResult(false);
                      setMissionResult(null);
                      setResponses({});
                      setError('');
                      setIsLoadingResult(false);
                    }}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700"
                  >
                    다시 하기
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
                  >
                    홈으로 돌아가기
                  </button>
                </div>
              </div>
            ) : currentMission.user_participated ? (
              <div className="text-center">
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">이미 참여한 미션입니다</h2>
                  <p className="text-gray-600 mb-6">결과를 확인하거나 다시 참여하실 수 있습니다.</p>
                  <div className="flex space-x-4 justify-center">
                    <button
                      onClick={() => loadMissionResult(currentMission.mission_id)}
                      disabled={isLoadingResult}
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingResult ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          로딩 중...
                        </div>
                      ) : (
                        '결과 보기'
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowResult(false);
                        setMissionResult(null);
                        setResponses({});
                        setError('');
                        setIsLoadingResult(false);
                      }}
                      className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                    >
                      다시 하기
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 진행 상황 표시 */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">미션 질문</h2>
                    <span className="text-sm text-gray-500">
                      {Object.keys(responses).length} / {currentMission.questions.length} 완료
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(Object.keys(responses).length / currentMission.questions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                  
                  {currentMission.questions
                    .sort((a, b) => a.order_number - b.order_number)
                    .map((question, index) => (
                    <div key={question.question_id} className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        {index + 1}. {question.question_text}
                      </h3>
                      
                      {question.question_type === 'select' && question.options ? (
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <label key={optionIndex} className="flex items-center">
                              <input
                                type="radio"
                                name={`question_${question.question_id}`}
                                value={option}
                                checked={responses[question.question_id]?.answer === option}
                                onChange={() => handleResponseChange(question.question_id, option, optionIndex + 1)}
                                className="mr-2"
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="bg-white rounded-lg shadow-lg p-6">
                  <button
                    type="submit"
                    disabled={isSubmitting || Object.keys(responses).length !== currentMission.questions.length}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        제출 중...
                      </div>
                    ) : Object.keys(responses).length === currentMission.questions.length ? (
                      '미션 제출하기'
                    ) : (
                      `${currentMission.questions.length - Object.keys(responses).length}개 질문이 남았습니다`
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}