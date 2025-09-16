'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

interface DocumentGeneratorProps {
  reportData: any;
  isVisible: boolean;
  onClose: () => void;
}

export default function DocumentGenerator({ reportData, isVisible, onClose }: DocumentGeneratorProps) {
  const [selectedDocument, setSelectedDocument] = useState<'repair' | 'content' | 'adjustment' | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isVisible) return null;

  const documents = [
    {
      id: 'repair',
      title: '임대인 수선 요구서',
      description: '수압, 누수, 곰팡이 등 시설 개선 요구',
      icon: 'ri-tools-line',
      color: 'bg-blue-500',
      usage: '수리가 필요한 시설이 있을 때'
    },
    {
      id: 'content',
      title: '내용증명 우편',
      description: '법적 효력이 있는 공식 통지서',
      icon: 'ri-mail-send-line',
      color: 'bg-red-500',
      usage: '강력한 법적 근거가 필요할 때'
    },
    {
      id: 'adjustment',
      title: '월세 조정 요청서',
      description: '시세 데이터 기반 월세 인하 요청',
      icon: 'ri-money-dollar-circle-line',
      color: 'bg-emerald-500',
      usage: '월세가 시세보다 높을 때'
    }
  ];

  const generateDocument = async (docType: string) => {
    setIsGenerating(true);
    
    try {
      toast.loading('문서를 생성하는 중입니다...', { id: 'doc-loading' });
      
      // PDF 생성
      const pdf = new jsPDF();
      
      // 문서 제목
      const selectedDoc = documents.find(d => d.id === docType);
      const title = selectedDoc?.title || '문서';
      
      // PDF 내용 작성
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.text(title, 20, 30);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.text('작성일: ' + new Date().toLocaleDateString(), 20, 50);
      pdf.text('임차인: [사용자명]', 20, 65);
      pdf.text('임대인: [임대인명]', 20, 80);
      pdf.text('주소: ' + (reportData?.contractSummary?.address || '[주소]'), 20, 95);
      
      pdf.text('본 문서는 월세의 정석에서 자동 생성된 템플릿입니다.', 20, 120);
      pdf.text('실제 사용 시에는 법무 검토를 받으시기 바랍니다.', 20, 135);
      
      // 문서별 내용
      let content = '';
      switch (docType) {
        case 'repair':
          content = `
수선 요구 사항:
1. 수압 개선 요구 (측정값: [데이터])
2. 소음 차단 시설 개선
3. 기타 시설 보수

관련 법령: 주택임대차보호법 제6조의2
          `;
          break;
        case 'content':
          content = `
통지 내용:
임대차계약서상 임대인의 수선의무 불이행에 대해
정식으로 통지하며, 30일 이내 조치를 요구합니다.

미이행 시 임대차계약 해지 및 손해배상을 청구할 수 있습니다.
          `;
          break;
        case 'adjustment':
          content = `
월세 조정 요청 근거:
1. 지역 평균 대비 높은 월세 (분석 데이터 첨부)
2. 시설 상태 대비 부적절한 가격
3. 시장 동향 분석 결과

요청 사항: 월세 [현재금액] → [요청금액] 조정
          `;
          break;
      }
      
      const lines = content.trim().split('\n');
      let yPos = 160;
      lines.forEach(line => {
        pdf.text(line.trim(), 20, yPos);
        yPos += 15;
      });
      
      // 하단 정보
      pdf.setFontSize(10);
      pdf.text('※ 본 문서는 AI가 생성한 템플릿이며, 실제 법적 효력을 위해서는 전문가 검토가 필요합니다.', 20, 280);
      pdf.text('월세의 정석 | https://rental-lovat-theta.vercel.app', 20, 290);
      
      // 파일 다운로드
      const fileName = `${title}_${new Date().toLocaleDateString().replace(/\//g, '')}.pdf`;
      pdf.save(fileName);
      
      toast.success('문서가 생성되었습니다!', { id: 'doc-loading' });
      
    } catch (error) {
      console.error('Document generation error:', error);
      toast.error('문서 생성 중 오류가 발생했습니다.', { id: 'doc-loading' });
    } finally {
      setIsGenerating(false);
    }
  };

  const sendEmail = async (docType: string) => {
    toast.loading('이메일을 발송하는 중입니다...', { id: 'email-loading' });
    
    // 목업 이메일 발송 (2초 딜레이)
    setTimeout(() => {
      toast.success('임대인에게 이메일이 발송되었습니다!', { id: 'email-loading' });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                <i className="ri-file-text-line text-2xl text-white"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold">📄 전자문서 자동 생성</h2>
                <p className="text-white/90">AI가 리포트 데이터를 기반으로 법적 문서를 생성합니다</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <i className="ri-close-line text-xl text-white"></i>
            </button>
          </div>
        </div>

        <div className="p-8">
          {!selectedDocument ? (
            <>
              {/* 문서 선택 */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">생성할 문서를 선택하세요</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocument(doc.id as any)}
                      className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-300 cursor-pointer transition-all transform hover:scale-[1.02] group"
                    >
                      <div className={`w-16 h-16 ${doc.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                        <i className={`${doc.icon} text-3xl text-white`}></i>
                      </div>
                      <h4 className="font-bold text-gray-800 text-center mb-2">{doc.title}</h4>
                      <p className="text-gray-600 text-sm text-center mb-3">{doc.description}</p>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-500 text-center">{doc.usage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 프리미엄 특징 */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mr-3">
                    <i className="ri-crown-line text-white"></i>
                  </div>
                  <h4 className="font-bold text-amber-800">프리미엄 전자문서 특징</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-amber-700">
                    <i className="ri-check-line mr-2 text-amber-600"></i>
                    리포트 데이터 자동 삽입
                  </div>
                  <div className="flex items-center text-amber-700">
                    <i className="ri-check-line mr-2 text-amber-600"></i>
                    법적 근거 조항 자동 추가
                  </div>
                  <div className="flex items-center text-amber-700">
                    <i className="ri-check-line mr-2 text-amber-600"></i>
                    임대인 정보 자동 조회
                  </div>
                  <div className="flex items-center text-amber-700">
                    <i className="ri-check-line mr-2 text-amber-600"></i>
                    등기우편 발송 대행 연결
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* 선택된 문서 미리보기 */}
              <div className="mb-6">
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="flex items-center text-purple-600 hover:text-purple-700 mb-4"
                >
                  <i className="ri-arrow-left-line mr-2"></i>
                  다른 문서 선택
                </button>
                
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {documents.find(d => d.id === selectedDocument)?.title} 미리보기
                </h3>
              </div>

              {/* 문서 템플릿 미리보기 */}
              <div className="bg-white border-2 border-gray-300 rounded-lg p-8 mb-6 min-h-[500px] shadow-inner">
                <DocumentTemplate 
                  docType={selectedDocument} 
                  reportData={reportData} 
                />
              </div>

              {/* 액션 버튼들 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => generateDocument(selectedDocument)}
                  disabled={isGenerating}
                  className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg"
                >
                  <i className="ri-download-line mr-2"></i>
                  {isGenerating ? '생성 중...' : 'PDF 다운로드'}
                </button>
                
                <button
                  onClick={() => sendEmail(selectedDocument)}
                  className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg"
                >
                  <i className="ri-mail-send-line mr-2"></i>
                  임대인에게 이메일 발송
                </button>
              </div>

              {/* 안내 문구 */}
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start">
                  <i className="ri-information-line text-amber-600 mr-2 mt-1"></i>
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">💡 안내사항</p>
                    <p>본 문서는 AI가 생성한 템플릿입니다. 실제 사용 전에는 법무 전문가의 검토를 받으시기 바랍니다.</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// 문서 템플릿 컴포넌트
function DocumentTemplate({ docType, reportData }: { docType: string; reportData: any }) {
  const currentDate = new Date().toLocaleDateString();
  const address = reportData?.contractSummary?.address || '[주소 정보]';
  
  const getDocumentContent = () => {
    switch (docType) {
      case 'repair':
        return (
          <div className="space-y-6">
            <div className="text-center border-b pb-4">
              <h1 className="text-2xl font-bold">임대인 수선 요구서</h1>
            </div>
            
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <p><strong>작성일:</strong> {currentDate}</p>
                <p><strong>임차인:</strong> [사용자명]</p>
                <p><strong>연락처:</strong> [연락처]</p>
              </div>
              <div>
                <p><strong>임대인:</strong> [임대인명]</p>
                <p><strong>임대물:</strong> {address}</p>
                <p><strong>계약일:</strong> [계약일]</p>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-3">수선 요구 사항</h3>
              <div className="space-y-2 text-sm">
                <p>1. <strong>수압 개선:</strong> 현재 수압이 정상 수준에 미달합니다.</p>
                <p>2. <strong>소음 차단:</strong> 층간소음이 환경부 기준을 초과합니다.</p>
                <p>3. <strong>환기 시설:</strong> 곰팡이 발생으로 인한 환기 개선이 필요합니다.</p>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-3">법적 근거</h3>
              <p className="text-sm text-gray-700">
                「주택임대차보호법」 제6조의2에 따라 임대인은 임대목적물을 임차인이 사용·수익하기에 
                필요한 상태를 유지하게 할 의무가 있습니다.
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-3">요구 기한</h3>
              <p className="text-sm">본 요구서 발송일로부터 <strong className="text-red-600">30일 이내</strong> 수선 완료를 요구합니다.</p>
            </div>

            <div className="text-right pt-8">
              <p>임차인: _________________ (인)</p>
            </div>
          </div>
        );
        
      case 'content':
        return (
          <div className="space-y-6">
            <div className="text-center border-b pb-4">
              <h1 className="text-2xl font-bold">내용증명 우편</h1>
            </div>
            
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <p><strong>발송인:</strong> [사용자명]</p>
                <p><strong>주소:</strong> {address}</p>
                <p><strong>연락처:</strong> [연락처]</p>
              </div>
              <div>
                <p><strong>수신인:</strong> [임대인명]</p>
                <p><strong>주소:</strong> [임대인 주소]</p>
                <p><strong>발송일:</strong> {currentDate}</p>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-3 text-center">통 지 서</h3>
              <div className="space-y-4 text-sm leading-relaxed">
                <p>
                  귀하가 임대인으로 있는 상기 임대목적물과 관련하여, 
                  「주택임대차보호법」상 수선의무 이행을 정식으로 통지드립니다.
                </p>
                
                <div>
                  <p className="font-semibold mb-2">1. 수선 요구 사항</p>
                  <p className="ml-4">- 수압 개선 (현재 수준: 미달)</p>
                  <p className="ml-4">- 소음 차단 시설 개선 (측정값: 기준 초과)</p>
                  <p className="ml-4">- 환기 및 습도 조절 시설 보수</p>
                </div>

                <div>
                  <p className="font-semibold mb-2">2. 이행 기한</p>
                  <p className="ml-4">본 통지서 도달일로부터 <strong className="text-red-600">30일 이내</strong></p>
                </div>

                <div>
                  <p className="font-semibold mb-2">3. 미이행 시 조치</p>
                  <p className="ml-4">- 임대차계약 해지 통보</p>
                  <p className="ml-4">- 손해배상 청구</p>
                  <p className="ml-4">- 주택임대차분쟁조정위원회 신청</p>
                </div>

                <p>
                  상기와 같이 통지하오니 기한 내 이행하여 주시기 바랍니다.
                </p>
              </div>
            </div>

            <div className="text-right pt-6">
              <p>{currentDate}</p>
              <p className="mt-4">통지인: _________________ (인)</p>
            </div>
          </div>
        );
        
      case 'adjustment':
        return (
          <div className="space-y-6">
            <div className="text-center border-b pb-4">
              <h1 className="text-2xl font-bold">월세 조정 요청서</h1>
            </div>
            
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <p><strong>작성일:</strong> {currentDate}</p>
                <p><strong>임차인:</strong> [사용자명]</p>
                <p><strong>연락처:</strong> [연락처]</p>
              </div>
              <div>
                <p><strong>임대인:</strong> [임대인명]</p>
                <p><strong>임대물:</strong> {address}</p>
                <p><strong>계약 형태:</strong> {reportData?.contractSummary?.contractType || '월세'}</p>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-3">월세 조정 요청 근거</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-semibold text-blue-800 mb-2">1. 시장 시세 분석</p>
                  <p>• 지역 평균 월세: [평균값] (본 계약 대비 -XX%)</p>
                  <p>• 최근 24개월 시장 동향: 과열 상승 (15.2% 급등)</p>
                  <p>• 유사 조건 비교: 상위 20% 높은 수준</p>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="font-semibold text-amber-800 mb-2">2. 시설 상태 분석</p>
                  <p>• 수압 상태: 평균 이하 (2.3/5점)</p>
                  <p>• 소음 환경: 환경부 기준 초과 (측정값: XXdB)</p>
                  <p>• 전반적 만족도: 동네 평균보다 0.6점 낮음</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-3">요청 사항</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm">
                  상기 분석 결과를 바탕으로, 현재 월세 <strong className="text-red-600">[현재 금액]</strong>에서 
                  적정 시세인 <strong className="text-green-600">[요청 금액]</strong>으로의 조정을 요청드립니다.
                </p>
                <p className="text-sm mt-2">
                  또는 시설 개선(수압, 방음, 환기)을 통한 주거 환경 개선을 요청드립니다.
                </p>
              </div>
            </div>

            <div className="text-right pt-6">
              <p>요청인: _________________ (인)</p>
            </div>
          </div>
        );
        
      default:
        return <div>문서를 선택해주세요.</div>;
    }
  };

  return (
    <div className="bg-white min-h-[500px] p-6 font-serif leading-relaxed">
      {getDocumentContent()}
    </div>
  );
}