'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { diagnosisApi } from '../../../lib/api';
import toast from 'react-hot-toast';
import SmartDiagnosisTools from '@/components/SmartDiagnosisTools';

export default function DiagnosisResultsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);
  const [error, setError] = useState('');
  
  // Smart Assistant States
  const [showSmartDiagnosis, setShowSmartDiagnosis] = useState(false);
  const [showSmartTools, setShowSmartTools] = useState(false);
  const [noiseLevel, setNoiseLevel] = useState<number | null>(null);
  const [isMeasuringNoise, setIsMeasuringNoise] = useState(false);
  const [recordedNoise, setRecordedNoise] = useState<string | null>(null);
  const [smartMeasurements, setSmartMeasurements] = useState<any[]>([]);
  
  const [levelX, setLevelX] = useState<number | null>(null);
  const [levelY, setLevelY] = useState<number | null>(null);
  const [levelZ, setLevelZ] = useState<number | null>(null);
  const [isMeasuringLevel, setIsMeasuringLevel] = useState(false);
  const [recordedLevel, setRecordedLevel] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiagnosisResult = async () => {
      try {
        const response = await diagnosisApi.getResult();
        console.log('진단 결과 API 응답:', response);
        
        // 백엔드 응답 구조: { success: true, data: DiagnosisResultResponseDTO, message: string }
        const resultData = response?.data;
        
        if (resultData) {
          setDiagnosisResult(resultData);
        } else {
          throw new Error('진단 결과 데이터를 찾을 수 없습니다.');
        }
      } catch (err: any) {
        console.error('진단 결과 로드 실패:', err);
        setError('진단 결과를 불러오는 데 실패했습니다.');
        toast.error('진단 결과를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiagnosisResult();
  }, []);

  // Smart Diagnosis Functions
  const startNoiseMeasurement = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let animationFrameId: number = 0;

      const getNoiseLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / dataArray.length);
        const db = 20 * Math.log10(rms / 255);
        setNoiseLevel(db === -Infinity ? 0 : db + 100);

        animationFrameId = requestAnimationFrame(getNoiseLevel);
      };

      getNoiseLevel();
      setIsMeasuringNoise(true);
      (window as any).noiseStream = stream;
      (window as any).noiseAudioContext = audioContext;
      (window as any).noiseAnimationFrameId = animationFrameId;

    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast.error('마이크 접근에 실패했습니다. 권한을 허용해주세요.');
      setIsMeasuringNoise(false);
    }
  };

  const stopNoiseMeasurement = () => {
    if ((window as any).noiseStream) {
      (window as any).noiseStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      (window as any).noiseStream = null;
    }
    if ((window as any).noiseAudioContext) {
      (window as any).noiseAudioContext.close();
      (window as any).noiseAudioContext = null;
    }
    if ((window as any).noiseAnimationFrameId) {
      cancelAnimationFrame((window as any).noiseAnimationFrameId);
      (window as any).noiseAnimationFrameId = null;
    }
    setNoiseLevel(null);
    setIsMeasuringNoise(false);
  };

  const recordNoiseLevel = () => {
    if (noiseLevel !== null) {
      const timestamp = new Date().toLocaleString('ko-KR');
      setRecordedNoise(`${noiseLevel.toFixed(1)}dB (${timestamp})`);
      toast.success('소음 레벨이 기록되었습니다! 진단 결과에 반영됩니다.');
    }
  };

  const startLevelMeasurement = () => {
    if ('DeviceOrientationEvent' in window) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        const x = event.beta || 0;
        const y = event.gamma || 0;
        const z = event.alpha || 0;
        
        setLevelX(x);
        setLevelY(y);
        setLevelZ(z);
      };

      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        (DeviceOrientationEvent as any).requestPermission()
          .then((permissionState: string) => {
            if (permissionState === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation);
              setIsMeasuringLevel(true);
              toast.success('수평 측정을 시작합니다.');
            } else {
              toast.error('디바이스 방향 센서 권한이 필요합니다.');
            }
          })
          .catch(() => {
            toast.error('디바이스 방향 센서에 접근할 수 없습니다.');
          });
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
        setIsMeasuringLevel(true);
        toast.success('수평 측정을 시작합니다.');
      }
      
      (window as any).orientationHandler = handleOrientation;
    } else {
      toast.error('이 디바이스는 방향 센서를 지원하지 않습니다.');
    }
  };

  const stopLevelMeasurement = () => {
    if ((window as any).orientationHandler) {
      window.removeEventListener('deviceorientation', (window as any).orientationHandler);
      (window as any).orientationHandler = null;
    }
    setIsMeasuringLevel(false);
    setLevelX(null);
    setLevelY(null);
    setLevelZ(null);
    toast.success('수평 측정을 중지했습니다.');
  };

  const recordLevel = () => {
    if (levelX !== null && levelY !== null && levelZ !== null) {
      const timestamp = new Date().toLocaleString('ko-KR');
      setRecordedLevel(`X: ${levelX.toFixed(2)}°, Y: ${levelY.toFixed(2)}°, Z: ${levelZ.toFixed(2)}° (${timestamp})`);
      toast.success('수평 정보가 기록되었습니다! 진단 결과에 반영됩니다.');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopNoiseMeasurement();
      stopLevelMeasurement();
    };
  }, []);

  const handleGoToReport = () => {
    router.push('/report');
  };

  const handleGoToWeeklyMission = () => {
    router.push('/weekly-mission');
  };

  // 스마트 진단 도구 완료 핸들러
  const handleSmartMeasurementComplete = (type: string, data: any) => {
    setSmartMeasurements(prev => [...prev, { type, data, timestamp: new Date().toISOString() }]);
    toast.success(`${type} 측정이 완료되었습니다!`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900">진단 결과 분석 중...</h2>
          <p className="text-gray-600">이웃들과 비교 분석을 진행하고 있습니다</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-error-warning-line text-3xl text-red-600"></i>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900">오류가 발생했습니다</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/diagnosis')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            다시 진단하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-bold text-purple-600 cursor-pointer mb-2 font-['Roboto']">월세의 정석</h1>
          </Link>
          <div className="w-16 h-1 bg-purple-600 rounded-full mx-auto mb-6"></div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-check-circle-fill text-4xl text-purple-600"></i>
            </div>
            <h2 className="text-3xl font-bold mb-3 text-gray-800">진단 완료! 🎉</h2>
            <p className="text-lg text-gray-600 mb-4">우리 집 거주 환경을 분석했습니다</p>
            
            {diagnosisResult && (
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex items-center justify-center text-purple-800">
                  <i className="ri-bar-chart-line mr-2"></i>
                  <span className="font-medium">
                    {diagnosisResult.statistics?.participantCount || 0}명의 이웃 데이터와 비교 분석
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {diagnosisResult && (
          <div className="space-y-8">
            {/* Subjective Data Section */}
            <div className="bg-white rounded-2xl shadow-lg border-l-4 border-purple-500 p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <i className="ri-user-heart-line text-2xl text-purple-600"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">📝 주관적 평가 데이터</h3>
                  <p className="text-gray-600 text-sm">설문 기반 만족도 • 이웃 비교 분석</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-600">
                      {diagnosisResult.summary?.totalScore || 0}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-1">내 점수</h4>
                  <p className="text-sm text-gray-600">종합 만족도</p>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-600">
                      {(diagnosisResult.summary?.buildingAverage || 0).toFixed(2)}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-1">건물 평균</h4>
                  <p className="text-sm text-gray-600">같은 건물 이웃들</p>
                </div>
                
                <div className="text-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-600">
                      {(diagnosisResult.summary?.neighborhoodAverage || 0).toFixed(2)}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-1">동네 평균</h4>
                  <p className="text-sm text-gray-600">같은 동네 이웃들</p>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            {diagnosisResult.categoryDetails && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">📋 카테고리별 분석</h3>
                
                <div className="space-y-4">
                  {diagnosisResult.categoryDetails.map((category: any, index: number) => {
                    const categoryNames = ['소음', '수압', '채광', '주차', '난방', '환기', '보안', '관리', '편의성', '인터넷'];
                    const categoryName = categoryNames[category.categoryId - 1] || `카테고리 ${category.categoryId}`;
                    
                    return (
                      <div key={category.categoryId} className="bg-purple-50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-bold text-gray-800">{categoryName}</h4>
                          <div className="text-right">
                            <div className="text-xl font-bold text-purple-600">{category.myScore || 0}</div>
                            <div className="text-sm text-gray-600">내 점수</div>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">건물 평균</span>
                              <span className="font-semibold text-purple-600">{(category.buildingAverage || 0).toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">동네 평균</span>
                              <span className="font-semibold text-purple-600">{(category.neighborhoodAverage || 0).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">💡 개선 제안</h3>
              
              <div className="space-y-4">
                {/* 시설 개선 우선순위 - 실제 데이터 기반 */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-purple-800 mb-3">시설 개선 우선순위</h4>
                  {(() => {
                    const categoryNames = ['소음', '수압', '채광', '주차', '난방', '환기', '보안', '관리', '편의성', '인터넷'];
                    const lowScoreCategories = diagnosisResult.categoryDetails
                      ?.filter((category: any) => category.myScore < 60)
                      ?.sort((a: any, b: any) => a.myScore - b.myScore)
                      ?.slice(0, 3) || [];
                    
                    if (lowScoreCategories.length > 0) {
                      return (
                        <div>
                          <p className="text-gray-700 mb-3">
                            <strong>협상 근거:</strong> 회원님의 집은 다음 항목에서 건물 평균보다 낮은 만족도를 보입니다. → 임대인에게 개선 조치나 임대료 조정을 요청할 수 있는 근거입니다:
                          </p>
                          <div className="space-y-2">
                            {lowScoreCategories.map((category: any, index: number) => {
                              const categoryName = categoryNames[category.categoryId - 1] || `카테고리 ${category.categoryId}`;
                              const gap = (category.buildingAverage || 0) - (category.myScore || 0);
                              return (
                                <div key={category.categoryId} className="bg-white rounded-lg p-3 border border-blue-100">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-800">{categoryName}</span>
                                    <div className="text-right">
                                      <span className="text-sm text-red-600 font-semibold">
                                        내 점수: {category.myScore}점
                                      </span>
                                      <span className="text-xs text-gray-500 ml-2">
                                        (건물 평균 대비 -{gap.toFixed(1)}점)
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <p className="text-gray-700">
                          모든 항목에서 건물 평균 이상의 점수를 받았습니다! 현재 거주 환경이 양호한 상태입니다.
                        </p>
                      );
                    }
                  })()}
                </div>
                
                {/* 협상 전략 - 실제 데이터 기반 */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                  <h4 className="text-lg font-bold text-purple-800 mb-3">협상 전략</h4>
                  {(() => {
                    const categoryNames = ['소음', '수압', '채광', '주차', '난방', '환기', '보안', '관리', '편의성', '인터넷'];
                    const lowScoreCategories = diagnosisResult.categoryDetails
                      ?.filter((category: any) => category.myScore < 60)
                      ?.sort((a: any, b: any) => a.myScore - b.myScore)
                      ?.slice(0, 3) || [];
                    
                    if (lowScoreCategories.length > 0) {
                      const worstCategory = lowScoreCategories[0];
                      const categoryName = categoryNames[worstCategory.categoryId - 1] || `카테고리 ${worstCategory.categoryId}`;
                      const gap = (worstCategory.buildingAverage || 0) - (worstCategory.myScore || 0);
                      
                      return (
                        <div>
                          <p className="text-gray-700 mb-3">
                            <strong>{categoryName}</strong> 항목에서 건물 평균 대비 <strong>{gap.toFixed(1)}점 낮은 점수</strong>를 받았습니다.
                          </p>
                          <div className="bg-white rounded-lg p-4 border border-green-100">
                            <h5 className="font-semibold text-gray-800 mb-2">협상 포인트:</h5>
                            <ul className="text-sm text-gray-700 space-y-1">
                              <li>• "{categoryName} 항목에서 건물 평균({worstCategory.buildingAverage?.toFixed(1)}점)보다 {gap.toFixed(1)}점 낮은 점수를 받았습니다"</li>
                              <li>• "이웃 {diagnosisResult.statistics?.participantCount || 0}명의 객관적 데이터를 바탕으로 개선이 필요합니다"</li>
                              <li>• "주택임대차보호법 제20조에 따른 수선의무에 해당할 수 있습니다"</li>
                            </ul>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div>
                          <p className="text-gray-700 mb-3">
                            모든 항목에서 건물 평균 이상의 점수를 받았습니다.
                          </p>
                          <div className="bg-white rounded-lg p-4 border border-green-100">
                            <h5 className="font-semibold text-gray-800 mb-2">협상 포인트:</h5>
                            <ul className="text-sm text-gray-700 space-y-1">
                              <li>• "현재 거주 환경이 건물 평균보다 우수합니다"</li>
                              <li>• "이웃 {diagnosisResult.statistics?.participantCount || 0}명의 데이터로 검증된 양호한 상태입니다"</li>
                              <li>• "현재 조건 유지 또는 적정한 인상률을 요구할 수 있습니다"</li>
                            </ul>
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Smart Diagnosis Enhancement Section */}
        <div className="mt-12">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-200 p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-flask-line text-3xl text-blue-600"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">더 정확한 진단을 원하나요?</h3>
              <p className="text-gray-600 mb-4">객관적 측정으로 진단 신뢰도를 높여보세요!</p>
              
              {!showSmartDiagnosis ? (
                <button
                  onClick={() => setShowSmartDiagnosis(true)}
                  className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <div className="flex items-center justify-center">
                    <i className="ri-smartphone-line mr-2"></i>
                    스마트 측정 시작하기
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => setShowSmartDiagnosis(false)}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  측정 도구 닫기
                </button>
              )}
            </div>
            
            {/* Objective vs Subjective Data Comparison */}
            {(recordedNoise || recordedLevel) && (
              <div className="space-y-6 mb-8">
                {/* Objective Data Card */}
                <div className="bg-white rounded-xl shadow-lg border-l-4 border-blue-500 p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <i className="ri-line-chart-line text-2xl text-blue-600"></i>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">📊 객관적 측정 데이터</h4>
                      <p className="text-gray-600 text-sm">실시간 센서 측정값 • 협상 근거 자료</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {recordedNoise && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <i className="ri-volume-down-line mr-2 text-blue-600"></i>
                            <span className="font-semibold text-gray-800">실제 소음 측정값</span>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">{recordedNoise.split('dB')[0]}dB</div>
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-white rounded border-l-4 border-orange-400">
                          <p className="text-sm text-gray-700">
                            <strong>협상 포인트:</strong> "실제 측정 결과 {recordedNoise.split('dB')[0]}dB로, 환경부 권고 기준(주거지역 낮 시간 55dB)을 {parseInt(recordedNoise.split('dB')[0]) - 55}dB 초과합니다. → 소음 문제 해결을 위한 조치를 요청할 근거가 있습니다."
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {recordedLevel && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <i className="ri-compass-line mr-2 text-green-600"></i>
                            <span className="font-semibold text-gray-800">바닥 수평 측정값</span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">{recordedLevel.split('(')[0]}</div>
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-white rounded border-l-4 border-green-400">
                          <p className="text-sm text-gray-700">
                            <strong>협상 포인트:</strong> "건물 기울기 측정 결과를 통해 구조적 안전성을 확인했습니다. → 건물 관리 상태에 대한 객관적 자료로 활용 가능합니다."
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* CTA Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => router.push('/report')}
                    className="bg-purple-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-purple-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
                  >
                    <i className="ri-file-text-line mr-2"></i>
                    📄 이 데이터로 협상 리포트 만들기
                  </button>
                  <button
                    onClick={() => setShowSmartDiagnosis(true)}
                    className="bg-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
                  >
                    <i className="ri-refresh-line mr-2"></i>
                    🔄 다시 측정하기
                  </button>
                </div>
              </div>
            )}
            
            {/* Smart Diagnosis Tools */}
            {showSmartDiagnosis && (
              <div className="space-y-8">
                {/* Noise Measurement */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="flex items-center mb-4">
                    <i className="ri-mic-line text-2xl text-blue-600 mr-3"></i>
                    <h4 className="text-xl font-semibold text-gray-800">🎤 내 방 소음 측정하기</h4>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm">실제 소음 수준을 측정하여 주관적 평가와 비교해보세요</p>
                  
                  <div className="flex flex-col items-center mb-6">
                    {/* Circular Gauge for Noise Level */}
                    <div className="relative w-48 h-48 mb-6">
                      <svg className="transform -rotate-90 w-48 h-48" viewBox="0 0 100 100">
                        {/* Background circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                        />
                        {/* Progress circle */}
                        {noiseLevel !== null && (
                          <circle
                            cx="50"
                            cy="50"
                            r="45"
                            stroke={
                              noiseLevel > 70 ? '#dc2626' :  // 환경부 기준: 공업지역 (70dB+) - 빨강
                              noiseLevel > 65 ? '#ea580c' :  // 상업지역 (65dB+) - 주황  
                              noiseLevel > 55 ? '#ca8a04' :  // 주거지역 낮 (55dB+) - 노랑
                              noiseLevel > 45 ? '#16a34a' :  // 주거지역 밤 (45dB+) - 연두
                              '#059669'                       // 매우 조용함 (45dB 미만) - 녹색
                            }
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${Math.min(100, Math.max(0, (noiseLevel / 80) * 100)) * 2.827} 282.7`}
                            className="transition-all duration-500 ease-out"
                          />
                        )}
                      </svg>
                      
                      {/* Center content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-3xl font-bold text-gray-800">
                          {noiseLevel !== null ? `${noiseLevel.toFixed(1)}` : '--'}
                        </div>
                        <div className="text-lg font-medium text-gray-600">dB</div>
                      </div>
                      
                      {/* Environment standard indicators */}
                      <div className="absolute inset-0">
                        {/* 45dB 표시 (주거지역 밤) */}
                        <div 
                          className="absolute w-2 h-2 bg-green-500 rounded-full transform -translate-x-1 -translate-y-1"
                          style={{
                            left: '50%',
                            top: `${50 - 45 * Math.cos((45/80) * Math.PI)}%`,
                            transform: `rotate(${(45/80) * 180}deg) translate(45px) rotate(-${(45/80) * 180}deg)`
                          }}
                        >
                          <div className="absolute -top-6 -left-4 text-xs text-green-600 font-medium whitespace-nowrap">45dB</div>
                        </div>
                        
                        {/* 55dB 표시 (주거지역 낮) */}
                        <div 
                          className="absolute w-2 h-2 bg-yellow-500 rounded-full transform -translate-x-1 -translate-y-1"
                          style={{
                            left: '50%',
                            top: `${50 - 45 * Math.cos((55/80) * Math.PI)}%`,
                            transform: `rotate(${(55/80) * 180}deg) translate(45px) rotate(-${(55/80) * 180}deg)`
                          }}
                        >
                          <div className="absolute -top-6 -left-4 text-xs text-yellow-600 font-medium whitespace-nowrap">55dB</div>
                        </div>
                        
                        {/* 70dB 표시 (공업지역) */}
                        <div 
                          className="absolute w-2 h-2 bg-red-500 rounded-full transform -translate-x-1 -translate-y-1"
                          style={{
                            left: '50%',
                            top: `${50 - 45 * Math.cos((70/80) * Math.PI)}%`,
                            transform: `rotate(${(70/80) * 180}deg) translate(45px) rotate(-${(70/80) * 180}deg)`
                          }}
                        >
                          <div className="absolute -top-6 -left-4 text-xs text-red-600 font-medium whitespace-nowrap">70dB</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status indicator */}
                    {noiseLevel !== null && (
                      <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        noiseLevel > 70 ? 'bg-red-100 text-red-800 border border-red-200' :
                        noiseLevel > 65 ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                        noiseLevel > 55 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                        noiseLevel > 45 ? 'bg-green-100 text-green-800 border border-green-200' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {noiseLevel > 70 ? '🔴 공업지역 수준 - 매우 시끄러움' :
                         noiseLevel > 65 ? '🟠 상업지역 수준 - 시끄러움' :
                         noiseLevel > 55 ? '🟡 주거지역 낮시간 기준 초과' :
                         noiseLevel > 45 ? '🟢 주거지역 적정 수준' :
                         '💚 매우 조용한 환경'
                        }
                      </div>
                    )}
                    
                    {/* Environment standards reference */}
                    <div className="mt-4 text-xs text-gray-500 text-center max-w-md">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="font-medium mb-2">환경부 소음 기준</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>주거지역(밤): 45dB</div>
                          <div>주거지역(낮): 55dB</div>
                          <div>상업지역: 65dB</div>
                          <div>공업지역: 70dB</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={startNoiseMeasurement}
                      disabled={isMeasuringNoise}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                      {isMeasuringNoise ? '측정 중...' : '측정 시작'}
                    </button>
                    <button
                      onClick={stopNoiseMeasurement}
                      disabled={!isMeasuringNoise}
                      className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
                    >
                      측정 중지
                    </button>
                  </div>
                  
                  <button
                    onClick={recordNoiseLevel}
                    disabled={noiseLevel === null}
                    className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-semibold"
                  >
                    소음 레벨 기록하기
                  </button>
                </div>

                {/* Level Measurement */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="flex items-center mb-4">
                    <i className="ri-compass-line text-2xl text-green-600 mr-3"></i>
                    <h4 className="text-xl font-semibold text-gray-800">📐 바닥 수평 확인하기</h4>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm">건물 기울기나 바닥 수평 상태를 객관적으로 측정해보세요 (모바일 디바이스 필요)</p>
                  
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative w-32 h-32 mb-4">
                      <div className="absolute inset-0 rounded-full border-4 border-gray-300 bg-gradient-to-br from-blue-50 to-blue-100">
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-400"></div>
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-400"></div>
                        
                        {levelX !== null && levelY !== null && (
                          <div 
                            className="absolute w-3 h-3 bg-green-500 rounded-full shadow-lg border-2 border-white transition-all duration-150"
                            style={{
                              left: `calc(50% + ${Math.max(-56, Math.min(56, levelY * 2))}px - 6px)`,
                              top: `calc(50% + ${Math.max(-56, Math.min(56, levelX * 2))}px - 6px)`,
                            }}
                          ></div>
                        )}
                        
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            levelX !== null && levelY !== null && Math.abs(levelX) < 2 && Math.abs(levelY) < 2
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {levelX !== null && levelY !== null && Math.abs(levelX) < 2 && Math.abs(levelY) < 2 
                              ? '수평' 
                              : '기울어짐'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-xs text-gray-500">전후</div>
                        <div className="font-bold">
                          {levelX !== null ? `${levelX.toFixed(1)}°` : '--°'}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-xs text-gray-500">좌우</div>
                        <div className="font-bold">
                          {levelY !== null ? `${levelY.toFixed(1)}°` : '--°'}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-xs text-gray-500">방위</div>
                        <div className="font-bold">
                          {levelZ !== null ? `${levelZ.toFixed(0)}°` : '--°'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={startLevelMeasurement}
                      disabled={isMeasuringLevel}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                    >
                      {isMeasuringLevel ? '측정 중...' : '측정 시작'}
                    </button>
                    <button
                      onClick={stopLevelMeasurement}
                      disabled={!isMeasuringLevel}
                      className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
                    >
                      측정 중지
                    </button>
                  </div>
                  
                  <button
                    onClick={recordLevel}
                    disabled={levelX === null}
                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-semibold"
                  >
                    수평 정보 기록하기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h3 className="text-xl font-bold mb-4 text-gray-800">다음 단계</h3>
            <p className="text-gray-600 mb-6">진단 결과를 바탕으로 다음 단계를 진행해보세요</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowSmartTools(true)}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="flex items-center justify-center">
                  <i className="ri-tools-line mr-2"></i>
                  스마트 진단 도구
                </div>
              </button>
              
              <button
                onClick={handleGoToReport}
                className="bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="flex items-center justify-center">
                  <i className="ri-file-text-line mr-2"></i>
                  협상 리포트 생성하기
                </div>
              </button>
              
              <button
                onClick={handleGoToWeeklyMission}
                className="bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="flex items-center justify-center">
                  <i className="ri-task-line mr-2"></i>
                  주간 미션 참여하기
                </div>
              </button>
              
              <Link href="/profile">
                <button className="bg-gray-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap">
                  <div className="flex items-center justify-center">
                    <i className="ri-user-line mr-2"></i>
                    내 프로필 보기
                  </div>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 스마트 진단 도구 모달 */}
      {showSmartTools && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">🔬 스마트 진단 도구</h3>
                <button
                  onClick={() => setShowSmartTools(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <SmartDiagnosisTools onMeasurementComplete={handleSmartMeasurementComplete} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}