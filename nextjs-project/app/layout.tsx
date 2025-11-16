import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { AppContextProvider } from "@/context/AppContext";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "여행사 관리 시스템",
  description: "Next.js로 마이그레이션된 여행사 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <Script
          src="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/js/all.min.js"
          strategy="lazyOnload"
        />
      </head>
      <body className={notoSansKr.className}>
        <AppContextProvider>{children}</AppContextProvider>
      </body>
    </html>
  );
}
