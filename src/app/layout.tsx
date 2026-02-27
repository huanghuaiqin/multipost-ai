import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
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
  title: "Multipost AI · 内容多平台改写助手",
  description: "用一段原始内容，一键生成小红书、视频号、TikTok 多平台文案。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}

        {/* 
          接入统计工具 (请替换您的 ID)
          1. 百度统计:
          <Script id="baidu-analytics">
            {`
              var _hmt = _hmt || [];
              (function() {
                var hm = document.createElement("script");
                hm.src = "https://hm.baidu.com/hm.js?YOUR_BAIDU_ID";
                var s = document.getElementsByTagName("script")[0]; 
                s.parentNode.insertBefore(hm, s);
              })();
            `}
          </Script>
        */}

        {/* 
          2. Umami (自建或云版):
          <Script 
            src="https://analytics.umami.is/script.js" 
            data-website-id="YOUR_UMAMI_ID" 
            strategy="lazyOnload" 
          />
        */}
      </body>
    </html>
  );
}
