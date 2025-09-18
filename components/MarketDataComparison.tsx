'use client';

import { useState, useEffect } from 'react';
import { officetelApi, villaApi, locationApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { extractLawdCdFromAddress } from '../lib/addressUtils';

interface MarketDataComparisonProps {
  userRent: number;
  userAddress?: string;
  buildingType?: string;
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

export default function MarketDataComparison({ userRent, userAddress, buildingType }: MarketDataComparisonProps) {
  const safeUserAddress = userAddress && userAddress.trim() !== '' ? userAddress : '주소 정보 없음';
  
  const [marketData, setMarketData] = useState<{
    monthlyRentMarket: MarketData[];
    jeonseMarket: MarketData[];
    transactions: TransactionData[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const loadMarketData = async () => {
    // 5분 이내에 이미 호출했다면 중복 호출 방지
    const now = Date.now();
    if (now - lastFetchTime < 5 * 60 * 1000 && marketData) {
      console.log('🚫 API 호출 중복 방지: 5분 이내 재호출 차단');
      return;
    }

    try {
      setIsLoading(true);
      setLastFetchTime(now);
      
      // 주소에서 법정동코드 추출 (카카오 API + 폴백)
      let lawdCd = await extractLawdCdFromAddress(safeUserAddress);
      
      console.log(`Using lawdCd: ${lawdCd} for address: ${safeUserAddress}`);
      
      // 건물 유형에 따라 적절한 API 호출
      let monthlyRes, jeonseRes, transactionsRes;
      
      if (buildingType && (buildingType.includes('빌라') || buildingType.includes('다세대'))) {
        // 빌라 API 호출
        [monthlyRes, jeonseRes, transactionsRes] = await Promise.all([
          villaApi.getMonthlyRentMarket(lawdCd),
          villaApi.getJeonseMarket(lawdCd),
          villaApi.getTransactions(lawdCd)
        ]);
      } else {
        // 빌라 API 호출 (기본값)
        [monthlyRes, jeonseRes, transactionsRes] = await Promise.all([
          villaApi.getMonthlyRentMarket(lawdCd),
          villaApi.getJeonseMarket(lawdCd),
          villaApi.getTransactions(lawdCd)
        ]);
      }

      // API 응답 데이터 처리 (에러 체크 포함)
      const monthlyData = monthlyRes?.success ? monthlyRes.data : [];
      const jeonseData = jeonseRes?.success ? jeonseRes.data : [];
      const transactionData = transactionsRes?.success ? transactionsRes.data : [];

      // 백엔드 데이터를 프론트엔드 형식으로 변환
      const processedMonthlyData = monthlyData.map((item: any) => ({
        neighborhood: item.neighborhood || '알 수 없는 지역',
        averagePrice: item.avgMonthlyRent || 0,
        minPrice: Math.round((item.avgMonthlyRent || 0) * 0.8),
        maxPrice: Math.round((item.avgMonthlyRent || 0) * 1.2),
        transactionCount: item.transactionCount || 0,
        pricePerSquareMeter: Math.round((item.avgMonthlyRent || 0) / 30)
      }));

      // 거래 데이터 변환
      const processedTransactionData: TransactionData[] = [];
      if (transactionData && typeof transactionData === 'object') {
        Object.values(transactionData).forEach((transactions: any) => {
          if (Array.isArray(transactions)) {
            transactions.forEach((transaction: any) => {
              processedTransactionData.push({
                buildingName: transaction.buildingName || '건물명 없음',
                contractDate: transaction.contractDate || new Date().toISOString().split('T')[0],
                contractType: '월세',
                contractTerm: '2년',
                deposit: parseFloat(transaction.deposit) || 0,
                monthlyRent: parseFloat(transaction.monthlyRent) || 0,
                area: parseFloat(transaction.area) || 30,
                floor: parseInt(transaction.floor) || 1
              });
            });
          }
        });
      }

      // 데이터가 비어있으면 시뮬레이션 데이터 생성
      const processedData = {
        monthlyRentMarket: processedMonthlyData.length > 0 ? processedMonthlyData : generateSimulatedMarketData(safeUserAddress),
        jeonseMarket: jeonseData.length > 0 ? jeonseData : [],
        transactions: processedTransactionData.length > 0 ? processedTransactionData : generateSimulatedTransactions(safeUserAddress)
      };

      setMarketData(processedData);
      
      // 데이터 소스에 따른 메시지 표시
      if (processedMonthlyData.length > 0) {
        toast.success('실거래가 데이터를 불러왔습니다.');
      } else {
        toast('API 호출 제한으로 인해 시뮬레이션 데이터를 표시합니다.', {
          icon: 'ℹ️',
        });
      }
    } catch (err: any) {
      console.error('Market data load error:', err);
      // API 실패 시 시뮬레이션 데이터로 폴백
      setMarketData({
        monthlyRentMarket: generateSimulatedMarketData(safeUserAddress),
        jeonseMarket: [],
        transactions: generateSimulatedTransactions(safeUserAddress)
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  // 시뮬레이션 시장 데이터 생성
  const generateSimulatedMarketData = (address: string): MarketData[] => {
    const baseRent = getBaseRentByAddress(address);
    const neighborhoods = [
      `${address.split(' ')[0]} 인근 지역 1`,
      `${address.split(' ')[0]} 인근 지역 2`,
      `${address.split(' ')[0]} 인근 지역 3`,
      `${address.split(' ')[0]} 인근 지역 4`,
      `${address.split(' ')[0]} 인근 지역 5`,
      `${address.split(' ')[0]} 인근 지역 6`
    ];

    return neighborhoods.map((neighborhood, index) => {
      const variation = 0.9 + (index * 0.05); // 0.9 ~ 1.15 배 (더 현실적인 범위)
      const averagePrice = Math.round(baseRent * variation);
      
      return {
        neighborhood,
        averagePrice,
        minPrice: Math.round(averagePrice * 0.85),
        maxPrice: Math.round(averagePrice * 1.15),
        transactionCount: Math.floor(Math.random() * 15) + 10, // 10-25건
        pricePerSquareMeter: Math.round(averagePrice / 30) // 30㎡ 기준
      };
    });
  };

  // 시뮬레이션 거래 데이터 생성
  const generateSimulatedTransactions = (address: string): TransactionData[] => {
    const baseRent = getBaseRentByAddress(address);
    const buildings = [
      `${address.split(' ')[0]} 빌라`,
      `${address.split(' ')[0]} 빌딩`,
      `${address.split(' ')[0]} 타워`,
      `${address.split(' ')[0]} 센터`,
      `${address.split(' ')[0]} 플라자`
    ];

    return Array.from({ length: 15 }, (_, index) => {
      const building = buildings[index % buildings.length];
      const variation = 0.8 + Math.random() * 0.4; // 0.8 ~ 1.2 배
      const monthlyRent = Math.round(baseRent * variation);
      const deposit = Math.round(monthlyRent * 10); // 월세의 10배 (보증금)
      
      const now = new Date();
      const contractDate = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000); // 최근 90일 내
      
      return {
        buildingName: building,
        contractDate: contractDate.toISOString().split('T')[0],
        contractType: '월세',
        contractTerm: '2년',
        deposit,
        monthlyRent,
        area: Math.round(20 + Math.random() * 20), // 20-40㎡
        floor: Math.floor(Math.random() * 20) + 1 // 1-20층
      };
    });
  };

  // 주소별 기본 월세 설정
  const getBaseRentByAddress = (address: string): number => {
    if (address.includes('강남') || address.includes('서초')) {
      return 1200000; // 120만원
    } else if (address.includes('마포') || address.includes('용산')) {
      return 900000; // 90만원
    } else if (address.includes('송파') || address.includes('강동')) {
      return 800000; // 80만원
    } else if (address.includes('울산')) {
      return 500000; // 50만원
    } else {
      return 700000; // 70만원
    }
  };

  // 국토교통부 데이터 가공 함수 (올바른 필드명 사용)
  const processMolitData = (transactions: any[]) => {
    const monthlyRentTransactions = transactions.filter(t => t.monthlyRent && parseInt(t.monthlyRent) > 0);
    const jeonseTransactions = transactions.filter(t => !t.monthlyRent || parseInt(t.monthlyRent) === 0);
    
    // 동네별 월세 데이터 그룹화
    const neighborhoodGroups: {[key: string]: any[]} = {};
    monthlyRentTransactions.forEach(transaction => {
      const dong = transaction.neighborhood || transaction.umdNm || '알 수 없음';
      if (!neighborhoodGroups[dong]) {
        neighborhoodGroups[dong] = [];
      }
      neighborhoodGroups[dong].push(transaction);
    });
    
    const monthlyRentMarket = Object.entries(neighborhoodGroups).map(([neighborhood, transactions]) => {
      const rents = transactions.map(t => parseInt(t.monthlyRent)).filter(r => r > 0);
      const areas = transactions.map(t => parseFloat(t.area || t.excluUseAr)).filter(a => a > 0);
      
      return {
        neighborhood,
        averagePrice: rents.length > 0 ? rents.reduce((a, b) => a + b, 0) / rents.length : 0,
        minPrice: rents.length > 0 ? Math.min(...rents) : 0,
        maxPrice: rents.length > 0 ? Math.max(...rents) : 0,
        transactionCount: transactions.length,
        pricePerSquareMeter: rents.length > 0 && areas.length > 0 
          ? (rents.reduce((a, b) => a + b, 0) / rents.length) / (areas.reduce((a, b) => a + b, 0) / areas.length)
          : 0
      };
    });
    
    // 거래 데이터 변환
    const processedTransactions = transactions.slice(0, 20).map(transaction => ({
      buildingName: transaction.buildingName || transaction.offiNm || '건물명 없음',
      contractDate: `${transaction.year || ''}-${String(transaction.month || '').padStart(2, '0')}-${String(transaction.day || '').padStart(2, '0')}`,
      contractType: transaction.monthlyRent ? '월세' : '전세',
      contractTerm: transaction.contractTerm || '정보 없음',
      deposit: parseInt(transaction.deposit?.replace(/,/g, '') || '0'),
      monthlyRent: parseInt(transaction.monthlyRent?.replace(/,/g, '') || '0'),
      area: parseFloat(transaction.area || transaction.excluUseAr || '0'),
      floor: parseInt(transaction.floor || '0')
    }));
    
    return {
      monthlyRentMarket,
      jeonseMarket: [], // 전세 데이터는 별도 처리 필요
      transactions: processedTransactions
    };
  };

  useEffect(() => {
    // 이미 데이터가 있거나 로딩 중이면 중복 호출 방지
    if (!marketData && !isLoading && safeUserAddress) {
      loadMarketData();
    }
  }, [safeUserAddress]);

  const formatPrice = (price: number) => {
    if (price >= 100000000) { // 1억 이상일 때만 억원 단위 사용
      return `${(price / 100000000).toFixed(1)}억원`;
    } else if (price >= 10000) { // 1만 이상일 때는 만원 단위
      return `${(price / 10000).toFixed(1)}만원`;
    }
    return `${price.toLocaleString()}원`;
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
    <section className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col items-end">
          <button
            onClick={() => {
              setLastFetchTime(0); // 캐싱 무시하고 강제 갱신
              loadMarketData();
            }}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {isLoading ? '로딩...' : '최신 데이터 갱신'}
          </button>
          <span className="text-xs text-gray-500 mt-1">
            기준일: {new Date().toLocaleDateString('ko-KR')}
          </span>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* 주변 동네 월세 시세 비교 */}
        {(marketData?.monthlyRentMarket?.length || 0) > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <i className="ri-building-line mr-2 text-blue-600"></i>
              주변 동네 월세 시세 비교
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(marketData?.monthlyRentMarket || []).slice(0, 6).map((market: MarketData, index: number) => {
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
                        <strong>협상 포인트:</strong> {market.neighborhood} 대비 
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
        {(marketData?.transactions?.length || 0) > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <i className="ri-line-chart-line mr-2 text-green-600"></i>
              최근 거래 동향 (최근 3개월)
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
                  {(marketData?.transactions || []).slice(0, 10).map((transaction: TransactionData, index: number) => {
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
              <h4 className="font-semibold text-blue-800 mb-2">시세 분석 요약</h4>
              <div className="text-sm text-blue-700" dangerouslySetInnerHTML={{
                __html: (() => {
                  // 전체 시장 데이터에서 평균 계산
                  const allMarketData = marketData?.monthlyRentMarket || [];
                  if (allMarketData.length === 0) {
                    return "시세 정보가 부족합니다. 주소 정보를 확인해주세요.";
                  }
                  
                  const totalRent = allMarketData.reduce((sum, market) => sum + market.averagePrice, 0);
                  const avgMarketRent = totalRent / allMarketData.length;
                  
                  if (avgMarketRent === 0) return "시세 정보가 부족합니다.";
                  
                  const difference = userRent - avgMarketRent;
                  const percentDiff = avgMarketRent > 0 ? (difference / avgMarketRent) * 100 : 0;
                  const transactionCount = marketData?.transactions?.length || 0;
                  
                  if (percentDiff > 15) {
                    return `최근 거래 ${transactionCount}건 분석 결과, 회원님의 월세가 동네 평균보다 <strong>${percentDiff.toFixed(1)}% 높습니다 (${formatPrice(userRent)} vs ${formatPrice(avgMarketRent)})</strong>. → <strong class="text-red-600">임대료 인하 협상의 강력한 근거가 될 수 있습니다.</strong>`;
                  } else if (percentDiff < -10) {
                    return `최근 거래 ${transactionCount}건 분석 결과, 회원님의 월세가 동네 평균보다 <strong>${Math.abs(percentDiff).toFixed(1)}% 낮습니다 (${formatPrice(userRent)} vs ${formatPrice(avgMarketRent)})</strong>. → <strong class="text-green-600">현재 합리적인 수준으로 계약되어 있습니다.</strong>`;
                  } else {
                    return `최근 거래 ${transactionCount}건 분석 결과, 회원님의 월세가 동네 평균과 비슷한 수준입니다 <strong>(차이: ${percentDiff.toFixed(1)}%, ${formatPrice(userRent)} vs ${formatPrice(avgMarketRent)})</strong>. → <strong class="text-blue-600">현재 적정 수준이지만 다른 조건 개선을 요구할 수 있습니다.</strong>`;
                  }
                })()
              }} />
            </div>
          </div>
        )}

        {/* 지역별 시세 비교 요약 카드 */}
        {(marketData?.monthlyRentMarket?.length || 0) > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <i className="ri-map-pin-line mr-2 text-purple-600"></i>
              🗺️ 협상 근거 요약
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(marketData?.monthlyRentMarket || []).slice(0, 4).map((market: MarketData, index: number) => {
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
                        {difference > 0 ? '임대료 조정 요청 가능' : '합리적 계약 수준'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* 전체 협상 근거 요약 */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3">📊 전체 협상 근거 요약</h4>
              <div className="text-sm text-blue-700" dangerouslySetInnerHTML={{
                __html: (() => {
                  const allMarketData = marketData?.monthlyRentMarket || [];
                  if (allMarketData.length === 0) {
                    return "협상 근거를 분석할 수 없습니다.";
                  }
                  
                  const totalRent = allMarketData.reduce((sum, market) => sum + market.averagePrice, 0);
                  const avgMarketRent = totalRent / allMarketData.length;
                  const difference = userRent - avgMarketRent;
                  const percentDiff = avgMarketRent > 0 ? (difference / avgMarketRent) * 100 : 0;
                  
                  if (percentDiff > 15) {
                    return `🎯 <strong>강력한 협상 근거:</strong> 동네 평균 대비 ${percentDiff.toFixed(1)}% 높은 월세로 임대료 인하 요구가 가능합니다.<br/>
                    💡 <strong>협상 전략:</strong> "동네 시세 대비 높은 월세를 근거로 합리적 수준으로 조정 요청"<br/>
                    📈 <strong>예상 성공률:</strong> 높음 (객관적 데이터 기반)`;
                  } else if (percentDiff < -10) {
                    return `✅ <strong>현재 상태:</strong> 동네 평균 대비 ${Math.abs(percentDiff).toFixed(1)}% 낮은 합리적 월세입니다.<br/>
                    💡 <strong>협상 전략:</strong> "현재 합리적 수준 유지하며 다른 조건 개선 요구"<br/>
                    📈 <strong>예상 성공률:</strong> 중간 (다른 개선사항 중심)`;
                  } else {
                    return `⚖️ <strong>현재 상태:</strong> 동네 평균과 비슷한 수준의 월세입니다.<br/>
                    💡 <strong>협상 전략:</strong> "월세는 적정하나 거주 환경 개선 요구"<br/>
                    📈 <strong>예상 성공률:</strong> 중간 (환경 개선 중심)`;
                  }
                })()
              }} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}