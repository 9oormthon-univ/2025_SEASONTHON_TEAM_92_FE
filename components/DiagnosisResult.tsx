import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { User } from '../types';
import { diagnosisApi } from '../lib/api';
import ComparisonChart from './ComparisonChart'; // Import the new chart component

interface DiagnosisResultProps {
  currentUser: User;
  result?: any;
  onGenerateReport?: () => void;
}

export default function DiagnosisResult({ currentUser }: DiagnosisResultProps) {
    const [stats, setStats] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (currentUser.id) {
            fetchStats();
        }
    }, [currentUser.id]);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const response = await diagnosisApi.getResult();
            console.log('진단 결과 응답:', response);
            
            if (response.success && response.data) {
                setStats(response.data);
            } else {
                toast.error(response.message || '결과를 불러오는 데 실패했습니다.');
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            toast.error('네트워크 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">결과를 분석하고 있습니다...</p>
            </div>
        );
    }

    if (!stats || !stats.userScores) {
        return <div className="text-center py-10 text-red-500">결과를 불러올 수 없습니다.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-4">
            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900">거주 환경 진단 결과</h2>
                <p className="mt-2 text-lg text-gray-500">나의 환경과 이웃의 환경을 시각적으로 비교해보세요.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold text-gray-800 mb-4">종합 비교 분석 그래프</h3>
                <ComparisonChart stats={stats} />
            </div>
        </div>
    );
}
