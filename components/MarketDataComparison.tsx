'use client';

import { useState, useEffect } from 'react';
import { officetelApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface MarketDataComparisonProps {
  userRent: number;
  userAddress?: string;
  isPremium?: boolean;
}

interface MarketData {
  neighborhood: string;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  transactionCount: number;
  pricePerSquareMeter: number;
}

interface TransactionData {
  buildingName: string;
  contractDate: string;
  contractType: string;
  contractTerm: string;
  deposit: number;
  monthlyRent: number;
  area: number;
  floor: number;
}

export default function MarketDataComparison({ userRent, userAddress }: MarketDataComparisonProps) {
  const [marketData, setMarketData] = useState<{
    monthlyRentMarket: MarketData[];
    jeonseMarket: MarketData[];
    transactions: TransactionData[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadMarketData = async (customLawdCd?: string) => {
    try {
      setIsLoading(true);
      
      // 사용자 위치 기반 법정동 코드 추출
      let lawdCd = customLawdCd || '11410'; // 기본값: 마포구
      
      if (userAddress) {
        const addressMapping: {[key: string]: string} = {
          '강남구': '11680', '강서구': '11500', '구로구': '11530', '금천구': '11545',
          '노원구': '11350', '도봉구': '11320', '동대문구': '11230', '동작구': '11590',
          '마포구': '11410', '서초구': '11620', '성동구': '11200', '성북구': '11290',
          '송파구': '11710', '양천구': '11440', '영등포구': '11560', '용산구': '11170',
          '은평구': '11380', '종로구': '11110', '중구': '11140', '중랑구': '11260'
        };
        
        for (const [gu, code] of Object.entries(addressMapping)) {
          if (userAddress.includes(gu)) {
            lawdCd = code;
            break;
          }
        }
      }
      
      const [monthlyRes, jeonseRes, transactionsRes] = await Promise.all([
        officetelApi.getMonthlyRentMarket(lawdCd),
        officetelApi.getJeonseMarket(lawdCd),
        officetelApi.getTransactions(lawdCd)
      ]);

      setMarketData({
        monthlyRentMarket: monthlyRes?.success ? monthlyRes.data : [],
        jeonseMarket: jeonseRes?.success ? jeonseRes.data : [],
        transactions: transactionsRes?.success ? transactionsRes.data : []
      });

      toast.success('실거래가 데이터를 불러왔습니다.');
    } catch (err: any) {
      console.error('Market data load error:', err);
      toast.error('실거래가 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMarketData();
  }, [userAddress]);

  const formatPrice = (price: number) => {
    if (price >= 10000) {
      return `${(price / 10000).toFixed(1)}억원`;
    }
    return `${price.toLocaleString()}만원`;
  };

  if (isLoading) {
    return (
      <div className="bg-green-50 rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">실거래가 데이터를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (!marketData) {
    return (
      <div className="bg-green-50 rounded-lg p-6">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">시세 데이터를 불러올 수 없습니다.</p>
          <button
            onClick={() => loadMarketData()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-green-50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">📊 객관적 지표 (국토부 실거래가 기반)</h2>
        <button
          onClick={() => loadMarketData()}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
        >
          {isLoading ? '로딩...' : '최신 데이터 갱신'}
        </button>
      </div>
      
      <div className="space-y-6">
        {/* 주변 동네 월세 시세 비교 */}
        {marketData.monthlyRentMarket.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <i className="ri-building-line mr-2 text-blue-600"></i>
              🏘️ 주변 동네 월세 시세 비교
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {marketData.monthlyRentMarket.slice(0, 6).map((market: MarketData, index: number) => {
                const averageRent = market.averagePrice || 0;
                const difference = userRent - averageRent;
                const percentDiff = averageRent > 0 ? ((difference / averageRent) * 100) : 0;
                
                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <h4 className="font-semibold text-gray-900 mb-3">{market.neighborhood}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">평균 월세:</span>
                        <span className="font-semibold text-blue-600">
                          {formatPrice(averageRent)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">내 월세:</span>
                        <span className="font-semibold">
                          {formatPrice(userRent)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">차이:</span>
                        <span className={`font-semibold ${difference < 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {difference < 0 ? '-' : '+'}{formatPrice(Math.abs(difference))}
                          ({percentDiff > 0 ? '+' : ''}{percentDiff.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">거래건수:</span>
                        <span className="text-gray-500">{market.transactionCount}건</span>
                      </div>
                    </div>
                    
                    {/* 협상 포인트 */}
                    {Math.abs(percentDiff) > 10 && (
                      <div className={`mt-3 p-2 rounded text-xs ${
                        difference > 0 ? 'bg-red-50 text-red-700 border border-red-200' : 
                        'bg-green-50 text-green-700 border border-green-200'
                      }`}>
                        <strong>💡 협상 포인트:</strong> {market.neighborhood} 대비 
                        {difference > 0 ? `${percentDiff.toFixed(1)}% 높음 → 임대료 조정 요청 근거` : 
                         `${Math.abs(percentDiff).toFixed(1)}% 낮음 → 현재 합리적 수준`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 최근 거래 동향 */}
        {marketData.transactions.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <i className="ri-line-chart-line mr-2 text-green-600"></i>
              📈 최근 거래 동향 (최근 3개월)
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">건물명</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">계약일</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">보증금</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">월세</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">면적</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">내 계약 대비</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {marketData.transactions.slice(0, 10).map((transaction: TransactionData, index: number) => {
                    const transactionRent = transaction.monthlyRent || 0;
                    const difference = userRent - transactionRent;
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{transaction.buildingName}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{transaction.contractDate}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatPrice(transaction.deposit)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {transactionRent > 0 ? formatPrice(transactionRent) : '전세'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{transaction.area}㎡</td>
                        <td className="px-4 py-3 text-sm">
                          {transactionRent > 0 ? (
                            <span className={`font-medium ${difference < 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {difference < 0 ? '-' : '+'}{formatPrice(Math.abs(difference))}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">🎯 시세 분석 요약</h4>
              <div className="text-sm text-blue-700" dangerouslySetInnerHTML={{
                __html: (() => {
                  const avgMarketRent = marketData.monthlyRentMarket.length > 0 
                    ? marketData.monthlyRentMarket[0]?.averagePrice || 0 
                    : 0;
                  if (avgMarketRent === 0) return "시세 정보가 부족합니다.";
                  
                  const difference = userRent - avgMarketRent;
                  const percentDiff = (difference / avgMarketRent) * 100;
                  
                  if (percentDiff > 15) {
                    return `최근 3개월 거래 ${marketData.transactions.length}건 분석 결과, 회원님의 월세가 동네 평균보다 <strong>${percentDiff.toFixed(1)}% 높습니다 (${formatPrice(userRent)} vs ${formatPrice(avgMarketRent)})</strong>. → <strong class="text-red-600">임대료 인하 협상의 강력한 근거가 될 수 있습니다.</strong>`;
                  } else if (percentDiff < -10) {
                    return `최근 3개월 거래 ${marketData.transactions.length}건 분석 결과, 회원님의 월세가 동네 평균보다 <strong>${Math.abs(percentDiff).toFixed(1)}% 낮습니다 (${formatPrice(userRent)} vs ${formatPrice(avgMarketRent)})</strong>. → <strong class="text-green-600">현재 합리적인 수준으로 계약되어 있습니다.</strong>`;
                  } else {
                    return `최근 3개월 거래 ${marketData.transactions.length}건 분석 결과, 회원님의 월세가 동네 평균과 비슷한 수준입니다 <strong>(차이: ${percentDiff.toFixed(1)}%, ${formatPrice(userRent)} vs ${formatPrice(avgMarketRent)})</strong>. → <strong class="text-blue-600">현재 적정 수준이지만 다른 조건 개선을 요구할 수 있습니다.</strong>`;
                  }
                })()
              }} />
            </div>
          </div>
        )}

        {/* 지역별 시세 비교 요약 카드 */}
        {marketData.monthlyRentMarket.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <i className="ri-map-pin-line mr-2 text-purple-600"></i>
              🗺️ 협상 근거 요약
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {marketData.monthlyRentMarket.slice(0, 4).map((market: MarketData, index: number) => {
                const averageRent = market.averagePrice || 0;
                const difference = userRent - averageRent;
                const percentDiff = averageRent > 0 ? ((difference / averageRent) * 100) : 0;
                const isNegotiationPoint = Math.abs(percentDiff) > 10;
                
                return (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    isNegotiationPoint 
                      ? (difference > 0 ? 'bg-red-50 border-red-400' : 'bg-green-50 border-green-400')
                      : 'bg-gray-50 border-gray-400'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-gray-900">{market.neighborhood}</h4>
                      <span className={`text-lg font-bold ${
                        difference > 0 ? 'text-red-600' : difference < 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {difference > 0 ? '+' : ''}{percentDiff.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatPrice(userRent)} vs {formatPrice(averageRent)}
                    </div>
                    {isNegotiationPoint && (
                      <div className={`mt-2 text-xs font-medium ${
                        difference > 0 ? 'text-red-700' : 'text-green-700'
                      }`}>
                        {difference > 0 ? '💰 임대료 조정 요청 가능' : '✅ 합리적 계약 수준'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}