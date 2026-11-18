import { publicAsset } from "@/lib/public-asset";
import type { Metadata } from "next";
import { Header, Footer } from "@/components/sites/mutoscope/Chrome";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Miles Okoro | Independent web designer in Chicago",
    template: "%s | Miles Okoro",
  },
  description:
    "Miles Okoro designs websites and builds them himself. Recent work for software, fashion, travel, and hospitality companies.",
  icons: { icon: publicAsset("/sites/mutoscope/icon.png") },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
