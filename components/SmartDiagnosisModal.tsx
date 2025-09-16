'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface SmartDiagnosisModalProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
}

export default function SmartDiagnosisModal({ isVisible, onClose, onComplete }: SmartDiagnosisModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurementData, setMeasurementData] = useState({
    noise: { value: 0, isComplete: false },
    level: { value: 0, isComplete: false },
    internet: { downloadSpeed: 0, uploadSpeed: 0, isComplete: false }
  });

  const steps = [
    {
      title: '🔊 소음 측정',
      description: '주변 소음 수준을 측정합니다',
      icon: 'ri-volume-up-line',
      color: 'blue'
    },
    {
      title: '📐 수평 측정',
      description: '바닥의 수평도를 측정합니다',
      icon: 'ri-ruler-line',
      color: 'green'
    },
    {
      title: '🚀 인터넷 속도 측정',
      description: '인터넷 다운로드/업로드 속도를 측정합니다',
      icon: 'ri-wifi-line',
      color: 'purple'
    }
  ];

  const simulateMeasurement = (stepIndex: number) => {
    setIsMeasuring(true);
    
    setTimeout(() => {
      let newData = { ...measurementData };
      
      switch (stepIndex) {
        case 0: // 소음 측정
          newData.noise = {
            value: Math.floor(Math.random() * 20) + 30, // 30-50dB
            isComplete: true
          };
          break;
        case 1: // 수평 측정
          newData.level = {
            value: Math.floor(Math.random() * 3) + 1, // 1-3도
            isComplete: true
          };
          break;
        case 2: // 인터넷 속도 측정
          newData.internet = {
            downloadSpeed: Math.floor(Math.random() * 200) + 100, // 100-300Mbps
            uploadSpeed: Math.floor(Math.random() * 50) + 20, // 20-70Mbps
            isComplete: true
          };
          break;
      }
      
      setMeasurementData(newData);
      setIsMeasuring(false);
      
      if (stepIndex < steps.length - 1) {
        setCurrentStep(stepIndex + 1);
      } else {
        // 모든 측정 완료
        const overallScore = calculateOverallScore(newData);
        const insights = generateInsights(newData);
        
        onComplete({
          ...newData,
          overallScore,
          insights
        });
        
        toast.success('스마트 진단이 완료되었습니다!');
        onClose();
      }
    }, 2000 + Math.random() * 1000); // 2-3초 시뮬레이션
  };

  const calculateOverallScore = (data: any) => {
    let score = 0;
    
    // 소음 점수 (30-50dB 범위에서 낮을수록 좋음)
    if (data.noise.isComplete) {
      const noiseScore = Math.max(0, 100 - (data.noise.value - 30) * 5);
      score += noiseScore * 0.4;
    }
    
    // 수평 점수 (1-3도 범위에서 낮을수록 좋음)
    if (data.level.isComplete) {
      const levelScore = Math.max(0, 100 - (data.level.value - 1) * 25);
      score += levelScore * 0.3;
    }
    
    // 인터넷 속도 점수 (100-300Mbps 범위에서 높을수록 좋음)
    if (data.internet.isComplete) {
      const internetScore = Math.min(100, (data.internet.downloadSpeed - 100) * 0.5);
      score += internetScore * 0.3;
    }
    
    return Math.round(score);
  };

  const generateInsights = (data: any) => {
    const insights = [];
    
    if (data.noise.isComplete) {
      if (data.noise.value < 35) {
        insights.push('매우 조용한 환경');
      } else if (data.noise.value < 45) {
        insights.push('적당한 소음 수준');
      } else {
        insights.push('소음이 다소 있는 환경');
      }
    }
    
    if (data.level.isComplete) {
      if (data.level.value <= 1) {
        insights.push('수평도가 우수함');
      } else if (data.level.value <= 2) {
        insights.push('수평도가 양호함');
      } else {
        insights.push('수평도 개선 필요');
      }
    }
    
    if (data.internet.isComplete) {
      if (data.internet.downloadSpeed > 200) {
        insights.push('인터넷 속도가 매우 빠름');
      } else if (data.internet.downloadSpeed > 100) {
        insights.push('인터넷 속도가 양호함');
      } else {
        insights.push('인터넷 속도 개선 필요');
      }
    }
    
    return insights.join(', ');
  };

  const resetMeasurement = () => {
    setCurrentStep(0);
    setMeasurementData({
      noise: { value: 0, isComplete: false },
      level: { value: 0, isComplete: false },
      internet: { downloadSpeed: 0, uploadSpeed: 0, isComplete: false }
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">🔬 스마트 진단</h2>
              <p className="text-blue-100">객관적 데이터로 거주 환경을 측정합니다</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>
        </div>

        {/* 진행률 표시 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">진행률</span>
            <span className="text-sm font-medium text-gray-600">
              {currentStep + 1} / {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* 현재 단계 */}
        <div className="p-6">
          {currentStep < steps.length && (
            <div className="text-center">
              <div className={`w-20 h-20 bg-${steps[currentStep].color}-100 rounded-full flex items-center justify-center mx-auto mb-6`}>
                <i className={`${steps[currentStep].icon} text-3xl text-${steps[currentStep].color}-600`}></i>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {steps[currentStep].title}
              </h3>
              <p className="text-gray-600 mb-8">
                {steps[currentStep].description}
              </p>

              {isMeasuring ? (
                <div className="space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                  <p className="text-gray-600">측정 중입니다...</p>
                </div>
              ) : (
                <button
                  onClick={() => simulateMeasurement(currentStep)}
                  className={`bg-gradient-to-r from-${steps[currentStep].color}-500 to-${steps[currentStep].color}-600 text-white px-8 py-3 rounded-lg hover:from-${steps[currentStep].color}-600 hover:to-${steps[currentStep].color}-700 transition-all flex items-center mx-auto`}
                >
                  <i className="ri-play-circle-line mr-2"></i>
                  측정 시작
                </button>
              )}
            </div>
          )}
        </div>

        {/* 측정 결과 요약 */}
        {(measurementData.noise.isComplete || measurementData.level.isComplete || measurementData.internet.isComplete) && (
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <h4 className="font-bold text-gray-800 mb-4">측정 결과</h4>
            <div className="space-y-3">
              {measurementData.noise.isComplete && (
                <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                  <span className="text-gray-700">🔊 소음</span>
                  <span className="font-semibold text-blue-600">{measurementData.noise.value}dB</span>
                </div>
              )}
              {measurementData.level.isComplete && (
                <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                  <span className="text-gray-700">📐 수평</span>
                  <span className="font-semibold text-green-600">{measurementData.level.value}°</span>
                </div>
              )}
              {measurementData.internet.isComplete && (
                <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                  <span className="text-gray-700">🚀 인터넷</span>
                  <span className="font-semibold text-purple-600">{measurementData.internet.downloadSpeed}Mbps</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={resetMeasurement}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <i className="ri-refresh-line mr-2"></i>
            다시 측정
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}