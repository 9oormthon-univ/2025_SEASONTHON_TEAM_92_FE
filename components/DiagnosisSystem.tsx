import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { User } from '../types';
import { diagnosisApi } from '../lib/api';

interface DiagnosisSystemProps {
  currentUser: User;
  onComplete: (result: any) => void;
  onSkip?: () => void;
  onGoHome?: () => void;
}

interface Question {
  questionId: number;
  questionText: string;
  subText: string;
}

interface Category {
  categoryId: number;
  sortOrder: number;
  title: string;
  description: string;
  questions: Question[];
}

interface DiagnosisQuestionsResponse {
  categories: Category[];
}

export default function DiagnosisSystem({ currentUser, onComplete }: DiagnosisSystemProps) {
  const [responses, setResponses] = useState<{[key: string]: number}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalQuestions = categories.reduce((sum, cat) => sum + cat.questions.length, 0);
  const completedQuestions = Object.keys(responses).length;

  // 백엔드에서 질문 데이터 가져오기
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setQuestionsLoading(true);
        const response = await diagnosisApi.getQuestions();
        if (response.success && response.data) {
          setCategories(response.data.categories);
        } else {
          toast.error('질문을 불러오는데 실패했습니다.');
        }
      } catch (error) {
        console.error('질문 로딩 실패:', error);
        toast.error('질문을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setQuestionsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleResponse = (questionId: string, value: number) => {
    setResponses({...responses, [questionId]: value});
  };

  // 각 질문의 맥락에 맞는 점수 라벨 생성
  const getScoreLabels = (subText: string) => {
    const labels = subText.split('~');
    if (labels.length === 2) {
      return {
        low: labels[0].trim(),
        high: labels[1].trim()
      };
    }
    return {
      low: '매우 나쁨',
      high: '매우 좋음'
    };
  };

  // 질문 로딩 중일 때 표시
  if (questionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">질문을 불러오는 중...</h2>
          <p className="text-gray-600">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  const scrollToNextCategory = (currentIndex: number) => {
    if (currentIndex < categories.length - 1) {
      const nextElement = document.getElementById(`category-${currentIndex + 1}`);
      if (nextElement) {
        nextElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Convert responses to the expected format for bulk submission
      const diagnosisData = [{
        responses: Object.entries(responses).map(([questionId, value]) => ({
          questionId: parseInt(questionId),
          score: value.toString()
        }))
      }];

      const response = await diagnosisApi.submitBulk(diagnosisData);

      if (response.success) {
        // 백엔드에서 실제 결과를 가져옴
        const resultResponse = await diagnosisApi.getResult();
        if (resultResponse.success) {
          onComplete(resultResponse.data);
        } else {
          toast.error('진단 결과를 가져오는데 실패했습니다.');
        }
      } else {
        toast.error('진단 결과 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('진단 결과 저장 실패:', error);
      toast.error('진단 결과 저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const isCategoryComplete = (category: Category) => {
    return category.questions.every((q: Question) => responses[q.questionId.toString()] !== undefined);
  };

  const isAllComplete = () => {
    return completedQuestions === totalQuestions;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">진단 결과 분석 중...</h2>
          <p className="text-gray-600 mb-4">이웃들과 비교 분석을 진행하고 있습니다</p>
          <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4" ref={containerRef}>
      <div className="max-w-3xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 cursor-pointer mb-2 font-['Pacifico']">월세 공동협약</h1>
          <div className="w-16 h-1 bg-blue-600 mx-auto mb-6 rounded-full"></div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">우리 집 종합 진단</h2>
            <p className="text-gray-600 mb-4">거주 환경을 평가하여 이웃들과 비교 분석해드립니다</p>
            
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center justify-between text-blue-800 mb-2">
                <span className="text-sm font-semibold">진행 상황</span>
                <span className="text-sm font-semibold">{completedQuestions}/{totalQuestions} 문항 완료</span>
              </div>
            </div>
          </div>
        </div>

        {/* 카테고리별 섹션 */}
        <div className="space-y-12">
          {categories.map((category, categoryIndex) => (
            <div 
              key={category.id} 
              id={`category-${categoryIndex}`}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-6">
                <div className="flex items-center justify-between text-white mb-3">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                      <i className={`${category.icon} text-2xl`}></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{category.title}</h3>
                      <p className="text-blue-100 text-sm">{category.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{categoryIndex + 1}</div>
                    <div className="text-xs text-blue-100">/ {categories.length}</div>
                  </div>
                </div>
                
                {isCategoryComplete(category) && (
                  <div className="flex items-center text-green-200 text-sm">
                    <i className="ri-check-circle-fill mr-2"></i>
                    완료됨
                  </div>
                )}
              </div>

              <div className="p-8">
                <div className="space-y-8">
                  {category.questions.map((question, qIndex) => {
                    const scoreLabels = getScoreLabels(question.subText);
                    return (
                      <div key={question.questionId} className="space-y-4">
                        <div className="bg-gray-50 rounded-xl p-6">
                          <h4 className="text-lg font-bold text-gray-800 mb-2">
                            Q{qIndex + 1}. {question.questionText}
                          </h4>
                          <p className="text-sm text-gray-500 mb-4">
                            <i className="ri-information-line mr-1"></i>
                            {question.subText}
                          </p>
                          
                          <div className="grid grid-cols-5 gap-3">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <button
                                key={value}
                                onClick={() => {
                                  handleResponse(question.questionId.toString(), value);
                                  // 답변 후 잠시 기다린 다음 자동 스크롤 (마지막 질문이 아닌 경우)
                                  if (qIndex === category.questions.length - 1 && categoryIndex < categories.length - 1) {
                                    setTimeout(() => {
                                      scrollToNextCategory(categoryIndex);
                                    }, 500);
                                  }
                                }}
                                className={`p-4 text-center rounded-xl border-2 transition-all duration-200 cursor-pointer group ${
                                  responses[question.questionId.toString()] === value
                                    ? 'border-blue-500 bg-blue-500 text-white shadow-lg'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                }`}
                              >
                                <div className={`text-2xl font-bold mb-1 ${
                                  responses[question.questionId.toString()] === value ? 'text-white' : 'text-blue-600'
                                }`}>
                                  {value}
                                </div>
                                <div className={`text-xs ${
                                  responses[question.questionId.toString()] === value ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                  {value === 1 && scoreLabels.low}
                                  {value === 2 && '나쁨'}
                                  {value === 3 && '보통'}
                                  {value === 4 && '좋음'}
                                  {value === 5 && scoreLabels.high}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 카테고리 완료 표시 및 다음 카테고리 버튼 */}
                {isCategoryComplete(category) && categoryIndex < categories.length - 1 && (
                  <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <button
                      onClick={() => scrollToNextCategory(categoryIndex)}
                      className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap flex items-center mx-auto"
                    >
                      다음 카테고리로
                      <i className="ri-arrow-down-line ml-2"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 완료 버튼 - 항상 표시되지만 조건부 활성화 */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            {isAllComplete() ? (
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-check-circle-fill text-3xl text-green-600"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">진단 완료!</h3>
                <p className="text-gray-600">모든 카테고리 평가가 완료되었습니다</p>
              </div>
            ) : (
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-clipboard-line text-3xl text-blue-600"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">진단 진행 중</h3>
                <p className="text-gray-600">
                  {totalQuestions - completedQuestions}개 문항이 더 남았습니다
                </p>
              </div>
            )}
            
            <button
              onClick={isAllComplete() ? handleSubmit : undefined}
              disabled={!isAllComplete()}
              className={`px-8 py-4 font-bold text-lg rounded-xl transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center mx-auto ${
                isAllComplete()
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isAllComplete() ? '결과 확인하기' : '모든 문항을 완료해주세요'}
              <i className={`ml-2 ${isAllComplete() ? 'ri-arrow-right-line' : 'ri-lock-line'}`}></i>
            </button>
          </div>
        </div>

        {/* 하단 안내 */}
        <div className="mt-6 text-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-center text-sm text-gray-600">
              <i className="ri-shield-check-line text-green-600 mr-2"></i>
              <span>모든 응답은 익명으로 처리되며, 이웃 비교 분석에만 사용됩니다.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}