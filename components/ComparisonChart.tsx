import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
interface ComparisonChartProps {
  stats: any;
}

const formatQuestionId = (questionId: string): string => {
    // 카테고리 ID를 기반으로 한글 이름 반환
    const categoryId = parseInt(questionId);
    switch (categoryId) {
        case 1: return "소음";
        case 2: return "수압";
        case 3: return "채광";
        case 4: return "주차";
        case 5: return "난방";
        case 6: return "환기";
        case 7: return "보안";
        case 8: return "관리";
        case 9: return "편의성";
        case 10: return "인터넷";
        default: return `카테고리 ${categoryId}`;
    }
};

const ComparisonChart: React.FC<ComparisonChartProps> = ({ stats }) => {
    const chartData = Object.keys(stats?.userScores || {}).map(key => ({
        name: formatQuestionId(key),
        '나의 점수': stats.userScores[key]?.toFixed(1),
        '건물 평균': stats.buildingAverageScores[key]?.toFixed(1),
        '동네 평균': stats.neighborhoodAverageScores[key]?.toFixed(1),
    }));

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart
                    data={chartData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="나의 점수" fill="#8884d8" />
                    <Bar dataKey="건물 평균" fill="#82ca9d" />
                    <Bar dataKey="동네 평균" fill="#ffc658" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ComparisonChart;
