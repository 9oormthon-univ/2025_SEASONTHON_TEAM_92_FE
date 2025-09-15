import type { Metadata } from "next";
import { Toaster } from 'react-hot-toast';
import "./globals.css";

// 데이터/신뢰감을 주는 폰트 옵션들
import { Inter, Noto_Sans_KR, IBM_Plex_Sans_KR, Source_Sans_3 } from 'next/font/google';

// 옵션 1: Inter + Noto Sans KR (현재 - 현대적, 깔끔)
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
});

const notoSansKr = Noto_Sans_KR({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '900'],
  variable: '--font-noto-sans-kr'
});

// 옵션 2: IBM Plex Sans KR (신뢰감, 기업용, 데이터 친화적)
const ibmPlexSansKr = IBM_Plex_Sans_KR({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex'
});

// 옵션 3: Source Sans 3 (Adobe, 전문적, 가독성 우수)
const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-source-sans'
});

export const metadata: Metadata = {
  title: "월세의 정석",
  description: "AI 분석과 그룹 협상으로 합리적인 월세를 만들어가는 20대를 위한 스마트한 월세 협상 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning={true}>
      <body
        className={`antialiased ${inter.variable} ${notoSansKr.variable} ${ibmPlexSansKr.variable} ${sourceSans3.variable}`}
        style={{ 
          /* 데이터/신뢰감 컨셉에 적합한 IBM Plex Sans KR 적용 */
          fontFamily: 'var(--font-ibm-plex), var(--font-inter), "IBM Plex Sans KR", "Pretendard", sans-serif'
        }}
      >
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
