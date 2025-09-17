'use client';

import WeeklyMission from '../../components/WeeklyMission';
import MissionResult from '../../components/MissionResult';
import { useState } from 'react';

interface MissionData {
  userScore: number;
  buildingAverage: number;
  neighborhoodAverage: number;
  buildingComparison: any;
  neighborhoodComparison: any;
}

export default function WeeklyMissionPage() {
  const [showResult, setShowResult] = useState(false);
  const [missionData, setMissionData] = useState<MissionData | null>(null);

  const handleMissionComplete = () => {
    // 미션 완료 후 결과 데이터 설정
    setMissionData({
      userScore: 68,
      buildingAverage: 72,
      neighborhoodAverage: 74,
      buildingComparison: null,
      neighborhoodComparison: null
    });
    setShowResult(true);
  };

  const handleBackToMain = () => {
    setShowResult(false);
    setMissionData(null);
  };

  if (showResult && missionData) {
    return (
      <MissionResult
        userScore={missionData.userScore}
        buildingAverage={missionData.buildingAverage}
        neighborhoodAverage={missionData.neighborhoodAverage}
        buildingComparison={missionData.buildingComparison}
        neighborhoodComparison={missionData.neighborhoodComparison}
        onBackToMain={handleBackToMain}
      />
    );
  }

  return (
    <WeeklyMission
      currentUser={{ id: '1', email: 'user@example.com', nickname: '사용자', role: 'tenant' }}
      onComplete={handleMissionComplete}
    />
  );
}