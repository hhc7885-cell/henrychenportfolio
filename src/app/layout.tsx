import { publicAsset } from "@/lib/public-asset";
import type { Metadata } from "next";
import { Header, Footer } from "@/components/sites/mutoscope/Chrome";
import "./globals.css";
import { SiteAudio } from "@/components/sites/mutoscope/SiteAudio";

export const metadata: Metadata = {
  title: {
    default: "henrychenportfolio",
    template: "%s | henrychenportfolio",
  },
  description:
    "陈豪辉 Henry Chen 的个人作品集，展示品牌策略、创意传播、消费品概念与 AI 交互探索。",
  icons: { icon: publicAsset("/sites/henry/icon.svg") },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <SiteAudio>
        <Header />
        {children}
        <Footer />
        </SiteAudio>
      </body>
    </html>
  );
}
