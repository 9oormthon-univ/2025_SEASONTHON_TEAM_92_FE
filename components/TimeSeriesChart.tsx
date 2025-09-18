'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { realEstateApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface TimeSeriesData {
  period: string;
  averageRent: number;
  transactionCount: number;
  yearMonth: string;
}

interface AnalysisData {
  totalChangeRate: number;
  monthlyChangeRate: number;
  startPeriod: string;
  endPeriod: string;
  startRent: number;
  endRent: number;
  trend: string;
  buildingType?: string;
}

interface TimeSeriesChartProps {
  buildingType: string;
  lawdCd: string;
  months?: number;
}

export default function TimeSeriesChart({ buildingType, lawdCd, months = 24 }: TimeSeriesChartProps) {
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMockData, setIsMockData] = useState(false);

  useEffect(() => {
    const fetchTimeSeriesData = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await realEstateApi.getTimeSeriesAnalysis(buildingType, lawdCd, months);
        
        if (response.success && response.data) {
          setTimeSeriesData(response.data.timeSeries || []);
          setAnalysis(response.data.analysis || null);
          setIsMockData(response.data.isMockData || false);
        } else {
          throw new Error(response.message || '시계열 데이터를 불러올 수 없습니다.');
        }
        
      } catch (err: any) {
        console.error('Time series data fetch error:', err);
        setError(err.message || '시계열 데이터 로딩 중 오류가 발생했습니다.');
        toast.error('시계열 데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    if (buildingType && lawdCd) {
      fetchTimeSeriesData();
    }
  }, [buildingType, lawdCd, months]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-violet-200 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">시계열 분석 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-2xl text-red-600"></i>
          </div>
          <h3 className="text-lg font-bold text-red-600 mb-2">데이터 로딩 실패</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!timeSeriesData.length) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-bar-chart-line text-2xl text-gray-400"></i>
          </div>
          <h3 className="text-lg font-bold text-gray-600 mb-2">데이터 없음</h3>
          <p className="text-gray-500">해당 지역의 시계열 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  // 차트 데이터 포맷팅 (월세를 만원 단위로 변환)
  const chartData = timeSeriesData.map(item => ({
    ...item,
    averageRentDisplay: Math.round(item.averageRent / 10000), // 만원 단위
    fullRent: item.averageRent
  }));

  const formatTooltip = (value: any, name: string) => {
    if (name === 'averageRentDisplay') {
      return [`${value}만원`, '평균 월세'];
    }
    return [value, name];
  };

  const formatXAxis = (tickItem: string) => {
    return tickItem.substring(2); // "2023-01" → "23-01"
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-violet-200 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mr-4">
            <i className="ri-line-chart-line text-2xl text-white"></i>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">월세 추이 분석</h3>
            <p className="text-gray-600 text-sm">{buildingType} • {analysis?.startPeriod} ~ {analysis?.endPeriod}</p>
          </div>
        </div>
        {isMockData && (
          <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium">
            데모 데이터
          </div>
        )}
      </div>

      {/* 핵심 지표 */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {analysis.totalChangeRate > 0 ? '+' : ''}{analysis.totalChangeRate}%
            </div>
            <div className="text-sm text-gray-600">총 상승률</div>
          </div>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600 mb-1">
              {Math.round((analysis.endRent - analysis.startRent) / 10000)}만원
            </div>
            <div className="text-sm text-gray-600">가격 상승폭</div>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-amber-600 mb-1">
              {analysis.monthlyChangeRate > 0 ? '+' : ''}{analysis.monthlyChangeRate}%
            </div>
            <div className="text-sm text-gray-600">월평균 상승률</div>
          </div>
          <div className={`rounded-lg p-4 text-center ${
            analysis.trend === '상승' ? 'bg-red-50' : 
            analysis.trend === '하락' ? 'bg-blue-50' : 'bg-gray-50'
          }`}>
            <div className={`text-2xl font-bold mb-1 ${
              analysis.trend === '상승' ? 'text-red-600' : 
              analysis.trend === '하락' ? 'text-blue-600' : 'text-gray-600'
            }`}>
              {analysis.trend === '상승' ? '📈' : analysis.trend === '하락' ? '📉' : '📊'}
            </div>
            <div className="text-sm text-gray-600">{analysis.trend} 추세</div>
          </div>
        </div>
      )}

      {/* 시계열 차트 */}
      <div className="h-80 mb-6" style={{ width: '100%', height: '320px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="rentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9333EA" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#9333EA" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="period" 
              tickFormatter={formatXAxis}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              domain={['dataMin - 5', 'dataMax + 5']}
              tickFormatter={(value) => `${value}만원`}
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip 
              formatter={formatTooltip}
              labelFormatter={(label) => `${label} 월`}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Area
              type="monotone"
              dataKey="averageRentDisplay"
              stroke="#9333EA"
              strokeWidth={3}
              fill="url(#rentGradient)"
              dot={{ fill: '#9333EA', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#9333EA', strokeWidth: 2, fill: '#ffffff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 분석 인사이트 */}
      {analysis && (
        <div className="space-y-4">
          {/* 트렌드 분석 */}
          <div className={`p-6 rounded-xl border-2 ${
            analysis.trend === '상승' ? 'bg-red-50 border-red-200' : 
            analysis.trend === '하락' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                analysis.trend === '상승' ? 'bg-red-500' : 
                analysis.trend === '하락' ? 'bg-blue-500' : 'bg-gray-500'
              }`}>
                <i className={`text-white text-xl ${
                  analysis.trend === '상승' ? 'ri-trending-up-line' : 
                  analysis.trend === '하락' ? 'ri-trending-down-line' : 'ri-subtract-line'
                }`}></i>
              </div>
              <div>
                <h4 className={`font-bold text-lg ${
                  analysis.trend === '상승' ? 'text-red-800' : 
                  analysis.trend === '하락' ? 'text-blue-800' : 'text-gray-800'
                }`}>
                  {analysis.trend} 추세 확인
                </h4>
                <p className="text-gray-600 text-sm">
                  {analysis.startPeriod}부터 {analysis.endPeriod}까지 {months}개월간 분석
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">
                <strong className="text-gray-900">분석 결과:</strong> 
                {analysis.trend === '상승' && analysis.totalChangeRate > 10 && (
                  <>
                    해당 지역 {buildingType} 월세가 {months}개월간 <span className="font-bold text-red-600">{analysis.totalChangeRate}% 상승</span>했습니다. 
                    이는 월평균 {analysis.monthlyChangeRate}%의 가파른 상승세로, 
                    <span className="font-bold text-purple-600"> 현재 시장이 과열 상태임을 시사합니다.</span>
                  </>
                )}
                {analysis.trend === '상승' && analysis.totalChangeRate <= 10 && (
                  <>
                    해당 지역 {buildingType} 월세가 {months}개월간 <span className="font-bold text-amber-600">{analysis.totalChangeRate}% 완만히 상승</span>했습니다. 
                    이는 <span className="font-bold text-green-600">안정적인 시장 상승세</span>로 평가됩니다.
                  </>
                )}
                {analysis.trend === '하락' && (
                  <>
                    해당 지역 {buildingType} 월세가 {months}개월간 <span className="font-bold text-blue-600">{Math.abs(analysis.totalChangeRate)}% 하락</span>했습니다. 
                    <span className="font-bold text-green-600">협상에 유리한 시장 상황</span>입니다.
                  </>
                )}
                {analysis.trend === '보합' && (
                  <>
                    해당 지역 {buildingType} 월세가 {months}개월간 <span className="font-bold text-gray-600">안정적으로 유지</span>되고 있습니다.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* 협상 활용 가이드 */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                <i className="ri-lightbulb-line text-xl text-white"></i>
              </div>
              <h4 className="font-bold text-purple-800 text-lg">💼 협상에서 이렇게 활용하세요</h4>
            </div>
            
            <div className="bg-white rounded-lg p-4 space-y-3">
              {analysis.trend === '상승' && analysis.totalChangeRate > 10 && (
                <>
                  <div className="flex items-start">
                    <i className="ri-number-1 text-purple-600 mr-2 mt-1"></i>
                    <span className="text-gray-700">
                      <strong>시장 과열 근거:</strong> "{months}개월간 {analysis.totalChangeRate}% 급등으로 시장이 과열 상태입니다"
                    </span>
                  </div>
                  <div className="flex items-start">
                    <i className="ri-number-2 text-purple-600 mr-2 mt-1"></i>
                    <span className="text-gray-700">
                      <strong>적정가 요구:</strong> "시장 안정화를 위해 {analysis.startPeriod} 수준으로 조정을 제안합니다"
                    </span>
                  </div>
                  <div className="flex items-start">
                    <i className="ri-number-3 text-purple-600 mr-2 mt-1"></i>
                    <span className="text-gray-700">
                      <strong>장기 계약 제안:</strong> "추가 상승 방지를 위해 2년 장기계약을 제안합니다"
                    </span>
                  </div>
                </>
              )}
              
              {analysis.trend === '상승' && analysis.totalChangeRate <= 10 && (
                <>
                  <div className="flex items-start">
                    <i className="ri-number-1 text-purple-600 mr-2 mt-1"></i>
                    <span className="text-gray-700">
                      <strong>안정적 상승:</strong> "시장이 안정적으로 성장하고 있어 현재 가격이 적정합니다"
                    </span>
                  </div>
                  <div className="flex items-start">
                    <i className="ri-number-2 text-purple-600 mr-2 mt-1"></i>
                    <span className="text-gray-700">
                      <strong>시설 개선 요구:</strong> "가격 상승분만큼 시설 개선을 요청할 수 있습니다"
                    </span>
                  </div>
                </>
              )}

              {analysis.trend === '하락' && (
                <>
                  <div className="flex items-start">
                    <i className="ri-number-1 text-purple-600 mr-2 mt-1"></i>
                    <span className="text-gray-700">
                      <strong>시장 하락 근거:</strong> "시장 평균이 하락하고 있어 월세 조정이 필요합니다"
                    </span>
                  </div>
                  <div className="flex items-start">
                    <i className="ri-number-2 text-purple-600 mr-2 mt-1"></i>
                    <span className="text-gray-700">
                      <strong>적극적 협상:</strong> "현재가 협상에 가장 유리한 시점입니다"
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 상세 데이터 표 */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center">
              <i className="ri-table-line mr-2"></i>
              월별 상세 데이터
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-600">기간</th>
                    <th className="text-right py-2 text-gray-600">평균 월세</th>
                    <th className="text-right py-2 text-gray-600">거래 건수</th>
                    <th className="text-right py-2 text-gray-600">전월 대비</th>
                  </tr>
                </thead>
                <tbody>
                  {(timeSeriesData || []).slice(-6).map((item, index, array) => {
                    const prevItem = index > 0 ? array[index - 1] : null;
                    const changeFromPrev = prevItem ? 
                      ((item.averageRent - prevItem.averageRent) / prevItem.averageRent * 100) : 0;
                    
                    return (
                      <tr key={item.period} className="border-b border-gray-100">
                        <td className="py-3 text-gray-800 font-medium">{item.period}</td>
                        <td className="py-3 text-right text-gray-900 font-semibold">
                          {(item.averageRent / 10000).toFixed(0)}만원
                        </td>
                        <td className="py-3 text-right text-gray-600">{item.transactionCount}건</td>
                        <td className={`py-3 text-right font-medium ${
                          changeFromPrev > 2 ? 'text-red-600' :
                          changeFromPrev > 0 ? 'text-amber-600' :
                          changeFromPrev < -2 ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                          {prevItem ? (
                            <>
                              {changeFromPrev > 0 ? '+' : ''}{changeFromPrev.toFixed(1)}%
                            </>
                          ) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-xs text-gray-500 text-center">
              최근 6개월 데이터만 표시됩니다 • 전체 {timeSeriesData.length}개월 데이터 분석
            </div>
          </div>
        </div>
      )}
    </div>
  );
}