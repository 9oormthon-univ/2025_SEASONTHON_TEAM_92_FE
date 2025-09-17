'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface ImprovedDiagnosisResultsProps {
  diagnosisResult: any;
}

export default function ImprovedDiagnosisResults({ diagnosisResult }: ImprovedDiagnosisResultsProps) {
  const router = useRouter();
  const [showSmartDiagnosis, setShowSmartDiagnosis] = useState(false);
  const [noiseLevel, setNoiseLevel] = useState<number | null>(null);
  const [isMeasuringNoise, setIsMeasuringNoise] = useState(false);
  const [recordedNoise, setRecordedNoise] = useState<string | null>(null);
  
  const [levelX, setLevelX] = useState<number | null>(null);
  const [levelY, setLevelY] = useState<number | null>(null);
  const [levelZ, setLevelZ] = useState<number | null>(null);
  const [isMeasuringLevel, setIsMeasuringLevel] = useState(false);
  const [recordedLevel, setRecordedLevel] = useState<string | null>(null);

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
        // dB 계산 - NaN과 Infinity 방지
        let db = 0;
        if (rms > 0) {
          const normalizedRms = rms / 255;
          if (normalizedRms > 0) {
            db = 20 * Math.log10(normalizedRms);
            // 실제 환경에 맞게 조정 (일반적으로 30-80dB 범위)
            db = Math.max(30, Math.min(80, db + 60));
          }
        }
        
        const adjustedDb = isNaN(db) ? 35 : db;
        setNoiseLevel(adjustedDb);
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
      toast.success('소음 레벨이 기록되었습니다! 협상 자료로 활용하세요.');
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
      toast.success('수평 정보가 기록되었습니다! 협상 자료로 활용하세요.');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopNoiseMeasurement();
      stopLevelMeasurement();
    };
  }, []);

  return (
    <div className="size- px-64 inline-flex justify-start items-start">
      <div className="w-[896px] h-auto max-w-[896px] inline-flex flex-col justify-start items-start">
        {/* Header */}
        <div className="size- pb-8 inline-flex justify-start items-start">
          <div className="w-[896px] h-48 inline-flex flex-col justify-start items-start">
            <div className="size- pb-2 inline-flex justify-start items-start">
              <div className="w-[896px] h-9 flex justify-center items-center">
                <div className="text-center justify-center text-gray-800 text-3xl font-bold font-['Inter'] leading-9">월세의 정석</div>
              </div>
            </div>
            <div className="size- px-96 pb-6 inline-flex justify-start items-start">
              <div className="w-16 h-1 bg-purple-600" />
            </div>
            <div className="self-stretch inline-flex justify-center items-start">
              <div className="size- px-96 pb-4 flex justify-start items-start">
                <div className="w-24 h-9 px-4 py-2 bg-purple-600 rounded-full flex justify-start items-center">
                  <div className="text-center justify-center text-white text-sm font-medium font-['Roboto'] leading-tight">진단 완료!</div>
                </div>
              </div>
            </div>
            <div className="size- pb-2 inline-flex justify-start items-start">
              <div className="w-[896px] h-8 flex justify-center items-center">
                <div className="text-center justify-center text-gray-900 text-2xl font-bold font-['Roboto'] leading-loose">거주 환경 종합 진단 결과</div>
              </div>
            </div>
            <div className="w-[896px] h-6 inline-flex justify-center items-center">
              <div className="text-center justify-center text-gray-600 text-base font-normal font-['Roboto'] leading-normal">{new Date().toLocaleDateString('ko-KR')}</div>
            </div>
          </div>
        </div>

        {/* Main Results Card - Subjective Data */}
        <div className="size- pb-8 inline-flex justify-start items-start">
          <div className="w-[896px] h-auto p-px bg-white rounded-2xl shadow-lg shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.10)] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-start items-start overflow-hidden">
            <div className="w-[894px] h-20 pb-px border-b border-gray-200 inline-flex justify-start items-start">
              <div className="w-96 h-20 px-6 py-4 bg-purple-600 inline-flex flex-col justify-start items-start">
                <div className="w-96 h-6 inline-flex justify-center items-center">
                  <div className="size- pr-2 flex justify-start items-start">
                    <div className="w-4 h-6 relative flex justify-center items-center">
                      <div className="size-4 left-[0.01px] top-[4px] absolute overflow-hidden">
                        <div className="w-3.5 h-3 left-[1px] top-[2px] absolute bg-white" />
                      </div>
                    </div>
                  </div>
                  <div className="text-center justify-center text-white text-base font-semibold font-['Roboto'] leading-normal">📝 주관적 평가</div>
                </div>
                <div className="size- pt-1 inline-flex justify-start items-start">
                  <div className="w-96 h-4 opacity-80 flex justify-center items-center">
                    <div className="opacity-80 text-center justify-center text-white text-xs font-semibold font-['Roboto'] leading-none">설문 기반 분석</div>
                  </div>
                </div>
              </div>
              <div className="w-96 h-20 px-6 py-4 inline-flex flex-col justify-start items-start">
                <div className="w-96 h-6 inline-flex justify-center items-center">
                  <div className="size- pr-2 flex justify-start items-start">
                    <div className="w-4 h-6 relative flex justify-center items-center">
                      <div className="size-4 left-[0.01px] top-[4px] absolute overflow-hidden">
                        <div className="w-3.5 h-3 left-[1.67px] top-[2px] absolute bg-gray-600" />
                      </div>
                    </div>
                  </div>
                  <div className="text-center justify-center text-gray-600 text-base font-semibold font-['Roboto'] leading-normal">📊 객관적 측정</div>
                </div>
                <div className="size- pt-1 inline-flex justify-start items-start">
                  <div className="w-96 h-4 opacity-80 flex justify-center items-center">
                    <div className="opacity-80 text-center justify-center text-gray-600 text-xs font-semibold font-['Roboto'] leading-none">
                      {recordedNoise || recordedLevel ? '측정 완료' : '측정 가능'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-[894px] h-auto p-8 flex flex-col justify-start items-start">
              {/* Subjective Analysis */}
              <div className="size- pb-8 inline-flex justify-start items-start">
                <div className="w-[830px] h-64 inline-flex flex-col justify-start items-start">
                  <div className="size- pb-4 inline-flex justify-start items-start">
                    <div className="w-[830px] h-7 flex justify-center items-center">
                      <div className="text-center justify-center text-gray-900 text-xl font-bold font-['Roboto'] leading-7">우리 건물 만족도 비교</div>
                    </div>
                  </div>
                  <div className="w-[830px] h-32 inline-flex justify-start items-start gap-6 flex-wrap content-start">
                    <div className="w-96 h-32 p-6 bg-purple-50 rounded-xl inline-flex flex-col justify-start items-start">
                      <div className="size- pb-2 inline-flex justify-start items-start">
                        <div className="w-96 h-9 flex justify-center items-center">
                          <div className="text-center justify-center text-purple-600 text-3xl font-bold font-['Roboto'] leading-9">
                            {diagnosisResult?.summary?.totalScore || 0}점
                          </div>
                        </div>
                      </div>
                      <div className="size- pb-2 inline-flex justify-start items-start">
                        <div className="w-96 h-5 flex justify-center items-center">
                          <div className="text-center justify-center text-violet-600 text-sm font-medium font-['Roboto'] leading-tight">내 점수</div>
                        </div>
                      </div>
                      <div className="w-96 h-4 inline-flex justify-center items-center">
                        <div className="text-center justify-center text-purple-600 text-xs font-normal font-['Roboto'] leading-none">설문 기반 평가</div>
                      </div>
                    </div>
                    <div className="w-96 h-32 p-6 bg-gray-50 rounded-xl inline-flex flex-col justify-start items-start">
                      <div className="size- pb-2 inline-flex justify-start items-start">
                        <div className="w-96 h-9 flex justify-center items-center">
                          <div className="text-center justify-center text-gray-600 text-3xl font-bold font-['Roboto'] leading-9">
                            {(diagnosisResult?.summary?.buildingAverage || 0).toFixed(0)}점
                          </div>
                        </div>
                      </div>
                      <div className="size- pb-2 inline-flex justify-start items-start">
                        <div className="w-96 h-5 flex justify-center items-center">
                          <div className="text-center justify-center text-gray-800 text-sm font-medium font-['Roboto'] leading-tight">우리 건물 평균</div>
                        </div>
                      </div>
                      <div className="w-96 h-4 inline-flex justify-center items-center">
                        <div className="text-center justify-center text-gray-600 text-xs font-normal font-['Roboto'] leading-none">
                          {diagnosisResult?.summary?.totalScore > diagnosisResult?.summary?.buildingAverage ? '평균보다 높음' : '평균보다 낮음'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="size- pt-6 inline-flex justify-start items-start">
                    <div className="w-[830px] h-14 p-4 bg-purple-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-purple-200 inline-flex flex-col justify-start items-start">
                      <div className="w-[796px] h-6 inline-flex justify-center items-center">
                        <div className="size- pr-2 flex justify-start items-start">
                          <div className="w-4 h-6 relative flex justify-center items-center">
                            <div className="size-4 left-[0.01px] top-[4px] absolute overflow-hidden">
                              <div className="w-2.5 h-3.5 left-[3px] top-[1px] absolute bg-purple-600" />
                            </div>
                          </div>
                        </div>
                        <div className="h-6 flex justify-center items-center">
                          <div className="text-center justify-center text-purple-600 text-base font-medium font-['Roboto'] leading-normal">
                            회원님의 집은 건물 평균보다 {Math.abs((diagnosisResult?.summary?.totalScore || 0) - (diagnosisResult?.summary?.buildingAverage || 0)).toFixed(0)}점 
                            {diagnosisResult?.summary?.totalScore > diagnosisResult?.summary?.buildingAverage ? ' 높습니다' : ' 낮습니다'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Objective Data Section */}
              {(recordedNoise || recordedLevel) && (
                <div className="w-[830px] h-auto mb-8">
                  <div className="bg-blue-50 rounded-2xl border-l-4 border-blue-500 p-6">
                    <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
                      <i className="ri-line-chart-line mr-2"></i>
                      📊 객관적 측정 데이터
                    </h4>
                    <div className="space-y-4">
                      {recordedNoise && (
                        <div className="bg-white rounded-lg p-4">
                          <div className="text-center mb-3">
                            <div className="text-3xl font-bold text-blue-600">{recordedNoise.split('dB')[0]}dB</div>
                            <div className="text-sm text-gray-600">실제 측정 소음</div>
                          </div>
                          <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-400">
                            <p className="text-sm text-gray-700">
                              <strong>🎯 협상 포인트:</strong> 실제 측정값 {recordedNoise.split('dB')[0]}dB는 환경부 주거지역 기준 55dB보다 {parseInt(recordedNoise.split('dB')[0]) - 55 > 0 ? `${parseInt(recordedNoise.split('dB')[0]) - 55}dB 높습니다` : '적정 수준입니다'}. 
                              {parseInt(recordedNoise.split('dB')[0]) - 55 > 0 ? ' → 소음 문제 해결 조치를 요청할 객관적 근거가 있습니다.' : ' → 현재 쾌적한 환경임을 증명할 수 있습니다.'}
                            </p>
                          </div>
                        </div>
                      )}
                      {recordedLevel && (
                        <div className="bg-white rounded-lg p-4">
                          <div className="text-center mb-3">
                            <div className="text-lg font-bold text-green-600">{recordedLevel.split('(')[0]}</div>
                            <div className="text-sm text-gray-600">바닥 수평 상태</div>
                          </div>
                          <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                            <p className="text-sm text-gray-700">
                              <strong>🎯 협상 포인트:</strong> 건물 기울기 측정으로 구조적 안전성을 확인했습니다. → 건물 관리 상태에 대한 객관적 증빙 자료로 활용 가능합니다.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Smart Diagnosis Enhancement Section */}
              {!showSmartDiagnosis && !(recordedNoise && recordedLevel) && (
                <div className="w-[830px] h-auto mb-8">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-smartphone-line text-2xl text-blue-600"></i>
                      </div>
                      <h4 className="text-lg font-bold text-gray-800 mb-2">더 정확한 진단을 원하나요?</h4>
                      <p className="text-gray-600 mb-4 text-sm">객관적 측정으로 협상 근거를 강화하세요!</p>
                      
                      <div className="flex gap-4 justify-center">
                        <button
                          onClick={() => setShowSmartDiagnosis(true)}
                          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
                        >
                          🎤 소음 측정하기
                        </button>
                        <button
                          onClick={() => setShowSmartDiagnosis(true)}
                          className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
                        >
                          📐 수평 확인하기
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA Section */}
              {(recordedNoise || recordedLevel) && (
                <div className="w-[830px] h-auto mb-8">
                  <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl p-6 text-white">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-lg font-bold mb-1">📄 객관적 데이터 확보 완료!</h4>
                        <p className="text-purple-100 text-sm">이제 강력한 협상 리포트를 만들어보세요</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">+10점</div>
                        <div className="text-xs text-purple-100">신뢰도 보너스</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="w-[830px] h-auto flex flex-col items-center gap-4">
                <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                  <button
                    onClick={() => router.push('/report')}
                    className="bg-purple-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-purple-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
                  >
                    <i className="ri-file-text-line mr-2"></i>
                    협상 리포트 생성
                  </button>
                  <button
                    onClick={() => setShowSmartDiagnosis(true)}
                    className="bg-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
                  >
                    <i className="ri-add-line mr-2"></i>
                    추가 측정하기
                  </button>
                </div>
                
                <button
                  onClick={() => router.push('/')}
                  className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                >
                  <i className="ri-home-line mr-2"></i>
                  메인으로 돌아가기
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Diagnosis Modal/Section */}
        {showSmartDiagnosis && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800">🔬 스마트 보조 진단</h3>
                  <button
                    onClick={() => setShowSmartDiagnosis(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <p className="text-gray-600 mt-2">객관적 데이터로 진단 신뢰도를 높이고 협상 근거를 강화하세요!</p>
              </div>
              
              <div className="p-6 space-y-8">
                {/* Noise Measurement */}
                <div className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <i className="ri-mic-line text-2xl text-blue-600 mr-3"></i>
                    <h4 className="text-xl font-semibold text-gray-800">🎤 소음 측정기</h4>
                  </div>
                  
                  <div className="flex flex-col items-center mb-6">
                    {/* Circular Gauge */}
                    <div className="relative w-40 h-40 mb-4">
                      <svg className="transform -rotate-90 w-40 h-40" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" stroke="#e5e7eb" strokeWidth="6" fill="none" />
                        {noiseLevel !== null && (
                          <circle
                            cx="50" cy="50" r="45"
                            stroke={
                              noiseLevel > 70 ? '#dc2626' : noiseLevel > 65 ? '#ea580c' : 
                              noiseLevel > 55 ? '#ca8a04' : noiseLevel > 45 ? '#16a34a' : '#059669'
                            }
                            strokeWidth="6" fill="none" strokeLinecap="round"
                            strokeDasharray={`${Math.min(100, Math.max(0, (noiseLevel / 80) * 100)) * 2.827} 282.7`}
                            className="transition-all duration-500"
                          />
                        )}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-2xl font-bold text-gray-800">
                          {noiseLevel !== null ? `${noiseLevel.toFixed(1)}` : '--'}
                        </div>
                        <div className="text-sm text-gray-600">dB</div>
                      </div>
                    </div>
                    
                    {noiseLevel !== null && (
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        noiseLevel > 70 ? 'bg-red-100 text-red-800' : noiseLevel > 65 ? 'bg-orange-100 text-orange-800' :
                        noiseLevel > 55 ? 'bg-yellow-100 text-yellow-800' : noiseLevel > 45 ? 'bg-green-100 text-green-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {noiseLevel > 70 ? '🔴 공업지역 수준' : noiseLevel > 65 ? '🟠 상업지역 수준' :
                         noiseLevel > 55 ? '🟡 주거지역 기준 초과' : noiseLevel > 45 ? '🟢 주거지역 적정' : '💚 매우 조용함'}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-3 mb-4">
                    <button onClick={startNoiseMeasurement} disabled={isMeasuringNoise}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">
                      {isMeasuringNoise ? '측정 중...' : '측정 시작'}
                    </button>
                    <button onClick={stopNoiseMeasurement} disabled={!isMeasuringNoise}
                      className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50">
                      중지
                    </button>
                  </div>
                  <button onClick={recordNoiseLevel} disabled={noiseLevel === null}
                    className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-semibold">
                    소음 레벨 기록하기
                  </button>
                </div>

                {/* Level Measurement */}
                <div className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <i className="ri-compass-line text-2xl text-green-600 mr-3"></i>
                    <h4 className="text-xl font-semibold text-gray-800">📐 수평계</h4>
                  </div>
                  
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
                          />
                        )}
                        
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            levelX !== null && levelY !== null && Math.abs(levelX) < 2 && Math.abs(levelY) < 2
                              ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {levelX !== null && levelY !== null && Math.abs(levelX) < 2 && Math.abs(levelY) < 2 ? '수평' : '기울어짐'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-xs text-gray-500">전후</div>
                        <div className="font-bold">{levelX !== null ? `${levelX.toFixed(1)}°` : '--°'}</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-xs text-gray-500">좌우</div>
                        <div className="font-bold">{levelY !== null ? `${levelY.toFixed(1)}°` : '--°'}</div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-xs text-gray-500">방위</div>
                        <div className="font-bold">{levelZ !== null ? `${levelZ.toFixed(0)}°` : '--°'}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mb-4">
                    <button onClick={startLevelMeasurement} disabled={isMeasuringLevel}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50">
                      {isMeasuringLevel ? '측정 중...' : '측정 시작'}
                    </button>
                    <button onClick={stopLevelMeasurement} disabled={!isMeasuringLevel}
                      className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50">
                      중지
                    </button>
                  </div>
                  <button onClick={recordLevel} disabled={levelX === null}
                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-semibold">
                    수평 정보 기록하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom spacing */}
        <div className="size- pt-6 inline-flex justify-start items-start">
          <div className="w-[896px] h-5 inline-flex flex-col justify-start items-start">
            <div className="w-[896px] h-5 inline-flex justify-center items-center">
              <div className="text-center justify-center text-gray-500 text-sm font-normal font-['Roboto'] leading-tight">
                {recordedNoise || recordedLevel ? '객관적 데이터가 추가되어 진단 신뢰도가 향상되었습니다!' : '스마트 측정으로 더 정확한 진단을 받아보세요!'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}