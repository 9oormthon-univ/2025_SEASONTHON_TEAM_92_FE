'use client';

import { useState, useEffect, useRef } from 'react';
import { smartDiagnosisApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface NoiseMeasurementToolProps {
  onComplete: (data: any) => void;
  onClose: () => void;
}

export default function NoiseMeasurementTool({ onComplete, onClose }: NoiseMeasurementToolProps) {
  const [phase, setPhase] = useState<'preparation' | 'measuring' | 'complete'>('preparation');
  const [noiseLevel, setNoiseLevel] = useState<number | null>(null);
  const [measurementId, setMeasurementId] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [noiseData, setNoiseData] = useState<number[]>([]);
  const [averageNoise, setAverageNoise] = useState<number>(0);
  const [maxNoise, setMaxNoise] = useState<number>(0);
  const [minNoise, setMinNoise] = useState<number>(100);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getNoiseCategory = (db: number): { level: string; color: string; description: string } => {
    if (db < 30) return { level: '매우 조용함', color: '#10b981', description: '도서관 수준' };
    if (db < 40) return { level: '조용함', color: '#34d399', description: '조용한 주택가' };
    if (db < 50) return { level: '보통', color: '#fbbf24', description: '일반적인 실내' };
    if (db < 60) return { level: '약간 시끄러움', color: '#f59e0b', description: '대화에 약간 방해' };
    if (db < 70) return { level: '시끄러움', color: '#ef4444', description: '대화에 방해됨' };
    return { level: '매우 시끄러움', color: '#dc2626', description: '집중하기 어려움' };
  };

  const startMeasurement = async () => {
    try {
      // 백엔드에 측정 시작 알림
      const response = await smartDiagnosisApi.startNoiseMeasurement('실내', 15);
      if (response.success) {
        setMeasurementId(response.data.measurementId);
      }

      // 마이크 접근
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const measureNoise = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);
        
        // RMS 계산
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / dataArray.length);
        const db = 20 * Math.log10(rms / 255);
        const adjustedDb = db === -Infinity ? 0 : Math.max(0, db + 100);

        setNoiseLevel(adjustedDb);
        setNoiseData(prev => [...prev, adjustedDb]);
        setMaxNoise(prev => Math.max(prev, adjustedDb));
        setMinNoise(prev => Math.min(prev, adjustedDb));

        // 실시간 데이터를 백엔드로 전송
        if (measurementId) {
          smartDiagnosisApi.processRealtimeNoise(
            measurementId,
            adjustedDb,
            new Date().toISOString()
          ).catch(console.error);
        }

        animationRef.current = requestAnimationFrame(measureNoise);
      };

      measureNoise();
      setPhase('measuring');

      // 타이머 시작
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            completeMeasurement();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      timerRef.current = timer;

    } catch (error) {
      console.error('마이크 접근 실패:', error);
      toast.error('마이크 접근에 실패했습니다. 권한을 허용해주세요.');
    }
  };

  const completeMeasurement = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const avg = noiseData.reduce((sum, val) => sum + val, 0) / noiseData.length;
    setAverageNoise(avg);

    // 백엔드에 측정 완료 알림
    if (measurementId) {
      try {
        await smartDiagnosisApi.completeNoiseMeasurement(
          measurementId,
          avg,
          maxNoise,
          minNoise
        );
      } catch (error) {
        console.error('측정 완료 전송 실패:', error);
      }
    }

    setPhase('complete');
    toast.success('소음 측정이 완료되었습니다!');
  };

  const resetMeasurement = () => {
    setPhase('preparation');
    setNoiseLevel(null);
    setTimeLeft(15);
    setNoiseData([]);
    setAverageNoise(0);
    setMaxNoise(0);
    setMinNoise(100);
    setMeasurementId(null);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const currentCategory = noiseLevel ? getNoiseCategory(noiseLevel) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-800">🔊 소음 측정기</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {phase === 'preparation' && (
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4">🎤</div>
              <h4 className="text-xl font-semibold text-gray-800">측정 준비</h4>
              <div className="bg-blue-50 rounded-xl p-6 text-left">
                <h5 className="font-semibold text-blue-800 mb-3">📋 측정 안내</h5>
                <ul className="text-blue-700 space-y-2 text-sm">
                  <li>• 조용한 상태에서 15초간 측정합니다</li>
                  <li>• 주변 소음이 없는 환경에서 시작해주세요</li>
                  <li>• 마이크 권한을 허용해주세요</li>
                  <li>• 측정 중에는 조용히 유지해주세요</li>
                </ul>
              </div>
              <button
                onClick={startMeasurement}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
              >
                측정 시작하기
              </button>
            </div>
          )}

          {phase === 'measuring' && (
            <div className="text-center space-y-6">
              <div className="relative w-64 h-64 mx-auto mb-6">
                {/* 원형 게이지 */}
                <svg className="transform -rotate-90 w-64 h-64" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" stroke="#e5e7eb" strokeWidth="6" fill="none" />
                  {noiseLevel !== null && (
                    <circle
                      cx="50" cy="50" r="45"
                      stroke={currentCategory?.color || '#3b82f6'}
                      strokeWidth="6" fill="none" strokeLinecap="round"
                      strokeDasharray={`${Math.min(100, Math.max(0, (noiseLevel / 80) * 100)) * 2.827} 282.7`}
                      className="transition-all duration-300"
                    />
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-bold text-gray-800">
                    {noiseLevel ? Math.round(noiseLevel) : 0}
                  </div>
                  <div className="text-lg text-gray-600">dB</div>
                  <div className="text-sm text-gray-500 mt-2">
                    {currentCategory?.level || '측정 중...'}
                  </div>
                </div>
              </div>

              {/* 타이머 */}
              <div className="text-center">
                <div className="text-6xl font-bold text-blue-600 mb-2">{timeLeft}</div>
                <div className="text-gray-600">초 남음</div>
              </div>

              {/* 실시간 상태 */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-800 mb-2">
                    {currentCategory?.description || '측정 중...'}
                  </div>
                  <div className="text-sm text-gray-600">
                    현재 소음 수준: {noiseLevel ? Math.round(noiseLevel) : 0}dB
                  </div>
                </div>
              </div>

              {/* 진행률 바 */}
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${((15 - timeLeft) / 15) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {phase === 'complete' && (
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4">✅</div>
              <h4 className="text-2xl font-bold text-gray-800">측정 완료!</h4>
              
              <div className="bg-green-50 rounded-xl p-6">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  평균 소음: {Math.round(averageNoise)}dB
                </div>
                <div className="text-lg text-green-700 mb-4">
                  {getNoiseCategory(averageNoise).level} ({getNoiseCategory(averageNoise).description})
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-gray-600">최대</div>
                    <div className="font-bold text-red-600">{Math.round(maxNoise)}dB</div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-gray-600">평균</div>
                    <div className="font-bold text-blue-600">{Math.round(averageNoise)}dB</div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-gray-600">최소</div>
                    <div className="font-bold text-green-600">{Math.round(minNoise)}dB</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={resetMeasurement}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  다시 측정
                </button>
                <button
                  onClick={() => onComplete({
                    type: 'noise',
                    averageNoise,
                    maxNoise,
                    minNoise,
                    category: getNoiseCategory(averageNoise)
                  })}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  완료
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}