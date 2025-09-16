'use client';

import { useState } from 'react';
import { smartDiagnosisApi } from '@/lib/api';
import toast from 'react-hot-toast';
import NoiseMeasurementTool from './NoiseMeasurementTool';
import LevelMeasurementTool from './LevelMeasurementTool';
import InternetSpeedTool from './InternetSpeedTool';

interface SmartDiagnosisToolsProps {
  onMeasurementComplete?: (type: string, data: any) => void;
}

export default function SmartDiagnosisTools({ onMeasurementComplete }: SmartDiagnosisToolsProps) {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const tools = [
    {
      id: 'noise',
      icon: '🔊',
      title: '소음 측정기',
      description: '주변 소음 측정',
      duration: '15초',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      id: 'level',
      icon: '📐',
      title: '수평계',
      description: '바닥 기울기 측정',
      duration: '3초',
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700'
    },
    {
      id: 'internet',
      icon: '🚀',
      title: '인터넷 속도',
      description: '네트워크 속도 측정',
      duration: '10초',
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700'
    }
  ];

  const handleToolSelect = (toolId: string) => {
    setActiveTool(toolId);
  };

  const handleMeasurementComplete = (type: string, data: any) => {
    onMeasurementComplete?.(type, data);
    setActiveTool(null);
  };

  const handleClose = () => {
    setActiveTool(null);
  };

  return (
    <div className="w-full">
      {/* 도구 선택 화면 */}
      {!activeTool && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">🔬 스마트 진단 도구</h2>
            <p className="text-gray-600">전문적인 측정 도구로 객관적 데이터를 수집하세요</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                onClick={() => handleToolSelect(tool.id)}
              >
                <div className={`bg-gradient-to-br ${tool.color} ${tool.hoverColor} rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-all duration-300`}>
                  <div className="text-center">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      {tool.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{tool.title}</h3>
                    <p className="text-blue-100 mb-3">{tool.description}</p>
                    <div className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
                      ⏱️ {tool.duration}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              💡 측정된 데이터는 협상 리포트에 자동으로 반영됩니다
            </p>
          </div>
        </div>
      )}

      {/* 측정 도구 화면 */}
      {activeTool === 'noise' && (
        <NoiseMeasurementTool
          onComplete={(data) => handleMeasurementComplete('noise', data)}
          onClose={handleClose}
        />
      )}

      {activeTool === 'level' && (
        <LevelMeasurementTool
          onComplete={(data) => handleMeasurementComplete('level', data)}
          onClose={handleClose}
        />
      )}

      {activeTool === 'internet' && (
        <InternetSpeedTool
          onComplete={(data) => handleMeasurementComplete('internet', data)}
          onClose={handleClose}
        />
      )}
    </div>
  );
}