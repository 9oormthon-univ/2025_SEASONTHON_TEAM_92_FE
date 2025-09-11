'use client';

import { useState, useEffect } from 'react';
import { officetelApi } from '@/lib/api';
import toast from 'react-hot-toast';

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

interface MarketData {
  neighborhood: string;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  transactionCount: number;
  pricePerSquareMeter: number;
}

export default function OfficetelData() {
  const [lawdCd, setLawdCd] = useState('11410'); // 마포구 법정동코드
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [jeonseMarket, setJeonseMarket] = useState<MarketData[]>([]);
  const [monthlyRentMarket, setMonthlyRentMarket] = useState<MarketData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'transactions' | 'jeonse' | 'monthly'>('transactions');

  const lawdCdOptions = [
    { code: '11410', name: '마포구' },
    { code: '11680', name: '강남구' },
    { code: '11500', name: '강서구' },
    { code: '11530', name: '구로구' },
    { code: '11545', name: '금천구' },
    { code: '11350', name: '노원구' },
    { code: '11320', name: '도봉구' },
    { code: '11230', name: '동대문구' },
    { code: '11590', name: '동작구' },
    { code: '11470', name: '마포구' },
    { code: '11620', name: '서초구' },
    { code: '11200', name: '성동구' },
    { code: '11290', name: '성북구' },
    { code: '11710', name: '송파구' },
    { code: '11440', name: '양천구' },
    { code: '11560', name: '영등포구' },
    { code: '11170', name: '용산구' },
    { code: '11380', name: '은평구' },
    { code: '11110', name: '종로구' },
    { code: '11140', name: '중구' },
    { code: '11260', name: '중랑구' },
  ];

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [transactionsRes, jeonseRes, monthlyRes] = await Promise.all([
        officetelApi.getTransactions(lawdCd),
        officetelApi.getJeonseMarket(lawdCd),
        officetelApi.getMonthlyRentMarket(lawdCd)
      ]);

      if (transactionsRes && transactionsRes.success) {
        setTransactions(transactionsRes.data);
      }

      if (jeonseRes && jeonseRes.success) {
        setJeonseMarket(jeonseRes.data);
      }

      if (monthlyRes && monthlyRes.success) {
        setMonthlyRentMarket(monthlyRes.data);
      }

      toast.success('공공 데이터를 성공적으로 불러왔습니다.');
    } catch (err: any) {
      console.error('Officetel data load error:', err);
      setError('공공 데이터를 불러오는 중 오류가 발생했습니다.');
      toast.error('데이터 로드에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [lawdCd]);

  const formatPrice = (price: number) => {
    if (price >= 10000) {
      return `${(price / 10000).toFixed(1)}억원`;
    }
    return `${price.toLocaleString()}만원`;
  };

  const formatArea = (area: number) => {
    return `${area.toFixed(2)}㎡`;
  };

  return (
    <div className="space-y-6">
      {/* 지역 선택 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">공공 데이터 조회</h2>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">지역 선택:</label>
          <select
            value={lawdCd}
            onChange={(e) => setLawdCd(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {lawdCdOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.name}
              </option>
            ))}
          </select>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '로딩 중...' : '새로고침'}
          </button>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              거래내역
            </button>
            <button
              onClick={() => setActiveTab('jeonse')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'jeonse'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              전세 시세
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'monthly'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              월세 시세
            </button>
          </nav>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">데이터를 불러오는 중...</span>
            </div>
          ) : (
            <>
              {/* 거래내역 탭 */}
              {activeTab === 'transactions' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">최근 거래내역</h3>
                  {transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              건물명
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              계약일
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              계약유형
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              보증금
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              월세
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              면적
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              층수
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {transactions.slice(0, 20).map((transaction, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {transaction.buildingName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {transaction.contractDate}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {transaction.contractType}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatPrice(transaction.deposit)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {transaction.monthlyRent > 0 ? formatPrice(transaction.monthlyRent) : '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatArea(transaction.area)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {transaction.floor}층
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">거래내역이 없습니다.</p>
                    </div>
                  )}
                </div>
              )}

              {/* 전세 시세 탭 */}
              {activeTab === 'jeonse' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">전세 시세</h3>
                  {jeonseMarket.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {jeonseMarket.map((market, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">{market.neighborhood}</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">평균가:</span>
                              <span className="font-semibold">{formatPrice(market.averagePrice)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">최저가:</span>
                              <span>{formatPrice(market.minPrice)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">최고가:</span>
                              <span>{formatPrice(market.maxPrice)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">거래건수:</span>
                              <span>{market.transactionCount}건</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">㎡당 가격:</span>
                              <span>{formatPrice(market.pricePerSquareMeter)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">전세 시세 데이터가 없습니다.</p>
                    </div>
                  )}
                </div>
              )}

              {/* 월세 시세 탭 */}
              {activeTab === 'monthly' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">월세 시세</h3>
                  {monthlyRentMarket.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {monthlyRentMarket.map((market, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">{market.neighborhood}</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">평균 월세:</span>
                              <span className="font-semibold">{formatPrice(market.averagePrice)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">최저 월세:</span>
                              <span>{formatPrice(market.minPrice)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">최고 월세:</span>
                              <span>{formatPrice(market.maxPrice)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">거래건수:</span>
                              <span>{market.transactionCount}건</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">㎡당 월세:</span>
                              <span>{formatPrice(market.pricePerSquareMeter)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">월세 시세 데이터가 없습니다.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}