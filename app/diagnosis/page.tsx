'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { diagnosisApi } from '../../lib/api';
import toast from 'react-hot-toast';

// API로부터 받아올 데이터 타입 정의
interface Question {
  id: number;
  text: string;
  scale: string;
}

interface Category {
  id: number;
  title: string;
  icon: string;
  description: string;
  questions: Question[];
}

export default function DiagnosisPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [responses, setResponses] = useState<{[key: number]: number}>({});
  const [isLoading, setIsLoading] = useState(true); // 초기 질문 로딩 상태
  const [isSubmitting, setIsSubmitting] = useState(false); // 제출 로딩 상태
  const [error, setError] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await diagnosisApi.getQuestions();
        console.log('진단 질문 API 응답:', response);
        
        // 백엔드 응답 구조: { success: true, data: DiagnosisQuestionsResponseDTO, message: string }
        const categoriesData = response?.data?.categories;

        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        } else {
          console.error("Unexpected data structure:", response);
          throw new Error('Failed to load questions due to unexpected format.');
        }
      } catch (err: any) {
        console.error('진단 질문 로드 실패:', err);
        setError('진단 질문을 불러오는 데 실패했습니다.');
        toast.error('진단 질문을 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const totalQuestions = categories.reduce((sum, cat) => sum + cat.questions.length, 0);
  const completedQuestions = Object.keys(responses).length;

  const handleResponse = (questionId: number, value: number) => {
    setResponses(prev => ({...prev, [questionId]: value}));
  };

  const scrollToNextCategory = (currentIndex: number) => {
    if (currentIndex < categories.length - 1) {
      const nextElement = document.getElementById(`category-${categories[currentIndex + 1].id}`);
      if (nextElement) {
        nextElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleSubmit = async () => {
    if (!isAllComplete()) {
      toast.error('모든 문항에 답변해주세요.');
      return;
    }
    setIsSubmitting(true);
    
    try {
      // 백엔드가 기대하는 요청 구조에 맞게 수정
      const payload = {
        responses: Object.entries(responses).map(([questionId, score]) => ({
          questionId: Number(questionId),
          score: score // 숫자로 전송
        }))
      };

      console.log('진단 응답 제출:', payload);
      const response = await diagnosisApi.submitResponses(payload);
      console.log('진단 응답 제출 결과:', response);
      
      toast.success('진단이 완료되었습니다! 결과를 분석합니다.');
      
      // 진단 완료 플래그 설정
      localStorage.setItem('diagnosis_completed', 'true');
      
      router.push('/diagnosis/results');

    } catch (err: any) {
      console.error('진단 제출 실패:', err);
      const errorMessage = err.response?.data?.message || '진단 결과 제출 중 오류가 발생했습니다.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCategoryComplete = (category: Category) => {
    return category.questions.every((q) => responses[q.id] !== undefined);
  };

  const isAllComplete = () => {
    if (totalQuestions === 0) return false;
    return completedQuestions === totalQuestions;
  };

  const getScoreLabel = (questionText: string, value: number) => {
    // 소음 관련 질문들 - 점수가 높을수록 나쁨
    if (questionText.includes('소음') || questionText.includes('시끄러움')) {
      const labels = ['매우 조용함', '조용함', '보통', '시끄러움', '매우 시끄러움'];
      return labels[value - 1];
    }
    
    // 수압 관련 질문들 - 점수가 높을수록 좋음
    if (questionText.includes('수압') || questionText.includes('온수') || questionText.includes('속도')) {
      const labels = ['매우 약함', '약함', '보통', '강함', '매우 강함'];
      return labels[value - 1];
    }
    
    // 채광 관련 질문들 - 점수가 높을수록 좋음
    if (questionText.includes('자연광') || questionText.includes('햇빛')) {
      const labels = ['매우 어두움', '어두움', '보통', '밝음', '매우 밝음'];
      return labels[value - 1];
    }
    
    // 주차 관련 질문들 - 점수가 높을수록 좋음
    if (questionText.includes('주차') || questionText.includes('거리')) {
      const labels = ['매우 어려움', '어려움', '보통', '쉬움', '매우 쉬움'];
      return labels[value - 1];
    }
    
    // 난방 관련 질문들 - 점수가 높을수록 좋음
    if (questionText.includes('난방') || questionText.includes('난방비')) {
      const labels = ['매우 나쁨', '나쁨', '보통', '좋음', '매우 좋음'];
      return labels[value - 1];
    }
    
    // 환기 관련 질문들 - 점수가 높을수록 좋음
    if (questionText.includes('공기순환') || questionText.includes('습도')) {
      const labels = ['매우 나쁨', '나쁨', '보통', '좋음', '매우 좋음'];
      return labels[value - 1];
    }
    
    // 보안 관련 질문들 - 점수가 높을수록 좋음
    if (questionText.includes('보안') || questionText.includes('안전함')) {
      const labels = ['매우 나쁨', '나쁨', '보통', '좋음', '매우 좋음'];
      return labels[value - 1];
    }
    
    // 관리 관련 질문들 - 점수가 높을수록 좋음
    if (questionText.includes('관리') || questionText.includes('대응')) {
      const labels = ['매우 나쁨', '나쁨', '보통', '좋음', '매우 좋음'];
      return labels[value - 1];
    }
    
    // 편의성 관련 질문들 - 점수가 높을수록 좋음
    if (questionText.includes('편의시설') || questionText.includes('대중교통')) {
      const labels = ['매우 부족함', '부족함', '보통', '충분함', '매우 충분함'];
      return labels[value - 1];
    }
    
    // 인터넷 관련 질문들 - 점수가 높을수록 좋음
    if (questionText.includes('인터넷') || questionText.includes('WiFi')) {
      const labels = ['매우 느림', '느림', '보통', '빠름', '매우 빠름'];
      return labels[value - 1];
    }
    
    // 기본값
    const labels = ['매우 나쁨', '나쁨', '보통', '좋음', '매우 좋음'];
    return labels[value - 1];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900">진단 질문을 불러오는 중...</h2>
          <p className="text-gray-600">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }
  
  if (isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900">진단 결과 분석 중...</h2>
          <p className="mb-4 text-gray-600">이웃들과 비교 분석을 진행하고 있습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50" ref={containerRef}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
            <Link href="/">
              <h1 className="text-3xl font-bold text-gray-800 cursor-pointer mb-2 font-['Pacifico']">월세의 정석</h1>
            </Link>
            <div className="w-16 h-1 bg-gray-700 mx-auto mb-6"></div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-2xl font-bold mb-3 text-gray-900">우리 집 종합 진단</h2>
            <p className="mb-4 text-gray-600">거주 환경을 평가하여 이웃들과 비교 분석해드립니다</p>
            
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2 text-blue-800">
                <span className="text-sm font-semibold">진행 상황</span>
                <span className="text-sm font-semibold">{completedQuestions}/{totalQuestions} 문항 완료</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          {categories.map((category, categoryIndex) => (
            <div key={category.id} id={`category-${category.id}`} className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-6 bg-blue-600">
                 <div className="flex items-center justify-between text-white mb-3">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                      <i className={`ri-volume-down-line text-2xl`}></i> {/* 아이콘은 백엔드에서 받거나 매핑 필요 */}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{category.title}</h3>
                      <p className="text-sm text-blue-100">{category.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{categoryIndex + 1}</div>
                    <div className="text-xs text-blue-100">/ {categories.length}</div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="space-y-8">
                  {category.questions.map((question, qIndex) => (
                    <div key={question.id} className="space-y-4">
                      <div className="bg-blue-50 rounded-xl p-6">
                        <h4 className="text-lg font-bold mb-2 text-gray-900">Q{qIndex + 1}. {question.questionText}</h4>
                        <p className="text-sm mb-4 text-gray-600"><i className="ri-information-line mr-1"></i>{question.subText}</p>
                        <div className="grid grid-cols-5 gap-3">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              onClick={() => {
                                handleResponse(question.id, value);
                                if (qIndex === category.questions.length - 1) {
                                  setTimeout(() => scrollToNextCategory(categoryIndex), 300);
                                }
                              }}
                              className={`p-4 text-center rounded-xl border-2 transition-all duration-200 cursor-pointer group ${responses[question.id] === value ? 'bg-blue-600 text-white shadow-lg border-blue-600' : 'border-gray-200 hover:bg-gray-50'}`}>
                              <div className={`text-2xl font-bold mb-1 ${responses[question.id] === value ? 'text-white' : 'text-gray-900'}`}>{value}</div>
                              <div className={`text-xs ${responses[question.id] === value ? 'text-white' : 'text-gray-600'}`}>
                                {getScoreLabel(question.questionText, value)}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            {isAllComplete() ? (
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"><i className="ri-check-circle-fill text-3xl text-white"></i></div>
                <h3 className="text-2xl font-bold mb-2 text-gray-900">진단 완료!</h3>
                <p className="text-gray-600">모든 카테고리 평가가 완료되었습니다</p>
              </div>
            ) : (
              <div className="mb-6">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4"><i className="ri-clipboard-line text-3xl text-gray-600"></i></div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">진단 진행 중</h3>
                <p className="text-gray-600">{totalQuestions - completedQuestions}개 문항이 더 남았습니다</p>
              </div>
            )}
            <button onClick={handleSubmit} disabled={!isAllComplete() || isSubmitting} className={`px-8 py-4 font-bold text-lg rounded-xl transition-all duration-300 cursor-pointer whitespace-nowrap flex items-center mx-auto ${isAllComplete() ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' : 'bg-gray-200 text-gray-600 cursor-not-allowed opacity-50'}`}>
              {isAllComplete() ? '결과 확인하기' : '모든 문항을 완료해주세요'}
              <i className={`ml-2 ${isAllComplete() ? 'ri-arrow-right-line' : 'ri-lock-line'}`}></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}