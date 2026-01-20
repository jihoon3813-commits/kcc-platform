import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KCC 홈씨씨 구독 솔루션 파트너 센터",
  description: "목돈 부담 제로! KCC 홈씨씨 창호 구독으로 매출을 혁신하세요. 시공 다음날 바로 정산, 99%의 승인율을 경험해 보세요.",
  openGraph: {
    title: "KCC 홈씨씨 구독 솔루션 파트너 센터",
    description: "목돈 부담 제로! KCC 홈씨씨 창호 구독으로 매출을 혁신하세요. 시공 다음날 바로 정산, 99%의 승인율을 경험해 보세요.",
    images: ["https://cdn.imweb.me/upload/S20250904697320f4fd9ed/9edabde9f8bd5.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KCC 홈씨씨 구독 솔루션 파트너 센터",
    description: "목돈 부담 제로! KCC 홈씨씨 창호 구독으로 매출을 혁신하세요. 시공 다음날 바로 정산, 99%의 승인율을 경험해 보세요.",
    images: ["https://cdn.imweb.me/upload/S20250904697320f4fd9ed/9edabde9f8bd5.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
