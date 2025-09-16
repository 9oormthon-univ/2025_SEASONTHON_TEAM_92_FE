'use client';

import { useState, useEffect, useRef } from 'react';
import { smartDiagnosisApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface LevelMeasurementToolProps {
  onComplete: (data: any) => void;
  onClose: () => void;
}

export default function LevelMeasurementTool({ onComplete, onClose }: LevelMeasurementToolProps) {
  const [phase, setPhase] = useState<'preparation' | 'measuring' | 'complete'>('preparation');
  const [measurementId, setMeasurementId] = useState<number | null>(null);
  const [orientation, setOrientation] = useState({ x: 0, y: 0, z: 0 });
  const [levelData, setLevelData] = useState<{x: number, y: number, z: number}[]>([]);
  const [averageLevel, setAverageLevel] = useState({ x: 0, y: 0, z: 0 });
  const [isSupported, setIsSupported] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const measurementTimerRef = useRef<NodeJS.Timeout | null>(null);

  const calculateLevel = (x: number, y: number, z: number): number => {
    // 3D 벡터의 크기 계산 (기울기 정도)
    return Math.sqrt(x * x + y * y + z * z);
  };

  const getLevelCategory = (level: number): { grade: string; color: string; description: string } => {
    if (level < 1) return { grade: '완벽', color: '#10b981', description: '거의 수평' };
    if (level < 2) return { grade: '우수', color: '#34d399', description: '매우 양호' };
    if (level < 3) return { grade: '양호', color: '#fbbf24', description: '가구 배치 적합' };
    if (level < 5) return { grade: '보통', color: '#f59e0b', description: '약간의 기울기' };
    return { grade: '주의', color: '#ef4444', description: '기울기가 큼' };
  };

  const startMeasurement = async () => {
    try {
      // 백엔드에 측정 시작 알림
      const response = await smartDiagnosisApi.startLevelMeasurement('실내');
      if (response.success) {
        setMeasurementId(response.data.measurementId);
      }

      // 기기 방향 센서 접근
      if ('DeviceOrientationEvent' in window) {
        const handleOrientation = (event: DeviceOrientationEvent) => {
          const x = event.beta || 0;  // 전후 기울기
          const y = event.gamma || 0; // 좌우 기울기
          const z = event.alpha || 0;  // 회전

          setOrientation({ x, y, z });
          setLevelData(prev => [...prev, { x, y, z }]);

          // 실시간 데이터를 백엔드로 전송
          if (measurementId) {
            smartDiagnosisApi.processLevelMeasurement(measurementId, x, y, z)
              .catch(console.error);
          }
        };

        // iOS Safari 권한 요청
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          } else {
            toast.error('기기 방향 센서 권한이 필요합니다.');
            return;
          }
        } else {
          window.addEventListener('deviceorientation', handleOrientation);
        }

        setPhase('measuring');

        // 3초 후 측정 완료
        measurementTimerRef.current = setTimeout(() => {
          completeMeasurement();
        }, 3000);

      } else {
        setIsSupported(false);
        toast.error('이 기기는 방향 센서를 지원하지 않습니다.');
      }

    } catch (error) {
      console.error('방향 센서 접근 실패:', error);
      toast.error('방향 센서 접근에 실패했습니다.');
    }
  };

  const completeMeasurement = async () => {
    // 이벤트 리스너 제거
    window.removeEventListener('deviceorientation', () => {});

    if (measurementTimerRef.current) {
      clearTimeout(measurementTimerRef.current);
    }

    // 평균 계산
    if (levelData.length > 0) {
      const avgX = levelData.reduce((sum, data) => sum + data.x, 0) / levelData.length;
      const avgY = levelData.reduce((sum, data) => sum + data.y, 0) / levelData.length;
      const avgZ = levelData.reduce((sum, data) => sum + data.z, 0) / levelData.length;
      
      setAverageLevel({ x: avgX, y: avgY, z: avgZ });
    }

    setPhase('complete');
    toast.success('수평 측정이 완료되었습니다!');
  };

  const resetMeasurement = () => {
    setPhase('preparation');
    setOrientation({ x: 0, y: 0, z: 0 });
    setLevelData([]);
    setAverageLevel({ x: 0, y: 0, z: 0 });
    setMeasurementId(null);
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', () => {});
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (measurementTimerRef.current) {
        clearTimeout(measurementTimerRef.current);
      }
    };
  }, []);

  const currentLevel = calculateLevel(orientation.x, orientation.y, orientation.z);
  const currentCategory = getLevelCategory(currentLevel);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-800">📐 수평계</h3>
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
              <div className="text-6xl mb-4">📐</div>
              <h4 className="text-xl font-semibold text-gray-800">측정 준비</h4>
              <div className="bg-green-50 rounded-xl p-6 text-left">
                <h5 className="font-semibold text-green-800 mb-3">📋 측정 안내</h5>
                <ul className="text-green-700 space-y-2 text-sm">
                  <li>• 바닥의 평평한 곳에 휴대폰을 올려두세요</li>
                  <li>• 3초 후 측정이 자동으로 시작됩니다</li>
                  <li>• 측정 중에는 휴대폰을 움직이지 마세요</li>
                  <li>• 기기 방향 센서 권한이 필요합니다</li>
                </ul>
              </div>
              <button
                onClick={startMeasurement}
                className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
              >
                측정 시작하기
              </button>
            </div>
          )}

          {phase === 'measuring' && (
            <div className="text-center space-y-6">
              <div className="relative w-64 h-64 mx-auto mb-6">
                {/* 디지털 물방울 수평계 */}
                <div className="w-full h-full border-4 border-gray-300 rounded-full relative overflow-hidden"
                     style={{ backgroundColor: currentCategory.color + '20' }}>
                  
                  {/* 중심 원 */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gray-400 rounded-full"></div>
                  
                  {/* 물방울 (기울기에 따라 움직임) */}
                  <div
                    className="absolute w-6 h-6 bg-blue-500 rounded-full transition-all duration-200"
                    style={{
                      top: `calc(50% + ${orientation.y * 2}px)`,
                      left: `calc(50% + ${orientation.x * 2}px)`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  ></div>
                  
                  {/* 격자 */}
                  <div className="absolute inset-0">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300"></div>
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300"></div>
                  </div>
                </div>
              </div>

              {/* 실시간 수치 */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-gray-600">X축</div>
                    <div className="font-bold text-blue-600">{orientation.x.toFixed(1)}°</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Y축</div>
                    <div className="font-bold text-green-600">{orientation.y.toFixed(1)}°</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">기울기</div>
                    <div className="font-bold text-purple-600">{currentLevel.toFixed(1)}°</div>
                  </div>
                </div>
              </div>

              {/* 상태 표시 */}
              <div className="text-center">
                <div className="text-lg font-semibold mb-2" style={{ color: currentCategory.color }}>
                  {currentCategory.grade} - {currentCategory.description}
                </div>
                <div className="text-sm text-gray-600">
                  측정 중... 휴대폰을 움직이지 마세요
                </div>
              </div>

              {/* 측정 진행 표시 */}
              <div className="flex justify-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}

          {phase === 'complete' && (
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4">✅</div>
              <h4 className="text-2xl font-bold text-gray-800">측정 완료!</h4>
              
              <div className="bg-green-50 rounded-xl p-6">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  바닥 기울기: {calculateLevel(averageLevel.x, averageLevel.y, averageLevel.z).toFixed(1)}°
                </div>
                <div className="text-lg text-green-700 mb-4">
                  {getLevelCategory(calculateLevel(averageLevel.x, averageLevel.y, averageLevel.z)).grade} 
                  ({getLevelCategory(calculateLevel(averageLevel.x, averageLevel.y, averageLevel.z)).description})
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-gray-600">X축 기울기</div>
                    <div className="font-bold text-blue-600">{averageLevel.x.toFixed(1)}°</div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-gray-600">Y축 기울기</div>
                    <div className="font-bold text-green-600">{averageLevel.y.toFixed(1)}°</div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-gray-600">전체 기울기</div>
                    <div className="font-bold text-purple-600">{calculateLevel(averageLevel.x, averageLevel.y, averageLevel.z).toFixed(1)}°</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 text-left">
                <h5 className="font-semibold text-blue-800 mb-2">💡 해석</h5>
                <p className="text-blue-700 text-sm">
                  {calculateLevel(averageLevel.x, averageLevel.y, averageLevel.z) < 2 
                    ? '바닥이 매우 평평합니다. 가구 배치에 적합한 상태입니다.'
                    : calculateLevel(averageLevel.x, averageLevel.y, averageLevel.z) < 5
                    ? '약간의 기울기가 있지만 일반적인 수준입니다.'
                    : '기울기가 있어 가구 배치 시 주의가 필요합니다.'
                  }
                </p>
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
                    type: 'level',
                    x: averageLevel.x,
                    y: averageLevel.y,
                    z: averageLevel.z,
                    totalLevel: calculateLevel(averageLevel.x, averageLevel.y, averageLevel.z),
                    category: getLevelCategory(calculateLevel(averageLevel.x, averageLevel.y, averageLevel.z))
                  })}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  완료
                </button>
              </div>
            </div>
          )}

          {!isSupported && (
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4">❌</div>
              <h4 className="text-xl font-semibold text-gray-800">지원되지 않는 기기</h4>
              <div className="bg-red-50 rounded-xl p-6">
                <p className="text-red-700">
                  이 기기는 방향 센서를 지원하지 않습니다.<br/>
                  다른 기기에서 다시 시도해주세요.
                </p>
              </div>
              <button
                onClick={onClose}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                닫기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}