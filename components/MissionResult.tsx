import { useState } from 'react';

interface MissionResultProps {
  userScore: number;
  buildingAverage: number;
  neighborhoodAverage: number;
  buildingComparison: any;
  neighborhoodComparison: any;
  onBackToMain: () => void;
}

export default function MissionResult({ 
  userScore, 
  buildingAverage, 
  neighborhoodAverage, 
  buildingComparison, 
  neighborhoodComparison,
  onBackToMain 
}: MissionResultProps) {
  const [activeTab, setActiveTab] = useState<'building' | 'neighborhood'>('building');

  const getScoreLevel = (score: number) => {
    if (score >= 80) return '전혀 안들림';
    if (score >= 60) return '거의 안들림';
    if (score >= 40) return '가끔 들림';
    if (score >= 20) return '자주 들림';
    return '항상 들림';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    if (score >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="size- px-64 inline-flex justify-start items-start">
      <div className="w-[896px] h-[1217px] max-w-[896px] inline-flex flex-col justify-start items-start">
        <div className="size- pb-8 inline-flex justify-start items-start">
          <div className="w-[896px] h-48 inline-flex flex-col justify-start items-start">
            <div className="size- pb-2 inline-flex justify-start items-start">
              <div className="w-[896px] h-9 flex justify-center items-center">
                <div className="text-center justify-center text-gray-800 text-3xl font-bold font-['Inter'] leading-9">월세의 정석</div>
              </div>
            </div>
            <div className="size- px-96 pb-6 inline-flex justify-start items-start">
              <div className="w-16 h-1 bg-purple-600" />
            </div>
            <div className="self-stretch inline-flex justify-center items-start">
              <div className="size- px-96 pb-4 flex justify-start items-start">
                <div className="w-24 h-9 px-4 py-2 bg-purple-600 rounded-full flex justify-start items-center">
                  <div className="text-center justify-center text-white text-sm font-medium font-['Roboto'] leading-tight">미션 완료!</div>
                </div>
              </div>
            </div>
            <div className="size- pb-2 inline-flex justify-start items-start">
              <div className="w-[896px] h-8 flex justify-center items-center">
                <div className="text-center justify-center text-gray-900 text-2xl font-bold font-['Roboto'] leading-loose">방음 상태 점검 결과</div>
              </div>
            </div>
            <div className="w-[896px] h-6 inline-flex justify-center items-center">
              <div className="text-center justify-center text-gray-600 text-base font-normal font-['Roboto'] leading-normal">2025년 1주차 • 2025.09.19</div>
            </div>
          </div>
        </div>
        <div className="size- pb-8 inline-flex justify-start items-start">
          <div className="w-[896px] h-[861px] p-px bg-white rounded-2xl shadow-lg shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.10)] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-start items-start overflow-hidden">
            <div className="w-[894px] h-20 pb-px border-b border-gray-200 inline-flex justify-start items-start">
              <button
                onClick={() => setActiveTab('building')}
                className={`w-96 h-20 px-6 py-4 ${activeTab === 'building' ? 'bg-purple-600' : ''} inline-flex flex-col justify-start items-start`}
              >
                <div className="w-96 h-6 inline-flex justify-center items-center">
                  <div className="size- pr-2 flex justify-start items-start">
                    <div className="w-4 h-6 relative flex justify-center items-center">
                      <div className="size-4 left-[0.01px] top-[4px] absolute overflow-hidden">
                        <div className="w-3.5 h-3 left-[1px] top-[2px] absolute bg-white" />
                      </div>
                    </div>
                  </div>
                  <div className={`text-center justify-center ${activeTab === 'building' ? 'text-white' : 'text-gray-600'} text-base font-semibold font-['Roboto'] leading-normal`}>우리 건물 비교</div>
                </div>
                <div className="size- pt-1 inline-flex justify-start items-start">
                  <div className="w-96 h-4 opacity-80 flex justify-center items-center">
                    <div className={`opacity-80 text-center justify-center ${activeTab === 'building' ? 'text-white' : 'text-gray-600'} text-xs font-semibold font-['Roboto'] leading-none`}>18세대 참여</div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('neighborhood')}
                className={`w-96 h-20 px-6 py-4 ${activeTab === 'neighborhood' ? 'bg-purple-600' : ''} inline-flex flex-col justify-start items-start`}
              >
                <div className="w-96 h-6 inline-flex justify-center items-center">
                  <div className="size- pr-2 flex justify-start items-start">
                    <div className="w-4 h-6 relative flex justify-center items-center">
                      <div className="size-4 left-[0.01px] top-[4px] absolute overflow-hidden">
                        <div className="w-3.5 h-3 left-[1.67px] top-[2px] absolute bg-gray-600" />
                      </div>
                    </div>
                  </div>
                  <div className={`text-center justify-center ${activeTab === 'neighborhood' ? 'text-white' : 'text-gray-600'} text-base font-semibold font-['Roboto'] leading-normal`}>우리 동네 비교</div>
                </div>
                <div className="size- pt-1 inline-flex justify-start items-start">
                  <div className="w-96 h-4 opacity-80 flex justify-center items-center">
                    <div className={`opacity-80 text-center justify-center ${activeTab === 'neighborhood' ? 'text-white' : 'text-gray-600'} text-xs font-semibold font-['Roboto'] leading-none`}>87세대 참여</div>
                  </div>
                </div>
              </button>
            </div>
            <div className="w-[894px] h-[782px] p-8 flex flex-col justify-start items-start">
              <div className="size- pb-8 inline-flex justify-start items-start">
                <div className="w-[830px] h-64 inline-flex flex-col justify-start items-start">
                  <div className="size- pb-4 inline-flex justify-start items-start">
                    <div className="w-[830px] h-7 flex justify-center items-center">
                      <div className="text-center justify-center text-gray-900 text-xl font-bold font-['Roboto'] leading-7">
                        {activeTab === 'building' ? '우리 건물 방음 점수 비교' : '우리 동네 방음 점수 비교'}
                      </div>
                    </div>
                  </div>
                  <div className="w-[830px] h-32 inline-flex justify-start items-start gap-6 flex-wrap content-start">
                    <div className="w-96 h-32 p-6 bg-purple-50 rounded-xl inline-flex flex-col justify-start items-start">
                      <div className="size- pb-2 inline-flex justify-start items-start">
                        <div className="w-96 h-9 flex justify-center items-center">
                          <div className="text-center justify-center text-purple-600 text-3xl font-bold font-['Roboto'] leading-9">{userScore}점</div>
                        </div>
                      </div>
                      <div className="size- pb-2 inline-flex justify-start items-start">
                        <div className="w-96 h-5 flex justify-center items-center">
                          <div className="text-center justify-center text-violet-600 text-sm font-medium font-['Roboto'] leading-tight">내 점수</div>
                        </div>
                      </div>
                      <div className="w-96 h-4 inline-flex justify-center items-center">
                        <div className={`text-center justify-center text-purple-600 text-xs font-normal font-['Roboto'] leading-none`}>{getScoreLevel(userScore)} 수준</div>
                      </div>
                    </div>
                    <div className="w-96 h-32 p-6 bg-gray-50 rounded-xl inline-flex flex-col justify-start items-start">
                      <div className="size- pb-2 inline-flex justify-start items-start">
                        <div className="w-96 h-9 flex justify-center items-center">
                          <div className="text-center justify-center text-gray-600 text-3xl font-bold font-['Roboto'] leading-9">
                            {activeTab === 'building' ? buildingAverage : neighborhoodAverage}점
                          </div>
                        </div>
                      </div>
                      <div className="size- pb-2 inline-flex justify-start items-start">
                        <div className="w-96 h-5 flex justify-center items-center">
                          <div className="text-center justify-center text-gray-800 text-sm font-medium font-['Roboto'] leading-tight">
                            {activeTab === 'building' ? '우리 건물 평균' : '우리 동네 평균'}
                          </div>
                        </div>
                      </div>
                      <div className="w-96 h-4 inline-flex justify-center items-center">
                        <div className="text-center justify-center text-gray-600 text-xs font-normal font-['Roboto'] leading-none">
                          {userScore < (activeTab === 'building' ? buildingAverage : neighborhoodAverage) ? '평균보다 낮음' : '평균보다 높음'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="size- pt-6 inline-flex justify-start items-start">
                    <div className="w-[830px] h-14 p-4 bg-purple-50 rounded-lg outline outline-1 outline-offset-[-1px] outline-purple-200 inline-flex flex-col justify-start items-start">
                      <div className="w-[796px] h-6 inline-flex justify-center items-center">
                        <div className="size- pr-2 flex justify-start items-start">
                          <div className="w-4 h-6 relative flex justify-center items-center">
                            <div className="size-4 left-[0.01px] top-[4px] absolute overflow-hidden">
                              <div className="w-2.5 h-3.5 left-[3px] top-[1px] absolute bg-purple-600" />
                            </div>
                          </div>
                        </div>
                        <div className="w-44 h-6 flex justify-center items-center">
                          <div className="text-center justify-center text-purple-600 text-base font-medium font-['Roboto'] leading-normal">
                            {activeTab === 'building' 
                              ? `우리 건물보다 ${Math.abs(userScore - buildingAverage)}점 ${userScore < buildingAverage ? '낮습니다' : '높습니다'}`
                              : `우리 동네보다 ${Math.abs(userScore - neighborhoodAverage)}점 ${userScore < neighborhoodAverage ? '낮습니다' : '높습니다'}`
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-[830px] h-72 flex flex-col justify-start items-start">
                <div className="w-[830px] h-7 inline-flex justify-start items-center">
                  <div className="justify-center text-gray-900 text-lg font-bold font-['Roboto'] leading-7">📊 상세 분석</div>
                </div>
                <div className="size- pt-6 inline-flex justify-start items-start">
                  <div className="w-[830px] h-60 flex justify-start items-start gap-6 flex-wrap content-start">
                    <div className="w-96 h-60 p-6 bg-gray-50 rounded-lg inline-flex flex-col justify-start items-start">
                      <div className="size- pb-4 inline-flex justify-start items-start">
                        <div className="w-96 h-6 flex justify-start items-center">
                          <div className="justify-center text-gray-800 text-base font-semibold font-['Roboto'] leading-normal">응답 분포</div>
                        </div>
                      </div>
                      <div className="w-96 h-36 flex flex-col justify-start items-start">
                        {['전혀 안들림', '거의 안들림', '가끔 들림', '자주 들림', '항상 들림'].map((level, index) => {
                          const count = activeTab === 'building' 
                            ? [2, 4, 8, 3, 1][index]
                            : [12, 23, 28, 18, 6][index];
                          const percentage = activeTab === 'building' 
                            ? [11, 22, 44, 17, 6][index]
                            : [14, 26, 32, 21, 7][index];
                          
                          return (
                            <div key={index} className="w-96 h-5 inline-flex justify-between items-center">
                              <div className="w-16 h-5 flex justify-start items-center">
                                <div className="justify-center text-gray-600 text-sm font-normal font-['Roboto'] leading-tight">{level}</div>
                              </div>
                              <div className="w-28 h-4 flex justify-start items-center">
                                <div className="size- pr-2 flex justify-start items-start">
                                  <div className="w-20 h-2 bg-gray-200 rounded-full inline-flex flex-col justify-start items-start">
                                    <div className={`w-${Math.max(1, Math.floor(percentage / 5))} h-2 bg-purple-600 rounded-full`} />
                                  </div>
                                </div>
                                <div className="w-8 h-4 flex justify-start items-center">
                                  <div className="justify-center text-gray-500 text-xs font-normal font-['Roboto'] leading-none">{count}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="w-96 h-60 inline-flex flex-col justify-start items-start">
                      <div className="w-96 h-12 p-3 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-start">
                        <div className="size- pr-3 pt-0.5 flex justify-start items-start">
                          <div className="size-6 bg-purple-100 rounded-full flex justify-center items-center">
                            <div className="w-3.5 h-5 relative flex justify-start items-center">
                              <div className="size-3.5 left-0 top-[3px] absolute overflow-hidden">
                                <div className="size-3 left-[1.46px] top-[1.17px] absolute bg-purple-600" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="w-60 h-5 flex justify-start items-center">
                          <div className="justify-center text-gray-700 text-sm font-normal font-['Roboto'] leading-tight">
                            {activeTab === 'building' 
                              ? '우리 건물은 평균보다 방음이 4점 낮습니다'
                              : '우리 동네는 평균보다 방음이 6점 낮습니다'
                            }
                          </div>
                        </div>
                      </div>
                      <div className="size- pt-3 inline-flex justify-start items-start">
                        <div className="w-96 h-12 p-3 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-start items-start">
                          <div className="size- pr-3 pt-0.5 flex justify-start items-start">
                            <div className="size-6 bg-purple-100 rounded-full flex justify-center items-center">
                              <div className="w-3.5 h-5 relative flex justify-start items-center">
                                <div className="size-3.5 left-0 top-[3px] absolute overflow-hidden">
                                  <div className="size-3 left-[1.46px] top-[1.17px] absolute bg-purple-600" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="w-64 h-5 flex justify-start items-center">
                            <div className="justify-center text-gray-700 text-sm font-normal font-['Roboto'] leading-tight">
                              {activeTab === 'building' 
                                ? '18세대 중 12세대가 층간소음을 경험했습니다'
                                : '87세대 중 58세대가 층간소음을 경험했습니다'
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="size- pt-3 inline-flex justify-start items-start">
                        <div className="w-96 h-12 p-3 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-start items-start">
                          <div className="size- pr-3 pt-0.5 flex justify-start items-start">
                            <div className="size-6 bg-purple-100 rounded-full flex justify-center items-center">
                              <div className="w-3.5 h-5 relative flex justify-start items-center">
                                <div className="size-3.5 left-0 top-[3px] absolute overflow-hidden">
                                  <div className="size-3 left-[1.46px] top-[1.17px] absolute bg-purple-600" />
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="w-72 h-5 flex justify-start items-center">
                            <div className="justify-center text-gray-700 text-sm font-normal font-['Roboto'] leading-tight">주로 저녁 시간대(18-22시) 소음이 많이 발생합니다</div>
                          </div>
                        </div>
                      </div>
                      {activeTab === 'neighborhood' && (
                        <div className="size- pt-3 inline-flex justify-start items-start">
                          <div className="w-96 h-16 p-3 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-start items-start">
                            <div className="size- pr-3 pt-0.5 flex justify-start items-start">
                              <div className="size-6 bg-purple-100 rounded-full flex justify-center items-center">
                                <div className="w-3.5 h-5 relative flex justify-start items-center">
                                  <div className="size-3.5 left-0 top-[3px] absolute overflow-hidden">
                                    <div className="size-3 left-[1.46px] top-[1.17px] absolute bg-purple-600" />
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="w-80 h-10 flex justify-start items-start flex-wrap content-start">
                              <div className="w-80 h-10 justify-center text-gray-700 text-sm font-normal font-['Roboto'] leading-tight">우리 동네 신축 건물들의 방음 점수가 평균 78점으로 높습니다</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="size- pt-8 inline-flex justify-start items-start">
                <div className="w-[830px] h-24 p-6 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl inline-flex flex-col justify-start items-start">
                  <div className="w-[782px] h-14 inline-flex justify-between items-center">
                    <div className="w-32 h-14 inline-flex flex-col justify-start items-start">
                      <div className="size- pb-2 inline-flex justify-start items-start">
                        <div className="w-32 h-7 flex justify-start items-center">
                          <div className="justify-center text-white text-lg font-bold font-['Roboto'] leading-7">다음 주 미션 예고</div>
                        </div>
                      </div>
                      <div className="w-32 h-5 inline-flex justify-start items-center">
                        <div className="justify-center text-purple-100 text-sm font-normal font-['Roboto'] leading-tight">수압 및 온수 상태 점검</div>
                      </div>
                    </div>
                    <div className="w-14 h-12 inline-flex flex-col justify-start items-start">
                      <div className="w-14 h-8 inline-flex justify-end items-center">
                        <div className="text-right justify-center text-white text-2xl font-bold font-['Roboto'] leading-loose">+5점</div>
                      </div>
                      <div className="w-14 h-4 inline-flex justify-end items-center">
                        <div className="text-right justify-center text-purple-100 text-xs font-normal font-['Roboto'] leading-none">참여 보너스</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-[896px] h-14 inline-flex justify-center items-start">
          <div className="size- pt-5 flex justify-start items-start">
            <div className="w-60 h-5 flex justify-center items-start">
              <button
                onClick={onBackToMain}
                className="w-60 h-14 px-12 py-4 bg-purple-600 rounded-xl inline-flex flex-col justify-start items-start"
              >
                <div className="w-36 h-7 inline-flex justify-center items-center">
                  <div className="size- pr-2 flex justify-start items-start">
                    <div className="w-5 h-7 relative flex justify-center items-center">
                      <div className="size-5 left-[0.01px] top-[4px] absolute overflow-hidden">
                        <div className="w-3.5 h-4 left-[2.92px] top-[2.20px] absolute bg-white" />
                      </div>
                    </div>
                  </div>
                  <div className="text-center justify-center text-white text-base font-semibold font-['Roboto'] leading-normal">메인으로 돌아가기</div>
                </div>
              </button>
            </div>
          </div>
        </div>
        <div className="size- pt-6 inline-flex justify-start items-start">
          <div className="w-[896px] h-5 inline-flex flex-col justify-start items-start">
            <div className="w-[896px] h-5 inline-flex justify-center items-center">
              <div className="text-center justify-center text-gray-500 text-sm font-normal font-['Roboto'] leading-tight">매주 미션에 참여하여 더 정확한 이웃 비교 데이터를 받아보세요!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}