'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

interface DocumentGeneratorProps {
  reportData: any;
  isVisible: boolean;
  onClose: () => void;
}

export default function DocumentGenerator({ reportData, isVisible, onClose }: DocumentGeneratorProps) {
  const [selectedDocument, setSelectedDocument] = useState<'repair' | 'content' | 'adjustment' | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [landlordEmail, setLandlordEmail] = useState('');
  const [tenantInfo, setTenantInfo] = useState({
    name: '',
    address: '',
    phone: ''
  });

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
      // 임차인 정보 유효성 검사
      if (!tenantInfo.name.trim()) {
        toast.error('임차인 정보를 입력해주세요.');
        return;
      }

      toast.loading('문서를 생성하는 중입니다...', { id: 'doc-loading' });
      
      // HTML을 PDF로 변환하는 방식 (한글 완벽 지원)
      const selectedDoc = documents.find(d => d.id === docType);
      const title = selectedDoc?.title || '문서';
      
      // 임시 HTML 요소 생성 (A4 사이즈에 맞게 적절히 조정)
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '210mm'; // A4 너비
      tempDiv.style.padding = '20mm'; // 적절한 여백
      tempDiv.style.fontFamily = 'Noto Sans KR, sans-serif';
      tempDiv.style.fontSize = '12px'; // 적절한 폰트 크기
      tempDiv.style.lineHeight = '1.5';
      tempDiv.style.color = '#000';
      tempDiv.style.backgroundColor = '#fff';
      
      // 문서 내용 HTML 생성 (미리보기 템플릿과 동일)
      const currentDate = new Date().toLocaleDateString('ko-KR');
      let content = '';
      let additionalInfo = '';
      
      switch (docType) {
        case 'repair':
          // 실제 측정 데이터 반영
          const noiseLevel = reportData?.premiumFeatures?.smartDiagnosis?.noiseLevel;
          const noiseText = noiseLevel ? `측정값: ${noiseLevel}dB (환경부 기준 초과)` : '측정값: [데이터]';
          
          content = `
수선 요구 사항
1. 수압 개선: 현재 수압이 정상 수준에 미달합니다.

2. 소음 차단: 층간소음이 환경부 기준을 초과합니다. (${noiseText})

3. 환기 시설: 곰팡이 발생으로 인한 환기 개선이 필요합니다.
          `;
          additionalInfo = `
법적 근거
「주택임대차보호법」 제6조의2에 따라 임대인은 임대목적물을 임차인이 사용·수익하기에 필요한 상태를 유지하게 할 의무가 있습니다.

요구 기한
본 요구서 발송일로부터 30일 이내 수선 완료를 요구합니다.
          `;
          break;
        case 'content':
          content = `
통지 내용
임대차계약서상 임대인의 수선의무 불이행에 대해 정식으로 통지하며, 30일 이내 조치를 요구합니다.

미이행 시 임대차계약 해지 및 손해배상을 청구할 수 있습니다.
          `;
          additionalInfo = `
법적 근거
「주택임대차보호법」 제6조의2 및 민법 제623조에 따른 수선의무 불이행에 대한 법적 조치입니다.

요구 기한
본 통지서 발송일로부터 30일 이내 조치 완료를 요구합니다.
          `;
          break;
        case 'adjustment':
          // 실제 월세 데이터 반영
          const currentRent = reportData?.contractInfo?.monthlyRent;
          const marketAverage = reportData?.objectiveMetrics?.marketPrice?.nationalAverage;
          const difference = reportData?.objectiveMetrics?.marketPrice?.difference;
          const differencePercent = reportData?.objectiveMetrics?.marketPrice?.differencePercent;
          
          const rentText = currentRent && marketAverage ? 
            `현재: ${currentRent}만원, 시장평균: ${marketAverage}만원 (${difference > 0 ? '+' : ''}${difference}만원, ${differencePercent > 0 ? '+' : ''}${differencePercent}%)` :
            '[현재금액] → [요청금액]';
          
          content = `
월세 조정 요청 근거
1. 지역 평균 대비 높은 월세 (${rentText})

2. 시설 상태 대비 부적절한 가격

3. 시장 동향 분석 결과

요청 사항: 월세 조정 요구
          `;
          additionalInfo = `
법적 근거
「주택임대차보호법」 제6조의2 및 시장 원리에 따른 합리적 월세 조정 요구입니다.

요구 기한
본 요청서 발송일로부터 30일 이내 검토 및 조정을 요구합니다.
          `;
          break;
      }
      
      tempDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">${title}</h1>
        </div>
        
        <div style="margin-bottom: 15px;">
          <p><strong>작성일:</strong> ${currentDate}</p>
          <p><strong>임차인:</strong> ${tenantInfo.name || '[사용자명]'}</p>
          <p><strong>연락처:</strong> ${tenantInfo.phone || '[연락처]'}</p>
          <p><strong>임대인:</strong> ${landlordEmail ? landlordEmail.split('@')[0] : '[임대인명]'}</p>
          <p><strong>임대물:</strong> ${reportData?.contractInfo?.address || reportData?.contractSummary?.address || '[주소]'}</p>
          <p><strong>계약일:</strong> ${reportData?.contractInfo?.contractDate || reportData?.contractSummary?.contractDate || '[계약일]'}</p>
          ${reportData?.contractInfo ? `
          <p><strong>보증금:</strong> ${reportData.contractInfo.deposit}만원</p>
          <p><strong>월세:</strong> ${reportData.contractInfo.monthlyRent}만원</p>
          ` : ''}
        </div>
        
        <div style="margin-bottom: 20px; white-space: pre-line;">
          ${content}
        </div>
        
        <div style="margin-bottom: 20px; white-space: pre-line;">
          ${additionalInfo}
        </div>
        
        <div style="margin-top: 30px;">
          <p>임차인: _________________ (인)</p>
        </div>
        
        <div style="margin-top: 30px; font-size: 10px; color: #666;">
          <p>※ 본 문서는 AI가 생성한 템플릿이며, 실제 법적 효력을 위해서는 전문가 검토가 필요합니다.</p>
          <p>월세의 정석 | https://rental-lovat-theta.vercel.app</p>
        </div>
      `;
      
      document.body.appendChild(tempDiv);
      
      // HTML을 캔버스로 변환 (A4에 맞게 적절히 조정)
      const canvas = await html2canvas(tempDiv, {
        scale: 1.2, // 적절한 해상도
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // 캔버스를 PDF로 변환 (더 작은 크기로 조정)
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // A4 사이즈에 맞게 이미지 조정 (단순화된 로직)
      const pdfWidth = 210; // A4 너비
      const pdfHeight = 297; // A4 높이
      
      // 이미지 크기를 PDF 용지 폭에 정확히 맞추기
      const targetWidth = pdfWidth; // PDF 용지 폭에 맞춤
      const scaleRatio = targetWidth / canvas.width; // 가로 비율 계산
      const scaledHeight = canvas.height * scaleRatio; // 세로 길이 자동 조정
      
      // 이미지를 PDF에 추가
      pdf.addImage(imgData, 'PNG', 0, 0, targetWidth, scaledHeight);
      
      // 임시 요소 제거
      document.body.removeChild(tempDiv);
      
      // 파일 다운로드
      const fileName = `${title}_${tenantInfo.name || '문서'}_${new Date().toLocaleDateString('ko-KR').replace(/\./g, '-')}.pdf`;
      pdf.save(fileName);
      
      toast.success('문서가 생성되었습니다!', { id: 'doc-loading' });
      
    } catch (error) {
      console.error('Document generation error:', error);
      toast.error('문서 생성 중 오류가 발생했습니다.', { id: 'doc-loading' });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateWordDocument = async (docType: string) => {
    setIsGenerating(true);
    toast.loading('Word 문서를 생성하는 중입니다...', { id: 'word-loading' });
    
    try {
      // 임차인 정보 유효성 검사
      if (!tenantInfo.name.trim()) {
        toast.error('임차인 정보를 입력해주세요.');
        return;
      }

      // Word 문서 생성
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // 제목
            new Paragraph({
              children: [
                new TextRun({
                  text: `${docType} 계약서`,
                  bold: true,
                  size: 32,
                }),
              ],
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            
            // 임차인 정보
            new Paragraph({
              children: [
                new TextRun({
                  text: "임차인 정보",
                  bold: true,
                  size: 24,
                }),
              ],
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 200, after: 200 },
            }),
            
            new Paragraph({
              children: [
                new TextRun({
                  text: `성명: ${tenantInfo.name}`,
                  size: 20,
                }),
              ],
              spacing: { after: 100 },
            }),
            
            new Paragraph({
              children: [
                new TextRun({
                  text: `주소: ${tenantInfo.address}`,
                  size: 20,
                }),
              ],
              spacing: { after: 100 },
            }),
            
            new Paragraph({
              children: [
                new TextRun({
                  text: `연락처: ${tenantInfo.phone}`,
                  size: 20,
                }),
              ],
              spacing: { after: 200 },
            }),
            
            // 임대인 정보
            new Paragraph({
              children: [
                new TextRun({
                  text: "임대인 정보",
                  bold: true,
                  size: 24,
                }),
              ],
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 200, after: 200 },
            }),
            
            new Paragraph({
              children: [
                new TextRun({
                  text: `이메일: ${landlordEmail}`,
                  size: 20,
                }),
              ],
              spacing: { after: 200 },
            }),
            
            // 계약 내용
            new Paragraph({
              children: [
                new TextRun({
                  text: "계약 내용",
                  bold: true,
                  size: 24,
                }),
              ],
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 200, after: 200 },
            }),
            
            new Paragraph({
              children: [
                new TextRun({
                  text: "위 임차인과 임대인은 다음과 같이 임대차계약을 체결합니다.",
                  size: 20,
                }),
              ],
              spacing: { after: 200 },
            }),
            
            // 서명란
            new Paragraph({
              children: [
                new TextRun({
                  text: "임차인 서명: _________________",
                  size: 20,
                }),
              ],
              spacing: { before: 400, after: 100 },
            }),
            
            new Paragraph({
              children: [
                new TextRun({
                  text: "임대인 서명: _________________",
                  size: 20,
                }),
              ],
              spacing: { after: 200 },
            }),
            
            // 작성일
            new Paragraph({
              children: [
                new TextRun({
                  text: `작성일: ${new Date().toLocaleDateString('ko-KR')}`,
                  size: 20,
                }),
              ],
              alignment: AlignmentType.RIGHT,
              spacing: { before: 200 },
            }),
          ],
        }],
      });

      // 문서를 Blob으로 변환
      const blob = await Packer.toBlob(doc);
      
      // 파일명 생성
      const fileName = `${docType}_${tenantInfo.name || '문서'}_${new Date().toLocaleDateString('ko-KR').replace(/\./g, '-')}.docx`;
      
      // 파일 다운로드
      saveAs(blob, fileName);
      
      toast.success('Word 문서가 생성되었습니다!', { id: 'word-loading' });
      
    } catch (error) {
      console.error('Word 문서 생성 실패:', error);
      toast.error('Word 문서 생성 중 오류가 발생했습니다.', { id: 'word-loading' });
    } finally {
      setIsGenerating(false);
    }
  };

  const sendEmail = async (docType: string) => {
    // 유효성 검사
    if (!landlordEmail.trim()) {
      toast.error('임대인의 이메일 주소를 입력해주세요.');
      return;
    }
    
    if (!tenantInfo.name.trim()) {
      toast.error('임차인 정보를 입력해주세요.');
      return;
    }

    if (!tenantInfo.address.trim()) {
      toast.error('임차인 주소를 입력해주세요.');
      return;
    }

    if (!tenantInfo.phone.trim()) {
      toast.error('임차인 연락처를 입력해주세요.');
      return;
    }

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(landlordEmail)) {
      toast.error('올바른 이메일 형식을 입력해주세요.');
      return;
    }

    // 동의 체크박스 확인
    const emailConsent = document.getElementById('emailConsent') as HTMLInputElement;
    if (!emailConsent?.checked) {
      toast.error('이메일 발송 동의를 체크해주세요.');
      return;
    }

    toast.loading('이메일을 발송하는 중입니다...', { id: 'email-loading' });
    
    try {
      // 실제 구현에서는 백엔드 API를 호출하여 이메일 발송
      // const response = await fetch('/api/send-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     to: landlordEmail,
      //     subject: `${docType} 계약서`,
      //     tenantInfo,
      //     docType
      //   })
      // });
      
      // 현재는 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(
        <div>
          <p className="font-semibold">📧 이메일 발송 시뮬레이션 완료!</p>
          <p className="text-sm mt-1">
            {landlordEmail}로 {docType} 계약서 발송이 시뮬레이션되었습니다.
          </p>
          <p className="text-xs mt-2 text-orange-600">
            ※ 실제 발송 기능은 준비 중입니다. 현재는 테스트용입니다.
          </p>
        </div>, 
        { id: 'email-loading', duration: 5000 }
      );
      
    } catch (error) {
      console.error('이메일 발송 실패:', error);
      toast.error('이메일 발송 중 오류가 발생했습니다.', { id: 'email-loading' });
    }
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
                <h2 className="text-2xl font-bold">전자문서 자동 생성</h2>
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
                  <div className="w-4 h-4 bg-amber-500 rounded flex items-center justify-center mr-3">
                    <i className="ri-crown-line text-white text-xs"></i>
                  </div>
                  <h4 className="font-bold text-amber-800 text-lg">프리미엄 전자문서 특징</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
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

              {/* 임차인 정보 입력 */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 임차인 정보</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">임차인 성명 *</label>
                    <input
                      type="text"
                      value={tenantInfo.name}
                      onChange={(e) => setTenantInfo({...tenantInfo, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="홍길동"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">연락처</label>
                    <input
                      type="tel"
                      value={tenantInfo.phone}
                      onChange={(e) => setTenantInfo({...tenantInfo, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="010-1234-5678"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">주소</label>
                    <input
                      type="text"
                      value={tenantInfo.address}
                      onChange={(e) => setTenantInfo({...tenantInfo, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="서울시 마포구 공덕동 123-45"
                    />
                  </div>
                </div>
              </div>

              {/* 임대인 이메일 입력 */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📧 임대인 이메일</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">임대인 이메일 주소 *</label>
                  <input
                    type="email"
                    value={landlordEmail}
                    onChange={(e) => setLandlordEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="landlord@example.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">문서가 첨부파일로 발송됩니다.</p>
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="space-y-4">
                {/* 1단계: 문서 다운로드 */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">1단계: 문서 다운로드</h4>
                  <p className="text-sm text-gray-600 mb-4">생성된 문서를 다운로드하여 확인하세요.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => generateDocument(selectedDocument)}
                      disabled={isGenerating}
                      className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg"
                    >
                      <i className="ri-file-pdf-line mr-2"></i>
                      {isGenerating ? '생성 중...' : 'PDF 다운로드'}
                    </button>
                    
                    <button
                      onClick={() => generateWordDocument(selectedDocument)}
                      disabled={isGenerating}
                      className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 transition-all shadow-lg"
                    >
                      <i className="ri-file-word-line mr-2"></i>
                      {isGenerating ? '생성 중...' : 'Word 다운로드'}
                    </button>
                  </div>
                  
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      <i className="ri-check-line mr-1"></i>
                      <strong>완료:</strong> PDF는 HTML 캔버스 변환으로 한글 완벽 지원, Word 문서도 한글로 정상 생성됩니다.
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                      💡 입력하신 정보와 리포트 데이터가 자동으로 문서에 반영됩니다.
                    </p>
                  </div>
                </div>

                {/* 2단계: 이메일 발송 (선택사항) */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">2단계: 이메일 발송 (선택사항)</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    임대인에게 직접 이메일을 발송할 수 있습니다. 
                    <span className="text-orange-600 font-medium">※ 실제 발송 기능은 준비 중입니다.</span>
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="emailConsent"
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="emailConsent" className="text-sm text-gray-700">
                        위 정보가 정확함을 확인하고 이메일 발송에 동의합니다
                      </label>
                    </div>
                    
                    <button
                      onClick={() => sendEmail(selectedDocument)}
                      className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg"
                    >
                      <i className="ri-mail-send-line mr-2"></i>
                      임대인에게 이메일 발송
                    </button>
                  </div>
                </div>
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